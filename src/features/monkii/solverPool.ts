import type { Intensity } from "@/features/api/types";
import type { PowRequest, PowResponse } from "@/workers/pow.worker";

/* =====================================================================
   The solver pool.

   One challenge, N workers, one nonce space cut N ways. Worker k starts at
   nonce k and steps by N, so the workers never test the same nonce and
   never need to coordinate. The first solution cancels the rest.

   Cutting the space this way, rather than handing each worker its own
   range, means every worker is searching nonces of the same magnitude at
   the same moment. Ranges would have worker 11 grinding eleven-digit
   nonces that are no more likely to solve than worker 0's, just slower to
   hash, and would strand whatever work the losers had done in a region
   nobody revisits.

   The server does not care how the nonce was found. It hashes
   `seed:nonce` and counts leading zero bits, so a strided nonce verifies
   exactly like a sequential one.

   A LANE IS ALLOWED TO DIE. Workers are spawned on a ramp rather than all
   at once, and a lane that fails to start is marked dead and skipped
   instead of failing the session. Its nonces simply go unsearched, which
   costs throughput and nothing else: the space is unbounded and the
   remaining lanes still cover it. Only losing every lane is a real error.
   ===================================================================== */

export interface SolverSolution {
  seed: string;
  nonce: string;
  hash: string;
  /** Hashes computed across the whole pool for this challenge. */
  hashes: number;
  /** Wall clock from dispatch to solution, in ms. */
  ms: number;
}

export interface SolverProgress {
  /** Hashes computed across the whole pool for the current challenge. */
  hashes: number;
  /** Aggregate hashes per second across every live lane. */
  hashRate: number;
  /** Lanes actually grinding right now. */
  cores: number;
}

export interface SolverPoolHandlers {
  onSolved: (solution: SolverSolution) => void;
  onProgress: (progress: SolverProgress) => void;
  /** Every lane died. Nothing is grinding. */
  onError: () => void;
}

/**
 * Workers come up on a ramp instead of in one burst.
 *
 * In dev each module worker resolves its own dependency graph over HTTP,
 * and viem's graph is not small. Twelve workers asking for all of it in
 * the same tick is a thundering herd against the dev server, and a lane
 * whose import fails arrives as an `onerror` rather than anything
 * readable. The first worker warms the transform cache and the rest come
 * up behind it. It also keeps a session from pinning every core the
 * instant you press start.
 */
const SPAWN_STAGGER_MS = 120;

/** What the browser admits to, clamped to something a phone survives. */
function coreCount(): number {
  const reported = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined;
  if (!Number.isFinite(reported) || !reported || reported < 1) return 2;
  return Math.min(16, Math.floor(reported));
}

/**
 * How many workers an intensity is worth.
 *
 * The three intensities already promised this. "Light: low CPU/GPU
 * overhead" was previously a difficulty offset and nothing else, so light
 * and max loaded a machine identically and only differed in how long a
 * solve took. Core count is what the labels were describing all along.
 *
 * Max leaves one core alone once there are enough of them. The cockpit
 * animates while a session runs, and a browser that cannot paint makes a
 * fast grind look like a hung one.
 */
export function solverPoolSize(intensity: Intensity): number {
  const cores = coreCount();
  if (intensity === "light") return 1;
  if (intensity === "standard") return Math.max(1, Math.min(4, Math.ceil(cores / 2)));
  return cores >= 4 ? cores - 1 : cores;
}

interface Lane {
  worker: Worker | null;
  /** `pending` until its spawn timer fires, then `alive` or `dead`. */
  status: "pending" | "alive" | "dead";
  hashes: number;
  rate: number;
}

export class SolverPool {
  private readonly lanes: Lane[];
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private readonly handlers: SolverPoolHandlers;
  /** The challenge currently in flight. Null between challenges. */
  private seed: string | null = null;
  private difficulty = 0;
  private dispatchedAt = 0;
  private disposed = false;

  constructor(size: number, handlers: SolverPoolHandlers) {
    this.handlers = handlers;
    const count = Math.max(1, Math.floor(size));
    this.lanes = Array.from({ length: count }, () => ({
      worker: null,
      status: "pending" as const,
      hashes: 0,
      rate: 0,
    }));

    // Lane 0 starts now so the first challenge is never waiting on a timer.
    this.spawn(0);
    for (let index = 1; index < count; index++) {
      this.timers.push(setTimeout(() => this.spawn(index), index * SPAWN_STAGGER_MS));
    }
  }

