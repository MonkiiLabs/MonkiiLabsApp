import { Field, MerkleTree, verify, type VerificationKey } from "o1js";

import { pool } from "../db/index";
import { getProtocolSetting, setProtocolSetting } from "./settings";
import {
  PrivateStanding,
  STANDING_TREE_HEIGHT,
  identityCommitment,
  standingLeaf,
} from "./zk/leaderboardProgram";

/* =====================================================================
   Private standing: publishing the tree, and checking proofs against it.

   Two jobs, and they are deliberately separate.

   PUBLISHING builds a Merkle tree over the ranked nurturers and writes the
   root. Everything a proof is checked against comes from here, so a root
   is written once and never rewritten: editing it would silently
   invalidate every proof already issued against it, and those proofs are
   unlinkable, so nobody could be told.

   VERIFYING checks a proof against a root we published, then burns the
   nullifier. The nullifier is the only thing that persists, and it is
   deliberately not stored next to a wallet address.

   Compiling the circuit takes a minute and a half cold. The verifier does
   not need the circuit though, only the verification key, so the key is
   compiled once, cached in protocol_settings, and reused from then on.
   ===================================================================== */

const VK_SETTING_KEY = "zk_standing_vk";

/** In-process cache, so a warm server does not touch the database either. */
let cachedKey: VerificationKey | null = null;

/**
 * The verification key, from memory, then from the database, then by
 * compiling. Only the very first call on a fresh deployment pays the
 * compile cost.
 */
