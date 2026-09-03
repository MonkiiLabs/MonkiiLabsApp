// MONKII LABS — front-end mock data for the nurturing loop.
// No backend: everything here is local demo data shaped like the PRD's domain model.

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

export const COMPANIONS: Companion[] = [
  {
    id: "ember-orb",
    name: "Ember Orb",
    emoji: "🔥",
    rarity: "Common",
    category: "Energy orb",
    bonusLabel: "+8% $MONKII earn rate",
    bonusPct: 8,
    effect: "—",
    owned: true,
  },
  {
    id: "tin-wrench",
    name: "Tin Wrench",
    emoji: "🔧",
    rarity: "Common",
    category: "Tool",
    bonusLabel: "+6% $MONKII earn rate",
    bonusPct: 6,
    effect: "—",
    owned: true,
  },
  {
    id: "moss-sprite",
    name: "Moss Sprite",
    emoji: "🌱",
    rarity: "Uncommon",
    category: "Small creature",
    bonusLabel: "+13% $MONKII earn rate",
    bonusPct: 13,
    effect: "Minor fade protection",
    owned: true,
  },
  {
    id: "tide-lantern",
    name: "Tide Lantern",
    emoji: "🏮",
    rarity: "Rare",
    category: "Mystical object",
    bonusLabel: "+21% $MONKII earn rate",
    bonusPct: 21,
    effect: "Moderate fade protection",
    owned: true,
  },
  {
    id: "storm-familiar",
    name: "Storm Familiar",
    emoji: "⚡",
    rarity: "Epic",
    category: "Life-force entity",
    bonusLabel: "+31% $MONKII earn rate",
    bonusPct: 31,
    effect: "Strong fade protection + visual aura",
    owned: true,
  },
  {
    id: "eternal-banana",
    name: "Eternal Banana",
    emoji: "🍌",
    rarity: "Legendary",
    category: "Life-force entity",
    bonusLabel: "+44% $MONKII earn rate",
    bonusPct: 44,
    effect: "Never fully fades — agent stays at least Idle",
    owned: false,
  },
  {
    id: "chrome-monkii",
    name: "Chrome Monkii",
    emoji: "🐵",
    rarity: "Legendary",
    category: "Small creature",
    bonusLabel: "+38% $MONKII earn rate",
    bonusPct: 38,
    effect: "Double nurture reward once per day",
    owned: false,
  },
  {
    id: "quartz-sigil",
    name: "Quartz Sigil",
    emoji: "💎",
    rarity: "Rare",
    category: "Mystical object",
    bonusLabel: "+17% $MONKII earn rate",
    bonusPct: 17,
    effect: "Moderate fade protection",
    owned: false,
  },
];

export const MAX_EQUIPPED = 3;

export interface LeaderRow {
  rank: number;
  wallet: string;
  emoji: string;
  heartbeats: number;
  agentsEarned: number;
  streak: number;
}

export const NURTURER_LEADERBOARD: LeaderRow[] = [
  { rank: 1, wallet: "7xKq…v9Pm", emoji: "🐒", heartbeats: 41280, agentsEarned: 58912, streak: 64 },
  { rank: 2, wallet: "Ba2f…Lq7d", emoji: "🙉", heartbeats: 38104, agentsEarned: 51220, streak: 51 },
  { rank: 3, wallet: "9tRw…Km3x", emoji: "🐵", heartbeats: 33990, agentsEarned: 47008, streak: 47 },
  { rank: 4, wallet: "Cd8n…Ry1v", emoji: "🙈", heartbeats: 28771, agentsEarned: 39114, streak: 33 },
  { rank: 5, wallet: "Fk4m…Tz8q", emoji: "🙊", heartbeats: 24500, agentsEarned: 31860, streak: 29 },
  { rank: 6, wallet: "Lp1x…Wc5r", emoji: "🐒", heartbeats: 19822, agentsEarned: 26440, streak: 21 },
  { rank: 7, wallet: "Mn6v…Qs2t", emoji: "🙉", heartbeats: 15310, agentsEarned: 20115, streak: 18 },
];

export const TOKEN_MINT = "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump";

export const POOL_STATS = {
  poolBalance: 1_842_500,
  totalDistributed: 6_215_400,
  epochHours: 24,
  minStake: 500,
  feeLedger: [
    { source: "LP / trading fees", status: "Planned", captured: 0 },
    { source: "Developer fees", status: "Planned", captured: 0 },
    { source: "Premium-feature fees", status: "Planned", captured: 0 },
    { source: "Companion mints & royalties", status: "Planned", captured: 0 },
  ],
};
