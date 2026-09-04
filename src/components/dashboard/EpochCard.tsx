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
      <section className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0d130f]/90 p-5 shadow-xl shadow-black/40 backdrop-blur-md">
        <header className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Next Epoch Disbursal
            </h2>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">00:00 UTC</span>
        </header>

        <div className="pt-4">
          <div className="flex items-center justify-center gap-1 rounded-xl border border-white/5 bg-black/40 py-3 font-mono text-2xl font-bold tabular-nums text-emerald-400 shadow-inner">
            {countdown ? (
              <>
                <span className="w-10 text-center">{countdown.h}</span>
                <span className="text-slate-600">:</span>
                <span className="w-10 text-center">{countdown.m}</span>
                <span className="text-slate-600">:</span>
                <span className="w-10 text-center">{countdown.s}</span>
              </>
            ) : (
              <span className="text-slate-500">23:59:59</span>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            Automated snapshot & $PONS distribution cycle
          </p>

          <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Cycle Eligibility</dt>
              <dd
                className={`font-mono text-xs font-semibold ${
                  staking?.isEligibleForNextEpoch ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {staking ? (staking.isEligibleForNextEpoch ? "Eligible ✓" : "Pending Next Cycle") : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Current Multiplier</dt>
              <dd className="font-mono text-xs font-semibold tabular-nums text-white">
                {staking ? `×${staking.rewardMultiplier.toFixed(2)}` : "×1.00"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">{BRAND.valueToken} Yield Accrued</dt>
              <dd className="font-mono text-xs font-semibold tabular-nums text-emerald-400">
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
