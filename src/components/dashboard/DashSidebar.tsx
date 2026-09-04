import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";

import { useWallet } from "@/hooks/useWallet";
import { useAgents, useClaimable, useDashboardSummary, useStakingStatus } from "@/features/api/hooks";
import { Panel, PanelHeader, StateChip, fmt } from "@/components/dashboard/primitives";
import { BRAND, monkiiMark } from "@/lib/brand";
import { useWatchlist } from "@/hooks/useWatchlist";

const DashSidebar = () => {
  const { address, formatAddress, isAuthenticated } = useWallet();
  const { data: balances } = useClaimable();
  const { data: staking } = useStakingStatus();
  const { data: summary } = useDashboardSummary();
  const { data: fleet = [] } = useAgents();
  const { watchlist } = useWatchlist();

  // Watchlist agents (either from user's watchlist or fallback to active nurtured)
  const starredAgents = fleet.filter((a) => watchlist.includes(a.id)).slice(0, 4);
  const displayList = starredAgents.length > 0 ? starredAgents : (summary?.nurturedAgents ?? []).slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Account Profile Card */}
      <Panel raised className="overflow-hidden">
        <div className="h-12 border-b border-hair/8 bg-gradient-to-r from-hair/[0.06] to-transparent" />
        <div className="-mt-6 px-4 pb-4">
          <div className="relative inline-block">
            <img
              src={monkiiMark}
              alt=""
              className="h-12 w-12 rounded-md border border-hair/14 bg-bench object-cover"
            />
            {isAuthenticated && (
              <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-act text-[10px] text-paper ring-2 ring-bench">
                ✓
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-xs font-semibold text-paper">
              {address ? formatAddress(address) : "Wallet Not Connected"}
            </p>
            {isAuthenticated && (
              <span className="font-mono text-[10px] uppercase text-alive-lit">
                Rank #{summary?.powerRank ?? "-"}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-paper-3">
            {isAuthenticated && summary
              ? `${fmt(summary.totalHeartbeats)} heartbeats · ${fmt(summary.activeAgents)} active`
              : "Connect wallet to sync proof-of-life"}
          </p>
          <Link
            to="/dashboard/profile"
            className="mt-fib2 inline-flex items-center gap-1 text-label font-semibold text-paper-2 underline-offset-4 hover:text-paper hover:underline"
          >
            Telemetry profile <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </Panel>

      {/* Balances & Yield Telemetry */}
      <Panel>
        <PanelHeader title="Balances & Yield" />
        <dl className="divide-y divide-hair/[0.05] px-4">
          {[
            {
              k: `${BRAND.rewardToken} earned`,
              v: fmt(balances?.claimableMonki, 1),
              tone: "text-alive-lit",
            },
            {
              k: "Staked",
              v: fmt(balances?.stakedMonki),
              tone: "text-paper",
            },
            {
              k: `${BRAND.valueToken} yield`,
              v: fmt(balances?.claimablePons, 2),
              tone: "text-act-lit",
            },
            {
              k: "Multiplier",
              v: staking ? `×${staking.rewardMultiplier.toFixed(2)}` : "×1.00",
              tone: "text-alive-lit",
            },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between py-2.5">
              <dt className="text-xs text-paper-3">{row.k}</dt>
              <dd className={`font-mono text-xs font-semibold tabular-nums ${row.tone}`}>
                {row.v}
              </dd>
            </div>
          ))}
        </dl>
        <div className="p-4 pt-2">
          <Link
            to="/dashboard/staking"
            className="act-quiet flex w-full items-center justify-center gap-2 py-2 font-mono text-micro font-semibold uppercase text-paper-2"
          >
            <Zap className="h-3.5 w-3.5" />
            Manage Stake
          </Link>
          {staking && staking.stakedMonki < staking.policy.PREMIUM_THRESHOLD && (
            <p className="mt-2 text-center text-[11px] text-paper-3">
              Stake {fmt(staking.policy.PREMIUM_THRESHOLD)} {BRAND.rewardToken} to unlock maximum boost
            </p>
          )}
        </div>
      </Panel>

      {/* Watchlist / Monitored Agents */}
      {displayList.length > 0 && (
        <Panel>
          <PanelHeader
            title={starredAgents.length > 0 ? "Watchlist ⭐" : "Monitored Agents"}
            action={
              <Link
                to="/dashboard/agents"
                className="text-micro font-semibold text-paper-2 underline-offset-4 hover:text-paper hover:underline"
              >
                Fleet →
              </Link>
            }
          />
          <ul className="p-2 divide-y divide-hair/[0.05]">
            {displayList.map((agent) => (
              <li key={agent.id}>
                <Link
                  to={`/dashboard/agents/${agent.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-hair/[0.05]"
                >
                  <img
                    src={agent.avatarUrl ?? monkiiMark}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-lg border border-hair/10 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-paper">
                      {agent.name}
                    </span>
                    <span className="mt-0.5 block">
                      <StateChip state={agent.state} />
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-medium text-paper-3">
                    {Math.round(agent.power)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
};

export default DashSidebar;
