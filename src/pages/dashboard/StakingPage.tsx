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
        <div className="border-t border-hair/10 px-5 py-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-mono text-paper-3">
              Progress to Max Boost (×{policy?.MAX_MULTIPLIER ?? 3.0})
            </span>
            <span className="font-mono font-semibold tabular-nums text-alive-lit">
              {fmt(staked)} / {fmt(policy?.STAKE_FOR_MAX ?? 10000)} {BRAND.rewardToken}
            </span>
          </div>

          <div className="mt-2.5 h-3 overflow-hidden rounded-full border border-hair/10 bg-bench">
            <div
              className="h-full bg-gradient-to-r from-alive to-alive-lit transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{ width: `${pct * 100}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-paper-3">
            {data.isEligibleForNextEpoch
              ? "Your position is active and qualified for the upcoming 00:00 UTC snapshot."
              : "Staking resets your epoch timer. Distribution eligibility begins the next cycle."}
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
                    ? "border border-alive/40 bg-alive/15 text-alive-lit"
                    : "border border-hair/10 bg-hair/[0.05] text-paper-3 hover:text-paper"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-xs uppercase tracking-wider text-paper-3">
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
                className="h-11 min-w-0 flex-1 rounded-xl border border-hair/10 bg-bench px-4 font-mono text-sm tabular-nums text-paper focus:border-alive/50 focus:outline-none focus:ring-1 focus:ring-alive/50"
              />
              <button
                type="button"
                onClick={() => setAmount(String(available))}
                className="rounded-xl border border-hair/10 bg-hair/10 px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-paper transition-colors hover:bg-hair/20"
              >
                MAX
              </button>
            </div>
            <span className="mt-1.5 block text-xs text-paper-3">
              Available in wallet/accrual: <span className="font-mono text-paper">{fmt(available, 2)}</span> {token}
            </span>
          </label>

          {projected != null && token === "MONKI" && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-alive/20 bg-alive/5 p-3 text-xs text-alive-lit">
              <Sparkles className="h-4 w-4 shrink-0 text-alive-lit" />
              <span>
                Projected mining multiplier will increase to{" "}
                <strong className="font-mono font-bold text-alive-lit">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-act py-3 font-mono text-micro font-semibold uppercase text-paper transition-colors hover:bg-act-lit active:scale-[0.97] disabled:opacity-40"
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-hair/15 bg-hair/[0.05] py-3 font-mono text-xs font-bold uppercase tracking-wider text-paper transition-all hover:bg-hair/10 active:scale-[0.98] disabled:opacity-40"
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
