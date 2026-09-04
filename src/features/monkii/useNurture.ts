import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { sessions } from "@/features/api/endpoints";
import { describeError, qk } from "@/features/api/hooks";
import type { AgentState, Challenge, Intensity } from "@/features/api/types";
import type { PowRequest, PowResponse } from "@/workers/pow.worker";

/* =====================================================================
   The Proof-of-Life loop.

   start → worker grinds a nonce → submit heartbeat → server verifies,
   pays $MONKII, restores vitality and hands back the next challenge →
   grind again. The worker lives off the main thread, and the loop is
   driven by refs rather than state so a re-render never restarts a grind
   or double-submits a solution.
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

export type NurturePhase = "idle" | "starting" | "solving" | "submitting" | "stopping";

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

          setPhase("submitting");
          try {
            const sessionId = sessionRef.current;
            if (sessionId == null) return;

            const result = await sessions.heartbeat(sessionId, msg.seed, msg.nonce);
            if (!runningRef.current) return;

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
