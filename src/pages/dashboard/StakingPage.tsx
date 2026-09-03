import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import EpochCard, { useCountdown } from "@/components/dashboard/EpochCard";
import { useMonkii } from "@/features/monkii/store";
import { POOL_STATS, TOKEN_MINT } from "@/features/monkii/data";
import { BRAND } from "@/lib/brand";

const StakingPage = () => {
  const { agentsBalance, staked, stake, unstake, earnMultiplier, epochEndsAt, ansemClaimed, pendingAnsem } =
    useMonkii();
  const [amount, setAmount] = useState("250");
  const countdown = useCountdown(epochEndsAt);
  const parsed = Number(amount) || 0;

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-claw-charcoal">
          Stake {BRAND.rewardToken} → earn {BRAND.valueToken}
        </h1>
        <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">
          Staking is the only way to earn {BRAND.valueToken}. Payouts follow one flat, global
          schedule: hold a qualifying stake unchanged through a full cycle and you're paid a flat
          amount proportional to your stake. Staking or unstaking mid-cycle forfeits that cycle and
          rolls you into the next one.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {[
            { label: "Available", value: Math.floor(agentsBalance).toLocaleString() },
            { label: "Staked", value: staked.toLocaleString() },
            { label: "Multiplier", value: `×${earnMultiplier.toFixed(2)}` },
            { label: "Next epoch", value: countdown },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-cream border-2 border-dashboard-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-claw-gray-600">{s.label}</p>
              <p className="text-base font-extrabold text-claw-charcoal tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-11 rounded-full bg-cream border-2 border-dashboard-border text-sm font-bold"
            aria-label={`Amount of ${BRAND.rewardToken}`}
          />
          <Button
            onClick={() => {
              if (parsed <= 0 || parsed > agentsBalance) {
                toast.error("Not enough " + BRAND.rewardToken);
                return;
              }
              stake(parsed);
              toast.success(`Staked ${parsed.toLocaleString()} ${BRAND.rewardToken}`, {
                description: "Your epoch timer restarts from this cycle.",
              });
            }}
            className="h-11 rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral px-6"
          >
            Stake
          </Button>
          <Button
            onClick={() => {
              if (parsed <= 0 || parsed > staked) {
                toast.error("Amount exceeds your stake");
                return;
              }
              unstake(parsed);
              toast.info(`Unstaked ${parsed.toLocaleString()} ${BRAND.rewardToken}`, {
                description: "This cycle's payout is forfeited.",
              });
            }}
            variant="outline"
            className="h-11 rounded-full font-bold border-2 border-dashboard-border text-claw-charcoal hover:text-coral hover:border-coral px-6"
          >
            Unstake
          </Button>
        </div>
        <p className="text-[11px] text-claw-gray-600 mt-2">
          Minimum qualifying stake: {POOL_STATS.minStake.toLocaleString()} {BRAND.rewardToken}. Cycle
          length: {POOL_STATS.epochHours}h.
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <EpochCard />

        <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-3">
            Why stakers benefit
          </h2>
          <ul className="space-y-2.5 text-sm text-claw-gray-600 leading-relaxed">
            <li>
              <span className="font-extrabold text-claw-charcoal">Reward multiplier.</span> Staking
              linearly raises your per-heartbeat earn rate, up to a capped maximum.
            </li>
            <li>
              <span className="font-extrabold text-claw-charcoal">Premium access.</span> Staking above
              a threshold unlocks premium agents.
            </li>
            <li>
              <span className="font-extrabold text-claw-charcoal">Epoch reward.</span> Currently
              pending: {pendingAnsem} {BRAND.valueToken}. Lifetime claimed: {ansemClaimed.toFixed(1)}.
            </li>
            <li>
              <span className="font-extrabold text-claw-charcoal">Transparency.</span> The numbers
              below are read from the pool wallet, not claimed.
            </li>
          </ul>
        </Card>
      </div>

      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <h2 className="text-base font-extrabold text-claw-charcoal">Reward pool transparency</h2>
        <p className="text-xs text-claw-gray-600 mt-1 break-all font-mono bg-cream rounded-xl border-2 border-dashboard-border p-3">
          {BRAND.valueToken} mint · {TOKEN_MINT}
        </p>
        <div className="overflow-x-auto no-scrollbar mt-4">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-claw-gray-600">
                <th className="py-2 font-extrabold">Revenue source</th>
                <th className="py-2 font-extrabold">Status</th>
                <th className="py-2 font-extrabold text-right">Captured</th>
              </tr>
            </thead>
            <tbody>
              {POOL_STATS.feeLedger.map((row) => (
                <tr key={row.source} className="border-t-2 border-dashboard-border">
                  <td className="py-2.5 font-bold text-claw-charcoal">{row.source}</td>
                  <td className="py-2.5 text-claw-gray-600">{row.status}</td>
                  <td className="py-2.5 text-right font-extrabold text-claw-charcoal tabular-nums">
                    {row.captured}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-claw-gray-600 mt-3 leading-relaxed">
          The ledger reports honest zeros rather than invented revenue until a source is actually
          live. The pool wallet and its {BRAND.valueToken} disbursements are real today.
        </p>
      </Card>
    </div>
  );
};

export default StakingPage;
