import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler, parseBody } from "../lib/http";
import { getProtocolSetting } from "../lib/settings";
import { epochIndexAt } from "../lib/pons-epoch";
import { publishStanding, verifyAndBurn, witnessFor, STANDING_TREE_HEIGHT } from "../lib/zk-standing";

export const zkRouter = Router();

/* =====================================================================
   Private standing.

   Tiers are coarse on purpose. A proof reveals the claim it satisfies, so
   anonymity is only as good as the number of people who could have made
   the same claim. "Top 3" would name you in a fleet this size; "Top 100"
   hides you in a crowd. These thresholds are the product being honest
   about the privacy it can actually deliver.
   ===================================================================== */
export const STANDING_TIERS = [
  { key: "canopy", label: "Canopy", maxRank: 100, minStake: 0 },
  { key: "ridge", label: "Ridge", maxRank: 50, minStake: 1_000 },
  { key: "summit", label: "Summit", maxRank: 25, minStake: 10_000 },
] as const;

export type TierKey = (typeof STANDING_TIERS)[number]["key"];

async function isEnabled(): Promise<boolean> {
  const val = await getProtocolSetting("zk_private_standing", "false");
  return val === "true" || val === "1";
}

/** The epoch a standing is published for: the one that has fully closed. */
function currentStandingEpoch(): number {
  return epochIndexAt(new Date()) - 1;
}

// GET /api/zk/params — everything a client needs before it can prove
zkRouter.get(
  "/zk/params",
  handler(async (_req, res) => {
    const epochIndex = currentStandingEpoch();
    const { rows } = await pool.query<{ root: string; leaf_count: number; published_at: Date }>(
      `SELECT root, leaf_count, published_at FROM zk_standing_epochs WHERE epoch_index = $1`,
      [epochIndex],
    );

    res.json({
      ok: true,
      enabled: await isEnabled(),
      epochIndex,
      treeHeight: STANDING_TREE_HEIGHT,
      published: Boolean(rows[0]),
      root: rows[0]?.root ?? null,
      participants: rows[0]?.leaf_count ?? 0,
      publishedAt: rows[0] ? new Date(rows[0].published_at).toISOString() : null,
      tiers: STANDING_TIERS,
      // Proving is heavy and runs in the browser. Saying so up front lets
      // the client set expectations instead of looking frozen.
      provingHintSeconds: 120,
    });
  }),
);

const commitmentSchema = z.object({
  commitment: z.string().regex(/^\d+$/, "commitment must be a field element in decimal"),
});

// POST /api/zk/commitment — register Poseidon(secret) for the caller
zkRouter.post(
  "/zk/commitment",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(commitmentSchema, req, res);
    if (!body) return;

    // Rotating a commitment mid-epoch would strand the leaf already in the
    // published tree, so the new one only takes effect at the next publish.
    await pool.query(
      `INSERT INTO zk_identity_commitments (user_address, commitment)
       VALUES ($1, $2)
       ON CONFLICT (user_address)
       DO UPDATE SET commitment = EXCLUDED.commitment, updated_at = NOW()`,
      [req.user!.walletAddress, body.commitment],
    );

    res.json({ ok: true, appliesFromEpoch: currentStandingEpoch() + 1 });
  }),
);

// GET /api/zk/witness — the caller's own leaf and Merkle path
zkRouter.get(
  "/zk/witness",
  requireAuth,
  handler(async (req, res) => {
    const epochIndex = currentStandingEpoch();
    const witness = await witnessFor(epochIndex, req.user!.walletAddress);

    if (!witness) {
      res.status(404).json({
        error: "not_in_standing",
        message:
          "You are not in the published standing for this epoch. Register a commitment and earn $MONKI, then you are included at the next publish.",
        appliesFromEpoch: epochIndex + 1,
      });
      return;
    }

    // Which tiers this witness could actually satisfy, so the client does
    // not spend two minutes proving something that cannot hold.
    const stake = Number(witness.stake);
    const eligibleTiers = STANDING_TIERS.filter(
      (t) => witness.rank <= t.maxRank && stake >= t.minStake,
    ).map((t) => t.key);

    res.json({ ok: true, ...witness, eligibleTiers });
  }),
);

