import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMonkii } from "@/features/monkii/store";
import { POOL_STATS } from "@/features/monkii/data";
import { BRAND } from "@/lib/brand";

export const useCountdown = (target: number) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const ms = Math.max(0, target - now);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const EpochCard = ({ compact = false }: { compact?: boolean }) => {
  const { epochEndsAt, staked, pendingAnsem, claimAnsem } = useMonkii();
  const countdown = useCountdown(epochEndsAt);
  const qualifies = staked >= POOL_STATS.minStake;

  return (
    <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-4">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-2">
        Next {BRAND.valueToken} epoch
      </h3>
      <p className="text-2xl font-extrabold text-claw-charcoal tabular-nums">{countdown}</p>
      <p className="text-[11px] text-claw-gray-600 leading-relaxed mt-1">
        One fixed schedule shared by every staker. Staking or unstaking during a cycle forfeits that
        cycle's payout.
      </p>

      {!compact && (
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-claw-gray-600 font-medium">Pool wallet balance</dt>
            <dd className="font-extrabold text-claw-charcoal tabular-nums">
              {POOL_STATS.poolBalance.toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-claw-gray-600 font-medium">Total distributed</dt>
            <dd className="font-extrabold text-claw-charcoal tabular-nums">
              {POOL_STATS.totalDistributed.toLocaleString()}
            </dd>
          </div>
        </dl>
      )}

      <Button
        onClick={() => {
          const amount = claimAnsem();
          if (amount > 0) {
            toast.success(`Claimed ${amount} ${BRAND.valueToken}`, {
              description: "Sent from the pool wallet — the pool paid the network fee.",
            });
          } else {
            toast.error(`Stake at least ${POOL_STATS.minStake} ${BRAND.rewardToken} to qualify.`);
          }
        }}
        disabled={!qualifies}
        className="w-full mt-4 rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral disabled:opacity-60"
      >
        {qualifies ? `Claim ${pendingAnsem} ${BRAND.valueToken}` : "Not qualifying yet"}
      </Button>
    </Card>
  );
};

export default EpochCard;
