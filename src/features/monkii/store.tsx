import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AGENTS,
  COMPANIONS,
  MAX_EQUIPPED,
  POOL_STATS,
  stateForPower,
  type Agent,
  type AgentState,
  type Companion,
} from "./data";

const STORAGE_KEY = "monkii_state_v1";

export interface MonkiiNotification {
  id: string;
  agentId?: string;
  title: string;
  body: string;
  tone: "alert" | "reward" | "info";
  createdAt: number;
  read: boolean;
}

interface PersistedState {
  power: Record<string, number>;
  heartbeats: Record<string, number>;
  activeAgentId: string | null;
  equipped: Record<string, string[]>;
  agentsBalance: number;
  staked: number;
  stakeStartedAt: number | null;
  epochEndsAt: number;
  ansemClaimed: number;
  totalHeartbeats: number;
  streakDays: number;
  notifications: MonkiiNotification[];
}

const initialState = (): PersistedState => ({
  power: Object.fromEntries(AGENTS.map((a) => [a.id, a.power])),
  heartbeats: Object.fromEntries(AGENTS.map((a) => [a.id, 0])),
  activeAgentId: null,
  equipped: { aixbt: ["moss-sprite"], gaia: ["tide-lantern", "ember-orb"] },
  agentsBalance: 1240,
  staked: 750,
  stakeStartedAt: Date.now() - 1000 * 60 * 60 * 5,
  epochEndsAt: Date.now() + 1000 * 60 * 60 * 7,
  ansemClaimed: 128.4,
  totalHeartbeats: 3120,
  streakDays: 6,
  notifications: [
    {
      id: "n1",
      agentId: "gaia",
      title: "GAIA is fading",
      body: "Power dropped below 30%. Start a heartbeat session to pull it back to Idle.",
      tone: "alert",
      createdAt: Date.now() - 1000 * 60 * 12,
      read: false,
    },
    {
      id: "n2",
      title: "Epoch reward settled",
      body: "You were paid a flat $PONS amount for holding your stake through the full cycle.",
      tone: "reward",
      createdAt: Date.now() - 1000 * 60 * 60 * 9,
      read: false,
    },
    {
      id: "n3",
      title: "Milestone Companion unlocked",
      body: "6-day thriving streak: Moss Sprite (Uncommon) added to your inventory.",
      tone: "info",
      createdAt: Date.now() - 1000 * 60 * 60 * 26,
      read: true,
    },
  ],
});

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return { ...initialState(), ...(JSON.parse(raw) as PersistedState) };
  } catch {
    return initialState();
  }
}

interface MonkiiContextValue extends PersistedState {
  agents: Agent[];
  companions: Companion[];
  ownedCompanions: Companion[];
  getAgent: (id: string) => Agent | undefined;
  getPower: (id: string) => number;
  getState: (id: string) => AgentState;
  equippedFor: (agentId: string) => Companion[];
  bonusFor: (agentId: string) => number;
  isEquippedAnywhere: (companionId: string) => string | null;
  toggleNurture: (agentId: string) => void;
  equip: (agentId: string, companionId: string) => void;
  unequip: (agentId: string, companionId: string) => void;
  stake: (amount: number) => void;
  unstake: (amount: number) => void;
  claimAnsem: () => number;
  markAllRead: () => void;
  unreadCount: number;
  pendingAnsem: number;
  earnMultiplier: number;
  reset: () => void;
}

const MonkiiContext = createContext<MonkiiContextValue | undefined>(undefined);

