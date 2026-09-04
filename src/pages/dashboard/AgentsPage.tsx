import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Star } from "lucide-react";

import { useAgents } from "@/features/api/hooks";
import type { AgentState } from "@/features/api/types";
import AgentCard from "@/components/dashboard/AgentCard";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  PageTitle,
} from "@/components/dashboard/primitives";
import { useWatchlist } from "@/hooks/useWatchlist";

type FilterTab = AgentState | "all" | "watchlist";
type SortOption = "power_desc" | "power_asc" | "nurturers" | "name";

const TABS: Array<{ value: FilterTab; label: string; icon?: typeof Star }> = [
  { value: "all", label: "All Fleet" },
  { value: "watchlist", label: "Watchlist", icon: Star },
  { value: "thriving", label: "Thriving" },
  { value: "idle", label: "Idle" },
  { value: "fading", label: "Fading" },
];

const AgentsPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("power_desc");

  const { watchlist } = useWatchlist();

  // If filtering by a specific backend state
  const backendState =
    activeTab === "all" || activeTab === "watchlist" ? undefined : activeTab;

  const { data, isLoading, isError, error, refetch } = useAgents(
    backendState ? { state: backendState } : {},
  );

  const categories = useMemo(() => {
    const set = new Set((data ?? []).map((a) => a.category).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [data]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (data ?? []).filter((a) => {
      // Watchlist filter
      if (activeTab === "watchlist" && !watchlist.includes(a.id)) return false;
      // Category filter
      if (category !== "all" && a.category !== category) return false;
      // Search query
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        (a.xHandle ?? "").toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q)
      );
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "power_desc") return b.power - a.power;
      if (sortBy === "power_asc") return a.power - b.power;
      if (sortBy === "nurturers") return b.nurturerCount - a.nurturerCount;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [data, activeTab, watchlist, category, query, sortBy]);

  return (
    <>
      <PageTitle
        index="01"
        eyebrow="Fleet Telemetry"
        title="Autonomous Agent Fleet"
        intro="Live agents synced from Virtuals Protocol on Robinhood Chain. Contribute Proof-of-Life compute to keep fading agents alive."
      />

      {/* Controls: Search, Tabs, Sorting, Categories */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-4" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents by name, handle, or thesis…"
              className="h-10 w-full rounded-xl border border-hair/10 bg-bench-2 pl-10 pr-4 text-xs text-paper placeholder:text-paper-4 focus:border-alive/50 focus:outline-none focus:ring-1 focus:ring-alive/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-hair/10 bg-bench-2 px-3 py-2 text-xs text-paper-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-paper-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs text-paper focus:outline-none"
              >
                <option value="power_desc" className="bg-bench-2">Highest Power</option>
                <option value="power_asc" className="bg-bench-2">Needs Help (Lowest Power)</option>
                <option value="nurturers" className="bg-bench-2">Most Nurturers</option>
                <option value="name" className="bg-bench-2">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Tabs (including Watchlist ⭐) */}
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                  isSelected
                    ? "border border-alive/40 bg-alive/15 text-alive-lit"
                    : "border border-hair/10 bg-hair/[0.05] text-paper-3 hover:border-hair/20 hover:text-paper"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isSelected ? "fill-idle text-idle" : "text-paper-3"
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                {tab.value === "watchlist" && watchlist.length > 0 && (
                  <span className="ml-1 rounded-full bg-idle/20 px-1.5 py-0.2 text-[10px] text-idle">
                    {watchlist.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  category === c
                    ? "bg-hair/15 text-paper"
                    : "text-paper-3 hover:bg-hair/[0.05] hover:text-paper"
                }`}
              >
                {c === "all" ? "All categories" : c}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && <LoadingPanel label="Connecting to Virtuals Protocol stream" />}
      {isError && <ErrorPanel error={error} onRetry={refetch} />}

      {!isLoading && !isError && visible.length === 0 && (
        <EmptyPanel
          title={activeTab === "watchlist" ? "No starred agents in watchlist" : "No matching agents found"}
          body={
            activeTab === "watchlist"
              ? "Click the star icon on any agent card to pin it to your quick-access watchlist."
              : "Try adjusting your search query or vitality filter."
          }
        />
      )}

      {visible.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between text-xs text-paper-3">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Displaying {visible.length} Agent{visible.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default AgentsPage;
