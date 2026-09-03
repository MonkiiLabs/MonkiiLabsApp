import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AgentCard from "@/components/dashboard/AgentCard";
import { useMonkii } from "@/features/monkii/store";
import { stateForPower, type AgentState } from "@/features/monkii/data";

const FILTERS: { key: "all" | AgentState; label: string }[] = [
  { key: "all", label: "All agents" },
  { key: "fading", label: "🙊 Fading" },
  { key: "idle", label: "🙈 Idle" },
  { key: "thriving", label: "🐒 Thriving" },
];

const AgentsPage = () => {
  const { agents, getPower } = useMonkii();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | AgentState>("all");

  const visible = useMemo(
    () =>
      agents.filter((a) => {
        const matchesQuery =
          !query ||
          `${a.name} ${a.handle} ${a.category} ${a.tagline}`.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === "all" || stateForPower(getPower(a.id)) === filter;
        return matchesQuery && matchesFilter;
      }),
    [agents, query, filter, getPower],
  );

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-claw-charcoal">Agent marketplace</h1>
        <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">
          Every agent here is a real, live agent sourced from PONS Protocol. Power meters update
          continuously — the lowest ones need heartbeats the most.
        </p>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claw-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents by name, handle or category…"
            className="h-11 pl-9 bg-cream border-2 border-dashboard-border rounded-full text-sm focus:border-sky"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border-2 transition-colors ${
                filter === f.key
                  ? "bg-coral text-white border-coral"
                  : "bg-white text-claw-gray-600 border-dashboard-border hover:border-coral hover:text-coral"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {visible.length === 0 ? (
        <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🙈</div>
          <p className="text-sm font-bold text-claw-charcoal">No agents match that filter</p>
          <p className="text-xs text-claw-gray-600 mt-1">Try clearing the search or picking another state.</p>
        </Card>
      ) : (
        visible.map((agent) => <AgentCard key={agent.id} agent={agent} />)
      )}
    </div>
  );
};

export default AgentsPage;
