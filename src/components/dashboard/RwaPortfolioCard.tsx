import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Coins,
  ExternalLink,
  Info,
  PieChart,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { useRealtimeRwaBalances } from "@/features/api/useRealtimeRwaBalances";
import { Panel, PanelHeader, Stat, fmt } from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";

export default function RwaPortfolioCard() {
  const {
    monki,
    pons,
    electionMode,
    rwaHoldings,
    activeRwaCount,
    isLoading,
    isRefetching,
    lastUpdated,
    refetch,
  } = useRealtimeRwaBalances();

  return (
    <Panel raised className="overflow-hidden">
      <PanelHeader
        title="Real-Time RWA & Compute Portfolio"
        hint="Live on-chain & off-chain balances across Robinhood Chain (4663)"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hair/15 bg-hair/5 px-2.5 py-1 font-mono text-xs text-paper-2 hover:bg-hair/10 hover:text-paper transition-all disabled:opacity-50"
              title="Sync balances in real-time"
            >
              <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin text-alive-lit" : ""}`} />
              <span>{isRefetching ? "Syncing..." : "Sync RPC"}</span>
            </button>
            <Link
              to="/dashboard/staking"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-xs font-semibold text-alive-lit hover:underline"
            >
              Configure Basket <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      {/* Top 3 Metric Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-hair/10 border-b border-hair/10 bg-bench/30 p-5">
        <div className="space-y-1 pb-3 sm:pb-0 sm:pr-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-alive-lit" />
            <span className="font-mono text-xs uppercase tracking-wider text-paper-3">
              {BRAND.rewardToken} Live Accrual
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-paper tabular-nums">
            {fmt(monki.claimable, 2)}
          </div>
          <p className="text-[11px] font-mono text-paper-3">
            {fmt(monki.total, 2)} total earned ({fmt(monki.staked, 1)} staked)
          </p>
        </div>

        <div className="space-y-1 py-3 sm:py-0 sm:px-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-coral" />
            <span className="font-mono text-xs uppercase tracking-wider text-paper-3">
              {BRAND.valueToken} Yield Accrual
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-coral tabular-nums">
            {fmt(pons.claimable, 2)}
          </div>
          <p className="text-[11px] font-mono text-paper-3">
            {fmt(pons.claimed, 2)} already settled to wallet
          </p>
        </div>

        <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-alive-lit" />
            <span className="font-mono text-xs uppercase tracking-wider text-paper-3">
              Active RWA Allocation
            </span>
          </div>
          <div className="font-mono text-lg font-bold text-paper truncate">
            {electionMode === "stock_elected" ? (
              <span className="text-alive-lit">Stock-Elected Basket</span>
            ) : (
              <span className="text-paper-3">Plain {BRAND.valueToken} Only</span>
            )}
          </div>
          <p className="text-[11px] font-mono text-paper-3">
            {activeRwaCount > 0
              ? `${activeRwaCount} RWA token${activeRwaCount > 1 ? "s" : ""} selected for next epoch`
              : "No stock tokens elected yet"}
          </p>
        </div>
      </div>

      {/* RWA Token Holdings Grid */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-paper">
            Robinhood Chain Real-Time Stock Holdings
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-alive-lit font-bold bg-alive/10 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-alive-lit animate-pulse" />
            LIVE RHC 4663
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rwaHoldings.map((token) => {
            const hasElection = token.electedPercentage > 0;
            const hasOnchain = token.walletBalanceNum > 0;

            return (
              <div
                key={token.symbol}
                className={`rounded-xl border p-4 transition-all ${
                  hasElection || hasOnchain
                    ? "border-alive/30 bg-alive/[0.03] shadow-sm"
                    : "border-hair/10 bg-bench/50 hover:bg-bench"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-paper">
                        {token.symbol}
                      </span>
                      {hasElection && (
                        <span className="rounded bg-alive/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-alive-lit">
                          {token.electedPercentage}%
                        </span>
                      )}
                    </div>
                    <span className="block text-xs text-paper-3 truncate max-w-[180px]">
                      {token.name.replace(" Tokenized Stock", "")}
                    </span>
                  </div>

                  <a
                    href={token.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-paper-3 hover:text-paper p-1 rounded hover:bg-hair/10 transition-colors"
                    title="View contract on Blockscout"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="mt-3.5 pt-3 border-t border-hair/10 flex items-baseline justify-between">
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-paper-3">
                      Wallet Balance
                    </span>
                    <span className="font-mono text-sm font-bold text-paper tabular-nums">
                      {token.walletBalance}
                    </span>
                  </div>

                  {hasElection && (
                    <div className="text-right">
                      <span className="block text-[10px] font-mono uppercase text-alive-lit">
                        Pending Accrual
                      </span>
                      <span className="font-mono text-xs font-bold text-alive-lit tabular-nums">
                        +{token.projectedAccrual.toFixed(2)} {BRAND.valueToken}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-paper-3">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-paper-3 shrink-0" />
            <span>On-chain ERC-20 balances refresh automatically via RPC.</span>
          </div>
          {lastUpdated && (
            <span>Last checked: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </Panel>
  );
}
