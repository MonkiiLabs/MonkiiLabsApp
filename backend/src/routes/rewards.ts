import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler, parseBody } from "../lib/http";
import { accrueStakingRewards } from "../db/rewards";
import { disbursePonsClaim } from "../lib/chain";
import { isPonsClaimingEnabled } from "../lib/settings";
import { verifyActionAuthorization, type ClaimAuthPayload } from "../lib/claim-auth";

export const rewardsRouter = Router();

const claimAuthSchema = z.object({
  signature: z.string(),
  nonce: z.string(),
  timestamp: z.number(),
});

// GET /api/rewards/claimable — balances of $MONKI, $PONS, and $META
rewardsRouter.get(
  "/rewards/claimable",
  requireAuth,
  handler(async (req, res) => {
    const userAddress = req.user!.walletAddress;
    await accrueStakingRewards(userAddress);

    const { rows } = await pool.query<{
      claimable_monki: string;
      claimed_monki: string;
      staked_monki: string;
      claimable_pons: string;
      claimed_pons: string;
      claimable_meta_stock: string;
      claimed_meta_stock: string;
    }>(
      `SELECT claimable_monki, claimed_monki, staked_monki, claimable_pons, claimed_pons,
              claimable_meta_stock, claimed_meta_stock
         FROM rewards WHERE user_address = $1`,
      [userAddress],
    );

    const r = rows[0] ?? {
      claimable_monki: "0",
      claimed_monki: "0",
      staked_monki: "0",
      claimable_pons: "0",
      claimed_pons: "0",
      claimable_meta_stock: "0",
      claimed_meta_stock: "0",
    };

    res.json({
      claimableMonki: Number(r.claimable_monki),
      claimedMonki: Number(r.claimed_monki),
      stakedMonki: Number(r.staked_monki),
      claimablePons: Number(r.claimable_pons),
      claimedPons: Number(r.claimed_pons),
      claimableMetaStock: Number(r.claimable_meta_stock),
      claimedMetaStock: Number(r.claimed_meta_stock),
    });
  }),
);

// POST /api/rewards/claim — disburse claimable $PONS with cryptographic wallet signature
rewardsRouter.post(
  "/rewards/claim",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(claimAuthSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;

    // Verify wallet signed authorization for withdraw_pons
    const authVerdict = await verifyActionAuthorization(userAddress, {
      ...body,
      action: "withdraw_pons",
    });
    if (!authVerdict.ok) {
      res.status(401).json({ error: "unauthorized_action", reason: authVerdict.reason });
      return;
    }

    const isEnabled = await isPonsClaimingEnabled();
    if (!isEnabled) {
      res.status(400).json({ error: "claim_disabled", message: "$PONS claiming is currently paused." });
      return;
    }

    await accrueStakingRewards(userAddress);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<{ claimable_pons: string }>(
        `SELECT claimable_pons FROM rewards WHERE user_address = $1 FOR UPDATE`,
        [userAddress],
      );
      const claimable = Number(rows[0]?.claimable_pons ?? 0);
      if (claimable <= 0) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: "nothing_to_claim" });
        return;
      }

      let txHash: string;
      try {
        const disburseRes = await disbursePonsClaim(userAddress, claimable);
        txHash = disburseRes.txHash;
      } catch (chainErr: any) {
        await client.query("ROLLBACK");
        res.status(502).json({
          error: "disbursal_failed",
          message: chainErr.message || "Failed to disburse tokens on Robinhood Chain",
        });
        return;
      }

      await client.query(
        `UPDATE rewards
            SET claimed_pons = claimed_pons + $1,
                claimable_pons = 0,
                last_claim_tx = $2,
                updated_at = now()
          WHERE user_address = $3`,
        [claimable, txHash, userAddress],
      );

      await client.query("COMMIT");

      res.json({
        ok: true,
        claimedPons: claimable,
        txHash,
        network: "robinhood-chain-l2",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }),
);

// POST /api/rewards/claim-monki — withdraw $MONKI with signed authorization
rewardsRouter.post(
  "/rewards/claim-monki",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(claimAuthSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;
    const authVerdict = await verifyActionAuthorization(userAddress, {
      ...body,
      action: "withdraw_monki",
    });
    if (!authVerdict.ok) {
      res.status(401).json({ error: "unauthorized_action", reason: authVerdict.reason });
      return;
    }

    const { isMonkiClaimingEnabled } = await import("../lib/settings");
    if (!(await isMonkiClaimingEnabled())) {
      res.status(403).json({
        error: "claiming_disabled_pre_launch",
        message: "$MONKI claiming is disabled during Pre-Launch. Continue Proof-of-Life heartbeats to accrue telemetry points until TGE.",
      });
      return;
    }

    const { rows } = await pool.query<{ claimable_monki: string }>(
      `SELECT claimable_monki FROM rewards WHERE user_address = $1`,
      [userAddress],
    );
    const claimable = Number(rows[0]?.claimable_monki ?? 0);
    if (claimable <= 0) {
      res.status(400).json({ error: "nothing_to_claim" });
      return;
    }

    await pool.query(
      `UPDATE rewards
          SET claimed_monki = claimed_monki + claimable_monki,
              claimable_monki = 0,
              updated_at = now()
        WHERE user_address = $1`,
      [userAddress],
    );

    res.json({
      ok: true,
      withdrawnMonki: claimable,
      status: "settled",
    });
  }),
);

// POST /api/rewards/claim-meta — withdraw future $META stock token with signed authorization
rewardsRouter.post(
  "/rewards/claim-meta",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(claimAuthSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;
    const authVerdict = await verifyActionAuthorization(userAddress, {
      ...body,
      action: "withdraw_meta",
    });
    if (!authVerdict.ok) {
      res.status(401).json({ error: "unauthorized_action", reason: authVerdict.reason });
      return;
    }

    res.status(501).json({
      error: "feature_pending_phase_2",
      message: "$META Stock Token distribution split activates in Phase 2 on Robinhood Chain.",
    });
  }),
);
