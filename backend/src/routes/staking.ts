import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler, parseBody } from "../lib/http";
import { multiplierFor, premiumUnlocked, stakingPolicy } from "../lib/staking";
import { accrueStakingRewards } from "../db/rewards";
import { env } from "../lib/env";
import { epochIndexAt, firstEligibleEpochIndex, nextEpochStartAfter } from "../lib/pons-epoch";

export const stakingRouter = Router();

async function applyStakeDelta(userAddress: string, deltaMonki: number) {
  // Settle any completed epochs against old stake amount first
  await accrueStakingRewards(userAddress);

  const { rows } = await pool.query<{ staked_monki: string }>(
    `UPDATE rewards
        SET staked_monki = GREATEST(staked_monki + $1, 0),
            claimable_monki = GREATEST(claimable_monki - $1, 0),
            stake_period_started_at = now(),
            updated_at = now()
      WHERE user_address = $2
      RETURNING staked_monki`,
    [deltaMonki, userAddress],
  );
  const staked = Number(rows[0].staked_monki);
  const multiplier = multiplierFor(staked);
  await pool.query(
    `UPDATE rewards SET reward_multiplier = $1 WHERE user_address = $2`,
    [multiplier, userAddress],
  );
  return { staked, multiplier };
}

const amountSchema = z.object({ amount: z.number().positive() });

// POST /api/staking/stake — lock $MONKI to increase heartbeat multiplier
stakingRouter.post(
  "/staking/stake",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(amountSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;
    const { rows: checkRows } = await pool.query<{ claimable_monki: string }>(
      `SELECT claimable_monki FROM rewards WHERE user_address = $1`,
      [userAddress],
    );
    const claimable = Number(checkRows[0]?.claimable_monki ?? 0);
    if (claimable < body.amount) {
      res.status(400).json({ error: "insufficient_claimable", message: "Insufficient claimable $MONKI to stake" });
      return;
    }

    const result = await applyStakeDelta(userAddress, body.amount);
    res.json({
      stakedMonki: result.staked,
      rewardMultiplier: result.multiplier,
      premiumAccess: premiumUnlocked(result.staked),
    });
  }),
);

// POST /api/staking/unstake — release staked $MONKI
stakingRouter.post(
  "/staking/unstake",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(amountSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;
    const { rows: checkRows } = await pool.query<{ staked_monki: string }>(
      `SELECT staked_monki FROM rewards WHERE user_address = $1`,
      [userAddress],
    );
    const staked = Number(checkRows[0]?.staked_monki ?? 0);
    if (staked < body.amount) {
      res.status(400).json({ error: "insufficient_staked", message: "Insufficient staked $MONKI to unstake" });
      return;
    }

    const result = await applyStakeDelta(userAddress, -body.amount);
    res.json({
      stakedMonki: result.staked,
      rewardMultiplier: result.multiplier,
      premiumAccess: premiumUnlocked(result.staked),
    });
  }),
);

// GET /api/staking/status — current stake status, multiplier, and epoch countdown
stakingRouter.get(
  "/staking/status",
  requireAuth,
  handler(async (req, res) => {
    const userAddress = req.user!.walletAddress;
    await accrueStakingRewards(userAddress);

    const { rows } = await pool.query<{
      staked_monki: string;
      claimable_monki: string;
      claimable_pons: string;
      reward_multiplier: string;
      stake_period_started_at: Date;
      pons_paid_through: Date;
    }>(
      `SELECT staked_monki, claimable_monki, claimable_pons, reward_multiplier,
              stake_period_started_at, pons_paid_through
         FROM rewards WHERE user_address = $1`,
      [userAddress],
    );

    const r = rows[0] ?? {
      staked_monki: "0",
      claimable_monki: "0",
      claimable_pons: "0",
      reward_multiplier: "1",
      stake_period_started_at: new Date(),
      pons_paid_through: new Date(),
    };

    const staked = Number(r.staked_monki);
    const now = new Date();
    const isEligibleForNextEpoch =
      staked >= env.ponsMinStakeForPons &&
      firstEligibleEpochIndex(new Date(r.stake_period_started_at)) <= epochIndexAt(now);

    res.json({
      stakedMonki: staked,
      claimableMonki: Number(r.claimable_monki),
      claimablePons: Number(r.claimable_pons),
      rewardMultiplier: Number(r.reward_multiplier),
      stakePeriodStartedAt: new Date(r.stake_period_started_at).toISOString(),
      isEligibleForNextEpoch,
      nextEpochAt: nextEpochStartAfter(now).toISOString(),
      policy: stakingPolicy,
    });
  }),
);
