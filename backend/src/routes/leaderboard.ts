import { Router } from "express";

import { pool } from "../db/index";
import { handler } from "../lib/http";
import { AGENT_COLUMNS, LIVE_POWER_SQL, mapAgent, type AgentRow } from "../lib/agents";

export const leaderboardRouter = Router();

// GET /api/leaderboard/top-nurturers — ranked by total $MONKI earned
leaderboardRouter.get(
  "/leaderboard/top-nurturers",
  handler(async (_req, res) => {
    const { rows } = await pool.query<{
      wallet_address: string;
      display_name: string | null;
      total_monki_earned: string;
    }>(
      `SELECT wallet_address, display_name, total_monki_earned
         FROM users
        WHERE total_monki_earned > 0
        ORDER BY total_monki_earned DESC LIMIT 50`,
    );

    res.json({
      nurturers: rows.map((r, i) => ({
        rank: i + 1,
        walletAddress: r.wallet_address,
        displayName: r.display_name,
        totalMonkiEarned: Number(r.total_monki_earned),
      })),
    });
  }),
);

// GET /api/leaderboard/top-agents — ranked by live power & nurturer count
leaderboardRouter.get(
  "/leaderboard/top-agents",
  handler(async (_req, res) => {
    const { rows } = await pool.query<AgentRow>(
      `SELECT ${AGENT_COLUMNS} FROM agents
        ORDER BY ${LIVE_POWER_SQL} DESC, nurturer_count DESC LIMIT 50`,
    );
    const now = new Date();
    res.json({
      agents: rows.map((r, i) => ({ rank: i + 1, ...mapAgent(r, now) })),
    });
  }),
);
