import { Award, CheckCircle2, Gift, Loader2, Lock, Shield, Sparkles, Zap } from "lucide-react";

import {
  useClaimMilestone,
  useInventory,
  useMilestones,
  useMintCompanion,
  useNetwork,
  useUnequipCompanion,
} from "@/features/api/hooks";
import type { MilestoneKey, Rarity } from "@/features/api/types";
import {
  AuthGate,
  EmptyPanel,
  LoadingPanel,
  Panel,
  PanelHeader,
  PageTitle,
} from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";

/* The companion roster with unlock criteria */
const ROSTER: Array<{
  id: string;
  name: string;
  rarity: Rarity;
  category: string;
  earn: number;
  decay: number;
  unlockRequirement: string;
  isMilestoneReward?: boolean;
  milestoneKey?: MilestoneKey;
  minHeartbeats?: number;
  minMonki?: number;
}> = [
  {
    id: "cyber-chimp-drone",
    name: "Cyber-Chimp Drone",
    rarity: "Common",
    category: "mech",
    earn: 6,
    decay: 0,
    unlockRequirement: "Submit 1st Proof-of-Life heartbeat",
    isMilestoneReward: true,
    milestoneKey: "first_heartbeat",
  },
  {
    id: "nano-baboon-core",
    name: "Nano-Baboon Core",
    rarity: "Common",
    category: "construct",
    earn: 8,
    decay: 0,
    unlockRequirement: "Open Free Mint for all nurturers",
  },
  {
    id: "plasma-lemur",
    name: "Plasma Lemur",
    rarity: "Uncommon",
    category: "spirit",
    earn: 12,
    decay: 10,
    unlockRequirement: "Keep agents thriving for 7 active days",
    isMilestoneReward: true,
    milestoneKey: "thriving_streak_7d",
  },
  {
    id: "mecha-mandrill",
    name: "Mecha Mandrill",
    rarity: "Uncommon",
    category: "guardian",
    earn: 15,
    decay: 15,
    unlockRequirement: "Complete at least 5 heartbeat sessions",
    minHeartbeats: 5,
  },
  {
    id: "quantum-ape-sentinel",
    name: "Quantum Ape Sentinel",
    rarity: "Rare",
    category: "sentinel",
    earn: 20,
    decay: 25,
    unlockRequirement: "Mine at least 1,000 $MONKI",
    minMonki: 1000,
  },
  {
    id: "celestial-king-monkii",
    name: "Celestial King Monkii",
    rarity: "Epic",
    category: "celestial",
    earn: 30,
    decay: 40,
    unlockRequirement: "Earn 10,000 $MONKI mined (Elite Tier)",
    isMilestoneReward: true,
    milestoneKey: "top_nurturer_10k",
  },
];

const RARITY_CHIP: Record<Rarity, string> = {
  Common: "border-paper-4/30 bg-paper-4/10 text-paper-2",
  Uncommon: "border-alive/30 bg-alive/10 text-alive-lit",
  Rare: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  Epic: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  Legendary: "border-idle/30 bg-idle/10 text-idle",
};

const MILESTONE_CARDS: Array<{
  key: MilestoneKey;
  companionId: string;
  title: string;
  companionName: string;
  rarity: Rarity;
  description: string;
  requirement: string;
}> = [
  {
    key: "first_heartbeat",
    companionId: "cyber-chimp-drone",
    title: "Initiation Ritual",
    companionName: "Cyber-Chimp Drone",
    rarity: "Common",
    description: "Granted automatically upon completing your first Proof-of-Life heartbeat session.",
    requirement: "1 Completed Heartbeat",
  },
  {
    key: "thriving_streak_7d",
    companionId: "plasma-lemur",
    title: "Vitality Guardian",
    companionName: "Plasma Lemur",
    rarity: "Uncommon",
    description: "Granted for maintaining active nurturer heartbeats across 7 separate days.",
    requirement: "7 Active Nurturing Days",
  },
  {
    key: "top_nurturer_10k",
    companionId: "celestial-king-monkii",
    title: "Celestial Sovereign",
    companionName: "Celestial King Monkii",
    rarity: "Epic",
    description: "Awarded to elite laboratory participants who mine over 10,000 $MONKI compute tokens.",
    requirement: "10,000 $MONKI Mined",
  },
];

