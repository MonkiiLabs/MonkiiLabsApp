/**
 * Wire types for the Monkii Labs API.
 * Field names mirror the integration guide exactly: do not rename them
 * here; map to friendlier names at the component boundary instead.
 */

export type AgentState = "thriving" | "idle" | "fading";
export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type Intensity = "light" | "standard" | "max";
export type StakeToken = "MONKI" | "PONS" | "META";

/* ---- Auth ------------------------------------------------------------ */

export interface NonceResponse {
  nonce: string;
  message: string;
}

export interface VerifyResponse {
  token: string;
  user: { id: string; walletAddress: string };
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  displayName: string | null;
  totalMonkiEarned: number;
  powerRank: number | null;
  telegram: {
    linked: boolean;
    username: string | null;
    linkCode: string | null;
  };
  createdAt: string;
}

/* ---- Agents ----------------------------------------------------------- */

export interface Agent {
  id: string;
  onChainId: string;
  ownerWallet: string;
  name: string;
  description: string;
  category: string;
  xHandle: string | null;
  avatarUrl: string | null;
  power: number;
  healthyThreshold: number;
  warningThreshold: number;
  powerDecayRate: number;
  nurturerCount: number;
  state: AgentState;
  createdAt: string;
}

export interface EquippedCompanion {
  userCompanionId: number;
  companionId: string;
  name: string;
  slug?: string;
  category?: string;
  rarity?: Rarity;
  imageUrl?: string;
  slotIndex: number;
  bonusEarnPct: number;
  decayReductionPct: number;
}

export interface CompanionBuffs {
  totalBonusEarnPct: number;
  totalDecayReductionPct: number;
  equippedCount: number;
  companions: EquippedCompanion[];
}

export interface AgentDetail {
  agent: Agent;
  companionBuffs: CompanionBuffs;
}

/* ---- Sessions (Proof-of-Life) ----------------------------------------- */

export interface Challenge {
  seed: string;
  difficulty: number;
  expiresAt: string;
}

export interface SessionStartResponse {
  sessionId: number;
  agentId: string;
  status: string;
  intensity: Intensity;
  challenge: Challenge;
}

export interface HeartbeatResponse {
  ok: boolean;
  powerDelta: number;
  monkiEarned: number;
  effectiveMultiplier: number;
  companionBuffPct: number;
  agent: { id: string; power: number; state: AgentState };
  nextChallenge: Challenge | null;
}

/* ---- Staking ----------------------------------------------------------- */

export interface StakingStatus {
  stakedMonki: number;
  claimableMonki: number;
  claimablePons: number;
  rewardMultiplier: number;
  stakePeriodStartedAt: string | null;
  isEligibleForNextEpoch: boolean;
  nextEpochAt: string;
  policy: {
    STAKE_FOR_MAX: number;
    MAX_MULTIPLIER: number;
    PREMIUM_THRESHOLD: number;
  };
}

/* ---- Rewards ------------------------------------------------------------ */

export interface ClaimableBalances {
  claimableMonki: number;
  claimedMonki: number;
  stakedMonki: number;
  claimablePons: number;
  claimedPons: number;
  claimableMetaStock: number;
  claimedMetaStock: number;
}

export interface ClaimResult {
  ok: boolean;
  claimedPons?: number;
  claimedMonki?: number;
  claimedMetaStock?: number;
  txHash?: string;
  network?: string;
}

/* ---- Companions ---------------------------------------------------------- */

export interface CompanionType {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  rarity: Rarity;
  imageUrl: string;
  earnBoostPct: number;
  decayReductionPct: number;
  mintPricePons: number;
  supplyCap: number | null;
  mintedCount: number;
}

export interface OwnedCompanion {
  id: number;
  companionId: string;
  name: string;
  slug: string;
  category: string;
  rarity: Rarity;
  imageUrl: string;
  earnBoostPct: number;
  decayReductionPct: number;
  equippedAgentId: string | null;
  agentName?: string | null;
  slotIndex: number | null;
  acquiredAt: string;
}

export interface MintTxPayload {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  chainId: number;
  companionTypeId: number;
}

export type MilestoneKey = "first_heartbeat" | "thriving_streak_7d" | "top_nurturer_10k";

/* ---- Dashboard & leaderboards --------------------------------------------- */

export interface DashboardSummary {
  activeAgents: number;
  totalHeartbeats: number;
  streakDays: number;
  powerRank: number | null;
  claimableMonki: number;
  claimablePons: number;
  stakedMonki: number;
  rewardMultiplier: number;
  nextEpochAt: string | null;
  nurturedAgents: Agent[];
  recentActivity: ActivityEntry[];
}

export interface ActivityEntry {
  id: string | number;
  type: string;
  agentId?: string | null;
  agentName?: string | null;
  amount?: number | null;
  createdAt: string;
  message?: string;
}

export interface NurturerRow {
  rank: number;
  walletAddress: string;
  displayName: string | null;
  totalMonkiEarned: number;
  agentsNurtured?: number;
}

export interface AgentLeaderRow {
  rank: number;
  id: string;
  name: string;
  avatarUrl: string | null;
  power: number;
  state: AgentState;
  nurturerCount: number;
}

/* ---- Telegram --------------------------------------------------------------- */

export interface TelegramLinkCode {
  linkCode: string;
  botUsername?: string;
  expiresAt?: string;
}
