import { pool } from "../db/index";

const VIRTUALS_API = "https://api.virtuals.io/api/virtuals";

export interface VirtualsAgent {
  id: number;
  virtualId: string | null;
  name: string;
  description: string | null;
  walletAddress: string | null;
  category: string | null;
  role: string | null;
  tokenAddress: string | null;
  status: string;
  chain: string | null;
  symbol: string | null;
  holderCount: number | null;
  mcapInVirtual: number | null;
  totalValueLocked: string | null;
  mindshare: number | null;
  image: { url: string | null } | null;
  socials: Record<string, any> | null;
}

export interface MappedAgent {
  id: string;
  onChainId: string;
  ownerWallet: string;
  name: string;
  description: string;
  category: string;
  xHandle: string | null;
  avatarUrl: string | null;
  healthy: number;
  warning: number;
  decayPerHour: number;
  power: number;
}

async function fetchPage(
  page: number,
  pageSize: number,
  sortStrategy: string = "mindshare:desc",
): Promise<VirtualsAgent[]> {
  const url = `${VIRTUALS_API}?pagination[page]=${page}&pagination[pageSize]=${pageSize}&filters[status]=AVAILABLE&sort[0]=${sortStrategy}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "agent-fleet-sync/1.0" },
  });
  if (!res.ok) throw new Error(`Virtuals API HTTP error: ${res.status}`);
  const body = (await res.json()) as { data?: VirtualsAgent[] };
  return body.data ?? [];
}

function extractXHandle(socials: Record<string, any> | null): string | null {
  if (!socials) return null;
  const verified = socials.VERIFIED_LINKS as Record<string, any> | undefined;
  const candidates = [verified?.TWITTER, socials.TWITTER, socials.x, socials.X];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      const match = c.match(/(?:x|twitter)\.com\/(?:#!\/)?@?([A-Za-z0-9_]{1,30})/i);
      if (match) return match[1];
    }
  }
  return null;
}

function deriveParams(a: VirtualsAgent): {
  healthy: number;
  warning: number;
  decay: number;
  power: number;
} {
  const holders = Math.max(a.holderCount ?? 0, 0);
  const mcap = Math.max(a.mcapInVirtual ?? 0, 0);

  const holderScore = Math.min(Math.log10(holders + 1) / 6, 1);
  const mcapScore = Math.min(Math.log10(mcap + 1) / 8.5, 1);
  const traction = Math.max(holderScore, mcapScore);

  const healthy = Math.round(450 + traction * 750);
  const warning = Math.round(healthy * 0.3);
  const decay = Math.round(10 + traction * 12);
  const power = healthy;

  return { healthy, warning, decay, power };
}

function mapAgent(a: VirtualsAgent): MappedAgent | null {
  if (!a.name || !a.walletAddress) return null;
  const key = a.virtualId
    ? `virtuals:${a.virtualId}`
    : a.tokenAddress
      ? `virtuals-token:${a.tokenAddress}`
      : null;
  if (!key) return null;

  const id = key.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
  const { healthy, warning, decay, power } = deriveParams(a);
  const rawCategory = (a.role || a.category || "Agent").replace(/_/g, " ");
  const category = rawCategory.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id,
    onChainId: key,
    ownerWallet: a.walletAddress.toLowerCase(),
    name: a.name.trim().slice(0, 60),
    description: (a.description ?? "").trim().slice(0, 2000),
    category: category.slice(0, 40),
    xHandle: extractXHandle(a.socials),
    avatarUrl: a.image?.url ?? null,
    healthy,
    warning,
    decayPerHour: decay,
    power,
  };
}

export async function syncVirtualsAgents(
  startPage: number = 1,
  count: number = 60,
  sortStrategy: string = "mindshare:desc",
): Promise<{ synced: number }> {
  const pageSize = 30;
  const pagesNeeded = Math.ceil(count / pageSize);
  const raw: VirtualsAgent[] = [];

  for (let p = startPage; p < startPage + pagesNeeded; p++) {
    const batch = await fetchPage(p, pageSize, sortStrategy);
    raw.push(...batch);
    if (batch.length < pageSize) break;
  }

  const mapped = raw
    .slice(0, count)
    .map(mapAgent)
    .filter((m): m is MappedAgent => m !== null);

  if (mapped.length === 0) throw new Error("No agents returned from Virtuals Protocol API.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const m of mapped) {
      const state = m.power >= m.healthy ? "thriving" : m.power <= m.warning ? "fading" : "idle";
      await client.query(
        `INSERT INTO agents
           (id, on_chain_id, owner_wallet, name, description, category, x_handle, avatar_url,
            current_power, healthy_threshold, warning_threshold, power_decay_rate, state,
            nurturer_count, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,0, now())
         ON CONFLICT (id) DO UPDATE SET
           on_chain_id = EXCLUDED.on_chain_id,
           owner_wallet = EXCLUDED.owner_wallet,
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           category = EXCLUDED.category,
           x_handle = EXCLUDED.x_handle,
           avatar_url = EXCLUDED.avatar_url,
           healthy_threshold = EXCLUDED.healthy_threshold,
           warning_threshold = EXCLUDED.warning_threshold,
           power_decay_rate = EXCLUDED.power_decay_rate;`,
        [
          m.id,
          m.onChainId,
          m.ownerWallet,
          m.name,
          m.description,
          m.category,
          m.xHandle,
          m.avatarUrl,
          m.power,
          m.healthy,
          m.warning,
          m.decayPerHour,
          state,
        ],
      );
    }
    await client.query("COMMIT");
    return { synced: mapped.length };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
