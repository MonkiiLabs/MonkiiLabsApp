import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useMonkii } from "@/features/monkii/store";
import { MAX_EQUIPPED, RARITY_ORDER, RARITY_STYLES, type Rarity } from "@/features/monkii/data";
import { BRAND } from "@/lib/brand";

const CompanionsPage = () => {
  const { companions, agents, isEquippedAnywhere, equip, unequip, equippedFor, getAgent } = useMonkii();
  const [tab, setTab] = useState<"owned" | "all">("owned");
  const [rarity, setRarity] = useState<Rarity | "all">("all");

  const visible = companions.filter(
    (c) => (tab === "all" || c.owned) && (rarity === "all" || c.rarity === rarity),
  );

  const activeBonus = agents.reduce(
    (sum, a) => sum + equippedFor(a.id).reduce((s, c) => s + c.bonusPct, 0),
    0,
  );

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-claw-charcoal">Companion inventory</h1>
        <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">
          Companions are Robinhood cNFTs. Equip up to {MAX_EQUIPPED} per agent for passive
          {" "}{BRAND.rewardToken} earn-rate bonuses and fade protection. Equipping is instant and free.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {[
            { label: "Owned", value: companions.filter((c) => c.owned).length },
            { label: "Equipped", value: agents.reduce((n, a) => n + equippedFor(a.id).length, 0) },
            { label: "Total active bonus", value: `+${activeBonus}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-cream border-2 border-dashboard-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-claw-gray-600">{s.label}</p>
              <p className="text-base font-extrabold text-claw-charcoal tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {(["owned", "all"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border-2 transition-colors ${
                tab === t
                  ? "bg-coral text-white border-coral"
                  : "bg-white text-claw-gray-600 border-dashboard-border hover:text-coral hover:border-coral"
              }`}
            >
              {t === "owned" ? "My Companions" : "Full collection"}
            </button>
          ))}
          <span className="w-px bg-dashboard-border mx-1" />
          {(["all", ...RARITY_ORDER] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRarity(r as Rarity | "all")}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold border-2 transition-colors ${
                rarity === r
                  ? "bg-claw-charcoal text-white border-claw-charcoal"
                  : "bg-white text-claw-gray-600 border-dashboard-border hover:text-coral hover:border-coral"
              }`}
            >
              {r === "all" ? "Any rarity" : r}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((c) => {
          const s = RARITY_STYLES[c.rarity];
          const holderId = isEquippedAnywhere(c.id);
          const holder = holderId ? getAgent(holderId) : undefined;
          return (
            <Card key={c.id} className={`border-2 ${s.border} bg-white rounded-2xl p-4 card-playful`}>
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 shrink-0 rounded-2xl ${s.bg} border-2 ${s.border} flex items-center justify-center text-2xl`}>
                  {c.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-extrabold text-claw-charcoal">{c.name}</h2>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                      {c.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-claw-gray-600 mt-1">{c.category}</p>
                  <p className="text-xs font-bold text-human-green mt-1">{c.bonusLabel}</p>
                  {c.effect !== "—" && (
                    <p className="text-xs text-claw-gray-600 mt-0.5">{c.effect}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                {!c.owned ? (
                  <Button
                    onClick={() =>
                      toast.info("Mint wave not open yet", {
                        description: `Limited paid waves are priced in SOL or ${BRAND.valueToken}. Milestone mints unlock through thriving streaks.`,
                      })
                    }
                    variant="outline"
                    className="w-full rounded-full font-bold border-2 border-dashboard-border text-claw-charcoal hover:text-coral hover:border-coral"
                  >
                    🔔 Notify me for the mint
                  </Button>
                ) : holder ? (
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/dashboard/agents/${holder.id}`}
                      className="text-xs font-extrabold text-sky-dark hover:text-coral truncate"
                    >
                      Equipped to {holder.name} →
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unequip(holder.id, c.id)}
                      className="rounded-full font-bold border-2 border-dashboard-border text-claw-charcoal hover:text-coral hover:border-coral"
                    >
                      Unequip
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {agents.slice(0, 4).map((a) => (
                      <Button
                        key={a.id}
                        size="sm"
                        onClick={() => {
                          equip(a.id, c.id);
                          toast.success(`${c.name} equipped to ${a.name}`);
                        }}
                        className="rounded-full bg-cream hover:bg-coral hover:text-white text-claw-charcoal font-bold border-2 border-dashboard-border"
                      >
                        {a.emoji} {a.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CompanionsPage;
