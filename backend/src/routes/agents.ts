import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { handler, parseBody } from "../lib/http";
import { AGENT_COLUMNS, LIVE_POWER_SQL, mapAgent, type AgentRow } from "../lib/agents";
import { getAgentCompanionBuffs } from "../lib/companions";

export const agentsRouter = Router();

// GET /api/agents — list fleet agents with live decayed power + state
agentsRouter.get(
  "/agents",
  handler(async (req, res) => {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;

    let sql = `SELECT ${AGENT_COLUMNS} FROM agents WHERE 1=1`;
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ` ORDER BY ${LIVE_POWER_SQL} DESC, nurturer_count DESC`;

    const { rows } = await pool.query<AgentRow>(sql, params);
    const now = new Date();
    let agents = rows.map((r) => mapAgent(r, now));

    if (state) {
      agents = agents.filter((a) => a.state === state);
    }

    res.json({ agents });
  }),
);

// GET /api/agents/:id — single agent detail + equipped companions and active buffs
agentsRouter.get(
  "/agents/:id",
  handler(async (req, res) => {
    const id = req.params.id;
    const { rows } = await pool.query<AgentRow>(
      `SELECT ${AGENT_COLUMNS} FROM agents WHERE id = $1`,
      [id],
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "agent_not_found" });
      return;
    }

    const agent = mapAgent(rows[0]);
    const companionBuffs = await getAgentCompanionBuffs(id, req.user?.walletAddress);

    res.json({
      agent,
      companionBuffs,
    });
  }),
);

const registerSchema = z.object({
  id: z.string().min(3).max(64),
  name: z.string().min(2).max(128),
  description: z.string().default(""),
  category: z.string().default("sentinel"),
  xHandle: z.string().optional(),
  avatarUrl: z.string().optional(),
  powerDecayRate: z.number().positive().default(1.0),
});

// POST /api/agents/register — register new agent
agentsRouter.post(
  "/agents/register",
  handler(async (req, res) => {
    const body = parseBody(registerSchema, req, res);
    if (!body) return;

    const ownerWallet = req.user?.walletAddress ?? "0x0000000000000000000000000000000000000000";

    try {
      const { rows } = await pool.query<AgentRow>(
        `INSERT INTO agents (id, on_chain_id, name, description, category, x_handle, avatar_url, power_decay_rate, owner_wallet, current_power, state)
         VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $8, 88, 'thriving')
         RETURNING ${AGENT_COLUMNS}`,
        [body.id, body.name, body.description, body.category, body.xHandle ?? null, body.avatarUrl ?? null, body.powerDecayRate, ownerWallet],
      );
      res.status(201).json({ agent: mapAgent(rows[0]) });
    } catch (err: any) {
      if (err.code === "23505") {
        res.status(409).json({ error: "agent_id_already_exists" });
        return;
      }
      throw err;
    }
  }),
);
