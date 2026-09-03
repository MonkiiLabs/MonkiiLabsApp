import { describe, expect, test } from "bun:test";
import { multiplierFor, premiumUnlocked } from "../src/lib/staking";

describe("Staking Multipliers & Policy", () => {
  test("multiplierFor scales from 1.0x to 3.0x linearly and caps", () => {
    expect(multiplierFor(0)).toBe(1.0);
    expect(multiplierFor(5000)).toBe(2.0); // halfway to 10k
    expect(multiplierFor(10000)).toBe(3.0); // max
    expect(multiplierFor(25000)).toBe(3.0); // capped
  });

  test("premiumUnlocked activates at 1000 $MONKI", () => {
    expect(premiumUnlocked(0)).toBe(false);
    expect(premiumUnlocked(999)).toBe(false);
    expect(premiumUnlocked(1000)).toBe(true);
    expect(premiumUnlocked(5000)).toBe(true);
  });
});
