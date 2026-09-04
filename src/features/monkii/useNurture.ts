import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { sessions } from "@/features/api/endpoints";
import { describeError, qk } from "@/features/api/hooks";
import { ApiError } from "@/lib/api";
import { HEARTBEAT_MIN_INTERVAL_SECONDS } from "@/lib/config";
import type { AgentState, Challenge, Intensity } from "@/features/api/types";
import type { PowRequest, PowResponse } from "@/workers/pow.worker";

/* =====================================================================
   The Proof-of-Life loop.

   start → worker grinds a nonce → submit heartbeat → server verifies,
   pays $MONKII, restores vitality and hands back the next challenge →
   grind again. The worker lives off the main thread, and the loop is
   driven by refs rather than state so a re-render never restarts a grind
   or double-submits a solution.

   PACING. The server rejects two heartbeats from one session inside
   HEARTBEAT_MIN_INTERVAL_SECONDS with 429 `too_fast`. A quick machine
   solves a low-difficulty challenge in well under a second, so without
   pacing the loop sprints straight into that limiter, and the old code
   treated the 429 like any other rejection: toast, and stop the session.
   The effect was that the faster your CPU, the sooner nurturing died.

   Two things prevent it now. Before submitting, the loop waits out
   whatever is left of the interval since the last accepted heartbeat. If
   a 429 still comes back (clock skew, a longer server-side interval, a
   retried request), it is treated as back-pressure rather than failure:
   the loop sleeps for the server's own retryAfterSeconds and resubmits
   the same solution, which is still valid because the rate-limit check
   runs before the challenge is consumed. The interval the server reports
   is remembered, so the loop self-corrects to the real configured value.
   ===================================================================== */

export interface NurtureStats {
  heartbeats: number;
  monkiEarned: number;
  powerGained: number;
  hashes: number;
  hashRate: number;
  lastMultiplier: number;
  companionBuffPct: number;
}

const EMPTY_STATS: NurtureStats = {
  heartbeats: 0,
  monkiEarned: 0,
  powerGained: 0,
  hashes: 0,
  hashRate: 0,
  lastMultiplier: 1,
  companionBuffPct: 0,
};

export type NurturePhase =
  | "idle"
  | "starting"
  | "solving"
  | "submitting"
  /** Solved, holding for the server's minimum gap before submitting. */
  | "pacing"
  | "stopping";

/** Resolves after `ms`, or early if `abort` flips false. Never rejects. */
function sleep(ms: number, abort: () => boolean): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const step = 100;
    let waited = 0;
    const id = window.setInterval(() => {
      waited += step;
      if (waited >= ms || abort()) {
        window.clearInterval(id);
        resolve();
      }
    }, step);
  });
}

/**
 * A 429 from the heartbeat endpoint, carrying the server's own wait.
 * Anything else, including a 429 without the `too_fast` code, is a real
 * failure and is left for the caller to surface.
 */
function readTooFast(err: unknown): { retryAfterSeconds: number } | null {
  if (!(err instanceof ApiError) || err.status !== 429) return null;
  const body = err.body as { error?: string; retryAfterSeconds?: number } | undefined;
  if (body?.error !== "too_fast") return null;
  const wait = Number(body.retryAfterSeconds);
  return { retryAfterSeconds: Number.isFinite(wait) && wait > 0 ? wait : 1 };
}

