import { api } from "@/lib/api";
import { signFinancialAction, type FinancialAction } from "@/lib/signing";
import type {
  Agent,
  AgentDetail,
  AgentLeaderRow,
  AgentState,
  ClaimableBalances,
  ClaimResult,
  CompanionType,
  DashboardSummary,
  HeartbeatResponse,
  Intensity,
  MilestoneKey,
  MintTxPayload,
  NonceResponse,
  NurturerRow,
  OwnedCompanion,
  SessionStartResponse,
  StakeToken,
  StakingStatus,
  TelegramLinkCode,
  UserProfile,
  VerifyResponse,
} from "./types";

/* =====================================================================
   Every endpoint in the Monkii Labs API & Frontend Integration Guide,
   in the order the guide presents them. Each balance-altering call signs
   its own authorization first, so callers never have to remember to.
   ===================================================================== */

/* ---- 1. Authentication ---------------------------------------------- */

export const auth = {
  nonce: (walletAddress: string) =>
    api.post<NonceResponse>("/auth/nonce", { walletAddress }, { anonymous: true }),

  verify: (walletAddress: string, signature: string) =>
    api.post<VerifyResponse>("/auth/verify", { walletAddress, signature }, { anonymous: true }),

  me: () => api.get<{ user: UserProfile }>("/auth/me").then((r) => r.user),
};

/* ---- 3. Proof-of-Life sessions --------------------------------------- */

export const sessions = {
  start: (agentId: string, intensity: Intensity = "standard") =>
    api.post<SessionStartResponse>("/sessions/start", { agentId, intensity }),

  heartbeat: (sessionId: number, seed: string, nonce: string) =>
    api.post<HeartbeatResponse>("/sessions/heartbeat", { sessionId, seed, nonce }),

  stop: (sessionId: number) => api.post<{ ok: boolean }>("/sessions/stop", { sessionId }),
};

/* ---- 4. Agent fleet ---------------------------------------------------- */

export const agents = {
  list: (params: { category?: string; state?: AgentState } = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.state) qs.set("state", params.state);
    const suffix = qs.toString() ? `?${qs}` : "";
    return api.get<{ agents: Agent[] }>(`/agents${suffix}`).then((r) => r.agents ?? []);
  },

  detail: (id: string) => api.get<AgentDetail>(`/agents/${encodeURIComponent(id)}`),
};

/* ---- 5. Staking -------------------------------------------------------- */

const STAKE_ACTION: Record<StakeToken, FinancialAction> = {
  MONKI: "stake_monki",
  PONS: "stake_pons",
  META: "stake_pons",
};

const UNSTAKE_ACTION: Record<StakeToken, FinancialAction> = {
  MONKI: "unstake_monki",
  PONS: "unstake_pons",
  META: "unstake_pons",
};

export const staking = {
  status: () => api.get<StakingStatus>("/staking/status"),

  stake: async (walletAddress: string, amount: number, token: StakeToken = "MONKI") => {
    const authorization = await signFinancialAction(walletAddress, STAKE_ACTION[token], amount);
    return api.post<{ ok: boolean; stakedMonki?: number }>("/staking/stake", {
      amount,
      token,
      ...authorization,
    });
  },

  unstake: async (walletAddress: string, amount: number, token: StakeToken = "MONKI") => {
    const authorization = await signFinancialAction(walletAddress, UNSTAKE_ACTION[token], amount);
    return api.post<{ ok: boolean; stakedMonki?: number }>("/staking/unstake", {
      amount,
      token,
      ...authorization,
    });
  },
};

/* ---- 6. Rewards --------------------------------------------------------- */

export const rewards = {
  claimable: () => api.get<ClaimableBalances>("/rewards/claimable"),

  /** Disburses the whole claimable $PONS balance, so no Amount line is signed. */
  claimPons: async (walletAddress: string) => {
    const authorization = await signFinancialAction(walletAddress, "withdraw_pons");
    return api.post<ClaimResult>("/rewards/claim", authorization);
  },

  claimMonki: async (walletAddress: string) => {
    const authorization = await signFinancialAction(walletAddress, "withdraw_monki");
    return api.post<ClaimResult>("/rewards/claim-monki", authorization);
  },

  claimMeta: async (walletAddress: string) => {
    const authorization = await signFinancialAction(walletAddress, "withdraw_meta");
    return api.post<ClaimResult>("/rewards/claim-meta", authorization);
  },
};