const redeemSchema = z.object({
  perkKey: z.string().min(1).max(64),
  tier: z.enum(STANDING_TIERS.map((t) => t.key) as [TierKey, ...TierKey[]]),
  root: z.string().regex(/^\d+$/),
  proof: z.unknown(),
});

// POST /api/zk/redeem — verify a standing proof and unlock a perk
//
// Deliberately NOT behind requireAuth. Requiring a session token here would
// attach a wallet to the redemption and undo the unlinkability the circuit
// exists to provide. The proof is the authorisation.
zkRouter.post(
  "/zk/redeem",
  handler(async (req, res) => {
    if (!(await isEnabled())) {
      res.status(403).json({ error: "zk_standing_disabled" });
      return;
    }

    const body = parseBody(redeemSchema, req, res);
    if (!body) return;

    const tier = STANDING_TIERS.find((t) => t.key === body.tier);
    if (!tier) {
      res.status(400).json({ error: "unknown_tier" });
      return;
    }

    const verdict = await verifyAndBurn({
      proofJson: body.proof,
      perkKey: `${body.tier}:${body.perkKey}`,
      claimedRoot: body.root,
      claimedMaxRank: tier.maxRank,
      claimedMinStake: tier.minStake,
    });

    if (!verdict.ok) {
      const status = verdict.reason === "already_redeemed" ? 409 : 400;
      res.status(status).json({ error: verdict.reason, detail: verdict.detail });
      return;
    }

    res.json({
      ok: true,
      tier: tier.key,
      label: tier.label,
      perkKey: body.perkKey,
      // Returned so a client can show its own redemption; it identifies the
      // standing, never the wallet.
      nullifier: verdict.nullifier,
    });
  }),
);

// GET /api/zk/board — the anonymous standing
//
// Counts per tier and nothing else. No addresses, no balances, no ordering
// within a tier, because any of those would re-identify the top of the list.
zkRouter.get(
  "/zk/board",
  handler(async (_req, res) => {
    const epochIndex = currentStandingEpoch();
    const { rows } = await pool.query<{ root: string; leaf_count: number }>(
      `SELECT root, leaf_count FROM zk_standing_epochs WHERE epoch_index = $1`,
      [epochIndex],
    );
    if (!rows[0]) {
      res.json({ ok: true, epochIndex, published: false, tiers: [] });
      return;
    }

    const counts = await pool.query<{ perk_count: string; tier: string }>(
      `SELECT split_part(perk_key, ':', 1) AS tier, COUNT(*) AS perk_count
         FROM zk_spent_nullifiers
        WHERE root = $1
        GROUP BY 1`,
      [rows[0].root],
    );
    const redeemedByTier = new Map(counts.rows.map((r) => [r.tier, Number(r.perk_count)]));

    res.json({
      ok: true,
      epochIndex,
      published: true,
      root: rows[0].root,
      participants: rows[0].leaf_count,
      tiers: STANDING_TIERS.map((t) => ({
        ...t,
        // How many places the tier covers, capped by who is actually ranked.
        capacity: Math.min(t.maxRank, rows[0].leaf_count),
        proofsVerified: redeemedByTier.get(t.key) ?? 0,
      })),
    });
  }),
);

const publishSchema = z.object({ epochIndex: z.number().int().optional() });

// POST /api/zk/publish — build and publish the standing for an epoch
//
// Admin-keyed rather than open, because publishing a root is the one action
// here that cannot be undone: proofs are issued against it and they are
// unlinkable, so a rewritten root breaks holders who cannot be identified
// to be told.
zkRouter.post(
  "/zk/publish",
  handler(async (req, res) => {
    const key = req.headers["x-admin-key"];
    const { env } = await import("../lib/env");
    if (!key || key !== env.adminMasterKey) {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    const body = parseBody(publishSchema, req, res);
    if (!body) return;

    const epochIndex = body.epochIndex ?? currentStandingEpoch();
    const published = await publishStanding(epochIndex);
    res.json({ ok: true, ...published });
  }),
);
