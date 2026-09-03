import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler, parseBody } from "../lib/http";
import { accrueStakingRewards } from "../db/rewards";
import { disbursePonsClaim, ClaimPreBroadcastError } from "../lib/chain";
import { isPonsClaimingEnabled } from "../lib/settings";

export const rewardsRouter = Router();

// GET /api/rewards/claimable — balances of $MONKI and $PONS
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

// POST /api/rewards/claim — disburse claimable $PONS to user wallet on Robinhood Chain
rewardsRouter.post(
  "/rewards/claim",
  requireAuth,
  handler(async (req, res) => {
    const userAddress = req.user!.walletAddress;

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
