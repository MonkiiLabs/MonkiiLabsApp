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
  avatarUrl?: string | null;
  bio?: string | null;
  xHandle?: string | null;
  totalMonkiEarned: number;
  powerRank: number | null;
  telegram: {
    linked: boolean;
    username: string | null;
    linkCode: string | null;
  };
  createdAt: string;
}

export interface UpdateProfilePayload {
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  xHandle?: string | null;
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

/* ---- Protocol Settings & Network ------------------------------------------- */

export interface ProtocolSettings {
  enableMonkiClaiming: boolean;
  enablePonsClaiming: boolean;
  enableCompanionMinting: boolean;
  enableRwaElections?: boolean;
}

export interface NetworkConfig {
  chain: string;
  chainId: number;
  type: string;
  gasToken: string;
  tokens: {
    earning: string;
    stakingReward: string;
    ponsTokenAddress: string;
    metaStockToken: string;
  };
  protocolSettings: ProtocolSettings;
}

export interface MilestoneProgressItem {
  claimed: boolean;
  eligible: boolean;
  current: number;
  target: number;
}

export interface UserMilestones {
  first_heartbeat: MilestoneProgressItem;
  thriving_streak_7d: MilestoneProgressItem;
  top_nurturer_10k: MilestoneProgressItem;
}

export interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  activeSessions: number;
  totalClaimableMonki: number;
  totalClaimablePons: number;
  totalCompanionsMinted: number;
}

/* ---- RWA Stock-Elected Payouts (Sprint F) ------------------------------ */

export interface EligibleStockToken {
  symbol: string;
  name: string;
  contractAddress: string;
  /** Null while no price source exists for this token yet. */
  chainlinkFeedAddress: string | null;
  corporateActionMultiplier: number;
  isLiquid: boolean;
  isSuspended: boolean;
  /** "live" once a price source is configured, "pending" until then. */
  feedStatus: "live" | "pending";
}

export interface EligibleStockTokensResponse {
  ok: boolean;
  network: string;
  chainId: number;
  isElectionsActive: boolean;
  stage: string;
  tokens: EligibleStockToken[];
  disclaimer: string;
}

export interface UserRwaAllocation {
  symbol: string;
  percentage: number;
}

export interface UserRwaElection {
  ok: boolean;
  userAddress: string;
  isElectionsActive: boolean;
  mode: "stock_elected" | "plain_pons";
  allocations: UserRwaAllocation[];
  isEnabled: boolean;
  updatedAt: string | null;
  stage: string;
  pipeline?: {
    states: string[];
    currentState: string;
  };
}

export interface SaveRwaElectionPayload {
  mode: "stock_elected" | "plain_pons";
  allocations: UserRwaAllocation[];
  acceptedDisclaimer: boolean;
}

export interface SaveRwaElectionResponse {
  ok: boolean;
  userAddress: string;
  mode: "stock_elected" | "plain_pons";
  allocations: UserRwaAllocation[];
  isEnabled: boolean;
  updatedAt: string;
  isElectionsActive: boolean;
  stage: string;
  /** The period this save opened, or the one it left standing. */
  period: RwaElectionPeriod;
  /** False when the saved basket matches the one already in force. */
  changed: boolean;
  message: string;
}

/** One basket, and the window it was in force for. */
export interface RwaElectionPeriod {
  id: number;
  mode: "stock_elected" | "plain_pons";
  allocations: UserRwaAllocation[];
  isEnabled: boolean;
  effectiveFrom: string;
  /** Null while this is the period in force. */
  effectiveTo: string | null;
  isCurrent: boolean;
}

export interface RwaElectionHistoryResponse {
  ok: boolean;
  userAddress: string;
  isElectionsActive: boolean;
  current: RwaElectionPeriod | null;
  periods: RwaElectionPeriod[];
  /** True when older periods exist beyond the requested limit. */
  hasMore: boolean;
}

export interface RwaTokenHolding {
  symbol: string;
  name: string;
  contractAddress: string;
  chainlinkFeedAddress: string | null;
  corporateActionMultiplier: number;
  isLiquid: boolean;
  isSuspended: boolean;
  feedStatus: "live" | "pending";
  electedPercentage: number;
  projectedAccrual: number;
  walletBalance?: string;
  walletBalanceFormatted?: string;
}

export interface RealtimeBalancesResponse {
  ok: boolean;
  userAddress: string;
  network: string;
  chainId: number;
  isElectionsActive: boolean;
  timestamp: string;
  monki: {
    claimable: number;
    claimed: number;
    staked: number;
    total: number;
  };
  pons: {
    claimable: number;
    claimed: number;
  };
  election: {
    mode: "stock_elected" | "plain_pons";
    isEnabled: boolean;
    allocations: UserRwaAllocation[];
    updatedAt: string | null;
  };
  rwaTokens: RwaTokenHolding[];
}

