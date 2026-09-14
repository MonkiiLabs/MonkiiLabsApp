import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Coins,
  ExternalLink,
  PieChart,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRealtimeRwaBalances } from "@/features/api/useRealtimeRwaBalances";
import { fmt } from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";

export function RealtimeBalancesPopover() {
  const [open, setOpen] = useState(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="View real-time balances and RWAs"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border-2 border-human-green/30 bg-human-green-bg px-3.5 py-1.5 transition-all hover:border-human-green hover:shadow-sm"
        >
          {/* Live pulsing beacon */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-human-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-human-green" />
          </span>

          <span className="whitespace-nowrap text-xs font-extrabold tabular-nums text-human-green">
            {fmt(monki.claimable, 1)} {BRAND.rewardToken}
          </span>

          {activeRwaCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-human-green/15 px-2 py-0.5 text-[10px] font-bold text-human-green">
              <PieChart className="h-2.5 w-2.5" />
              {activeRwaCount} RWA{activeRwaCount > 1 ? "s" : ""}
            </span>
          )}

          <ChevronDown
            className={`h-3 w-3 text-human-green transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] rounded-2xl border-2 border-dashboard-border bg-white p-0 text-claw-charcoal shadow-xl"
      >
        {/* Popover Header */}
        <div className="flex items-center justify-between border-b border-hair/10 bg-cream/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-human-green animate-pulse" />
            <span className="font-mono text-xs font-bold text-paper uppercase tracking-wider">
              Real-Time Balances
            </span>
            <span className="rounded bg-hair/10 px-1.5 py-0.5 font-mono text-[9px] text-paper-3">
              RHC 4663
            </span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-paper-3 hover:text-paper transition-colors disabled:opacity-50"
            title="Refresh on-chain and off-chain balances"
          >
            <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
            <span>{isRefetching ? "Syncing..." : "Sync"}</span>
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-4 space-y-4 divide-y divide-hair/[0.08]">
          {/* Section 1: $MONKI Compute Receipts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-alive-lit" />
                <span className="font-mono text-xs font-bold text-paper">
                  {BRAND.rewardToken} Compute Receipts
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-alive-lit tabular-nums">
                {fmt(monki.total, 2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-hair/10 bg-bench p-2.5 text-xs font-mono">
              <div>
                <span className="block text-[10px] text-paper-3 uppercase">Accrued (Claimable)</span>
                <span className="font-bold text-paper tabular-nums">{fmt(monki.claimable, 2)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-paper-3 uppercase">Staked in Tier</span>
                <span className="font-bold text-paper tabular-nums">{fmt(monki.staked, 2)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: $PONS Staking Yield */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-coral" />
                <span className="font-mono text-xs font-bold text-paper">
                  {BRAND.valueToken} Yield
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-coral tabular-nums">
                {fmt(pons.claimable, 2)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-hair/10 bg-bench px-3 py-2 text-xs font-mono">
              <span className="text-paper-3">Settled to Wallet</span>
              <span className="font-semibold text-paper tabular-nums">{fmt(pons.claimed, 2)}</span>
            </div>
          </div>

          {/* Section 3: Robinhood RWAs (Tokenized Stocks) */}
          <div className="pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <PieChart className="h-3.5 w-3.5 text-alive-lit" />
                <span className="font-mono text-xs font-bold text-paper">
                  Robinhood Chain RWAs
                </span>
              </div>
              <span className="font-mono text-[10px] text-alive-lit font-bold bg-alive/10 rounded px-1.5 py-0.5">
                {electionMode === "stock_elected" ? "Elected Mode" : "Plain $PONS"}
              </span>
            </div>

            <div className="space-y-1.5">
              {rwaHoldings.map((token) => {
                const hasElection = token.electedPercentage > 0;
                const hasOnchain = token.walletBalanceNum > 0;

                return (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between rounded-xl border border-hair/10 bg-bench/70 px-3 py-2 text-xs font-mono transition-colors hover:bg-bench"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-paper">{token.symbol}</span>
                      {hasElection && (
                        <span className="rounded bg-alive/15 px-1 py-0.2 text-[9px] font-bold text-alive-lit">
                          {token.electedPercentage}%
                        </span>
                      )}
                      <a
                        href={token.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-paper-3 hover:text-paper"
                        title="View contract on Blockscout"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>

                    <div className="text-right tabular-nums">
                      <div className="font-bold text-paper">
                        {token.walletBalance} <span className="text-[10px] text-paper-3 font-normal">wallet</span>
                      </div>
                      {hasElection && token.projectedAccrual > 0 && (
                        <div className="text-[10px] text-alive-lit">
                          +{token.projectedAccrual.toFixed(2)} {BRAND.valueToken} share
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Popover Footer */}
        <div className="border-t border-hair/10 bg-cream/30 p-3 text-center">
          <Link
            to="/dashboard/staking"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-alive-lit hover:underline"
          >
            <span>Manage Stock Elections & Staking</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          {lastUpdated && (
            <div className="mt-1 text-[10px] font-mono text-paper-3">
              Synced {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
