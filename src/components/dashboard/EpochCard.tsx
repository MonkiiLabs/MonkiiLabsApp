import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { useClaimable, useStakingStatus } from "@/features/api/hooks";
import { fmt } from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";

/** Live countdown to the next 00:00 UTC disbursal. */
function useCountdown(target: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!target) return null;
  const ms = new Date(target).getTime() - now;
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return { h: "00", m: "00", s: "00", done: true };

  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    done: false,
  };
}

const EpochCard = () => {
  const { data: staking } = useStakingStatus();
  const { data: balances } = useClaimable();
  const countdown = useCountdown(staking?.nextEpochAt);

  return (
    <div className="space-y-4">
      {/* 24-Hour Epoch Disbursal Clock */}
      <section className="panel overflow-hidden p-fib3">
        {/* Stacked, not split: the tracked mono label and the timestamp
            both wrap in a 290px rail if they share a row. */}
        <header className="border-b border-hair/8 pb-fib2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-alive-lit" />
            <h2 className="label-mono text-paper-2">Next disbursal</h2>
          </div>
          <p className="mt-1 font-mono text-micro tabular-nums text-paper-3">
            Every 24h at 00:00 UTC
          </p>
        </header>

        <div className="pt-4">
          <div className="well flex items-center justify-center gap-1 py-fib2 font-mono text-d1 font-semibold tabular-nums text-alive-lit">
            {countdown ? (
              <>
                <span className="w-10 text-center">{countdown.h}</span>
                <span className="text-paper-4">:</span>
                <span className="w-10 text-center">{countdown.m}</span>
                <span className="text-paper-4">:</span>
                <span className="w-10 text-center">{countdown.s}</span>
              </>
            ) : (
              <span className="text-paper-4">--:--:--</span>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-paper-3">
            Automated snapshot & $PONS distribution cycle
          </p>

          <dl className="mt-4 space-y-2 border-t border-hair/10 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-paper-3">Cycle Eligibility</dt>
              <dd
                className={`font-mono text-xs font-semibold ${
                  staking?.isEligibleForNextEpoch ? "text-alive-lit" : "text-idle"
                }`}
              >
                {staking ? (staking.isEligibleForNextEpoch ? "Eligible ✓" : "Pending Next Cycle") : "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-paper-3">Current Multiplier</dt>
              <dd className="font-mono text-xs font-semibold tabular-nums text-paper">
                {staking ? `×${staking.rewardMultiplier.toFixed(2)}` : "×1.00"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-paper-3">{BRAND.valueToken} Yield Accrued</dt>
              <dd className="font-mono text-xs font-semibold tabular-nums text-alive-lit">
                {fmt(balances?.claimablePons, 2)}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
};

export default EpochCard;
