import { Link } from "react-router-dom";
import { ArrowUpRight, Coins, Heart, Sparkles, Zap } from "lucide-react";

import { useClaim, useClaimable, useDashboardSummary, useStakingStatus } from "@/features/api/hooks";
import AgentCard from "@/components/dashboard/AgentCard";
import {
  AuthGate,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  Panel,
  PanelHeader,
  PageTitle,
  Stat,
  fmt,
  timeAgo,
} from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";

const HomeInner = () => {
  const summary = useDashboardSummary();
  const { data: balances } = useClaimable();
  const { data: staking } = useStakingStatus();
  const claim = useClaim();

  if (summary.isLoading) return <LoadingPanel label="Loading laboratory telemetry" />;
  if (summary.isError) return <ErrorPanel error={summary.error} onRetry={summary.refetch} />;

  const data = summary.data;
  const agents = data?.nurturedAgents ?? [];
  const activity = data?.recentActivity ?? [];

  return (
    <div className="space-y-5">
      {/* 4 Telemetry Stats */}
      <Panel raised>
        <PanelHeader title="Compute Participation Telemetry" />
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <Stat value={fmt(data?.activeAgents)} label="Agents Nurtured" />
          <Stat value={fmt(data?.totalHeartbeats)} label="Total Heartbeats" />
          <Stat
            value={staking ? `×${staking.rewardMultiplier.toFixed(2)}` : "×1.00"}
            label="Mining Multiplier"
            tone="vital"
          />
          <Stat
            value={data?.powerRank ? `#${data.powerRank}` : "-"}
            label="Fleet Rank"
            tone="coral"
          />
        </div>
      </Panel>

      {/* Claimable Balances & Financial Settlement */}
      <Panel>
        <PanelHeader
          title="Claimable Rewards & Yield"
          hint="Disbursed on Robinhood Chain via gasless cryptographic authorization."
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="rounded-xl border border-hair/10 bg-hair/[0.05] p-4">
            <Stat
              value={fmt(balances?.claimableMonki, 1)}
              label={`${BRAND.rewardToken} Compute Accrual`}
            />
            <button
              type="button"
              disabled={claim.isPending || !balances?.claimableMonki}
              onClick={() => claim.mutate("monki")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-hair/10 bg-hair/10 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-paper transition-all hover:bg-hair/20 active:scale-[0.98] disabled:opacity-40"
            >
              <Zap className="h-3.5 w-3.5 text-alive-lit" />
              Settle {BRAND.rewardToken}
            </button>
          </div>

          <div className="rounded-xl border border-hair/10 bg-hair/[0.05] p-4">
            <Stat
              value={fmt(balances?.claimablePons, 2)}
              label={`${BRAND.valueToken} Yield Payout`}
              tone="coral"
            />
            <button
              type="button"
              disabled={claim.isPending || !balances?.claimablePons}
              onClick={() => claim.mutate("pons")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-act py-2.5 font-mono text-micro font-semibold uppercase text-paper transition-colors hover:bg-act-lit active:scale-[0.97] disabled:opacity-40"
            >
              <Coins className="h-3.5 w-3.5" />
              Claim {BRAND.valueToken} on L2
            </button>
          </div>
        </div>

        {(balances?.claimableMetaStock ?? 0) > 0 && (
          <div className="border-t border-hair/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Stat
                value={fmt(balances?.claimableMetaStock, 4)}
                label={`${BRAND.stockToken} Stock Token Yield (Phase 2)`}
              />
              <button
                type="button"
                disabled={claim.isPending}
                onClick={() => claim.mutate("meta")}
                className="rounded-xl border border-alive/30 bg-alive/15 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-alive-lit transition-all hover:bg-alive/25 active:scale-[0.98] disabled:opacity-40"
              >
                Claim {BRAND.stockToken}
              </button>
            </div>
          </div>
        )}
      </Panel>

      {/* Agents you nurture */}
      <Panel>
        <PanelHeader
          title="Agents Under Your Care"
          action={
            <Link
              to="/dashboard/agents"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-alive-lit hover:text-alive-lit"
            >
              Browse Fleet <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="p-5">
          {agents.length === 0 ? (
            <EmptyPanel
              title="No active agent heartbeats"
              body="Select an agent from the fleet and start a Proof-of-Life session. Keep agents alive and earn $MONKI receipts."
              action={
                <Link
                  to="/dashboard/agents"
                  className="inline-flex items-center gap-2 rounded-xl bg-act px-4 py-2 text-micro font-semibold uppercase text-paper transition-colors hover:bg-act-lit"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Explore Fleet
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {agents.slice(0, 4).map((agent) => (
                <AgentCard key={agent.id} agent={agent} compact />
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Recent Activity Log */}
      {activity.length > 0 && (
        <Panel>
          <PanelHeader title="Recent Proof-of-Life Telemetry Activity" />
          <ul className="divide-y divide-hair/[0.05] px-5">
            {activity.slice(0, 8).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 py-3 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-medium text-paper">
                    {entry.message ?? entry.type}
                  </p>
                  <p className="text-paper-3">
                    {entry.agentName ? `${entry.agentName} · ` : ""}
                    {timeAgo(entry.createdAt)}
                  </p>
                </div>
                {entry.amount != null && (
                  <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-alive-lit">
                    +{fmt(entry.amount, 2)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
};

const HomePage = () => (
  <>
    <PageTitle
      index="00"
      eyebrow="Cockpit"
      title="Monkii Laboratory Dashboard"
      intro="Your distributed compute telemetry: monitored AI agents, Proof-of-Life sessions, and claimable ecosystem yield."
    />
    <AuthGate what="your agents and reward balances">
      <HomeInner />
    </AuthGate>
  </>
);

export default HomePage;
