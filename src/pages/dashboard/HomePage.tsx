import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/dashboard/AgentCard";
import PowerMeter from "@/components/dashboard/PowerMeter";
import { useMonkii } from "@/features/monkii/store";
import { AGENT_STATE_META } from "@/features/monkii/data";
import { BRAND } from "@/lib/brand";

const HomePage = () => {
  const {
    agents,
    activeAgentId,
    getAgent,
    getPower,
    getState,
    toggleNurture,
    agentsBalance,
    totalHeartbeats,
    streakDays,
    earnMultiplier,
    heartbeats,
  } = useMonkii();

  const active = activeAgentId ? getAgent(activeAgentId) : undefined;
  const fading = agents
    .filter((a) => getState(a.id) !== "thriving")
    .sort((a, b) => getPower(a.id) - getPower(b.id));

  return (
    <div className="space-y-3">
      {/* Heartbeat console */}
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5 card-playful">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-claw-charcoal">
              Proof-of-Life console
            </h1>
            <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">
              One heartbeat session runs at a time. It solves a keccak256 challenge in your browser
              and converts that work into agent power and {BRAND.rewardToken}.
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-extrabold px-3 py-1.5 rounded-full ${
              active ? "bg-human-green-bg text-human-green" : "bg-cream-dark text-claw-gray-600"
            }`}
          >
            {active ? "Running" : "Idle"}
          </span>
        </div>

        {active ? (
          <div className="mt-4 rounded-2xl border-2 border-human-green/30 bg-human-green-bg/40 p-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-white border-2 border-dashboard-border flex items-center justify-center text-xl animate-bounce-gentle">
                {active.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-claw-charcoal">
                  Nurturing {active.name}
                </p>
                <p className="text-xs text-claw-gray-600 font-medium">
                  {(heartbeats[active.id] ?? 0).toLocaleString()} heartbeats this session ·{" "}
                  {AGENT_STATE_META[getState(active.id)].label}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <PowerMeter power={getPower(active.id)} size="lg" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => toggleNurture(active.id)}
                variant="outline"
                className="rounded-full font-bold border-2 border-dashboard-border bg-white text-claw-charcoal hover:text-coral hover:border-coral"
              >
                Stop session
              </Button>
              <Button asChild className="rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral">
                <Link to={`/dashboard/agents/${active.id}`}>Open agent</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-dashboard-border bg-cream p-5 text-center">
            <div className="text-4xl mb-2">🫀</div>
            <p className="text-sm font-bold text-claw-charcoal">No heartbeat running</p>
            <p className="text-xs text-claw-gray-600 mt-1 mb-4 max-w-sm mx-auto leading-relaxed">
              Pick the agent closest to fading and start a session. Power climbs within seconds.
            </p>
            {fading[0] && (
              <Button
                onClick={() => toggleNurture(fading[0].id)}
                className="rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral"
              >
                🫀 Nurture {fading[0].name} ({Math.round(getPower(fading[0].id))}%)
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t-2 border-dashboard-border">
          {[
            { label: `${BRAND.rewardToken} balance`, value: Math.floor(agentsBalance).toLocaleString() },
            { label: "Heartbeats", value: totalHeartbeats.toLocaleString() },
            { label: "Streak", value: `${streakDays}d` },
            { label: "Multiplier", value: `×${earnMultiplier.toFixed(2)}` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-cream border-2 border-dashboard-border p-3">
              <p className="text-[11px] font-bold text-claw-gray-600 uppercase tracking-wide">{stat.label}</p>
              <p className="text-base font-extrabold text-claw-charcoal tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-2 py-2">
        <div className="flex-1 h-px bg-dashboard-border" />
        <span className="text-xs font-extrabold text-claw-gray-600 bg-white px-3 py-1.5 rounded-full border-2 border-dashboard-border">
          Needs power first
        </span>
        <div className="flex-1 h-px bg-dashboard-border" />
      </div>

      {fading.length === 0 ? (
        <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-8 text-center card-playful">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-human-green-bg flex items-center justify-center text-4xl">
            🐒
          </div>
          <h2 className="text-lg font-extrabold text-claw-charcoal">Every agent is thriving</h2>
          <p className="text-sm text-claw-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Nothing needs rescuing right now. Keep a session running to bank {BRAND.rewardToken}, or
            browse the full marketplace.
          </p>
          <Button asChild className="mt-5 rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral">
            <Link to="/dashboard/agents">Browse all agents</Link>
          </Button>
        </Card>
      ) : (
        fading.map((agent) => <AgentCard key={agent.id} agent={agent} />)
      )}
    </div>
  );
};

export default HomePage;