const CompanionsInner = () => {
  const inventory = useInventory();
  const mint = useMintCompanion();
  const unequip = useUnequipCompanion();
  const milestone = useClaimMilestone();
  const milestones = useMilestones();
  const { data: networkConfig } = useNetwork();

  const protocolSettings = networkConfig?.protocolSettings;
  const isMintingEnabled = protocolSettings?.enableCompanionMinting !== false;

  const owned = inventory.data ?? [];
  const ownedIds = new Set(owned.map((c) => c.companionId));

  const msData = milestones.data;

  return (
    <div className="space-y-5">
      {/* Protocol Notice if Minting Paused */}
      {!isMintingEnabled && (
        <div className="rounded-2xl border border-hair/15 bg-hair/5 p-4 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-paper-2">
            ⚠️ Companion NFT minting is temporarily paused by protocol administration.
          </p>
        </div>
      )}

      {/* Inventory */}
      <Panel raised>
        <PanelHeader
          title={`Your Collectibles Inventory (${owned.length})`}
          hint="Equip up to 3 per agent for permanent passive boosts. Equipping is off-chain and gasless."
        />
        <div className="p-5">
          {inventory.isLoading ? (
            <LoadingPanel label="Querying Robinhood Chain inventory" />
          ) : owned.length === 0 ? (
            <EmptyPanel
              title="No companions in your wallet inventory"
              body="Complete milestones or mint companions below to equip passive boosts to your agents."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {owned.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-hair/10 bg-hair/[0.05] p-3"
                >
                  <img
                    src={c.imageUrl ?? `/companions/${c.slug}.jpg`}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-hair/15 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-paper">{c.name}</p>
                    <p className="text-[11px] text-paper-3">
                      +{c.earnBoostPct}% earn boost
                      {c.decayReductionPct > 0 && ` · ${c.decayReductionPct}% decay shield`}
                    </p>
                    {c.equippedAgentId && (
                      <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-alive-lit">
                        Equipped · {c.agentName ?? "Active Slot"}
                      </p>
                    )}
                  </div>
                  {c.equippedAgentId && (
                    <button
                      type="button"
                      onClick={() => unequip.mutate(c.id)}
                      disabled={unequip.isPending}
                      className="shrink-0 rounded-lg border border-hair/10 bg-hair/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase text-paper hover:bg-hair/20 disabled:opacity-50"
                    >
                      Unequip
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      {/* Milestone Achievements Track */}
      <Panel>
        <PanelHeader
          title="Milestone Earned Rewards"
          hint="Earn exclusive companion collectibles by meeting nurturing achievements. Zero mint gas required."
        />
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {MILESTONE_CARDS.map((m) => {
            const ms = msData?.[m.key];
            const isOwned = ownedIds.has(m.companionId);
            const isClaimed = ms?.claimed || isOwned;
            const isEligible = ms?.eligible && !isClaimed;
            const current = ms?.current ?? 0;
            const target = ms?.target ?? 1;
            const pct = Math.min(100, Math.round((current / target) * 100));

            return (
              <div
                key={m.key}
                className="flex flex-col justify-between rounded-2xl border border-hair/10 bg-white p-4 shadow-playful"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${RARITY_CHIP[m.rarity]}`}
                    >
                      {m.rarity}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-alive-lit">
                      {isClaimed ? "Claimed ✓" : `${pct}% Unlocked`}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={`/companions/${m.companionId}.jpg`}
                      alt={m.companionName}
                      className="h-14 w-14 rounded-xl border border-hair/15 object-cover"
                    />
                    <div>
                      <h4 className="font-display text-sm font-bold text-paper">{m.title}</h4>
                      <p className="font-mono text-xs text-alive-lit">{m.companionName}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-paper-3 leading-relaxed">{m.description}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-paper-3">
                      <span>{m.requirement}</span>
                      <span>
                        {current.toLocaleString()} / {target.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-hair/10">
                      <div
                        className="h-full bg-alive-lit transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-hair/10">
                  {isClaimed ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-hair/10 bg-hair/5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-paper-4 cursor-default"
                    >
                      Reward Unlocked
                    </button>
                  ) : isEligible ? (
                    <button
                      type="button"
                      disabled={milestone.isPending || !isMintingEnabled}
                      onClick={() => milestone.mutate(m.key)}
                      className="w-full rounded-xl bg-alive-lit py-2 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      {milestone.isPending ? "Unlocking…" : "Claim Milestone Reward"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-hair/10 bg-hair/5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-paper-3 cursor-not-allowed opacity-60 inline-flex items-center justify-center gap-1.5"
                    >
                      <Lock className="h-3 w-3" />
                      Locked ({pct}%)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Full Companion Roster */}
      <Panel>
        <PanelHeader
          title="Companion Roster & Minting Requirements"
          hint="Each companion provides specific power perks. Free minting directly on Robinhood Chain."
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROSTER.map((c) => {
            const isOwned = ownedIds.has(c.id);
            const busy = mint.isPending && mint.variables === c.id;

            // Check unlock criteria
            const heartbeats = msData?.first_heartbeat.current ?? 0;
            const monki = msData?.top_nurturer_10k.current ?? 0;

            let isLocked = false;
            let lockReason = "";

            if (c.isMilestoneReward) {
              const ms = c.milestoneKey ? msData?.[c.milestoneKey] : undefined;
              if (!ms?.eligible && !isOwned) {
                isLocked = true;
                lockReason = c.unlockRequirement;
              }
            } else if (c.minHeartbeats && heartbeats < c.minHeartbeats && !isOwned) {
              isLocked = true;
              lockReason = `Requires ${c.minHeartbeats} heartbeats (${heartbeats}/${c.minHeartbeats})`;
            } else if (c.minMonki && monki < c.minMonki && !isOwned) {
              isLocked = true;
              lockReason = `Requires ${c.minMonki.toLocaleString()} $MONKI (${monki}/${c.minMonki})`;
            }

            return (
              <article
                key={c.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-hair/10 bg-white shadow-playful transition-all hover:border-hair/20"
              >
                <div className="relative aspect-[4/3] bg-bench">
                  <img
                    src={`/companions/${c.id}.jpg`}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute left-2.5 top-2.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${RARITY_CHIP[c.rarity]}`}
                  >
                    {c.rarity}
                  </span>
                  {c.isMilestoneReward && (
                    <span className="absolute right-2.5 top-2.5 rounded-md border border-alive/30 bg-black/80 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-alive-lit">
                      Milestone
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="truncate font-display text-sm font-bold text-paper">{c.name}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-alive-lit font-semibold">+{c.earn}% Earn</span>
                    <span className="font-mono text-paper-3">
                      {c.decay > 0 ? `${c.decay}% Shield` : "Standard"}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-paper-3">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-coral">
                        <Lock className="h-3 w-3 inline" /> {lockReason}
                      </span>
                    ) : (
                      <span className="text-paper-3">Criteria Met · Available</span>
                    )}
                  </p>

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      disabled={isOwned || busy || isLocked || !isMintingEnabled}
                      onClick={() => mint.mutate(c.id)}
                      className={`w-full rounded-xl py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                        isOwned
                          ? "border border-hair/10 bg-hair/[0.05] text-paper-4"
                          : isLocked
                          ? "border border-hair/10 bg-hair/5 text-paper-3 cursor-not-allowed opacity-60"
                          : "bg-act text-white hover:bg-act-lit active:scale-[0.97]"
                      }`}
                    >
                      {busy ? (
                        <span className="inline-flex items-center gap-1.5 justify-center">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Minting…
                        </span>
                      ) : isOwned ? (
                        "Owned in Wallet"
                      ) : isLocked ? (
                        "Locked"
                      ) : (
                        "Free Mint (0 ETH)"
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};

const CompanionsPage = () => (
  <>
    <PageTitle
      title="Companion Collectibles"
      intro="Free collectible ERC-721 companions minted natively on Robinhood Chain. Equip up to three per agent to boost Proof-of-Life $MONKI accrual and resist power fade."
    />
    <AuthGate what="your companion inventory and minting">
      <CompanionsInner />
    </AuthGate>
  </>
);

export default CompanionsPage;
