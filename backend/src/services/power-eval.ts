import { pool } from "../db/index";
import { env } from "../lib/env";
import { LIVE_POWER_SQL, LIVE_STATE_SQL } from "../lib/agents";
import type { AgentState } from "../lib/power";
import { sendTelegramMessage } from "../lib/telegram";

const SEVERITY_SQL = (expr: string) =>
  `CASE ${expr} WHEN 'thriving' THEN 0 WHEN 'idle' THEN 1 ELSE 2 END`;

export async function evaluateAgents(): Promise<{ updated: number; notified: number }> {
  // 1. Detect agents whose live decayed state is worse than their stored state
  const dropped = await pool.query<{ id: string; name: string; new_state: AgentState }>(
    `SELECT id, name, (${LIVE_STATE_SQL}) AS new_state
       FROM agents
      WHERE ${SEVERITY_SQL(`(${LIVE_STATE_SQL})`)} > ${SEVERITY_SQL("state")}`,
  );

  let notified = 0;
  for (const a of dropped.rows) {
    notified += await notifyPowerDrop(a.id, a.new_state, a.name);
  }

  // 2. Persist decayed power and state
  const res = await pool.query(
    `UPDATE agents
        SET current_power = ${LIVE_POWER_SQL},
            state = ${LIVE_STATE_SQL},
            updated_at = now()`,
  );

  return { updated: res.rowCount ?? 0, notified };
}

async function notifyPowerDrop(agentId: string, state: AgentState, name: string): Promise<number> {
  const type = state === "fading" ? "power_drop_fading" : "power_drop_idle";
  const sinceIso = new Date(Date.now() - env.recentNurturerHours * 3_600_000).toISOString();
  const message =
    state === "fading"
      ? `${name} is fading and needs urgent Proof-of-Life heartbeats to recover.`
      : `${name} has gone idle — send some heartbeats before it fades.`;

  const inserted = await pool.query<{ user_address: string }>(
    `INSERT INTO notifications (user_address, agent_id, type, message)
       SELECT DISTINCT s.user_address, $1::text, $2::text, $3::text
         FROM sessions s
        WHERE s.agent_id = $1
          AND (s.status = 'active' OR s.started_at > $4::timestamptz)
          AND NOT EXISTS (
            SELECT 1 FROM notifications n
             WHERE n.user_address = s.user_address AND n.agent_id = $1
               AND n.type = $2 AND n.read = FALSE
          )
     RETURNING user_address`,
    [agentId, type, message, sinceIso],
  );
  const addresses = inserted.rows.map((r) => r.user_address);

  if (addresses.length > 0) {
    await deliverTelegram(addresses, agentId, name, message);
  }
  return addresses.length;
}

async function deliverTelegram(
  addresses: string[],
  agentId: string,
  name: string,
  message: string,
): Promise<void> {
  if (addresses.length === 0) return;
  const { rows } = await pool.query<{ telegram_chat_id: string }>(
    `SELECT telegram_chat_id FROM users
      WHERE wallet_address = ANY($1) AND telegram_chat_id IS NOT NULL`,
    [addresses],
  );
  if (rows.length === 0) return;

  const link = `${env.appUrl}/dashboard/agents/${agentId}`;
  const text = `⚠️ <b>${name} Alert</b>\n${message}\n\n<a href="${link}">Nurture ${name} on Monkii Labs →</a>`;
  await Promise.all(rows.map((r) => sendTelegramMessage(r.telegram_chat_id, text)));
}

let timer: ReturnType<typeof setInterval> | null = null;

export function startPowerEval(): void {
  if (timer) return;
  const intervalMs = env.powerEvalIntervalSeconds * 1000;
  timer = setInterval(() => {
    evaluateAgents().catch((err) => console.error("[power-eval] evaluation failed:", err));
  }, intervalMs);
  console.log(`[power-eval] Worker active — interval ${env.powerEvalIntervalSeconds}s`);
}

export function stopPowerEval(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
