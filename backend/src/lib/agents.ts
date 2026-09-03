import { liveStateOf } from "./power";

export interface AgentRow {
  id: string;
  on_chain_id: string;
  owner_wallet: string;
  name: string;
  description: string;
  category: string;
  x_handle: string | null;
  avatar_url: string | null;
  current_power: string | number;
  healthy_threshold: string | number;
  warning_threshold: string | number;
  power_decay_rate: string | number;
  nurturer_count: number;
  state: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export function mapAgent(row: AgentRow, now = new Date()) {
  const healthyThreshold = Number(row.healthy_threshold ?? 80);
  const warningThreshold = Number(row.warning_threshold ?? 30);
  const powerDecayRate = Number(row.power_decay_rate ?? 1.0);
  const { power, state } = liveStateOf(
    {
      currentPower: Number(row.current_power ?? 80),
      powerDecayRate,
      healthyThreshold,
      warningThreshold,
      updatedAt: row.updated_at,
    },
    now,
  );
  return {
    id: row.id,
    onChainId: row.on_chain_id ?? row.id,
    ownerWallet: row.owner_wallet ?? "",
    name: row.name,
    description: row.description,
    category: row.category,
    xHandle: row.x_handle,
    avatarUrl: row.avatar_url,
    power,
    healthyThreshold,
    warningThreshold,
    powerDecayRate,
    nurturerCount: row.nurturer_count ?? 0,
    state,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export const AGENT_COLUMNS = `id, on_chain_id, owner_wallet, name, description, category,
  x_handle, avatar_url, current_power, healthy_threshold, warning_threshold,
  power_decay_rate, nurturer_count, state, created_at, updated_at`;

export const LIVE_POWER_SQL = `GREATEST(current_power - power_decay_rate * EXTRACT(EPOCH FROM (now() - updated_at)) / 3600.0, 0)`;
export const LIVE_STATE_SQL = `CASE
    WHEN ${LIVE_POWER_SQL} >= healthy_threshold THEN 'thriving'
    WHEN ${LIVE_POWER_SQL} <= warning_threshold THEN 'fading'
    ELSE 'idle' END`;
