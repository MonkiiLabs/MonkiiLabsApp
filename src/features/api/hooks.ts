import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { explorerTxUrl } from "@/lib/config";
import { useWallet } from "@/hooks/useWallet";
import {
  admin,
  agents,
  auth,
  companions,
  dashboard,
  leaderboard,
  network,
  rewards,
  staking,
  telegram,
} from "./endpoints";
import { mintCompanion } from "./mintCompanion";
import type { AgentState, MilestoneKey, StakeToken } from "./types";

/* =====================================================================
   Query keys are centralised so a mutation can invalidate precisely what
   it changed. Anything that moves a balance touches the same four reads:
   staking status, claimable balances, the dashboard summary and profile.
   ===================================================================== */

export const qk = {
  me: ["me"] as const,
  agents: (filters?: { category?: string; state?: AgentState }) => ["agents", filters ?? {}] as const,
  agent: (id: string) => ["agent", id] as const,
  staking: ["staking", "status"] as const,
  claimable: ["rewards", "claimable"] as const,
  inventory: ["companions", "inventory"] as const,
  roster: ["companions", "roster"] as const,
  milestones: ["companions", "milestones"] as const,
  summary: ["dashboard", "summary"] as const,
  topNurturers: ["leaderboard", "nurturers"] as const,
  topAgents: ["leaderboard", "agents"] as const,
  network: ["network", "config"] as const,
  adminStats: ["admin", "stats"] as const,
  adminSettings: ["admin", "settings"] as const,
};

const BALANCE_KEYS = [qk.staking, qk.claimable, qk.summary, qk.me];

function useInvalidateBalances() {
  const qc = useQueryClient();
  return () => BALANCE_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
}

/** Surfaces the wallet's own rejection text rather than a generic failure. */
export function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  const code = (err as { code?: number })?.code;
  if (code === 4001) return "You rejected the signature request.";
  const message = (err as Error)?.message;
  if (!message) return "Something went wrong.";
  return message.length > 160 ? `${message.slice(0, 157)}…` : message;
}

/* ---- Reads ------------------------------------------------------------ */

export function useProfile() {
  const { isAuthenticated } = useWallet();
  return useQuery({
    queryKey: qk.me,
    queryFn: auth.me,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useAgents(filters: { category?: string; state?: AgentState } = {}) {
  return useQuery({
    queryKey: qk.agents(filters),
    queryFn: () => agents.list(filters),
    staleTime: 30_000,
  });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: qk.agent(id ?? ""),
    queryFn: () => agents.detail(id as string),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useStakingStatus() {
  const { isAuthenticated } = useWallet();
  return useQuery({
    queryKey: qk.staking,
    queryFn: staking.status,
    enabled: isAuthenticated,
    staleTime: 20_000,
  });
}

export function useClaimable() {
  const { isAuthenticated } = useWallet();
  return useQuery({
    queryKey: qk.claimable,
    queryFn: rewards.claimable,
    enabled: isAuthenticated,
    staleTime: 20_000,
  });
}

export function useInventory() {
  const { isAuthenticated } = useWallet();
  return useQuery({
    queryKey: qk.inventory,
    queryFn: companions.inventory,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useCompanionRoster() {
  return useQuery({
    queryKey: qk.roster,
    queryFn: companions.roster,
    staleTime: 5 * 60_000,
  });
}

export function useDashboardSummary() {
  const { isAuthenticated } = useWallet();
  return useQuery({
    queryKey: qk.summary,
    queryFn: dashboard.summary,
    enabled: isAuthenticated,
    staleTime: 20_000,
  });
}

export function useTopNurturers() {
  return useQuery({
    queryKey: qk.topNurturers,
    queryFn: leaderboard.topNurturers,
    staleTime: 60_000,
  });
}

export function useTopAgents() {
  return useQuery({
    queryKey: qk.topAgents,
    queryFn: leaderboard.topAgents,
    staleTime: 60_000,
  });
}

/* ---- Staking mutations -------------------------------------------------- */

export function useStake() {
  const { address } = useWallet();
  const invalidate = useInvalidateBalances();

  return useMutation({
    mutationFn: ({ amount, token = "MONKI" }: { amount: number; token?: StakeToken }) => {
      if (!address) throw new Error("Connect a wallet first.");
      return staking.stake(address, amount, token);
    },
    onSuccess: (_data, vars) => {
      invalidate();
      toast.success(`Staked ${vars.amount.toLocaleString()} ${vars.token ?? "MONKI"}`, {
        description: "Your multiplier updates from the next epoch.",
      });
    },
    onError: (err) => toast.error("Stake failed", { description: describeError(err) }),
  });
}

export function useUnstake() {
  const { address } = useWallet();
  const invalidate = useInvalidateBalances();

  return useMutation({
    mutationFn: ({ amount, token = "MONKI" }: { amount: number; token?: StakeToken }) => {
      if (!address) throw new Error("Connect a wallet first.");
      return staking.unstake(address, amount, token);
    },
    onSuccess: (_data, vars) => {
      invalidate();
      toast.success(`Unstaked ${vars.amount.toLocaleString()} ${vars.token ?? "MONKI"}`, {
        description: "This resets your epoch eligibility clock.",
      });
    },
    onError: (err) => toast.error("Unstake failed", { description: describeError(err) }),
  });
}

/* ---- Reward claims -------------------------------------------------------- */

type ClaimKind = "pons" | "monki" | "meta";

const CLAIM_LABEL: Record<ClaimKind, string> = {
  pons: "$PONS",
  monki: "$MONKII",
  meta: "$META",
};

export function useClaim() {
  const { address } = useWallet();
  const invalidate = useInvalidateBalances();

  return useMutation({
    mutationFn: (kind: ClaimKind) => {
      if (!address) throw new Error("Connect a wallet first.");
      if (kind === "pons") return rewards.claimPons(address);
      if (kind === "meta") return rewards.claimMeta(address);
      return rewards.claimMonki(address);
    },
    onSuccess: (data, kind) => {
      invalidate();
      toast.success(`${CLAIM_LABEL[kind]} claimed`, {
        description: data?.txHash
          ? "Settled on Robinhood Chain."
          : "Your balance has been updated.",
        action: data?.txHash
          ? {
              label: "View tx",
              onClick: () => window.open(explorerTxUrl(data.txHash as string), "_blank"),
            }
          : undefined,
      });
    },
    onError: (err) => toast.error("Claim failed", { description: describeError(err) }),
  });
}

/* ---- Companions ------------------------------------------------------------- */

export function useMintCompanion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (companionId: string) =>
      mintCompanion(companionId, (stage) => {
        if (stage === "signing") {
          toast.info("Confirm in your wallet", {
            description: "The mint is free. You pay network gas in ETH only.",
          });
        }
        if (stage === "verifying") {
          toast.info("Registering your companion…");
        }
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.inventory });
      qc.invalidateQueries({ queryKey: qk.roster });
      toast.success("Companion minted", {
        description: "It is now in your inventory and ready to equip.",
        action: {
          label: "View tx",
          onClick: () => window.open(explorerTxUrl(data.txHash), "_blank"),
        },
      });
    },
    onError: (err) => toast.error("Mint failed", { description: describeError(err) }),
  });
}

export function useEquipCompanion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { userCompanionId: number; agentId: string; slotIndex: number }) =>
      companions.equip(vars.userCompanionId, vars.agentId, vars.slotIndex),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.inventory });
      qc.invalidateQueries({ queryKey: qk.agent(vars.agentId) });
      qc.invalidateQueries({ queryKey: qk.summary });
      toast.success("Companion equipped", { description: "Buffs apply immediately. No gas." });
    },
    onError: (err) => toast.error("Could not equip", { description: describeError(err) }),
  });
}

