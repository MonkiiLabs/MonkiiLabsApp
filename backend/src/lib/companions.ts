import { pool } from "../db/index";

export interface CompanionRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  image_url: string;
  earn_boost_pct: number;
  decay_reduction_pct: number;
  mint_price_pons: string;
  supply_cap: number | null;
  minted_count: number;
  is_active: boolean;
  created_at: string;
}

export interface UserCompanionRow {
  id: number;
  user_address: string;
  companion_id: string;
  equipped_agent_id: string | null;
  slot_index: number | null;
  acquired_at: string;
  name?: string;
  slug?: string;
  category?: string;
  rarity?: string;
  image_url?: string;
  earn_boost_pct?: number;
  decay_reduction_pct?: number;
  agent_name?: string | null;
}

export interface AgentCompanionBuffs {
  totalBonusEarnPct: number;
  totalDecayReductionPct: number;
  equippedCount: number;
  companions: Array<{
    userCompanionId: number;
    companionId: string;
    name: string;
    slug: string;
    category: string;
    rarity: string;
    imageUrl: string;
    slotIndex: number;
    bonusEarnPct: number;
    decayReductionPct: number;
  }>;
}

export async function getAgentCompanionBuffs(
  agentId: string,
  userAddress?: string,
): Promise<AgentCompanionBuffs> {
  const params: any[] = [agentId];
  let userClause = "";
  if (userAddress) {
    params.push(userAddress);
    userClause = `AND uc.user_address = $2`;
  }

  const { rows } = await pool.query<any>(
    `SELECT uc.id AS user_companion_id,
            uc.companion_id,
            uc.slot_index,
            c.name,
            c.slug,
            c.category,
            c.rarity,
            c.image_url,
            c.earn_boost_pct,
            c.decay_reduction_pct
       FROM user_companions uc
       JOIN companions c ON c.id = uc.companion_id
      WHERE uc.equipped_agent_id = $1 ${userClause}
      ORDER BY uc.slot_index ASC`,
    params,
  );

  let totalBonusEarnPct = 0;
  let totalDecayReductionPct = 0;

  const companions = rows.map((r) => {
    const bonus = Number(r.earn_boost_pct ?? 0);
    const decay = Number(r.decay_reduction_pct ?? 0);
    totalBonusEarnPct += bonus;
    totalDecayReductionPct += decay;

    return {
      userCompanionId: Number(r.user_companion_id),
      companionId: r.companion_id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      rarity: r.rarity,
      imageUrl: r.image_url,
      slotIndex: Number(r.slot_index),
      bonusEarnPct: bonus,
      decayReductionPct: decay,
    };
  });

  totalDecayReductionPct = Math.min(80, totalDecayReductionPct);

  return {
    totalBonusEarnPct: Number(totalBonusEarnPct.toFixed(2)),
    totalDecayReductionPct: Number(totalDecayReductionPct.toFixed(2)),
    equippedCount: companions.length,
    companions,
  };
}

export async function getCompanionsCatalog(): Promise<CompanionRow[]> {
  const { rows } = await pool.query<CompanionRow>(
    `SELECT * FROM companions WHERE is_active = TRUE ORDER BY earn_boost_pct ASC`,
  );
  return rows;
}

export async function getUserInventory(userAddress: string): Promise<UserCompanionRow[]> {
  const { rows } = await pool.query<any>(
    `SELECT uc.*,
            c.slug,
            c.name,
            c.description,
            c.category,
            c.rarity,
            c.image_url,
            c.earn_boost_pct,
            c.decay_reduction_pct,
            a.name AS agent_name
       FROM user_companions uc
       JOIN companions c ON c.id = uc.companion_id
  LEFT JOIN agents a ON a.id = uc.equipped_agent_id
      WHERE uc.user_address = $1
      ORDER BY uc.equipped_agent_id NULLS LAST, uc.id DESC`,
    [userAddress],
  );
  return rows;
}

export async function equipCompanion(
  userAddress: string,
  userCompanionId: number,
  agentId: string,
  targetSlot?: number,
): Promise<{ success: boolean; slotIndex: number }> {
  const { rows: compRows } = await pool.query<{ id: number; equipped_agent_id: string | null }>(
    `SELECT id, equipped_agent_id FROM user_companions WHERE id = $1 AND user_address = $2`,
    [userCompanionId, userAddress],
  );
  if (compRows.length === 0) throw new Error("companion_not_owned");

  const { rows: agentRows } = await pool.query<{ id: string }>(
    `SELECT id FROM agents WHERE id = $1`,
    [agentId],
  );
  if (agentRows.length === 0) throw new Error("agent_not_found");

  const { rows: equippedRows } = await pool.query<{ id: number; slot_index: number }>(
    `SELECT id, slot_index FROM user_companions WHERE equipped_agent_id = $1 AND user_address = $2`,
    [agentId, userAddress],
  );

  const takenSlots = new Set(equippedRows.map((r) => r.slot_index));
  let slot = targetSlot;
  if (!slot) {
    for (let s = 1; s <= 3; s++) {
      if (!takenSlots.has(s)) {
        slot = s;
        break;
      }
    }
  }

  if (!slot || slot < 1 || slot > 3) throw new Error("invalid_or_full_slots");

  // If another companion occupied this slot on this agent, unequip it first
  await pool.query(
    `UPDATE user_companions
        SET equipped_agent_id = NULL, slot_index = NULL
      WHERE equipped_agent_id = $1 AND slot_index = $2 AND user_address = $3`,
    [agentId, slot, userAddress],
  );

  // Equip target companion
  await pool.query(
    `UPDATE user_companions
        SET equipped_agent_id = $1, slot_index = $2
      WHERE id = $3 AND user_address = $4`,
    [agentId, slot, userCompanionId, userAddress],
  );

  return { success: true, slotIndex: slot };
}

