import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ProveRequest, ProveResponse } from "./standing.worker";

/* =====================================================================
   Private standing, client side.

   Proving is slow enough that the shape of this hook is dictated by it:
   one signature, one proof per epoch, cached, and every perk redemption
   afterwards spends the cached proof rather than making a new one.

   The cache is keyed by root, so a new epoch invalidates it exactly when
   the standing it was proved against stops being current.
   ===================================================================== */

/** The message the wallet signs to derive the standing secret. */
export const STANDING_SECRET_MESSAGE = [
  "Monkii Labs private standing",
  "",
  "Signing derives the secret that proves your place on the leaderboard",
  "without revealing your address or your balance.",
  "",
  "This signature never leaves your browser. It costs no gas and sends no",
  "transaction. Signing the same message again on any device recovers the",
  "same secret.",
].join("\n");

export interface StandingTier {
  key: string;
  label: string;
  maxRank: number;
  minStake: number;
}

export interface StandingParams {
  enabled: boolean;
  epochIndex: number;
  published: boolean;
  root: string | null;
  participants: number;
  tiers: StandingTier[];
  provingHintSeconds: number;
}

export interface StandingWitness {
  epochIndex: number;
  root: string;
  rank: number;
  stake: string;
  path: Array<{ isLeft: boolean; sibling: string }>;
  eligibleTiers: string[];
}

export type ProofPhase = "idle" | "signing" | "compiling" | "proving" | "ready" | "error";

interface CachedProof {
  root: string;
  tier: string;
  proofJson: unknown;
  nullifier: string;
}

const CACHE_KEY = "monkii.standing.proof";

/** Cached proofs are per browser and per root, so a stale one is inert. */
function readCache(root: string, tier: string): CachedProof | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedProof;
    return parsed.root === root && parsed.tier === tier ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(entry: CachedProof): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* private window, or storage disabled. The proof still works this session. */
  }
}

export function useStandingParams() {
  return useQuery({
    queryKey: ["zk", "params"],
    queryFn: () => api.get<StandingParams & { ok: boolean }>("/zk/params", { anonymous: true }),
    staleTime: 60_000,
  });
}

export function useStandingWitness(enabled: boolean) {
  return useQuery({
    queryKey: ["zk", "witness"],
    queryFn: () => api.get<StandingWitness & { ok: boolean }>("/zk/witness"),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

/**
 * Drives one proof. `signMessage` is passed in rather than imported so the
 * hook does not care which wallet layer is in use, and so a test can drive
 * it without a wallet at all.
 */
export function useStandingProof(signMessage: (message: string) => Promise<string>) {
  const [phase, setPhase] = useState<ProofPhase>("idle");
  const [elapsedMs, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<CachedProof | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  const prove = useCallback(
    async (witness: StandingWitness, tier: StandingTier) => {
      setError(null);

      const cached = readCache(witness.root, tier.key);
      if (cached) {
        setProof(cached);
        setPhase("ready");
        return cached;
      }

      setPhase("signing");
      let signature: string;
      try {
        signature = await signMessage(STANDING_SECRET_MESSAGE);
      } catch {
        setPhase("error");
        setError("Signature declined. The secret cannot be derived without it.");
        return null;
      }

      const worker = new Worker(new URL("./standing.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current = worker;

      return new Promise<CachedProof | null>((resolve) => {
        worker.onmessage = (event: MessageEvent<ProveResponse>) => {
          const msg = event.data;

          if (msg.type === "stage") {
            setPhase(msg.stage);
            setElapsed(msg.elapsedMs);
            return;
          }

          if (msg.type === "error") {
            setPhase("error");
            setError(msg.message);
            worker.terminate();
            workerRef.current = null;
            resolve(null);
            return;
          }

          const entry: CachedProof = {
            root: witness.root,
            tier: tier.key,
            proofJson: msg.proofJson,
            nullifier: msg.nullifier,
          };
          writeCache(entry);
          setProof(entry);
          setElapsed(msg.elapsedMs);
          setPhase("ready");
          worker.terminate();
          workerRef.current = null;
          resolve(entry);
        };

        worker.postMessage({
          signature,
          root: witness.root,
          rank: witness.rank,
          stake: witness.stake,
          maxRank: tier.maxRank,
          minStake: tier.minStake,
          path: witness.path,
        } satisfies ProveRequest);
      });
    },
    [signMessage],
  );

  /**
   * Spend a proof on a perk. Sent without a session token on purpose: the
   * proof is the authorisation, and attaching a wallet here would link the
   * redemption back to an identity and undo the point of the circuit.
   */
  const redeem = useCallback(
    async (perkKey: string, entry: CachedProof) => {
      return api.post<{ ok: boolean; tier: string; label: string; nullifier: string }>(
        "/zk/redeem",
        { perkKey, tier: entry.tier, root: entry.root, proof: entry.proofJson },
        { anonymous: true },
      );
    },
    [],
  );

  const registerCommitment = useCallback(
    async (commitment: string) => api.post<{ ok: boolean }>("/zk/commitment", { commitment }),
    [],
  );

  return { phase, elapsedMs, error, proof, prove, redeem, registerCommitment };
}
