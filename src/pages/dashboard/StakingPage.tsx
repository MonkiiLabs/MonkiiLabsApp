import { useMemo, useState } from "react";
import { Coins, Loader2, Lock, Sparkles, Unlock, Zap } from "lucide-react";

import {
  useClaim,
  useClaimable,
  useStake,
  useStakingStatus,
  useUnstake,
} from "@/features/api/hooks";
import type { StakeToken } from "@/features/api/types";
import {
  AuthGate,
  ErrorPanel,
  LoadingPanel,
  Panel,
  PanelHeader,
  PageTitle,
  Stat,
  fmt,
  timeUntil,
} from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";

const TOKENS: Array<{ value: StakeToken; label: string }> = [
  { value: "MONKI", label: `$${BRAND.rewardToken} (Mining Multiplier)` },
  { value: "PONS", label: `$${BRAND.valueToken} (Yield Pool)` },
];

const StakingInner = () => {
  const status = useStakingStatus();
  const { data: balances } = useClaimable();
  const stake = useStake();
  const unstake = useUnstake();
  const claim = useClaim();

  const [token, setToken] = useState<StakeToken>("MONKI");
  const [amount, setAmount] = useState("");

  const policy = status.data?.policy;
  const staked = status.data?.stakedMonki ?? 0;
  const available = token === "MONKI" ? balances?.claimableMonki ?? 0 : balances?.claimablePons ?? 0;

  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;

  /** Multiplier scales linearly from 1× to MAX over STAKE_FOR_MAX */
  const projected = useMemo(() => {
    if (!policy || !valid) return null;
    const next = staked + parsed;
    const ratio = Math.min(1, next / policy.STAKE_FOR_MAX);
    return 1 + ratio * (policy.MAX_MULTIPLIER - 1);
  }, [policy, staked, parsed, valid]);

  if (status.isLoading) return <LoadingPanel label="Querying on-chain staking status" />;
  if (status.isError) return <ErrorPanel error={status.error} onRetry={status.refetch} />;

  const data = status.data!;
  const pct = policy ? Math.min(1, staked / policy.STAKE_FOR_MAX) : 0;

  return (
    <div className="space-y-5">
      {/* Position Overview */}
      <Panel raised>
        <PanelHeader title="Staking Position & Epoch Telemetry" />
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <Stat value={fmt(data.stakedMonki)} label={`${BRAND.rewardToken} Staked`} />
          <Stat value={`×${data.rewardMultiplier.toFixed(2)}`} label="Mining Boost" tone="vital" />
          <Stat value={fmt(data.claimablePons, 2)} label={`${BRAND.valueToken} Accrued`} tone="coral" />
          <Stat value={timeUntil(data.nextEpochAt)} label="Next Disbursal" />
        </div>

        {/* Multiplier Progress Bar */}
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-mono text-slate-400">
              Progress to Max Boost (×{policy?.MAX_MULTIPLIER ?? 3.0})
            </span>
            <span className="font-mono font-semibold tabular-nums text-emerald-400">
              {fmt(staked)} / {fmt(policy?.STAKE_FOR_MAX ?? 10000)} {BRAND.rewardToken}
            </span>
          </div>

          <div className="mt-2.5 h-3 overflow-hidden rounded-full border border-white/10 bg-[#090d0a]">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{ width: `${pct * 100}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {data.isEligibleForNextEpoch
              ? "Your position is active and qualified for the upcoming 00:00 UTC snapshot."
              : "Staking resets your epoch timer — distribution eligibility begins the subsequent cycle."}
          </p>
        </div>
      </Panel>

      {/* Stake & Unstake Console */}
      <Panel>
        <PanelHeader
          title="Stake / Release Tokens"
          hint="All staking actions require a gasless cryptographic wallet signature on Robinhood Chain."
        />
        <div className="p-5">
          {/* Token selector */}
          <div className="flex flex-wrap gap-2">
            {TOKENS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setToken(t.value)}
                className={`rounded-xl px-3.5 py-2 font-mono text-xs font-semibold transition-all ${
                  token === t.value
                    ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              Amount to Stake
            </span>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090d0a] px-4 font-mono text-sm tabular-nums text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <button
                type="button"
                onClick={() => setAmount(String(available))}
                className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-200 transition-colors hover:bg-white/20"
              >
                MAX
              </button>
            </div>
            <span className="mt-1.5 block text-xs text-slate-400">
              Available in wallet/accrual: <span className="font-mono text-white">{fmt(available, 2)}</span> {token}
            </span>
          </label>

          {projected != null && token === "MONKI" && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Projected mining multiplier will increase to{" "}
                <strong className="font-mono font-bold text-emerald-400">
                  ×{projected.toFixed(2)}
                </strong>
              </span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!valid || parsed > available || stake.isPending}
              onClick={() => stake.mutate({ amount: parsed, token })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40"
            >
              {stake.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Stake {token}
            </button>

            <button
              type="button"
              disabled={!valid || parsed > staked || unstake.isPending}
              onClick={() => unstake.mutate({ amount: parsed, token })}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-40"
            >
              {unstake.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
              Unstake
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

const StakingPage = () => (
  <>
    <PageTitle
      index="03"
      eyebrow="Staking & Yield"
      title="Epoch Staking & Multiplier Engine"
      intro="Stake $MONKI to boost your in-browser Proof-of-Life mining rewards up to ×3.00. Earn liquid $PONS utility tokens distributed across daily 24-hour snapshot epochs."
    />
    <AuthGate what="your staking position and epoch allocations">
      <StakingInner />
    </AuthGate>
  </>
);

export default StakingPage;
