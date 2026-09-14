import { Router } from "express";

import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler } from "../lib/http";
import { AGENT_COLUMNS, mapAgent, type AgentRow } from "../lib/agents";
import { accrueStakingRewards } from "../db/rewards";
import { env } from "../lib/env";
import { epochIndexAt, firstEligibleEpochIndex, nextEpochStartAfter } from "../lib/pons-epoch";

export const dashboardRouter = Router();

// GET /api/dashboard/summary — complete user dashboard cockpit
dashboardRouter.get(
  "/dashboard/summary",
  requireAuth,
  handler(async (req, res) => {
    const userAddress = req.user!.walletAddress;

    // Accrue any pending epoch rewards first
    await accrueStakingRewards(userAddress);

    // 1. Agents user is actively nurturing
    const activeRes = await pool.query<
      AgentRow & { session_id: number; monki_earned: string; power_contributed: string }
    >(
      `SELECT s.id AS session_id, s.monki_earned, s.power_contributed,
              ${AGENT_COLUMNS.split(",")
                .map((c) => `a.${c.trim()}`)
                .join(", ")}
         FROM sessions s JOIN agents a ON a.id = s.agent_id
        WHERE s.user_address = $1 AND s.status = 'active'
        ORDER BY s.started_at DESC`,
      [userAddress],
    );

    // 2. User rewards
    const rewardsRes = await pool.query<{
      claimable_monki: string;
      claimed_monki: string;
      staked_monki: string;
      claimable_pons: string;
      claimed_pons: string;
      claimable_meta_stock: string;
      claimed_meta_stock: string;
      reward_multiplier: string;
      stake_period_started_at: Date;
    }>(
      `SELECT claimable_monki, claimed_monki, staked_monki, claimable_pons, claimed_pons,
              claimable_meta_stock, claimed_meta_stock, reward_multiplier, stake_period_started_at
         FROM rewards WHERE user_address = $1`,
      [userAddress],
    );

    // 3. User lifetime total
    const userRes = await pool.query<{ total_monki_earned: string }>(
      `SELECT total_monki_earned FROM users WHERE wallet_address = $1`,
      [userAddress],
    );

    // 4. Recent history (last 20 sessions)
    const historyRes = await pool.query<{
      id: number;
      agent_id: string;
      agent_name: string;
      status: string;
      started_at: Date;
      ended_at: Date | null;
      monki_earned: string;
      power_contributed: string;
    }>(
      `SELECT s.id, s.agent_id, a.name AS agent_name, s.status, s.started_at, s.ended_at,
              s.monki_earned, s.power_contributed
         FROM sessions s JOIN agents a ON a.id = s.agent_id
        WHERE s.user_address = $1
        ORDER BY s.started_at DESC LIMIT 20`,
      [userAddress],
    );

    // 5. Power rank by lifetime $MONKI earned
    const rankRes = await pool.query<{ rank: string }>(
      `SELECT COUNT(*) + 1 AS rank FROM users
        WHERE total_monki_earned > (SELECT COALESCE(total_monki_earned, 0) FROM users WHERE wallet_address = $1)`,
      [userAddress],
    );

    // 6. Total heartbeats completed by user
    const heartbeatsRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count
         FROM contributions c
         JOIN sessions s ON s.id = c.session_id
        WHERE s.user_address = $1`,
      [userAddress],
    );

    // 7. Active streak in days (unique days with contributions)
    const streakRes = await pool.query<{ count: string }>(
      `SELECT COUNT(DISTINCT DATE(c.created_at)) AS count
         FROM contributions c
         JOIN sessions s ON s.id = c.session_id
        WHERE s.user_address = $1`,
      [userAddress],
    );

    const r = rewardsRes.rows[0] ?? {
      claimable_monki: "0",
      claimed_monki: "0",
      staked_monki: "0",
      claimable_pons: "0",
      claimed_pons: "0",
      claimable_meta_stock: "0",
      claimed_meta_stock: "0",
      reward_multiplier: "1",
      stake_period_started_at: new Date(),
    };

    const stakedMonki = Number(r.staked_monki);
    const now = new Date();
    const isEligibleForNextEpoch =
      stakedMonki >= env.ponsMinStakeForPons &&
      firstEligibleEpochIndex(new Date(r.stake_period_started_at)) <= epochIndexAt(now);

    const activeList = activeRes.rows.map((row) => ({
      sessionId: row.session_id,
      monkiEarned: Number(row.monki_earned),
      powerContributed: Number(row.power_contributed),
      agent: mapAgent(row),
    }));

    res.json({
      activeAgents: activeList,
      totalHeartbeats: Number(heartbeatsRes.rows[0]?.count ?? 0),
      streakDays: Number(streakRes.rows[0]?.count ?? 0),
      rewards: {
        claimableMonki: Number(r.claimable_monki),
        claimedMonki: Number(r.claimed_monki),
        stakedMonki: Number(r.staked_monki),
        claimablePons: Number(r.claimable_pons),
        claimedPons: Number(r.claimed_pons),
        claimableMetaStock: Number(r.claimable_meta_stock),
        claimedMetaStock: Number(r.claimed_meta_stock),
        rewardMultiplier: Number(r.reward_multiplier),
        totalMonkiEarned: Number(userRes.rows[0]?.total_monki_earned ?? 0),
        stakePeriodStartedAt: new Date(r.stake_period_started_at).toISOString(),
        isEligibleForNextEpoch,
        nextEpochAt: nextEpochStartAfter(now).toISOString(),
      },
      powerRank: Number(rankRes.rows[0]?.rank ?? 1),
      history: historyRes.rows.map((h) => ({
        sessionId: h.id,
        agentId: h.agent_id,
        agentName: h.agent_name,
        status: h.status,
        startedAt: new Date(h.started_at).toISOString(),
        endedAt: h.ended_at ? new Date(h.ended_at).toISOString() : null,
        monkiEarned: Number(h.monki_earned),
        powerContributed: Number(h.power_contributed),
      })),
    });
  }),
);
