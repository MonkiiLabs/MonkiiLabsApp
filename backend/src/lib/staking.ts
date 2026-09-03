/** Staking multiplier & policy for Monkii Labs. */

const STAKE_FOR_MAX = Number(process.env.STAKE_FOR_MAX_MONKI ?? 10_000);
const MAX_MULTIPLIER = Number(process.env.MAX_STAKE_MULTIPLIER ?? 3.0);
const PREMIUM_THRESHOLD = Number(process.env.PREMIUM_STAKE_THRESHOLD_MONKI ?? 1_000);

export function multiplierFor(stakedMonki: number): number {
  const frac = Math.min(Math.max(stakedMonki, 0) / STAKE_FOR_MAX, 1);
  return Number((1 + (MAX_MULTIPLIER - 1) * frac).toFixed(4));
}

export function premiumUnlocked(stakedMonki: number): boolean {
  return stakedMonki >= PREMIUM_THRESHOLD;
}

export const stakingPolicy = { STAKE_FOR_MAX, MAX_MULTIPLIER, PREMIUM_THRESHOLD };
