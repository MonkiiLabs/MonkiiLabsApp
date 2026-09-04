import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler, parseBody } from "../lib/http";
import { computeAccrual, issueChallenge, verifyAndConsume } from "../lib/pow";
import { deriveState } from "../lib/power";
import { LIVE_POWER_SQL } from "../lib/agents";
import { difficultyFor, INTENSITIES, type Intensity } from "../lib/intensity";
import { getAgentCompanionBuffs } from "../lib/companions";
import { env } from "../lib/env";

export const sessionsRouter = Router();

async function userRewardMultiplier(userAddress: string): Promise<number> {
  const { rows } = await pool.query<{ reward_multiplier: string }>(
    `SELECT reward_multiplier FROM rewards WHERE user_address = $1`,
    [userAddress],
  );
  return Number(rows[0]?.reward_multiplier ?? 1.0);
}

async function recountNurturers(agentId: string): Promise<void> {
  await pool.query(
    `UPDATE agents SET nurturer_count =
       (SELECT COUNT(DISTINCT user_address) FROM sessions WHERE agent_id = $1 AND status = 'active')
     WHERE agents.id = $1`,
    [agentId],
  );
}

const startSchema = z.object({
  agentId: z.string(),
  intensity: z.enum(INTENSITIES as [Intensity, ...Intensity[]]).default("standard"),
});

// POST /api/sessions/start — begin Proof-of-Life session for an agent
sessionsRouter.post(
  "/sessions/start",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(startSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;
    const agent = await pool.query(`SELECT id FROM agents WHERE id = $1`, [body.agentId]);
    if (agent.rowCount === 0) {
      res.status(404).json({ error: "agent_not_found" });
      return;
    }

    // End previous active sessions for this user & agent
    await pool.query(
      `UPDATE sessions
          SET status = 'ended', ended_at = now()
        WHERE user_address = $1 AND agent_id = $2 AND status = 'active'`,
      [userAddress, body.agentId],
    );

    const difficulty = difficultyFor(body.intensity);
    const created = await pool.query<{ id: number }>(
      `INSERT INTO sessions (user_id, user_address, agent_id, status, intensity, difficulty)
       VALUES ($1, $2, $3, 'active', $4, $5)
       RETURNING id`,
      [req.user!.id, userAddress, body.agentId, body.intensity, difficulty],
    );
    const sessionId = created.rows[0].id;
    await recountNurturers(body.agentId);

    const challenge = await issueChallenge(sessionId, difficulty);
    res.status(201).json({
      sessionId,
      agentId: body.agentId,
      status: "active",
      intensity: body.intensity,
      challenge,
    });
  }),
);

// GET /api/sessions/:id/challenge — get next challenge
sessionsRouter.get(
  "/sessions/:id/challenge",
  requireAuth,
  handler(async (req, res) => {
    const id = Number(req.params.id);
    const { rows } = await pool.query<{ status: string; difficulty: number }>(
      `SELECT status, difficulty FROM sessions WHERE id = $1 AND user_address = $2`,
      [id, req.user!.walletAddress],
    );
    if (!rows[0]) {
      res.status(404).json({ error: "session_not_found" });
      return;
    }
    if (rows[0].status !== "active") {
      res.status(409).json({ error: "session_superseded" });
      return;
    }
    res.json({ challenge: await issueChallenge(id, rows[0].difficulty) });
  }),
);

const heartbeatSchema = z.object({
  sessionId: z.coerce.number().int().positive(),
  seed: z.string(),
  nonce: z.coerce.string(),
});

