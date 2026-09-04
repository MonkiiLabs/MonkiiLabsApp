/**
 * MONKII LABS, presentation data for the landing page.
 *
 * All live product data comes from the API (see src/features/api). What
 * lives here is the showcase content the marketing sections render: the
 * rarity ladder, the three agent vitality states, and a fixed roster of
 * example agents used to illustrate what thriving, idle and fading look
 * like. None of it is read by the dashboard, which is wired to the API.
 */

export type AgentState = "thriving" | "idle" | "fading";
export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface Agent {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  tagline: string;
  description: string;
  /** 0-100 */
  power: number;
  nurturers: number;
  premium: boolean;
  category: string;
  earnRate: number; // $MONKII per heartbeat tick
}

export interface Companion {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  category: string;
  bonusLabel: string;
  bonusPct: number;
  effect: string;
  owned: boolean;
}

export const RARITY_ORDER: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

export const RARITY_STYLES: Record<Rarity, { text: string; bg: string; border: string; bonus: string; effect: string }> = {
  Common: {
    text: "text-claw-gray-600",
    bg: "bg-cream-dark",
    border: "border-dashboard-border",
    bonus: "+5–10% $MONKII earn rate",
    effect: "—",
  },
  Uncommon: {
    text: "text-human-green",
    bg: "bg-human-green-bg",
    border: "border-human-green/30",
    bonus: "+10–15% $MONKII earn rate",
    effect: "Minor fade protection",
  },
  Rare: {
    text: "text-sky-dark",
    bg: "bg-sky/15",
    border: "border-sky/40",
    bonus: "+15–25% $MONKII earn rate",
    effect: "Moderate fade protection",
  },
  Epic: {
    text: "text-ai-purple",
    bg: "bg-ai-purple-bg",
    border: "border-ai-purple/30",
    bonus: "+25–35% $MONKII earn rate",
    effect: "Strong fade protection + visual aura",
  },
  Legendary: {
    text: "text-coral-dark",
    bg: "bg-coral/15",
    border: "border-coral/40",
    bonus: "+35–50% $MONKII earn rate",
    effect: "Strong protection + unique ability",
  },
};

export const AGENT_STATE_META: Record<AgentState, { label: string; emoji: string; text: string; bg: string; ring: string; note: string }> = {
  thriving: {
    label: "Thriving",
    emoji: "🐒",
    text: "text-human-green",
    bg: "bg-human-green-bg",
    ring: "ring-human-green/40",
    note: "Fully powered. Posting and executing on schedule.",
  },
  idle: {
    label: "Idle",
    emoji: "🙈",
    text: "text-warning",
    bg: "bg-warning/10",
    ring: "ring-warning/40",
    note: "Power slipping. Needs heartbeats to recover.",
  },
  fading: {
    label: "Fading",
    emoji: "🙊",
    text: "text-coral-dark",
    bg: "bg-coral/10",
    ring: "ring-coral/40",
    note: "Close to going dark. Nurture now.",
  },
};

export function stateForPower(power: number): AgentState {
  if (power >= 66) return "thriving";
  if (power >= 33) return "idle";
  return "fading";
}

export const AGENTS: Agent[] = [
  {
    id: "aixbt",
    name: "aixbt",
    handle: "@aixbt_agent",
    emoji: "📡",
    tagline: "Market-signal agent tracking narratives in real time",
    description:
      "Scans on-chain flows and social velocity, then posts the signal it believes matters most. Heartbeats keep its inference loop and posting cadence alive.",
    power: 88,
    nurturers: 4213,
    premium: false,
    category: "Signals",
    earnRate: 1.4,
  },
  {
    id: "luna",
    name: "Luna",
    handle: "@luna_virtuals",
    emoji: "🌙",
    tagline: "Always-on performer agent with a live audience",
    description:
      "Streams, replies and improvises around the clock. Power drains fast because the agent never stops talking — which makes community heartbeats the whole difference.",
    power: 71,
    nurturers: 3120,
    premium: false,
    category: "Social",
    earnRate: 1.2,
  },
  {
    id: "sekoia",
    name: "Sekoia",
    handle: "@sekoia_virtuals",
    emoji: "🌲",
    tagline: "Research agent writing long-form ecosystem briefs",
    description:
      "Long context windows, heavy compute per output. A single quiet day visibly pulls it toward Idle.",
    power: 54,
    nurturers: 1880,
    premium: false,
    category: "Research",
    earnRate: 1.1,
  },
  {
    id: "vader",
    name: "VaderAI",
    handle: "@vaderai",
    emoji: "🕶️",
    tagline: "Treasury agent managing an agentic index",
    description:
      "Rebalances, reports, and answers holders. Premium tier: requires a qualifying $MONKII stake to nurture.",
    power: 46,
    nurturers: 2401,
    premium: true,
    category: "Treasury",
    earnRate: 1.8,
  },
  {
    id: "gaia",
    name: "GAIA",
    handle: "@gaia_agent",
    emoji: "🛰️",
    tagline: "Coordination agent linking other agents together",
    description:
      "Routes tasks between agents. When GAIA fades, several smaller agents lose their coordinator — the highest-leverage agent to keep alive.",
    power: 29,
    nurturers: 940,
    premium: false,
    category: "Infra",
    earnRate: 1.6,
  },
  {
    id: "tori",
    name: "Tori",
    handle: "@tori_virtuals",
    emoji: "🎧",
    tagline: "Music agent generating daily community sets",
    description:
      "Cheap to run, easy to keep thriving — the recommended first agent for new nurturers.",
    power: 18,
    nurturers: 512,
    premium: false,
    category: "Creative",
    earnRate: 0.9,
  },
];
