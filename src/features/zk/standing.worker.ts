/// <reference lib="webworker" />
import { Field, MerkleWitness, Poseidon } from "o1js";

import {
  PrivateStanding,
  STANDING_TREE_HEIGHT,
  StandingClaim,
} from "../../../zk/leaderboardProgram";

/* =====================================================================
   The standing prover.

   This runs in a worker for a blunt reason: compiling the circuit takes
   around ninety seconds on a cold start and producing a proof takes
   roughly one hundred more. On the main thread that is a frozen tab, not
   a slow one.

   The cost is also why proving is never wired to a button press. The
   product proves once per epoch, in the background, and caches the
   result. A perk click spends a proof that already exists.

   Nothing here is sent anywhere. The secret is derived in this worker
   from a signature the wallet already produced, used, and dropped.
   ===================================================================== */

class StandingWitness extends MerkleWitness(STANDING_TREE_HEIGHT) {}

export interface ProveRequest {
  /** Wallet signature over the derivation message. Never leaves the client. */
  signature: string;
  root: string;
  rank: number;
  stake: string;
  maxRank: number;
  minStake: number;
  path: Array<{ isLeft: boolean; sibling: string }>;
}

export type ProveResponse =
  | { type: "stage"; stage: "compiling" | "proving"; elapsedMs: number }
  | { type: "proved"; proofJson: unknown; nullifier: string; elapsedMs: number }
  | { type: "error"; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

/**
 * Turn a wallet signature into a field element.
 *
 * The signature is deterministic for a given wallet and message, so the
 * secret is recoverable on any device and never has to be stored. It is
 * reduced mod the field order by taking it through Poseidon rather than by
 * truncating, so no bits of entropy are discarded.
 */
function secretFromSignature(signature: string): Field {
  const hex = signature.startsWith("0x") ? signature.slice(2) : signature;
  // Split into 60-hex-digit chunks, each comfortably below the field size.
  const chunks: Field[] = [];
  for (let i = 0; i < hex.length; i += 60) {
    chunks.push(Field(BigInt("0x" + hex.slice(i, i + 60))));
  }
  return Poseidon.hash(chunks);
}

let compiled = false;

ctx.onmessage = async (event: MessageEvent<ProveRequest>) => {
  const req = event.data;
  const startedAt = Date.now();

  try {
    if (!compiled) {
      ctx.postMessage({ type: "stage", stage: "compiling", elapsedMs: 0 } satisfies ProveResponse);
      await PrivateStanding.compile();
      compiled = true;
    }

    ctx.postMessage({
      type: "stage",
      stage: "proving",
      elapsedMs: Date.now() - startedAt,
    } satisfies ProveResponse);

    const secret = secretFromSignature(req.signature);
    const claim = new StandingClaim({
      root: Field(req.root),
      maxRank: Field(req.maxRank),
      minStake: Field(req.minStake),
    });
    const witness = new StandingWitness(
      req.path.map((p) => ({ isLeft: p.isLeft, sibling: Field(p.sibling) })),
    );

    const { proof } = await PrivateStanding.proveStanding(
      claim,
      secret,
      Field(req.rank),
      Field(req.stake),
      witness,
    );

    ctx.postMessage({
      type: "proved",
      proofJson: proof.toJSON(),
      nullifier: proof.publicOutput.toString(),
      elapsedMs: Date.now() - startedAt,
    } satisfies ProveResponse);
  } catch (err) {
    ctx.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "proof generation failed",
    } satisfies ProveResponse);
  }
};
