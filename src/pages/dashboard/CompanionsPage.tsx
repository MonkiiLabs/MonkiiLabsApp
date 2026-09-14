import { Award, CheckCircle2, Gift, Loader2, Lock, Shield, Sparkles, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

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

/* The companion roster. Ids, rarity and numbers stay here; every readable
   string lives in the locale bundle under comp.roster.<id>. */
const ROSTER: Array<{
  id: string;
  rarity: Rarity;
  category: string;
  earn: number;
  decay: number;
  isMilestoneReward?: boolean;
  milestoneKey?: MilestoneKey;
  minHeartbeats?: number;
  minMonki?: number;
}> = [
  { id: "cyber-chimp-drone", rarity: "Common", category: "mech", earn: 6, decay: 0, isMilestoneReward: true, milestoneKey: "first_heartbeat" },
  { id: "nano-baboon-core", rarity: "Common", category: "construct", earn: 8, decay: 0 },
  { id: "plasma-lemur", rarity: "Uncommon", category: "spirit", earn: 12, decay: 10, isMilestoneReward: true, milestoneKey: "thriving_streak_7d" },
  { id: "mecha-mandrill", rarity: "Uncommon", category: "guardian", earn: 15, decay: 15, minHeartbeats: 5 },
  { id: "quantum-ape-sentinel", rarity: "Rare", category: "sentinel", earn: 20, decay: 25, minMonki: 1000 },
  { id: "celestial-king-monkii", rarity: "Epic", category: "celestial", earn: 30, decay: 40, isMilestoneReward: true, milestoneKey: "top_nurturer_10k" },
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
  rarity: Rarity;
}> = [
  { key: "first_heartbeat", companionId: "cyber-chimp-drone", rarity: "Common" },
  { key: "thriving_streak_7d", companionId: "plasma-lemur", rarity: "Uncommon" },
  { key: "top_nurturer_10k", companionId: "celestial-king-monkii", rarity: "Epic" },
]

const CompanionsInner = () => {
  const { t } = useTranslation();
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
            {t("comp.paused")}
          </p>
        </div>
      )}

      {/* Inventory */}
      <Panel raised>
        <PanelHeader
          title={t("comp.inventoryTitle", { count: owned.length })}
          hint={t("comp.inventoryHint")}
        />
        <div className="p-5">
          {inventory.isLoading ? (
            <LoadingPanel label={t("comp.loading")} />
          ) : owned.length === 0 ? (
            <EmptyPanel
              title={t("comp.emptyTitle")}
              body={t("comp.emptyBody")}
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
                      {t("comp.earnBoost", { pct: c.earnBoostPct })}
                      {c.decayReductionPct > 0 &&
                        t("comp.decayShield", { pct: c.decayReductionPct })}
                    </p>
                    {c.equippedAgentId && (
                      <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-alive-lit">
                        {t("comp.equipped", { agent: c.agentName ?? t("comp.activeSlot") })}
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
                      {t("comp.unequip")}
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
          title={t("comp.milestoneTitle")}
          hint={t("comp.milestoneHint")}
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
                      {isClaimed ? t("comp.claimed") : t("comp.unlockedPct", { pct })}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={`/companions/${m.companionId}.jpg`}
                      alt={t(`comp.cards.${m.key}.companion`)}
                      className="h-14 w-14 rounded-xl border border-hair/15 object-cover"
                    />
                    <div>
                      <h4 className="font-display text-sm font-bold text-paper">
                        {t(`comp.cards.${m.key}.title`)}
                      </h4>
                      <p className="font-mono text-xs text-alive-lit">
                        {t(`comp.cards.${m.key}.companion`)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-paper-3 leading-relaxed">
                    {t(`comp.cards.${m.key}.description`)}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-paper-3">
                      <span>{t(`comp.cards.${m.key}.requirement`)}</span>
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
                      {t("comp.rewardUnlocked")}
                    </button>
                  ) : isEligible ? (
                    <button
                      type="button"
                      disabled={milestone.isPending || !isMintingEnabled}
                      onClick={() => milestone.mutate(m.key)}
                      className="w-full rounded-xl bg-alive-lit py-2 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      {milestone.isPending ? t("comp.unlocking") : t("comp.claimMilestone")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-hair/10 bg-hair/5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-paper-3 cursor-not-allowed opacity-60 inline-flex items-center justify-center gap-1.5"
                    >
                      <Lock className="h-3 w-3" />
                      {t("comp.locked", { pct })}
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
          title={t("comp.rosterTitle")}
          hint={t("comp.rosterHint")}
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
                lockReason = t(`comp.roster.${c.id}.unlock`);
              }
            } else if (c.minHeartbeats && heartbeats < c.minHeartbeats && !isOwned) {
              isLocked = true;
              lockReason = t("comp.requiresHeartbeats", {
                need: c.minHeartbeats,
                have: heartbeats,
              });
            } else if (c.minMonki && monki < c.minMonki && !isOwned) {
              isLocked = true;
              lockReason = t("comp.requiresMonki", {
                need: c.minMonki.toLocaleString(),
                have: monki,
              });
            }

            return (
              <article
                key={c.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-hair/10 bg-white shadow-playful transition-all hover:border-hair/20"
              >
                <div className="relative aspect-[4/3] bg-bench">
                  <img
                    src={`/companions/${c.id}.jpg`}
                    alt={t(`comp.roster.${c.id}.name`)}
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
                      {t("comp.milestoneBadge")}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="truncate font-display text-sm font-bold text-paper">
                    {t(`comp.roster.${c.id}.name`)}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-alive-lit font-semibold">
                      {t("comp.earnPct", { pct: c.earn })}
                    </span>
                    <span className="font-mono text-paper-3">
                      {c.decay > 0 ? t("comp.shieldPct", { pct: c.decay }) : t("comp.standard")}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-paper-3">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-coral">
                        <Lock className="h-3 w-3 inline" /> {lockReason}
                      </span>
                    ) : (
                      <span className="text-paper-3">{t("comp.criteriaMet")}</span>
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
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("comp.minting")}
                        </span>
                      ) : isOwned ? (
                        t("comp.owned")
                      ) : isLocked ? (
                        t("comp.lockedShort")
                      ) : (
                        t("comp.freeMint")
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

const CompanionsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("comp.title")} intro={t("comp.intro")} />
      <AuthGate what={t("comp.authWhat")}>
        <CompanionsInner />
      </AuthGate>
    </>
  );
};

export default CompanionsPage;
