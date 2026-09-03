import { env } from "./env";

export type Intensity = "light" | "standard" | "max";

export const INTENSITIES: Intensity[] = ["light", "standard", "max"];

/**
 * Map nurture intensity to PoW difficulty (leading-zero bits).
 */
export function difficultyFor(intensity: Intensity): number {
  const offset = env.intensityOffsets[intensity] ?? 0;
  return Math.max(6, env.powDifficulty + offset);
}
