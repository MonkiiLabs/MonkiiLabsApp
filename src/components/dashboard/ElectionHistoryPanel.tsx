import { useState } from "react";
import { CheckCircle2, ChevronDown, Coins, History } from "lucide-react";

import { useRwaElectionHistory } from "@/features/api/hooks";
import { BRAND } from "@/lib/brand";

/* =====================================================================
   Election history.

   Saving an election used to overwrite the previous one, so nothing could
   say which basket earned what. Each basket is now kept as a period, and
   this panel is the readable end of that: what you elected, and the
   window it was live for.

   It sits under the election card rather than inside it, behind a button,
   because the card is for changing your election and this is for checking
   what you already did.
   ===================================================================== */

/** Periods shown before the list has to be expanded further. */
const INITIAL_PERIODS = 4;

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** How long a basket stood. An open period runs to now. */
function heldFor(from: string, to: string | null): string {
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  const days = Math.floor((end - start) / 86_400_000);
  if (days < 1) return "under a day";
  return days === 1 ? "1 day" : `${days} days`;
}

export default function ElectionHistoryPanel() {
  const { data, isLoading, isError } = useRwaElectionHistory();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // A history that cannot be read shows no button at all. An empty list
  // would read as "you have never elected anything", which is a different
  // claim and one we would have no basis for making.
  if (isLoading || isError) return null;

  const periods = data?.periods ?? [];
  if (periods.length === 0) return null;

  const shown = showAll ? periods : periods.slice(0, INITIAL_PERIODS);
  const hidden = periods.length - shown.length;

  return (
    <div className="rounded-2xl border border-hair/15 bg-card text-card-foreground shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="election-history-periods"
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-hair/[0.03]"
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4 shrink-0 text-alive-lit" />
          <span className="font-mono text-xs font-semibold text-paper">Election History</span>
          <span className="rounded-md border border-hair/15 bg-hair/5 px-2 py-0.5 font-mono text-[10px] tabular-nums text-paper-3">
            {periods.length} {periods.length === 1 ? "period" : "periods"}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-paper-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id="election-history-periods" className="border-t border-hair/10 p-4">
          <p className="text-[11px] text-paper-3">
            Every basket you have elected, kept as its own period. Yield is attributed to the
            basket that was live when it accrued, not to the one you hold today.
          </p>

          <ol className="mt-3 space-y-2">
            {shown.map((period) => (
              <li
                key={period.id}
                className={`rounded-lg border p-3 ${
                  period.isCurrent
                    ? "border-alive/30 bg-alive/[0.06]"
                    : "border-hair/10 bg-hair/[0.02]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] tabular-nums text-paper-2">
                    {formatStamp(period.effectiveFrom)}
                    <span className="text-paper-3"> to </span>
                    {period.effectiveTo ? formatStamp(period.effectiveTo) : "now"}
                  </span>

                  {period.isCurrent ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-alive/40 bg-alive/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-alive-lit">
                      <CheckCircle2 className="h-3 w-3" />
                      In force
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-paper-3">
                      held {heldFor(period.effectiveFrom, period.effectiveTo)}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {period.mode === "plain_pons" || period.allocations.length === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-hair/15 bg-hair/5 px-2 py-0.5 font-mono text-[11px] text-paper-2">
                      <Coins className="h-3 w-3 text-paper-3" />
                      Plain {BRAND.valueToken}
                    </span>
                  ) : (
                    period.allocations.map((allocation) => (
                      <span
                        key={allocation.symbol}
                        className="inline-flex items-center gap-1.5 rounded-md border border-hair/15 bg-hair/5 px-2 py-0.5 font-mono text-[11px] text-paper-2"
                      >
                        <span className="font-bold text-paper">{allocation.symbol}</span>
                        <span className="tabular-nums text-paper-3">{allocation.percentage}%</span>
                      </span>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ol>

          {periods.length > INITIAL_PERIODS && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-alive-lit transition-opacity hover:opacity-80"
            >
              {showAll ? "Show less" : `Show ${hidden} older`}
            </button>
          )}

          {showAll && data?.hasMore && (
            <p className="mt-2 font-mono text-[10px] text-paper-3">
              Older periods exist beyond the most recent {periods.length}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
