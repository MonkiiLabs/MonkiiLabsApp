import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Users } from "lucide-react";
import PowerMeter from "./PowerMeter";
import { useMonkii } from "@/features/monkii/store";
import { POOL_STATS, type Agent } from "@/features/monkii/data";

const AgentCard = ({ agent }: { agent: Agent }) => {
  const { getPower, toggleNurture, activeAgentId, equippedFor, bonusFor, staked, heartbeats } = useMonkii();
  const power = getPower(agent.id);
  const isActive = activeAgentId === agent.id;
  const companions = equippedFor(agent.id);
  const bonus = bonusFor(agent.id);
  const locked = agent.premium && staked < POOL_STATS.minStake * 4;

  return (
    <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-4 sm:p-5 card-playful">
      <div className="flex items-start gap-3">
        <Link
          to={`/dashboard/agents/${agent.id}`}
          className="w-14 h-14 shrink-0 rounded-2xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        >
          {agent.emoji}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/dashboard/agents/${agent.id}`}
              className="text-base font-extrabold text-claw-charcoal hover:text-coral transition-colors"
            >
              {agent.name}
            </Link>
            <span className="text-xs font-bold text-claw-gray-600">{agent.handle}</span>
            {agent.premium && (
              <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-ai-purple-bg text-ai-purple">
                Premium
              </span>
            )}
          </div>
          <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">{agent.tagline}</p>
        </div>
      </div>

      <div className="mt-4">
        <PowerMeter power={power} />
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs font-bold text-claw-gray-600 flex-wrap">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {agent.nurturers.toLocaleString()} nurturers
        </span>
        <span>🫀 {(heartbeats[agent.id] ?? 0).toLocaleString()} your heartbeats</span>
        {bonus > 0 && <span className="text-human-green">+{bonus}% bonus</span>}
      </div>

      {companions.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          {companions.map((c) => (
            <span
              key={c.id}
              title={`${c.name} — ${c.bonusLabel}`}
              className="w-8 h-8 rounded-xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-sm"
            >
              {c.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        {locked ? (
          <Button
            disabled
            className="flex-1 rounded-full bg-cream-dark text-claw-gray-600 font-bold border-2 border-dashboard-border"
          >
            <Lock className="w-4 h-4 mr-1.5" /> Stake to unlock
          </Button>
        ) : (
          <Button
            onClick={() => toggleNurture(agent.id)}
            className={`flex-1 rounded-full font-bold transition-all duration-200 ${
              isActive
                ? "bg-human-green hover:bg-human-green/90 text-white"
                : "bg-coral hover:bg-coral-dark text-white shadow-coral"
            }`}
          >
            {isActive ? "🫀 Heartbeat running" : "🫀 Nurture"}
          </Button>
        )}
        <Button
          asChild
          variant="outline"
          className="rounded-full font-bold border-2 border-dashboard-border text-claw-charcoal hover:text-coral hover:border-coral bg-white"
        >
          <Link to={`/dashboard/agents/${agent.id}`}>Details</Link>
        </Button>
      </div>
    </Card>
  );
};

export default AgentCard;
