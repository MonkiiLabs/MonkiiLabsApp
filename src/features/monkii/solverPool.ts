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
  /** Aggregate hashes per second across every worker. */
  hashRate: number;
}

export interface SolverPoolHandlers {
  onSolved: (solution: SolverSolution) => void;
  onProgress: (progress: SolverProgress) => void;
  onError: () => void;
}

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

export class SolverPool {
  private readonly workers: Worker[] = [];
  private readonly hashes: number[];
  private readonly rates: number[];
  private readonly handlers: SolverPoolHandlers;
  /** The challenge currently in flight. Null between challenges. */
  private seed: string | null = null;
  private dispatchedAt = 0;
  private disposed = false;

  constructor(size: number, handlers: SolverPoolHandlers) {
    this.handlers = handlers;
    const count = Math.max(1, Math.floor(size));
    this.hashes = new Array<number>(count).fill(0);
    this.rates = new Array<number>(count).fill(0);

    for (let index = 0; index < count; index++) {
      const worker = new Worker(new URL("@/workers/pow.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.onmessage = (event: MessageEvent<PowResponse>) => this.receive(index, event.data);
      worker.onerror = () => {
        if (!this.disposed) this.handlers.onError();
      };
      this.workers.push(worker);
    }
  }

  get size(): number {
    return this.workers.length;
  }

  /** Dispatch a challenge to every worker, each on its own lane of nonces. */
  solve(seed: string, difficulty: number): void {
    if (this.disposed) return;
    this.seed = seed;
    this.dispatchedAt = Date.now();
    this.hashes.fill(0);
    this.rates.fill(0);

    const stride = this.workers.length;
    this.workers.forEach((worker, offset) => {
      worker.postMessage({ seed, difficulty, offset, stride } satisfies PowRequest);
    });
  }

  /** Stop work on the current challenge. Workers stay alive and reusable. */
  cancel(): void {
    const seed = this.seed;
    this.seed = null;
    if (seed === null) return;
    for (const worker of this.workers) {
      worker.postMessage({ seed, difficulty: 0, cancel: true } satisfies PowRequest);
    }
  }

  terminate(): void {
    this.disposed = true;
    this.seed = null;
    for (const worker of this.workers) worker.terminate();
    this.workers.length = 0;
  }

  private total(values: number[]): number {
    let sum = 0;
    for (const value of values) sum += value;
    return sum;
  }

  private receive(index: number, msg: PowResponse): void {
    // A message about a challenge we have already moved past is stale. This
    // also swallows the cancel acknowledgements the losing workers send
    // after somebody else has solved.
    if (this.disposed || msg.seed !== this.seed) return;

    if (msg.type === "progress") {
      this.hashes[index] = msg.hashes;
      this.rates[index] = msg.hashRate;
      this.handlers.onProgress({
        hashes: this.total(this.hashes),
        hashRate: this.total(this.rates),
      });
      return;
    }

    if (msg.type === "cancelled") {
      this.hashes[index] = msg.hashes;
      return;
    }

    // Solved. Count this worker's exact total, stop everyone else, then
    // report. The losers' last few hundred hashes go uncounted, which is
    // worth more than the round trip it would take to collect them.
    this.hashes[index] = msg.hashes;
    const hashes = this.total(this.hashes);
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