export async function unequipCompanion(
  userAddress: string,
  userCompanionId: number,
): Promise<{ success: boolean }> {
  const res = await pool.query(
    `UPDATE user_companions
        SET equipped_agent_id = NULL, slot_index = NULL
      WHERE id = $1 AND user_address = $2`,
    [userCompanionId, userAddress],
  );

  if (res.rowCount === 0) throw new Error("companion_not_owned");
  return { success: true };
}

export type MilestoneKey = "first_heartbeat" | "thriving_streak_7d" | "top_nurturer_10k";

export const MILESTONES: Record<MilestoneKey, { name: string; description: string; companionId: string }> = {
  first_heartbeat: {
    name: "Cyber-Chimp Drone",
    description: "Granted upon completing your first Proof-of-Life heartbeat.",
    companionId: "cyber-chimp-drone",
  },
  thriving_streak_7d: {
    name: "Plasma Lemur",
    description: "Granted for nurturing and keeping agents alive.",
    companionId: "plasma-lemur",
  },
  top_nurturer_10k: {
    name: "Celestial King Monkii",
    description: "Granted to elite nurturers with over 10,000 $MONKI mined.",
    companionId: "celestial-king-monkii",
  },
};

export async function claimMilestoneReward(
  userAddress: string,
  milestoneKey: MilestoneKey,
): Promise<UserCompanionRow> {
  const milestone = MILESTONES[milestoneKey];
  if (!milestone) throw new Error("unknown_milestone");

  // Check eligibility
  if (milestoneKey === "first_heartbeat") {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM sessions WHERE user_address = $1`,
      [userAddress],
    );
    if (Number(rows[0]?.count || 0) < 1) {
      throw new Error("milestone_requirement_not_met: Requires at least 1 completed Proof-of-Life heartbeat");
    }
  } else if (milestoneKey === "thriving_streak_7d") {
    const { rows } = await pool.query<{ days: string }>(
      `SELECT COUNT(DISTINCT DATE(created_at)) AS days FROM sessions WHERE user_address = $1`,
      [userAddress],
    );
    if (Number(rows[0]?.days || 0) < 7) {
      throw new Error("milestone_requirement_not_met: Requires active heartbeats across at least 7 days");
    }
  } else if (milestoneKey === "top_nurturer_10k") {
    const { rows } = await pool.query<{ total: string }>(
      `SELECT (COALESCE(claimable_monki, 0) + COALESCE(claimed_monki, 0)) AS total
         FROM rewards WHERE user_address = $1`,
      [userAddress],
    );
    if (Number(rows[0]?.total || 0) < 10000) {
      throw new Error("milestone_requirement_not_met: Requires at least 10,000 $MONKI mined");
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO user_milestone_claims (user_address, milestone_key, companion_id)
       VALUES ($1, $2, $3)`,
      [userAddress, milestoneKey, milestone.companionId],
    );

    const { rows: inserted } = await client.query<UserCompanionRow>(
      `INSERT INTO user_companions (user_address, companion_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userAddress, milestone.companionId],
    );

    await client.query("COMMIT");
    return inserted[0];
  } catch (err: any) {
    await client.query("ROLLBACK");
    if (err.code === "23505") throw new Error("milestone_already_claimed");
    throw err;
  } finally {
    client.release();
  }
}

export async function getUserMilestones(userAddress: string) {
  const [sessionsRes, daysRes, rewardsRes, claimsRes] = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM sessions WHERE user_address = $1`, [userAddress]),
    pool.query<{ days: string }>(`SELECT COUNT(DISTINCT DATE(created_at)) AS days FROM sessions WHERE user_address = $1`, [userAddress]),
    pool.query<{ total: string }>(
      `SELECT (COALESCE(claimable_monki, 0) + COALESCE(claimed_monki, 0)) AS total
         FROM rewards WHERE user_address = $1`,
      [userAddress],
    ),
    pool.query<{ milestone_key: string }>(`SELECT milestone_key FROM user_milestone_claims WHERE user_address = $1`, [userAddress]),
  ]);

  const claimedSet = new Set(claimsRes.rows.map((r) => r.milestone_key));
  const heartbeats = Number(sessionsRes.rows[0]?.count ?? 0);
  const activeDays = Number(daysRes.rows[0]?.days ?? 0);
  const monkiMined = Number(rewardsRes.rows[0]?.total ?? 0);

  return {
    first_heartbeat: {
      claimed: claimedSet.has("first_heartbeat"),
      eligible: heartbeats >= 1,
      current: heartbeats,
      target: 1,
    },
    thriving_streak_7d: {
      claimed: claimedSet.has("thriving_streak_7d"),
      eligible: activeDays >= 7,
      current: activeDays,
      target: 7,
    },
    top_nurturer_10k: {
      claimed: claimedSet.has("top_nurturer_10k"),
      eligible: monkiMined >= 10000,
      current: Math.floor(monkiMined),
      target: 10000,
    },
  };
}