/* ---- 7. Companions ------------------------------------------------------- */

export const companions = {
  roster: () =>
    api
      .get<{ companions: CompanionType[] }>("/companions")
      .then((r) => r.companions ?? [])
      .catch(() => [] as CompanionType[]),

  inventory: () =>
    api
      .get<{ companions: OwnedCompanion[] }>("/companions/inventory")
      .then((r) => r.companions ?? []),

  buildMintTx: (companionId: string) =>
    api.post<MintTxPayload>("/companions/build-mint-tx", { companionId }),

  verifyMint: (txHash: string, companionId: string) =>
    api.post<{ ok: boolean; companion: unknown }>("/companions/verify-mint", {
      txHash,
      companionId,
    }),

  equip: (userCompanionId: number, agentId: string, slotIndex: number) =>
    api.post<{ ok: boolean }>("/companions/equip", { userCompanionId, agentId, slotIndex }),

  unequip: (userCompanionId: number) =>
    api.post<{ ok: boolean }>("/companions/unequip", { userCompanionId }),

  claimMilestone: (milestoneKey: MilestoneKey) =>
    api.post<{ ok: boolean; companion?: unknown }>("/companions/claim-milestone", {
      milestoneKey,
    }),

  milestones: () =>
    api
      .get<{ milestones: import("./types").UserMilestones }>("/companions/milestones")
      .then((r) => r.milestones),
};

/* ---- 8. Dashboard & leaderboards ------------------------------------------ */

export const dashboard = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary"),
};

export const leaderboard = {
  topNurturers: () =>
    api
      .get<{ nurturers: NurturerRow[] }>("/leaderboard/top-nurturers")
      .then((r) => r.nurturers ?? []),

  topAgents: () =>
    api.get<{ agents: AgentLeaderRow[] }>("/leaderboard/top-agents").then((r) => r.agents ?? []),
};

/* ---- 9. Telegram sentinel --------------------------------------------------- */

export const telegram = {
  linkCode: () => api.post<TelegramLinkCode>("/telegram/link-code"),
};

/* ---- 10. Network & Protocol ------------------------------------------------- */

export const network = {
  config: () => api.get<import("./types").NetworkConfig>("/network", { anonymous: true }),
};

/* ---- 11. Admin Dashboard ---------------------------------------------------- */

export const admin = {
  stats: (adminKey: string) =>
    api.get<import("./types").AdminStats>("/admin/stats", {
      headers: { "x-admin-key": adminKey },
    }),

  protocolSettings: (adminKey: string) =>
    api.get<import("./types").ProtocolSettings>("/admin/protocol-settings", {
      headers: { "x-admin-key": adminKey },
    }),

  toggleMonki: (adminKey: string) =>
    api.post<{ ok: boolean; enableMonkiClaiming: boolean; message: string }>(
      "/admin/protocol-settings/toggle-monki-claiming",
      {},
      { headers: { "x-admin-key": adminKey } },
    ),

  togglePons: (adminKey: string) =>
    api.post<{ ok: boolean; enablePonsClaiming: boolean; message: string }>(
      "/admin/protocol-settings/toggle-pons-claiming",
      {},
      { headers: { "x-admin-key": adminKey } },
    ),

  toggleCompanions: (adminKey: string) =>
    api.post<{ ok: boolean; enableCompanionMinting: boolean; message: string }>(
      "/admin/protocol-settings/toggle-companion-minting",
      {},
      { headers: { "x-admin-key": adminKey } },
    ),

  airdrop: (
    adminKey: string,
    payload: { recipientAddress: string; amountMonki?: number; amountPons?: number },
  ) =>
    api.post<{ ok: boolean }>("/admin/airdrop", payload, {
      headers: { "x-admin-key": adminKey },
    }),
};