export async function getVerificationKey(): Promise<VerificationKey> {
  if (cachedKey) return cachedKey;

  const stored = await getProtocolSetting(VK_SETTING_KEY, "");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { data: string; hash: string };
      const key = { data: parsed.data, hash: Field(parsed.hash) } as VerificationKey;
      cachedKey = key;
      return key;
    } catch {
      console.warn("[zk] stored verification key was unreadable, recompiling");
    }
  }

  console.log("[zk] compiling PrivateStanding, this takes a while on a cold start...");
  const started = Date.now();
  const { verificationKey } = await PrivateStanding.compile();
  console.log(`[zk] compiled in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  await setProtocolSetting(
    VK_SETTING_KEY,
    JSON.stringify({ data: verificationKey.data, hash: verificationKey.hash.toString() }),
  );
  cachedKey = verificationKey;
  return verificationKey;
}

export interface PublishedStanding {
  epochIndex: number;
  root: string;
  leafCount: number;
  treeHeight: number;
}

/**
 * Build and publish the standing for an epoch.
 *
 * Only wallets that have registered a commitment can appear, because a leaf
 * without one cannot be proved and would just be dead weight in the tree.
 * Ranking is by lifetime $MONKI earned, matching the public leaderboard, so
 * the private and public views never disagree about who placed where.
 *
 * Idempotent: publishing an epoch that already has a root returns the
 * existing one untouched.
 */
export async function publishStanding(epochIndex: number): Promise<PublishedStanding> {
  const existing = await pool.query<{ root: string; leaf_count: number; tree_height: number }>(
    `SELECT root, leaf_count, tree_height FROM zk_standing_epochs WHERE epoch_index = $1`,
    [epochIndex],
  );
  if (existing.rows[0]) {
    return {
      epochIndex,
      root: existing.rows[0].root,
      leafCount: existing.rows[0].leaf_count,
      treeHeight: existing.rows[0].tree_height,
    };
  }

  const maxLeaves = 2 ** (STANDING_TREE_HEIGHT - 1) - 1; // index 0 is reserved
  const { rows } = await pool.query<{
    wallet_address: string;
    commitment: string;
    staked: string;
  }>(
    `SELECT u.wallet_address,
            c.commitment,
            FLOOR(COALESCE(r.staked_monki, 0))::bigint AS staked
       FROM users u
       JOIN zk_identity_commitments c ON c.user_address = u.wallet_address
  LEFT JOIN rewards r ON r.user_address = u.wallet_address
      WHERE u.total_monki_earned > 0
      ORDER BY u.total_monki_earned DESC
      LIMIT $1`,
    [maxLeaves],
  );

  const tree = new MerkleTree(STANDING_TREE_HEIGHT);
  const leaves = rows.map((row, i) => {
    const rank = i + 1; // 1-based: leaf index 0 stays empty so rank 0 is invalid
    const stake = BigInt(row.staked ?? 0);
    const leaf = standingLeaf(Field(row.commitment), Field(rank), Field(stake));
    tree.setLeaf(BigInt(rank), leaf);
    return { rank, address: row.wallet_address, commitment: row.commitment, stake, leaf };
  });

  const root = tree.getRoot().toString();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO zk_standing_epochs (epoch_index, root, tree_height, leaf_count)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (epoch_index) DO NOTHING`,
      [epochIndex, root, STANDING_TREE_HEIGHT, leaves.length],
    );
    for (const l of leaves) {
      await client.query(
        `INSERT INTO zk_standing_leaves (epoch_index, rank, user_address, commitment, stake, leaf)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (epoch_index, rank) DO NOTHING`,
        [epochIndex, l.rank, l.address, l.commitment, l.stake.toString(), l.leaf.toString()],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return { epochIndex, root, leafCount: leaves.length, treeHeight: STANDING_TREE_HEIGHT };
}

/** Rebuild the tree for an epoch from its stored leaves, to cut a witness. */
async function treeForEpoch(epochIndex: number): Promise<MerkleTree> {
  const { rows } = await pool.query<{ rank: number; leaf: string }>(
    `SELECT rank, leaf FROM zk_standing_leaves WHERE epoch_index = $1`,
    [epochIndex],
  );
  const tree = new MerkleTree(STANDING_TREE_HEIGHT);
  for (const r of rows) tree.setLeaf(BigInt(r.rank), Field(r.leaf));
  return tree;
}

export interface StandingWitness {
  epochIndex: number;
  root: string;
  rank: number;
  stake: string;
  /** Merkle path, in the shape o1js's MerkleWitness constructor takes. */
  path: Array<{ isLeft: boolean; sibling: string }>;
}

/**
 * Everything one participant needs to build a proof. This response is the
 * one place the server hands back a rank tied to an address, so it is
 * authenticated and returns only the caller's own row.
 */
export async function witnessFor(
  epochIndex: number,
  userAddress: string,
): Promise<StandingWitness | null> {
  const { rows } = await pool.query<{ rank: number; stake: string; root: string }>(
    `SELECT l.rank, l.stake, e.root
       FROM zk_standing_leaves l
       JOIN zk_standing_epochs e ON e.epoch_index = l.epoch_index
      WHERE l.epoch_index = $1 AND l.user_address = $2`,
    [epochIndex, userAddress],
  );
  const row = rows[0];
  if (!row) return null;

  const tree = await treeForEpoch(epochIndex);
  const witness = tree.getWitness(BigInt(row.rank));

  return {
    epochIndex,
    root: row.root,
    rank: row.rank,
    stake: row.stake,
    path: witness.map((w) => ({ isLeft: w.isLeft, sibling: w.sibling.toString() })),
  };
}

export type VerifyVerdict =
  | { ok: true; nullifier: string }
  | { ok: false; reason: string; detail?: string };

/**
 * Check a proof and burn its nullifier, in that order and atomically.
 *
 * The order matters: verifying first means a malformed proof cannot consume
 * a perk, and inserting the nullifier under a primary key means two
 * simultaneous redemptions of the same standing cannot both win.
 */
export async function verifyAndBurn(input: {
  proofJson: unknown;
  perkKey: string;
  claimedRoot: string;
  claimedMaxRank: number;
  claimedMinStake: number;
}): Promise<VerifyVerdict> {
  // 1. The root has to be one we actually published. Without this check a
  //    prover supplies a tree of their own making and every claim is true.
  const known = await pool.query(`SELECT 1 FROM zk_standing_epochs WHERE root = $1`, [
    input.claimedRoot,
  ]);
  if (known.rowCount === 0) {
    return { ok: false, reason: "unknown_root" };
  }

  let proof: Awaited<ReturnType<typeof PrivateStanding.Proof.fromJSON>>;
  try {
    proof = await PrivateStanding.Proof.fromJSON(input.proofJson as never);
  } catch (err: any) {
    return { ok: false, reason: "malformed_proof", detail: err?.message };
  }

  // 2. The claim carried inside the proof must be the claim being made.
  //    A valid proof of a weaker statement must not unlock a stronger perk.
  const claim = proof.publicInput;
  if (
    claim.root.toString() !== input.claimedRoot ||
    claim.maxRank.toString() !== String(input.claimedMaxRank) ||
    claim.minStake.toString() !== String(input.claimedMinStake)
  ) {
    return { ok: false, reason: "claim_mismatch" };
  }

  const verificationKey = await getVerificationKey();
  const valid = await verify(proof, verificationKey).catch(() => false);
  if (!valid) return { ok: false, reason: "invalid_proof" };

  const nullifier = proof.publicOutput.toString();

  try {
    const inserted = await pool.query(
      `INSERT INTO zk_spent_nullifiers (nullifier, root, perk_key, max_rank, min_stake)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (nullifier, perk_key) DO NOTHING`,
      [nullifier, input.claimedRoot, input.perkKey, input.claimedMaxRank, input.claimedMinStake],
    );
    if (inserted.rowCount === 0) {
      return { ok: false, reason: "already_redeemed" };
    }
  } catch (err: any) {
    return { ok: false, reason: "burn_failed", detail: err?.message };
  }

  return { ok: true, nullifier };
}

/** Re-export so routes and tests agree with the circuit on shapes. */
export { STANDING_TREE_HEIGHT, identityCommitment };
