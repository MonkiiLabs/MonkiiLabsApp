import { Gift, Loader2, Shield, Sparkles, Zap } from "lucide-react";

import {
  useClaimMilestone,
  useInventory,
  useMintCompanion,
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

/* The roster is fixed by the integration guide — six companions, free mints paying native ETH gas */
const ROSTER: Array<{
  id: string;
  name: string;
  rarity: Rarity;
  category: string;
  earn: number;
  decay: number;
}> = [
  { id: "cyber-chimp-drone", name: "Cyber-Chimp Drone", rarity: "Common", category: "mech", earn: 6, decay: 0 },
  { id: "nano-baboon-core", name: "Nano-Baboon Core", rarity: "Common", category: "construct", earn: 8, decay: 0 },
  { id: "plasma-lemur", name: "Plasma Lemur", rarity: "Uncommon", category: "spirit", earn: 12, decay: 10 },
  { id: "mecha-mandrill", name: "Mecha Mandrill", rarity: "Uncommon", category: "guardian", earn: 15, decay: 15 },
  { id: "quantum-ape-sentinel", name: "Quantum Ape Sentinel", rarity: "Rare", category: "sentinel", earn: 20, decay: 25 },
  { id: "celestial-king-monkii", name: "Celestial King Monkii", rarity: "Epic", category: "celestial", earn: 30, decay: 40 },
];

const RARITY_CHIP: Record<Rarity, string> = {
  Common: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  Uncommon: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Rare: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  Epic: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  Legendary: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const MILESTONES: Array<{ key: MilestoneKey; label: string; requirement: string }> = [
  { key: "first_heartbeat", label: "Cyber-Chimp Drone", requirement: "Submit your first heartbeat" },
  { key: "thriving_streak_7d", label: "Plasma Lemur", requirement: "Keep an agent thriving 7 days" },
  { key: "top_nurturer_10k", label: "Celestial King Monkii", requirement: `Earn 10,000 ${BRAND.rewardToken}` },
];

const CompanionsInner = () => {
  const inventory = useInventory();
  const mint = useMintCompanion();
  const unequip = useUnequipCompanion();
  const milestone = useClaimMilestone();

  const owned = inventory.data ?? [];
  const ownedIds = new Set(owned.map((c) => c.companionId));

  return (
    <div className="space-y-5">
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
              body="Every companion below is available for free minting on Robinhood Chain (network gas in ETH only)."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {owned.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <img
                    src={c.imageUrl ?? `/companions/${c.slug}.jpg`}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-white/15 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-400">
                      +{c.earnBoostPct}% earn boost
                      {c.decayReductionPct > 0 && ` · ${c.decayReductionPct}% decay shield`}
                    </p>
                    {c.equippedAgentId && (
                      <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        Equipped · {c.agentName ?? "Active Slot"}
                      </p>
                    )}
                  </div>
                  {c.equippedAgentId && (
                    <button
                      type="button"
                      onClick={() => unequip.mutate(c.id)}
                      disabled={unequip.isPending}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase text-slate-200 hover:bg-white/20 disabled:opacity-50"
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

      {/* Free Mint Showcase */}
      <Panel>
        <PanelHeader
          title="Robinhood Chain Free Mints"
          hint="The backend constructs the calldata payload; your connected wallet signs and broadcasts directly."
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROSTER.map((c) => {
            const isOwned = ownedIds.has(c.id);
            const busy = mint.isPending && mint.variables === c.id;
            return (
              <article
                key={c.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20"
              >
                <div className="relative aspect-[4/3] bg-[#090d0a]">
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
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="truncate font-display text-sm font-bold text-white">{c.name}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-semibold">+{c.earn}% Earn</span>
                    <span className="font-mono text-slate-400">
                      {c.decay > 0 ? `${c.decay}% Shield` : "Standard"}
                    </span>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      disabled={isOwned || busy}
                      onClick={() => mint.mutate(c.id)}
                      className={`w-full rounded-xl py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                        isOwned
                          ? "border border-white/10 bg-white/5 text-slate-500"
                          : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]"
                      }`}
                    >
                      {busy ? (
                        <span className="inline-flex items-center gap-1.5 justify-center">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Minting…
                        </span>
                      ) : isOwned ? (
                        "Owned in Wallet"
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
      index="02"
      eyebrow="ERC-721 Collectibles"
      title="Companion Collectibles"
      intro="Free collectible ERC-721 companions minted natively on Robinhood Chain. Equip up to three per agent to boost Proof-of-Life $MONKI accrual and resist power fade."
    />
    <AuthGate what="your companion inventory and minting">
      <CompanionsInner />
    </AuthGate>
  </>
);

export default CompanionsPage;