  /** Lanes currently grinding. Starts at 1 and ramps to the full pool. */
  get size(): number {
    return this.lanes.reduce((n, lane) => n + (lane.status === "alive" ? 1 : 0), 0);
  }

  private spawn(index: number): void {
    if (this.disposed) return;
    const lane = this.lanes[index];
    if (!lane || lane.status !== "pending") return;

    let worker: Worker;
    try {
      worker = new Worker(new URL("@/workers/pow.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      lane.status = "dead";
      this.settle();
      return;
    }

    worker.onmessage = (event: MessageEvent<PowResponse>) => this.receive(index, event.data);
    worker.onerror = () => this.kill(index);
    worker.onmessageerror = () => this.kill(index);

    lane.worker = worker;
    lane.status = "alive";

    // A lane that comes up mid-challenge joins the one already in flight.
    if (this.seed !== null) {
      worker.postMessage({
        seed: this.seed,
        difficulty: this.difficulty,
        offset: index,
        stride: this.lanes.length,
      } satisfies PowRequest);
    }

    this.report();
  }

  /** Retire one lane. Only an empty pool is an error worth surfacing. */
  private kill(index: number): void {
    const lane = this.lanes[index];
    if (!lane || lane.status === "dead") return;
    lane.status = "dead";
    lane.rate = 0;
    lane.worker?.terminate();
    lane.worker = null;
    this.settle();
  }

  /**
   * Decide whether losing a lane mattered. A lane still waiting on its
   * spawn timer might yet come up, so the pool is only truly dead once
   * nothing is alive and nothing is pending.
   */
  private settle(): void {
    if (this.disposed) return;
    const pending = this.lanes.some((lane) => lane.status === "pending");
    if (this.size === 0 && !pending) {
      this.handlers.onError();
      return;
    }
    this.report();
  }

  /** Dispatch a challenge to every live lane, each on its own nonces. */
  solve(seed: string, difficulty: number): void {
    if (this.disposed) return;
    this.seed = seed;
    this.difficulty = difficulty;
    this.dispatchedAt = Date.now();

    const stride = this.lanes.length;
    this.lanes.forEach((lane, offset) => {
      lane.hashes = 0;
      lane.rate = 0;
      lane.worker?.postMessage({ seed, difficulty, offset, stride } satisfies PowRequest);
    });
  }

  /** Stop work on the current challenge. Live workers stay reusable. */
  cancel(): void {
    const seed = this.seed;
    this.seed = null;
    if (seed === null) return;
    for (const lane of this.lanes) {
      lane.worker?.postMessage({ seed, difficulty: 0, cancel: true } satisfies PowRequest);
    }
  }

  terminate(): void {
    this.disposed = true;
    this.seed = null;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.length = 0;
    for (const lane of this.lanes) {
      lane.worker?.terminate();
      lane.worker = null;
      lane.status = "dead";
    }
  }

  private report(): void {
    if (this.disposed) return;
    let hashes = 0;
    let hashRate = 0;
    for (const lane of this.lanes) {
      hashes += lane.hashes;
      hashRate += lane.rate;
    }
    this.handlers.onProgress({ hashes, hashRate, cores: this.size });
  }

  private receive(index: number, msg: PowResponse): void {
    // A message about a challenge we have already moved past is stale. This
    // also swallows the cancel acknowledgements the losing lanes send after
    // somebody else has solved.
    if (this.disposed || msg.seed !== this.seed) return;
    const lane = this.lanes[index];
    if (!lane) return;

    if (msg.type === "progress") {
      lane.hashes = msg.hashes;
      lane.rate = msg.hashRate;
      this.report();
      return;
    }

    if (msg.type === "cancelled") {
      lane.hashes = msg.hashes;
      lane.rate = 0;
      return;
    }

    // Solved. Count this lane's exact total, stop everyone else, then
    // report. The losers' last few hundred hashes go uncounted, which is
    // worth more than the round trip it would take to collect them.
    lane.hashes = msg.hashes;
    let hashes = 0;
    for (const l of this.lanes) hashes += l.hashes;
    const seed = msg.seed;
    this.cancel();

    this.handlers.onSolved({
      seed,
      nonce: msg.nonce,
      hash: msg.hash,
      hashes,
      ms: Math.max(1, Date.now() - this.dispatchedAt),
    });
  }
}
