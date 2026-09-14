import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Coins,
  ExternalLink,
  Info,
  Loader2,
  PieChart,
  ShieldAlert,
  Sliders,
  Sparkles,
} from "lucide-react";

import {
  useEligibleStockTokens,
  useRwaElection,
  useSaveRwaElection,
} from "@/features/api/hooks";
import type { UserRwaAllocation } from "@/features/api/types";
import { explorerAddressUrl } from "@/lib/config";
import { BRAND } from "@/lib/brand";

export default function StockElectionWidget() {
  const { t } = useTranslation();
  const { data: tokensData, isLoading: tokensLoading } = useEligibleStockTokens();
  const { data: electionData, isLoading: electionLoading } = useRwaElection();
  const saveMutation = useSaveRwaElection();

  // Memoised so the restore effect below, which depends on it, does not
  // re-run on every render against a fresh array identity.
  const eligibleTokens = useMemo(() => tokensData?.tokens ?? [], [tokensData]);
  // Electable right now. A pending price source does not disqualify a token:
  // Sprint F accrues and does not settle, so pricing is a payout concern.
  const availableTokens = useMemo(
    () => eligibleTokens.filter((t) => t.isLiquid && !t.isSuspended),
    [eligibleTokens],
  );
  const isFeatureFlagActive = tokensData?.isElectionsActive ?? false;

  const [mode, setMode] = useState<"stock_elected" | "plain_pons">("plain_pons");
  const [allocations, setAllocations] = useState<UserRwaAllocation[]>([]);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  // Sync state with server election data when loaded
  useEffect(() => {
    if (electionData) {
      setMode(electionData.mode);
      if (electionData.allocations && electionData.allocations.length > 0) {
        // A ticker can be withdrawn from the registry after someone has
        // already elected it. Carrying it back into the form would leave a
        // basket that looks fine and is refused on save, so drop it and
        // spread its weight across what is left.
        const available = new Set(
          eligibleTokens.filter((t) => t.isLiquid && !t.isSuspended).map((t) => t.symbol),
        );
        const kept =
          available.size > 0
            ? electionData.allocations.filter((a) => available.has(a.symbol))
            : electionData.allocations;

        if (kept.length > 0 && kept.length < electionData.allocations.length) {
          const even = Math.floor(100 / kept.length);
          const rem = 100 - even * kept.length;
          setAllocations(
            kept.map((a, idx) => ({ ...a, percentage: even + (idx === 0 ? rem : 0) })),
          );
        } else {
          setAllocations(kept);
        }
        setAcceptedDisclaimer(true);
      } else {
        // No saved election yet. Open on an even split of whatever is
        // listed, so the form starts valid instead of on a fixed pair that
        // may not be in the registry any more.
        const targets = availableTokens.slice(0, 4).map((t) => t.symbol);
        if (targets.length > 0) {
          const even = Math.floor(100 / targets.length);
          const rem = 100 - even * targets.length;
          setAllocations(
            targets.map((s, idx) => ({ symbol: s, percentage: even + (idx === 0 ? rem : 0) })),
          );
        }
      }
    }
    // eligibleTokens participates because a restored basket can only be
    // filtered once the registry it is filtered against has arrived.
  }, [electionData, eligibleTokens, availableTokens]);

  const totalPercentage = allocations.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  const isValidSum = totalPercentage === 100;
  const canSave =
    mode === "plain_pons" ||
    (isValidSum && acceptedDisclaimer && allocations.length > 0 && !saveMutation.isPending);

  const handleUpdatePercentage = (symbol: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, Math.floor(val)));
    setAllocations((prev) =>
      prev.map((item) => (item.symbol === symbol ? { ...item, percentage: clamped } : item)),
    );
  };

  const handleToggleToken = (symbol: string) => {
    setAllocations((prev) => {
      const exists = prev.some((i) => i.symbol === symbol);
      if (exists) {
        if (prev.length === 1) return prev; // Keep at least one
        const remaining = prev.filter((i) => i.symbol !== symbol);
        // redistribute equally
        const even = Math.floor(100 / remaining.length);
        const rem = 100 - even * remaining.length;
        return remaining.map((item, idx) => ({
          ...item,
          percentage: even + (idx === 0 ? rem : 0),
        }));
      } else {
        if (prev.length >= 5) return prev; // max 5
        const next = [...prev, { symbol, percentage: 0 }];
        const even = Math.floor(100 / next.length);
        const rem = 100 - even * next.length;
        return next.map((item, idx) => ({
          ...item,
          percentage: even + (idx === 0 ? rem : 0),
        }));
      }
    });
  };

  type Preset = { kind: "single"; symbol: string } | { kind: "equal" };

  const handleApplyPreset = (preset: Preset) => {
    if (preset.kind === "single") {
      setAllocations([{ symbol: preset.symbol, percentage: 100 }]);
      return;
    }

    // Equal across whatever is currently selected, or across the whole
    // available registry when nothing is.
    const activeSymbols = allocations.map((a) => a.symbol);
    const targets =
      activeSymbols.length > 0 ? activeSymbols : availableTokens.slice(0, 5).map((t) => t.symbol);
    if (targets.length === 0) return;

    const even = Math.floor(100 / targets.length);
    const rem = 100 - even * targets.length;
    setAllocations(targets.map((s, idx) => ({ symbol: s, percentage: even + (idx === 0 ? rem : 0) })));
  };

  const handleSave = () => {
    saveMutation.mutate({
      mode,
      allocations: mode === "stock_elected" ? allocations : [],
      acceptedDisclaimer,
    });
  };

  const pipelineStates = [
    { key: "accrued", label: "Accrued", active: true },
    { key: "eligible", label: "Eligible", active: false },
    { key: "claim_authorized", label: "Claim Authorized", active: false },
    { key: "broadcast", label: "Broadcast", active: false },
    { key: "confirmed", label: "Confirmed", active: false },
  ];

  if (tokensLoading || electionLoading) {
    return (
      <div className="rounded-2xl border border-hair/10 bg-bench/50 p-6 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-alive-lit" />
        <p className="mt-2 font-mono text-xs text-paper-3">Loading RWA Stock Registry...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-hair/15 bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-hair/10 bg-hair/[0.03] p-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-alive/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-alive-lit">
              <Sparkles className="h-3 w-3" />
              Sprint F · Accrual Only
            </span>
            <span className="rounded-md border border-hair/15 bg-hair/5 px-2 py-0.5 font-mono text-[10px] text-paper-3">
              Robinhood Chain (4663)
            </span>
          </div>
          <h3 className="mt-2 font-serif text-lg font-bold text-paper">
            Stock-Elected Payouts (RWA)
          </h3>
          <p className="mt-1 font-sans text-xs text-paper-3 max-w-2xl">
            Choose whether your daily epoch yield lands as standard {BRAND.valueToken} or automatically converts into native tokenized Stock Tokens (e.g. NVDA, TSLA, AAPL, META) on Robinhood Chain.
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="mt-4 sm:mt-0 flex items-center rounded-xl border border-hair/15 bg-bench p-1">
          <button
            type="button"
            onClick={() => setMode("plain_pons")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              mode === "plain_pons"
                ? "bg-hair/20 text-paper shadow-sm"
                : "text-paper-3 hover:text-paper"
            }`}
          >
            {BRAND.valueToken} Only
          </button>
          <button
            type="button"
            onClick={() => setMode("stock_elected")}
            className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === "stock_elected"
                ? "bg-alive/20 text-alive-lit shadow-sm border border-alive/30"
                : "text-paper-3 hover:text-paper"
            }`}
          >
            <PieChart className="h-3.5 w-3.5 text-alive-lit" />
            Stock Portfolio
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {mode === "plain_pons" ? (
          <div className="rounded-xl border border-hair/10 bg-hair/[0.02] p-5 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-paper-2" />
                <h4 className="font-mono text-sm font-bold text-paper">
                  Plain {BRAND.valueToken} Settlements Active
                </h4>
              </div>
              <p className="mt-1 text-xs text-paper-3 max-w-xl">
                Your daily nurturing and staking yield will remain untouched as standard {BRAND.valueToken}. You can switch to a stock-elected basket at any time prior to epoch close.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode("stock_elected")}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-alive/15 border border-alive/30 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-alive-lit hover:bg-alive/25 transition-all"
            >
              <Sliders className="h-3.5 w-3.5" />
              Configure Stock Basket
            </button>
          </div>
        ) : (
          <>
            {/* Presets Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-paper-3">
                Presets:
              </span>
              {/* Presets name the registry rather than hardcoding tickers, so
                  a listing change cannot leave a button that builds a basket
                  the server then refuses. */}
              {availableTokens.slice(0, 4).map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => handleApplyPreset({ kind: "single", symbol: token.symbol })}
                  className="rounded-lg border border-hair/15 bg-hair/5 px-2.5 py-1 font-mono text-xs text-paper-2 hover:bg-hair/15 hover:text-paper transition-all"
                >
                  100% {token.symbol}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleApplyPreset({ kind: "equal" })}
                className="rounded-lg border border-hair/15 bg-hair/5 px-2.5 py-1 font-mono text-xs text-paper-2 hover:bg-hair/15 hover:text-paper transition-all"
              >
                Equal Split
              </button>
            </div>

            {/* Token Selector Chips */}
            <div>
              <span className="block font-mono text-xs uppercase tracking-wider text-paper-3 mb-2">
                Eligible Registry (Robinhood Chain 4663)
              </span>
              <div className="flex flex-wrap gap-2">
                {eligibleTokens.map((token) => {
                  const isSelected = allocations.some((a) => a.symbol === token.symbol);
                  // The server refuses an election naming a suspended or
                  // illiquid ticker, so offering one here only produces a
                  // rejection after the user has already built a basket.
                  // Show it, since it is genuinely in the registry, but say
                  // plainly that it cannot be picked yet.
                  const isAvailable = token.isLiquid && !token.isSuspended;
                  return (
                    <button
                      key={token.symbol}
                      type="button"
                      disabled={!isAvailable}
                      title={isAvailable ? undefined : `${token.symbol} is not accepting elections yet`}
                      onClick={() => handleToggleToken(token.symbol)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs transition-all ${
                        !isAvailable
                          ? "cursor-not-allowed border border-hair/10 bg-bench text-paper-4 opacity-50"
                          : isSelected
                            ? "border border-alive/40 bg-alive/15 text-alive-lit font-bold shadow-sm"
                            : "border border-hair/10 bg-bench text-paper-3 hover:text-paper hover:bg-hair/5"
                      }`}
                    >
                      <span className="font-bold">{token.symbol}</span>
                      <span className="text-[10px] opacity-75 hidden sm:inline">
                        {token.name.replace(" Tokenized Stock", "")}
                      </span>
                      {!isAvailable && (
                        <span className="rounded bg-hair/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                          Unavailable
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allocation Sliders */}
            <div className="space-y-3 rounded-xl border border-hair/10 bg-hair/[0.02] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-paper">
                  Portfolio Weights
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-paper-3">Total:</span>
                  <span
                    className={`font-mono text-xs font-bold tabular-nums px-2 py-0.5 rounded ${
                      isValidSum
                        ? "bg-alive/20 text-alive-lit"
                        : "bg-coral/20 text-coral"
                    }`}
                  >
                    {totalPercentage}% {isValidSum ? "✓" : "≠ 100%"}
                  </span>
                </div>
              </div>

              {allocations.map((item) => {
                const token = eligibleTokens.find((t) => t.symbol === item.symbol);
                return (
                  <div
                    key={item.symbol}
                    className="rounded-lg border border-hair/10 bg-bench p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-paper">
                          {item.symbol}
                        </span>
                        {token && (
                          <a
                            href={explorerAddressUrl(token.contractAddress)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-[10px] font-mono text-paper-3 hover:text-paper transition-colors"
                            title="View contract on Blockscout"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {token?.feedStatus === "pending" && (
                          <span
                            className="rounded bg-hair/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-paper-3"
                            title="No price source is configured for this token yet. You can elect it now; it cannot settle until a feed is live."
                          >
                            Feed pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={item.percentage}
                          onChange={(e) =>
                            handleUpdatePercentage(item.symbol, Number(e.target.value))
                          }
                          className="h-8 w-16 rounded border border-hair/20 bg-background px-2 text-right font-mono text-xs font-bold tabular-nums text-paper focus:border-alive/50 focus:outline-none"
                        />
                        <span className="font-mono text-xs text-paper-3">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.percentage}
                      onChange={(e) =>
                        handleUpdatePercentage(item.symbol, Number(e.target.value))
                      }
                      className="w-full accent-alive cursor-pointer h-1.5 bg-hair/20 rounded-lg"
                    />
                  </div>
                );
              })}
            </div>

            {/* Exact UI Pipeline Display */}
            <div className="rounded-xl border border-hair/10 bg-bench/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-alive-lit shrink-0" />
                <span className="font-mono text-xs font-semibold text-paper">
                  Exact Payout State Pipeline
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {pipelineStates.map((st, idx) => (
                  <div key={st.key} className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-bold ${
                        st.active
                          ? "bg-alive/20 text-alive-lit border border-alive/40"
                          : "bg-hair/10 text-paper-3"
                      }`}
                    >
                      {st.active && <CheckCircle2 className="h-3 w-3" />}
                      {st.label}
                    </span>
                    {idx < pipelineStates.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-paper-3" />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] font-mono text-paper-3">
                In Sprint F, stock election preferences accrue off-chain. Once Sprint G activates, epoch settlement converts eligible rewards through the audited router with USDG safe-settlement fallback.
              </p>
            </div>

            {/* Non-US Person & Legal Boundary Disclaimer */}
            <div className="rounded-xl border border-coral/20 bg-coral/5 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-coral shrink-0 mt-0.5" />
                <label className="flex items-start gap-2 text-xs text-paper-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedDisclaimer}
                    onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-hair/30 text-alive focus:ring-alive"
                  />
                  <span>
                    <strong>Mandatory Compliance Acknowledgment:</strong> I represent and warrant that I am not a US person. I acknowledge that Stock Tokens are debt securities with no shareholder rights, jurisdiction-gated, and payouts represent variable distributions in-kind — no APY, projections, or brokerage services.
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Action Button & Status Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-hair/10">
          <div className="text-xs text-paper-3 font-mono">
            {electionData?.updatedAt ? (
              <span>Last updated: {new Date(electionData.updatedAt).toLocaleString()}</span>
            ) : (
              <span>No election recorded yet</span>
            )}
          </div>

          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-act px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-act-lit active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Save Election Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
