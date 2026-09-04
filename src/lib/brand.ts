/**
 * MONKII LABS: brand constants and art direction.
 *
 * Source art lives in /public/brand. The pieces are flat, ink-outlined
 * cartoon illustrations in two worlds: the bright Day Lab (sky, cream,
 * charcoal, monkii red) and the Activation Chamber (near-black + phosphor
 * green). The UI system in index.css is a direct translation of that
 * language: see the header comment there.
 */

export const monkiiMark = "/brand/monkii-mark.png";
export const labPortrait = "/brand/lab-portrait.png";
export const agentStates = "/brand/agent-states.png";
export const briefing = "/brand/briefing.png";
export const activationChamber = "/brand/activation-chamber.png";
export const rewardsCase = "/brand/rewards-case.png";

/** Legacy aliases, kept so dashboard routes mid-migration keep resolving. */
export const monkiiLogo = monkiiMark;
export const monkiiBanner = labPortrait;

export const BRAND = {
  name: "MONKII LABS",
  first: "MONKII",
  second: "LABS",
  tagline: "Nurturing AI Agents on Robinhood Chain",
  network: "Robinhood Chain",
  rewardToken: "$MONKII",
  valueToken: "$PONS",
  stockToken: "$META",
  emoji: "🐒",
} as const;
