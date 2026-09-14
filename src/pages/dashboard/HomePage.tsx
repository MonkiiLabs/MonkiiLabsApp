import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Coins, Heart, Lock, Sparkles, Zap } from "lucide-react";

import { useClaim, useClaimable, useDashboardSummary, useNetwork, useStakingStatus } from "@/features/api/hooks";
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
import RwaPortfolioCard from "@/components/dashboard/RwaPortfolioCard";

const HomeInner = () => {
  const { t } = useTranslation();
  const summary = useDashboardSummary();
  const { data: balances } = useClaimable();
  const { data: staking } = useStakingStatus();
  const { data: networkConfig } = useNetwork();
  const claim = useClaim();
  const protocolSettings = networkConfig?.protocolSettings;

  if (summary.isLoading) return <LoadingPanel label={t("home.loading")} />;
  if (summary.isError) return <ErrorPanel error={summary.error} onRetry={summary.refetch} />;

  const data = summary.data;
  const agents = data?.nurturedAgents ?? [];
  const activity = data?.recentActivity ?? [];

  return (
    <div className="space-y-5">
      {/* 4 Telemetry Stats */}
      <Panel raised>
        <PanelHeader title={t("home.telemetryTitle")} />
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <Stat value={fmt(data?.activeAgents)} label={t("home.agentsNurtured")} />
          <Stat value={fmt(data?.totalHeartbeats)} label={t("home.totalHeartbeats")} />
          <Stat
            value={staking ? `×${staking.rewardMultiplier.toFixed(2)}` : "×1.00"}
            label={t("home.miningMultiplier")}
            tone="vital"
          />
          <Stat
            value={data?.powerRank ? `#${data.powerRank}` : "-"}
            label={t("home.fleetRank")}
            tone="coral"
          />
        </div>
      </Panel>

      {/* Real-Time RWA & $MONKI Portfolio */}
      <RwaPortfolioCard />

      {/* Claimable Balances & Financial Settlement */}
      <Panel>
        <PanelHeader
          title={t("home.claimableTitle")}
          hint={t("home.claimableHint")}
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="rounded-xl border border-hair/10 bg-hair/[0.05] p-4">
            <Stat
              value={fmt(balances?.claimableMonki, 1)}
              label={t("home.computeAccrual")}
            />
            {protocolSettings?.enableMonkiClaiming ? (
              <button
                type="button"
                disabled={claim.isPending || !balances?.claimableMonki}
                onClick={() => claim.mutate("monki")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-hair/10 bg-hair/10 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-paper transition-all hover:bg-hair/20 active:scale-[0.98] disabled:opacity-40"
              >
                <Zap className="h-3.5 w-3.5 text-alive-lit" />
                {t("home.settle")}
              </button>
            ) : (
              <div className="mt-4">
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-hair/10 bg-hair/5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-paper-3 cursor-not-allowed opacity-75"
                >
                  <Lock className="h-3.5 w-3.5 text-paper-3" />
                  {t("home.preTge")}
                </button>
                <p className="mt-1.5 text-center font-mono text-[10px] text-paper-3">
                  {t("home.preTgeNote")}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-hair/10 bg-hair/[0.05] p-4">
            <Stat
              value={fmt(balances?.claimablePons, 2)}
              label={t("home.yieldPayout")}
              tone="coral"
            />
            <button
              type="button"
              disabled={
                claim.isPending ||
                !balances?.claimablePons ||
                protocolSettings?.enablePonsClaiming === false
              }
              onClick={() => claim.mutate("pons")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-act py-2.5 font-mono text-micro font-semibold uppercase text-white transition-colors hover:bg-act-lit active:scale-[0.97] disabled:opacity-40"
            >
              <Coins className="h-3.5 w-3.5" />
              {protocolSettings?.enablePonsClaiming === false
                ? t("home.payoutsPaused")
                : t("home.claimOnL2")}
            </button>
          </div>
        </div>

        {(balances?.claimableMetaStock ?? 0) > 0 && (
          <div className="border-t border-hair/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Stat
                value={fmt(balances?.claimableMetaStock, 4)}
                label={t("home.stockYield", { stockToken: BRAND.stockToken })}
              />
              <button
                type="button"
                disabled={claim.isPending}
                onClick={() => claim.mutate("meta")}
                className="rounded-xl border border-alive/30 bg-alive/15 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-alive-lit transition-all hover:bg-alive/25 active:scale-[0.98] disabled:opacity-40"
              >
                {t("home.claimStock", { stockToken: BRAND.stockToken })}
              </button>
            </div>
          </div>
        )}
      </Panel>

      {/* Agents you nurture */}
      <Panel>
        <PanelHeader
          title={t("home.underCare")}
          action={
            <Link
              to="/dashboard/agents"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-alive-lit hover:text-alive-lit"
            >
              {t("home.browseFleet")} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="p-5">
          {agents.length === 0 ? (
            <EmptyPanel
              title={t("home.noAgentsTitle")}
              body={t("home.noAgentsBody")}
              action={
                <Link
                  to="/dashboard/agents"
                  className="inline-flex items-center gap-2 rounded-xl bg-act px-4 py-2 text-micro font-semibold uppercase text-white transition-colors hover:bg-act-lit"
                >
                  <Heart className="h-3.5 w-3.5" />
                  {t("home.exploreFleet")}
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
          <PanelHeader title={t("home.recentActivity")} />
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

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("home.title")} intro={t("home.intro")} />
      <AuthGate what={t("home.authWhat")}>
        <HomeInner />
      </AuthGate>
    </>
  );
};

export default HomePage;
