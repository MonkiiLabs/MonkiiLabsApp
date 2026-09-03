import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";
import PowerMeter from "@/components/dashboard/PowerMeter";
import EpochCard from "@/components/dashboard/EpochCard";
import { useMonkii } from "@/features/monkii/store";
import { AGENT_STATE_META, MAX_EQUIPPED, POOL_STATS, RARITY_STYLES } from "@/features/monkii/data";
import { BRAND } from "@/lib/brand";

const AgentDetailPage = () => {
  const { id = "" } = useParams();
  const {
    getAgent,
    getPower,
    getState,
    toggleNurture,
    activeAgentId,
    equippedFor,
    bonusFor,
    ownedCompanions,
    isEquippedAnywhere,
    equip,
    unequip,
    staked,
    heartbeats,
    earnMultiplier,
  } = useMonkii();

  const agent = getAgent(id);

  if (!agent) {
    return (
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🙊</div>
        <h1 className="text-lg font-extrabold text-claw-charcoal">Agent not found</h1>
        <Button asChild className="mt-4 rounded-full bg-coral hover:bg-coral-dark text-white font-bold">
          <Link to="/dashboard/agents">Back to marketplace</Link>
        </Button>
      </Card>
    );
  }

  const power = getPower(agent.id);
  const meta = AGENT_STATE_META[getState(agent.id)];
  const equipped = equippedFor(agent.id);
  const bonus = bonusFor(agent.id);
  const isActive = activeAgentId === agent.id;
  const locked = agent.premium && staked < POOL_STATS.minStake * 4;
  const perTick = (agent.earnRate * (1 + bonus / 100) * earnMultiplier).toFixed(2);

  return (
    <div className="space-y-3">
      <Link
        to="/dashboard/agents"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-claw-gray-600 hover:text-coral transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All agents
      </Link>

      <Card className="border-2 border-dashboard-border bg-white rounded-2xl overflow-hidden">
        <div className="h-24 sm:h-28 sky-gradient" />
        <div className="px-5 pb-5 -mt-10">
          <motion.div
            className={`w-20 h-20 rounded-3xl bg-white border-4 border-white shadow-playful flex items-center justify-center text-4xl ring-4 ${meta.ring}`}
            animate={isActive ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {agent.emoji}
          </motion.div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-claw-charcoal">{agent.name}</h1>
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
              {meta.emoji} {meta.label}
            </span>
            {agent.premium && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-ai-purple-bg text-ai-purple">
                Premium
              </span>
            )}
          </div>
          <p className="text-sm text-claw-gray-600 mt-2 leading-relaxed max-w-2xl">{agent.description}</p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold text-claw-gray-600">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {agent.nurturers.toLocaleString()} nurturers
            </span>
            <span>🗂️ {agent.category}</span>
            <a
              href={`https://x.com/${agent.handle.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sky-dark hover:text-coral transition-colors"
            >
              {agent.handle} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="mt-5">
            <PowerMeter power={power} size="lg" />
            <p className="text-xs text-claw-gray-600 mt-2 leading-relaxed">{meta.note}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
            {[
              { label: "Your heartbeats", value: (heartbeats[agent.id] ?? 0).toLocaleString() },
              { label: "Companion bonus", value: `+${bonus}%` },
              { label: `${BRAND.rewardToken} / heartbeat`, value: perTick },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-cream border-2 border-dashboard-border p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-claw-gray-600">{s.label}</p>
                <p className="text-base font-extrabold text-claw-charcoal tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          {locked ? (
            <div className="mt-5 rounded-2xl border-2 border-ai-purple/30 bg-ai-purple-bg p-4">
              <p className="text-sm font-extrabold text-ai-purple flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Premium agent
              </p>
              <p className="text-xs text-claw-gray-600 mt-1 leading-relaxed">
                Stake at least {(POOL_STATS.minStake * 4).toLocaleString()} {BRAND.rewardToken} to
                nurture this agent.
              </p>
              <Button asChild className="mt-3 rounded-full bg-ai-purple hover:bg-ai-purple/90 text-white font-bold">
                <Link to="/dashboard/staking">Go to staking</Link>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => toggleNurture(agent.id)}
              className={`w-full sm:w-auto mt-5 rounded-full px-8 py-6 font-bold text-base ${
                isActive
                  ? "bg-human-green hover:bg-human-green/90 text-white"
                  : "bg-coral hover:bg-coral-dark text-white shadow-coral"
              }`}
            >
              {isActive ? "🫀 Stop heartbeat session" : "🫀 Start heartbeat session"}
            </Button>
          )}
        </div>
      </Card>

      {/* Companions */}
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-claw-charcoal">
            Equipped Companions
            <span className="text-claw-gray-600 font-bold"> · {equipped.length}/{MAX_EQUIPPED}</span>
          </h2>
          <Link to="/dashboard/companions" className="text-xs font-extrabold text-sky-dark hover:text-coral">
            Inventory →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {Array.from({ length: MAX_EQUIPPED }).map((_, i) => {
            const c = equipped[i];
            if (!c) {
              return (
                <div
                  key={`empty-${i}`}
                  className="rounded-2xl border-2 border-dashed border-dashboard-border bg-cream/60 p-4 text-center text-xs font-bold text-claw-gray-600"
                >
                  Empty slot
                </div>
              );
            }
            const s = RARITY_STYLES[c.rarity];
            return (
              <div key={c.id} className={`rounded-2xl border-2 ${s.border} ${s.bg} p-3 text-center`}>
                <div className="text-2xl">{c.emoji}</div>
                <p className="text-xs font-extrabold text-claw-charcoal mt-1 truncate">{c.name}</p>
                <p className={`text-[10px] font-extrabold ${s.text}`}>{c.rarity}</p>
                <button
                  type="button"
                  onClick={() => unequip(agent.id, c.id)}
                  className="mt-2 text-[11px] font-extrabold text-coral hover:underline"
                >
                  Unequip
                </button>
              </div>
            );
          })}
        </div>

        <h3 className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mt-5 mb-2">
          Available to equip
        </h3>
        <ul className="space-y-2">
          {ownedCompanions.map((c) => {
            const holder = isEquippedAnywhere(c.id);
            const here = holder === agent.id;
            const s = RARITY_STYLES[c.rarity];
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-dashboard-border p-3"
              >
                <span className={`w-10 h-10 rounded-xl ${s.bg} border-2 ${s.border} flex items-center justify-center text-lg`}>
                  {c.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-claw-charcoal truncate">{c.name}</span>
                  <span className="block text-xs text-claw-gray-600">{c.bonusLabel}</span>
                </span>
                {here ? (
                  <span className="text-xs font-extrabold text-human-green shrink-0">Equipped</span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => equip(agent.id, c.id)}
                    disabled={equipped.length >= MAX_EQUIPPED}
                    className="shrink-0 rounded-full bg-coral hover:bg-coral-dark text-white font-bold disabled:opacity-60"
                  >
                    {holder ? "Move here" : "Equip"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="xl:hidden">
        <EpochCard compact />
      </div>
    </div>
  );
};

export default AgentDetailPage;
