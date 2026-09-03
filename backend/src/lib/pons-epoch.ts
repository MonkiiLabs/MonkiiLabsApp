import { env } from "./env";

export const PONS_EPOCH_ANCHOR = new Date(env.ponsEpochAnchor);
export const PONS_EPOCH_MS = env.ponsStakeLockHours * 60 * 60 * 1000;

/** Index of epoch containing `at`. */
export function epochIndexAt(at: Date): number {
  return Math.floor((at.getTime() - PONS_EPOCH_ANCHOR.getTime()) / PONS_EPOCH_MS);
}

/** Start time of epoch containing `at`. */
export function epochStartAt(at: Date): Date {
  return new Date(PONS_EPOCH_ANCHOR.getTime() + epochIndexAt(at) * PONS_EPOCH_MS);
}

/** Next epoch start after `at`. */
export function nextEpochStartAfter(at: Date): Date {
  return new Date(epochStartAt(at).getTime() + PONS_EPOCH_MS);
}

/** First eligible epoch index for a stake made at `stakedSince`. */
export function firstEligibleEpochIndex(stakedSince: Date): number {
  const idx = epochIndexAt(stakedSince);
  const start = PONS_EPOCH_ANCHOR.getTime() + idx * PONS_EPOCH_MS;
  return stakedSince.getTime() > start ? idx + 1 : idx;
}
