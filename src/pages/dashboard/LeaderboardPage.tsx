import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Award, Flame, Heart, Medal, Trophy } from "lucide-react";

import { useTopAgents, useTopNurturers } from "@/features/api/hooks";
import { useWallet } from "@/hooks/useWallet";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  Panel,
  PanelHeader,
  PageTitle,
  StateChip,
  fmt,
} from "@/components/dashboard/primitives";
import { BRAND, monkiiMark } from "@/lib/brand";

type Tab = "nurturers" | "agents";

function rankBadge(rank: number) {
  if (rank === 1) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-xl border border-idle/50 bg-idle/20 font-mono text-xs font-bold text-idle shadow-[0_0_12px_rgba(251,191,36,0.3)]">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-xl border border-paper-2/40 bg-paper-3/20 font-mono text-xs font-bold text-paper">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-xl border border-brass/40 bg-brass/15 font-mono text-micro font-semibold tabular-nums text-brass">
        3
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 place-items-center rounded-xl border border-hair/10 bg-hair/[0.05] font-mono text-xs font-medium text-paper-3">
      {rank}
    </span>
  );
}

const LeaderboardPage = () => {
  const [tab, setTab] = useState<Tab>("nurturers");
  const nurturers = useTopNurturers();
  const agentsQuery = useTopAgents();
  const { address, formatAddress } = useWallet();

  const active = tab === "nurturers" ? nurturers : agentsQuery;

  return (
    <>
      <PageTitle
        title="Leaderboard & High-Power Telemetry"
        intro="Recognizing the top distributed compute nodes sustaining the autonomous agent ecosystem on Robinhood Chain."
      />

      <div className="mb-6 flex gap-2">
        {[
          { value: "nurturers" as const, label: "Top Compute Nurturers", icon: Trophy },
          { value: "agents" as const, label: "Top Agents by Power", icon: Flame },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                tab === t.value
                  ? "border border-alive/40 bg-alive/15 text-alive-lit"
                  : "border border-hair/10 bg-hair/[0.05] text-paper-3 hover:text-paper"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {active.isLoading && <LoadingPanel label="Querying fleet rankings" />}
      {active.isError && <ErrorPanel error={active.error} onRetry={active.refetch} />}

      {tab === "nurturers" && nurturers.data && (
        <Panel raised>
          <PanelHeader title={`Lifetime $${BRAND.rewardToken} Compute Receipts`} />
          {nurturers.data.length === 0 ? (
            <div className="p-5">
              <EmptyPanel
                title="No nurturer entries recorded"
                body="Submit your first Proof-of-Life heartbeat to take the #1 podium position."
              />
            </div>
          ) : (
            <ol className="divide-y divide-hair/[0.05] px-5">
              {nurturers.data.map((row) => {
                const isYou = address && row.walletAddress.toLowerCase() === address.toLowerCase();
                return (
                  <li
                    key={row.walletAddress}
                    className={`flex items-center gap-4 py-3.5 ${
                      isYou ? "-mx-3 rounded-xl bg-alive/10 px-3 border border-alive/20" : ""
                    }`}
                  >
                    {rankBadge(row.rank)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-xs font-semibold text-paper">
                          {row.displayName || formatAddress(row.walletAddress)}
                        </span>
                        {isYou && (
                          <span className="rounded bg-alive/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-alive-lit">
                            YOU
                          </span>
                        )}
                      </div>
                      {row.agentsNurtured != null && (
                        <p className="text-xs text-paper-3">
                          {fmt(row.agentsNurtured)} agents maintained
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold tabular-nums text-alive-lit">
                        {fmt(row.totalMonkiEarned, 1)}
                      </span>
                      <span className="block font-mono text-[10px] uppercase text-paper-4">
                        {BRAND.rewardToken}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      )}

      {tab === "agents" && agentsQuery.data && (
        <Panel raised>
          <PanelHeader title="Live Fleet Power Ranking" />
          {agentsQuery.data.length === 0 ? (
            <div className="p-5">
              <EmptyPanel
                title="No agents ranked"
                body="Power rankings compute once agent heartbeat sessions are active."
              />
            </div>
          ) : (
            <ol className="divide-y divide-hair/[0.05] px-5">
              {agentsQuery.data.map((row) => (
                <li key={row.id} className="py-3">
                  <Link
                    to={`/dashboard/agents/${row.id}`}
                    className="flex items-center gap-4 group transition-colors hover:bg-hair/[0.02] rounded-xl -mx-2 px-2"
                  >
                    {rankBadge(row.rank)}
                    <img
                      src={row.avatarUrl ?? monkiiMark}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-xl border border-hair/15 bg-hair/[0.05] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-paper group-hover:text-alive-lit">
                          {row.name}
                        </span>
                        <StateChip state={row.state} />
                      </div>
                      <p className="text-xs text-paper-3">
                        {fmt(row.nurturerCount)} active nurturers
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold tabular-nums text-paper">
                        {Math.round(row.power)}
                      </span>
                      <span className="block font-mono text-[10px] uppercase text-paper-4">
                        power
                      </span>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-paper-4 group-hover:text-alive-lit transition-colors" />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      )}
    </>
  );
};

export default LeaderboardPage;