// POST /api/sessions/heartbeat — submit solved PoW challenge; restore power & accrue $MONKI
sessionsRouter.post(
  "/sessions/heartbeat",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(heartbeatSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;

    const sessionRes = await pool.query<{
      id: number;
      agent_id: string;
      status: string;
      last_heartbeat_at: Date | null;
      difficulty: number;
    }>(
      `SELECT id, agent_id, status, last_heartbeat_at, difficulty
         FROM sessions WHERE id = $1 AND user_address = $2`,
      [body.sessionId, userAddress],
    );
    const session = sessionRes.rows[0];
    if (!session) {
      res.status(404).json({ error: "session_not_found" });
      return;
    }
    if (session.status !== "active") {
      res.status(409).json({ error: "session_superseded" });
      return;
    }

    // Rate-limit check
    if (session.last_heartbeat_at) {
      const since = (Date.now() - new Date(session.last_heartbeat_at).getTime()) / 1000;
      if (since < env.heartbeatMinIntervalSeconds) {
        res.status(429).json({
          error: "too_fast",
          retryAfterSeconds: Math.ceil(env.heartbeatMinIntervalSeconds - since),
        });
        return;
      }
    }

    const verdict = await verifyAndConsume(body.sessionId, body.seed, body.nonce);
    if (!verdict.ok) {
      res.status(400).json({ error: verdict.reason });
      return;
    }

    const multiplier = await userRewardMultiplier(userAddress);
    const companionBuffs = await getAgentCompanionBuffs(session.agent_id, userAddress);
    const companionMultiplier = 1 + companionBuffs.totalBonusEarnPct / 100;
    const effectiveMultiplier = multiplier * companionMultiplier;

    const { powerDelta, monki } = computeAccrual(verdict.difficulty, effectiveMultiplier);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Record contribution
      await client.query(
        `INSERT INTO contributions (session_id, agent_id, proof, power_delta)
         VALUES ($1, $2, $3, $4)`,
        [body.sessionId, session.agent_id, body.seed, powerDelta],
      );

      // 2. Update session
      await client.query(
        `UPDATE sessions
            SET power_contributed = power_contributed + $1,
                monki_earned = monki_earned + $2,
                last_heartbeat_at = now()
          WHERE id = $3`,
        [powerDelta, monki, body.sessionId],
      );

      // 3. Update agent power and state
      const agentUpdate = await client.query<{
        current_power: string;
        healthy_threshold: string;
        warning_threshold: string;
      }>(
        // Decay is virtual: reads derive live power from current_power and
        // the age of updated_at, and the power-eval worker only materialises
        // that every POWER_EVAL_INTERVAL_SECONDS. So current_power on the row
        // is stale-high between ticks, and adding to it directly while also
        // resetting updated_at discarded every bit of decay accrued since the
        // last tick. On an agent that had decayed a long way (a restarted
        // server, a gap in the worker) a single heartbeat snapped power back
        // to the stale value and clamped at the 100 ceiling, so nurturing a
        // dead agent appeared to jump it straight to full health.
        //
        // Decay first, then add, in the same statement, so the write starts
        // from the same number the read path just showed the user.
        `UPDATE agents
            SET current_power = LEAST(${LIVE_POWER_SQL} + $1, 100),
                updated_at = now()
          WHERE id = $2
          RETURNING current_power, healthy_threshold, warning_threshold`,
        [powerDelta, session.agent_id],
      );
      const a = agentUpdate.rows[0];
      const newPower = Number(a.current_power);
      const newState = deriveState(newPower, Number(a.healthy_threshold), Number(a.warning_threshold));
      await client.query(`UPDATE agents SET state = $1 WHERE id = $2`, [newState, session.agent_id]);

      // 4. Update user rewards
      await client.query(
        `UPDATE rewards
            SET claimable_monki = claimable_monki + $1,
                updated_at = now()
          WHERE user_address = $2`,
        [monki, userAddress],
      );

      await client.query(
        `UPDATE users
            SET total_monki_earned = total_monki_earned + $1
          WHERE wallet_address = $2`,
        [monki, userAddress],
      );

      await client.query("COMMIT");

      // Issue next challenge immediately (pipeline optimization)
      const nextChallenge = await issueChallenge(body.sessionId, session.difficulty);

      res.json({
        ok: true,
        powerDelta,
        monkiEarned: monki,
        effectiveMultiplier,
        companionBuffPct: companionBuffs.totalBonusEarnPct,
        agent: {
          id: session.agent_id,
          power: newPower,
          state: newState,
        },
        nextChallenge,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }),
);

// POST /api/sessions/stop — terminate session
sessionsRouter.post(
  "/sessions/stop",
  requireAuth,
  handler(async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
      res.status(400).json({ error: "sessionId_required" });
      return;
    }
    const result = await pool.query(
      `UPDATE sessions
          SET status = 'ended', ended_at = now()
        WHERE id = $1 AND user_address = $2 AND status = 'active'
        RETURNING agent_id`,
      [sessionId, req.user!.walletAddress],
    );
    if (result.rows[0]) {
      await recountNurturers(result.rows[0].agent_id);
    }
    res.json({ ok: true, status: "ended" });
  }),
);
