import { describe, expect, test } from "bun:test";
import { computeLivePower, deriveState } from "../src/lib/power";

describe("Vitality & Power State Calculations", () => {
  test("computeLivePower decays power accurately over elapsed hours", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
    const power = computeLivePower({
      currentPower: 80,
      powerDecayRate: 5, // 5 points per hour
      healthyThreshold: 80,
      warningThreshold: 30,
      updatedAt: twoHoursAgo,
    });
    // 80 - 10 = 70
    expect(power).toBeCloseTo(70, 0.1);
  });

  test("deriveState classifies power into thriving, idle, and fading", () => {
    expect(deriveState(80, 80, 30)).toBe("thriving");
    expect(deriveState(95, 80, 30)).toBe("thriving");
    expect(deriveState(79, 80, 30)).toBe("idle");
    expect(deriveState(31, 80, 30)).toBe("idle");
    expect(deriveState(30, 80, 30)).toBe("fading");
    expect(deriveState(15, 80, 30)).toBe("fading");
  });
});
