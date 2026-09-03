import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useMonkii } from "@/features/monkii/store";
import { AGENT_STATE_META, NURTURER_LEADERBOARD } from "@/features/monkii/data";
import PowerMeter from "@/components/dashboard/PowerMeter";
import { BRAND } from "@/lib/brand";

const LeaderboardPage = () => {
  const [tab, setTab] = useState<"nurturers" | "agents">("nurturers");
  const { agents, getPower, getState, totalHeartbeats } = useMonkii();

  const healthiest = [...agents].sort((a, b) => getPower(b.id) - getPower(a.id));

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-claw-charcoal">Leaderboard</h1>
        <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">
          Celebrating the most dedicated nurturers and the healthiest agents. Top placements also
          unlock free milestone Companion mints.
        </p>
        <div className="flex gap-2 mt-4">
          {(["nurturers", "agents"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 transition-colors ${
                tab === t
                  ? "bg-coral text-white border-coral"
                  : "bg-white text-claw-gray-600 border-dashboard-border hover:text-coral hover:border-coral"
              }`}
            >
              {t === "nurturers" ? "🐒 Top nurturers" : "📡 Healthiest agents"}
            </button>
          ))}
        </div>
      </Card>

      {tab === "nurturers" ? (
        <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-2 sm:p-4">
          <ul className="divide-y-2 divide-dashboard-border">
            {NURTURER_LEADERBOARD.map((row) => (
              <li key={row.rank} className="flex items-center gap-3 p-3">
                <span
                  className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                    row.rank <= 3 ? "bg-coral text-white" : "bg-cream text-claw-gray-600 border-2 border-dashboard-border"
                  }`}
                >
                  {row.rank}
                </span>
                <span className="w-10 h-10 shrink-0 rounded-xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-lg">
                  {row.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-claw-charcoal font-mono">{row.wallet}</span>
                  <span className="block text-xs text-claw-gray-600 font-medium">
                    {row.heartbeats.toLocaleString()} heartbeats · {row.streak}-day streak
                  </span>
                </span>
                <span className="shrink-0 text-sm font-extrabold text-human-green tabular-nums">
                  {row.agentsEarned.toLocaleString()}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3 p-3 bg-sky/10 rounded-2xl">
              <span className="w-8 h-8 shrink-0 rounded-xl bg-sky text-white flex items-center justify-center text-xs font-extrabold">
                —
              </span>
              <span className="w-10 h-10 shrink-0 rounded-xl bg-white border-2 border-dashboard-border flex items-center justify-center text-lg">
                🐒
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-claw-charcoal">You</span>
                <span className="block text-xs text-claw-gray-600 font-medium">
                  {totalHeartbeats.toLocaleString()} heartbeats · keep a session running to climb
                </span>
              </span>
              <Link to="/dashboard" className="shrink-0 text-xs font-extrabold text-sky-dark hover:text-coral">
                Nurture →
              </Link>
            </li>
          </ul>
        </Card>
      ) : (
        <div className="space-y-3">
          {healthiest.map((agent, i) => {
            const meta = AGENT_STATE_META[getState(agent.id)];
            return (
              <Card key={agent.id} className="border-2 border-dashboard-border bg-white rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 shrink-0 rounded-xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-xs font-extrabold text-claw-gray-600">
                    {i + 1}
                  </span>
                  <Link
                    to={`/dashboard/agents/${agent.id}`}
                    className="w-11 h-11 shrink-0 rounded-2xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-xl"
                  >
                    {agent.emoji}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/dashboard/agents/${agent.id}`}
                      className="text-sm font-extrabold text-claw-charcoal hover:text-coral"
                    >
                      {agent.name}
                    </Link>
                    <p className={`text-xs font-extrabold ${meta.text}`}>
                      {meta.label} · {agent.nurturers.toLocaleString()} nurturers
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <PowerMeter power={getPower(agent.id)} showLabel={false} />
                </div>
              </Card>
            );
          })}
          <p className="text-xs text-claw-gray-600 px-2">
            Healthiest agents earn their nurturers more {BRAND.rewardToken} per heartbeat over time.
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
