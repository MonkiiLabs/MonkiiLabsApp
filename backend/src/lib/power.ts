export type AgentState = "thriving" | "idle" | "fading";

export interface PowerInputs {
  currentPower: number;
  powerDecayRate: number; // power lost per hour absent nurturing
  healthyThreshold: number;
  warningThreshold: number;
  updatedAt: Date | string;
}

/**
 * Live power = last recorded power decayed by elapsed time.
 */
export function computeLivePower(input: PowerInputs, now = new Date()): number {
  const last = new Date(input.updatedAt).getTime();
  const hours = Math.max(0, (now.getTime() - last) / 3_600_000);
  const decayed = input.currentPower - input.powerDecayRate * hours;
  return Math.max(0, Number(decayed.toFixed(6)));
}

/** Derive vitality state from power level and thresholds. */
export function deriveState(
  power: number,
  healthyThreshold: number,
  warningThreshold: number,
): AgentState {
  if (power >= healthyThreshold) return "thriving";
  if (power <= warningThreshold) return "fading";
  return "idle";
}

/** Live power + derived state. */
export function liveStateOf(
  input: PowerInputs,
  now = new Date(),
): { power: number; state: AgentState } {
  const power = computeLivePower(input, now);
  return { power, state: deriveState(power, input.healthyThreshold, input.warningThreshold) };
}