export function useNurture(agentId: string | undefined) {
  const qc = useQueryClient();

  const [phase, setPhase] = useState<NurturePhase>("idle");
  const [stats, setStats] = useState<NurtureStats>(EMPTY_STATS);
  const [power, setPower] = useState<number | null>(null);
  const [state, setState] = useState<AgentState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const sessionRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const currentSeedRef = useRef<string | null>(null);
  /** Epoch ms of the last accepted heartbeat, for pacing the next one. */
  const lastAcceptedRef = useRef(0);
  /** Server's minimum gap, in seconds. Corrected by any 429 we receive. */
  const minIntervalRef = useRef(HEARTBEAT_MIN_INTERVAL_SECONDS);

  const isRunning = phase !== "idle";

  const teardownWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    currentSeedRef.current = null;
  }, []);

  const grind = useCallback((challenge: Challenge) => {
    if (!workerRef.current) return;
    currentSeedRef.current = challenge.seed;
    setDifficulty(challenge.difficulty);
    setPhase("solving");
    workerRef.current.postMessage({
      seed: challenge.seed,
      difficulty: challenge.difficulty,
    } satisfies PowRequest);
  }, []);

  const stop = useCallback(async () => {
    if (!runningRef.current) return;
    runningRef.current = false;
    setPhase("stopping");

    const seed = currentSeedRef.current;
    if (seed && workerRef.current) {
      workerRef.current.postMessage({ seed, difficulty: 0, cancel: true } satisfies PowRequest);
    }
    teardownWorker();

    const sessionId = sessionRef.current;
    sessionRef.current = null;

    if (sessionId != null) {
      try {
        await sessions.stop(sessionId);
      } catch {
        /* the server also expires sessions on its own */
      }
    }

    setPhase("idle");
    setDifficulty(null);
    qc.invalidateQueries({ queryKey: qk.summary });
    qc.invalidateQueries({ queryKey: qk.claimable });
    if (agentId) qc.invalidateQueries({ queryKey: qk.agent(agentId) });
  }, [agentId, qc, teardownWorker]);

  const start = useCallback(
    async (intensity: Intensity = "standard") => {
      if (!agentId || runningRef.current) return;

      setError(null);
      setStats(EMPTY_STATS);
      setPhase("starting");
      runningRef.current = true;
      lastAcceptedRef.current = 0;

      try {
        const session = await sessions.start(agentId, intensity);
        if (!runningRef.current) return;

        sessionRef.current = session.sessionId;

        const worker = new Worker(new URL("@/workers/pow.worker.ts", import.meta.url), {
          type: "module",
        });
        workerRef.current = worker;

        worker.onmessage = async (event: MessageEvent<PowResponse>) => {
          const msg = event.data;
          if (!runningRef.current) return;

          if (msg.type === "progress") {
            setStats((s) => ({ ...s, hashes: s.hashes + 0, hashRate: msg.hashRate }));
            return;
          }
          if (msg.type === "cancelled") return;

          // A solution for a challenge we have already moved past is stale.
          if (msg.seed !== currentSeedRef.current) return;

          try {
            const sessionId = sessionRef.current;
            if (sessionId == null) return;

            // Wait out whatever is left of the server's minimum gap. On the
            // first heartbeat of a session there is nothing to wait for.
            const sinceLast = Date.now() - lastAcceptedRef.current;
            const gapMs = minIntervalRef.current * 1000;
            if (lastAcceptedRef.current > 0 && sinceLast < gapMs) {
              setPhase("pacing");
              await sleep(gapMs - sinceLast, () => !runningRef.current);
              if (!runningRef.current) return;
            }

            setPhase("submitting");

            // The rate-limit check runs before the challenge is consumed, so
            // a rejected solution is still a valid solution: on `too_fast`
            // we sleep and resubmit the same nonce rather than discarding
            // the work and killing the session.
            let result = null as Awaited<ReturnType<typeof sessions.heartbeat>> | null;
            for (let attempt = 0; attempt < 4 && result === null; attempt += 1) {
              try {
                result = await sessions.heartbeat(sessionId, msg.seed, msg.nonce);
              } catch (err) {
                const tooFast = readTooFast(err);
                if (!tooFast) throw err;

                // Trust the server over our own configured guess.
                minIntervalRef.current = Math.max(
                  minIntervalRef.current,
                  tooFast.retryAfterSeconds,
                );
                setPhase("pacing");
                await sleep(tooFast.retryAfterSeconds * 1000 + 250, () => !runningRef.current);
                if (!runningRef.current) return;
                setPhase("submitting");
              }
            }
            if (!runningRef.current) return;
            if (result === null) {
              throw new Error("The server kept asking us to slow down. Try again in a moment.");
            }

            lastAcceptedRef.current = Date.now();

            setStats((s) => ({
              heartbeats: s.heartbeats + 1,
              monkiEarned: s.monkiEarned + (result.monkiEarned ?? 0),
              powerGained: s.powerGained + (result.powerDelta ?? 0),
              hashes: s.hashes + msg.hashes,
              hashRate: msg.ms > 0 ? Math.round((msg.hashes / msg.ms) * 1000) : s.hashRate,
              lastMultiplier: result.effectiveMultiplier ?? s.lastMultiplier,
              companionBuffPct: result.companionBuffPct ?? s.companionBuffPct,
            }));
            setPower(result.agent?.power ?? null);
            setState(result.agent?.state ?? null);

            if (result.nextChallenge) {
              grind(result.nextChallenge);
            } else {
              // The server ended the session (expired, or the agent is full).
              await stop();
            }
          } catch (err) {
            setError(describeError(err));
            toast.error("Heartbeat rejected", { description: describeError(err) });
            await stop();
          }
        };

        worker.onerror = () => {
          setError("The compute worker failed to start.");
          void stop();
        };

        grind(session.challenge);
      } catch (err) {
        runningRef.current = false;
        setPhase("idle");
        setError(describeError(err));
        toast.error("Could not start nurturing", { description: describeError(err) });
      }
    },
    [agentId, grind, stop],
  );

  const toggle = useCallback(
    (intensity: Intensity = "standard") => (isRunning ? stop() : start(intensity)),
    [isRunning, start, stop],
  );

  // Never leave a worker or an open session behind on unmount.
  useEffect(
    () => () => {
      runningRef.current = false;
      teardownWorker();
      const sessionId = sessionRef.current;
      if (sessionId != null) void sessions.stop(sessionId).catch(() => {});
    },
    [teardownWorker],
  );

  return {
    phase,
    isRunning,
    stats,
    power,
    state,
    difficulty,
    error,
    start,
    stop,
    toggle,
  };
}