export const MonkiiProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PersistedState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Proof-of-Life heartbeat tick: the active agent gains power and mints $MONKII,
  // every other agent slowly drains. Purely client-side simulation.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) => {
        const power = { ...prev.power };
        const heartbeats = { ...prev.heartbeats };
        let balance = prev.agentsBalance;
        let total = prev.totalHeartbeats;

        for (const agent of AGENTS) {
          const equippedIds = prev.equipped[agent.id] ?? [];
          const hasProtection = equippedIds.some((id) => {
            const c = COMPANIONS.find((x) => x.id === id);
            return c && c.rarity !== "Common";
          });
          const floor = equippedIds.includes("eternal-banana") ? 33 : hasProtection ? 12 : 0;
          const drain = hasProtection ? 0.25 : 0.5;
          power[agent.id] = Math.max(floor, (power[agent.id] ?? agent.power) - drain);
        }

        if (prev.activeAgentId) {
          const id = prev.activeAgentId;
          const agent = AGENTS.find((a) => a.id === id);
          const bonus =
            (prev.equipped[id] ?? []).reduce((sum, cid) => {
              const c = COMPANIONS.find((x) => x.id === cid);
              return sum + (c?.bonusPct ?? 0);
            }, 0) / 100;
          const stakeMultiplier = Math.min(2, 1 + prev.staked / 5000);
          power[id] = Math.min(100, (power[id] ?? 0) + 3.5);
          heartbeats[id] = (heartbeats[id] ?? 0) + 1;
          total += 1;
          balance += (agent?.earnRate ?? 1) * (1 + bonus) * stakeMultiplier;
        }

        return { ...prev, power, heartbeats, agentsBalance: balance, totalHeartbeats: total };
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  // Keep the shared global epoch countdown rolling.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) =>
        prev.epochEndsAt > Date.now()
          ? prev
          : { ...prev, epochEndsAt: Date.now() + POOL_STATS.epochHours * 3600 * 1000 },
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getPower = useCallback(
    (id: string) => state.power[id] ?? AGENTS.find((a) => a.id === id)?.power ?? 0,
    [state.power],
  );

  const equippedFor = useCallback(
    (agentId: string) =>
      (state.equipped[agentId] ?? [])
        .map((id) => COMPANIONS.find((c) => c.id === id))
        .filter((c): c is Companion => !!c),
    [state.equipped],
  );

  const bonusFor = useCallback(
    (agentId: string) => equippedFor(agentId).reduce((sum, c) => sum + c.bonusPct, 0),
    [equippedFor],
  );

  const value = useMemo<MonkiiContextValue>(() => {
    const earnMultiplier = Math.min(2, 1 + state.staked / 5000);
    const qualifies = state.staked >= POOL_STATS.minStake;
    const pendingAnsem = qualifies ? Math.round((state.staked / 100) * 10) / 10 : 0;

    return {
      ...state,
      agents: AGENTS,
      companions: COMPANIONS,
      ownedCompanions: COMPANIONS.filter((c) => c.owned),
      getAgent: (id) => AGENTS.find((a) => a.id === id),
      getPower,
      getState: (id) => stateForPower(getPower(id)),
      equippedFor,
      bonusFor,
      isEquippedAnywhere: (companionId) =>
        Object.entries(state.equipped).find(([, ids]) => ids.includes(companionId))?.[0] ?? null,
      toggleNurture: (agentId) =>
        setState((prev) => ({
          ...prev,
          activeAgentId: prev.activeAgentId === agentId ? null : agentId,
        })),
      equip: (agentId, companionId) =>
        setState((prev) => {
          const equipped = { ...prev.equipped };
          for (const key of Object.keys(equipped)) {
            equipped[key] = equipped[key].filter((id) => id !== companionId);
          }
          const current = equipped[agentId] ?? [];
          if (current.length >= MAX_EQUIPPED) return prev;
          equipped[agentId] = [...current, companionId];
          return { ...prev, equipped };
        }),
      unequip: (agentId, companionId) =>
        setState((prev) => ({
          ...prev,
          equipped: {
            ...prev.equipped,
            [agentId]: (prev.equipped[agentId] ?? []).filter((id) => id !== companionId),
          },
        })),
      stake: (amount) =>
        setState((prev) =>
          amount <= 0 || amount > prev.agentsBalance
            ? prev
            : {
                ...prev,
                agentsBalance: prev.agentsBalance - amount,
                staked: prev.staked + amount,
                stakeStartedAt: Date.now(),
              },
        ),
      unstake: (amount) =>
        setState((prev) =>
          amount <= 0 || amount > prev.staked
            ? prev
            : {
                ...prev,
                agentsBalance: prev.agentsBalance + amount,
                staked: prev.staked - amount,
                stakeStartedAt: Date.now(),
              },
        ),
      claimAnsem: () => {
        let claimed = 0;
        setState((prev) => {
          const amount = prev.staked >= POOL_STATS.minStake ? Math.round((prev.staked / 100) * 10) / 10 : 0;
          claimed = amount;
          if (!amount) return prev;
          return {
            ...prev,
            ansemClaimed: prev.ansemClaimed + amount,
            epochEndsAt: Date.now() + POOL_STATS.epochHours * 3600 * 1000,
          };
        });
        return claimed;
      },
      markAllRead: () =>
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, read: true })),
        })),
      unreadCount: state.notifications.filter((n) => !n.read).length,
      pendingAnsem,
      earnMultiplier,
      reset: () => setState(initialState()),
    };
  }, [state, getPower, equippedFor, bonusFor]);

  return <MonkiiContext.Provider value={value}>{children}</MonkiiContext.Provider>;
};

export const useMonkii = (): MonkiiContextValue => {
  const ctx = useContext(MonkiiContext);
  if (!ctx) throw new Error("useMonkii must be used within a MonkiiProvider");
  return ctx;
};