export function useUnequipCompanion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userCompanionId: number) => companions.unequip(userCompanionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.inventory });
      qc.invalidateQueries({ queryKey: ["agent"] });
      toast.success("Companion unequipped");
    },
    onError: (err) => toast.error("Could not unequip", { description: describeError(err) }),
  });
}

export function useClaimMilestone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (milestoneKey: MilestoneKey) => companions.claimMilestone(milestoneKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.inventory });
      toast.success("Milestone companion claimed");
    },
    onError: (err) => toast.error("Not available yet", { description: describeError(err) }),
  });
}

/* ---- Telegram ------------------------------------------------------------------ */

export function useTelegramLinkCode() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: telegram.linkCode,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me }),
    onError: (err) => toast.error("Could not get a code", { description: describeError(err) }),
  });
}

/* ---- Network & Milestones ------------------------------------------------------ */

export function useNetwork() {
  return useQuery({
    queryKey: qk.network,
    queryFn: network.config,
    staleTime: 30_000,
  });
}

export function useMilestones() {
  const { isAuthenticated } = useWallet();
  return useQuery({
    queryKey: qk.milestones,
    queryFn: companions.milestones,
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

/* ---- Admin Dashboard ----------------------------------------------------------- */

export function useAdminStats(adminKey: string) {
  return useQuery({
    queryKey: [...qk.adminStats, adminKey],
    queryFn: () => admin.stats(adminKey),
    enabled: Boolean(adminKey),
    refetchInterval: 10_000,
  });
}

export function useAdminProtocolSettings(adminKey: string) {
  return useQuery({
    queryKey: [...qk.adminSettings, adminKey],
    queryFn: () => admin.protocolSettings(adminKey),
    enabled: Boolean(adminKey),
  });
}

export function useToggleProtocolSetting(adminKey: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (setting: "monki" | "pons" | "companion") => {
      if (setting === "monki") return admin.toggleMonki(adminKey);
      if (setting === "pons") return admin.togglePons(adminKey);
      return admin.toggleCompanions(adminKey);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.adminSettings });
      qc.invalidateQueries({ queryKey: qk.network });
      toast.success(data.message);
    },
    onError: (err) => toast.error("Failed to toggle setting", { description: describeError(err) }),
  });
}

export function useAdminAirdrop(adminKey: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { recipientAddress: string; amountMonki?: number; amountPons?: number }) =>
      admin.airdrop(adminKey, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminStats });
      toast.success("Airdrop credited successfully");
    },
    onError: (err) => toast.error("Airdrop failed", { description: describeError(err) }),
  });
}

