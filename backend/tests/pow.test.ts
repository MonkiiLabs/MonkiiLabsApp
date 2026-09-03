import { describe, expect, test } from "bun:test";
import { leadingZeroBits, hashSolution, computeAccrual, solve } from "../src/lib/pow";

describe("Proof-of-Life Cryptographic Engine", () => {
  test("leadingZeroBits counts leading zero bits correctly", () => {
    expect(leadingZeroBits("0x0000000000000000000000000000000000000000000000000000000000000000")).toBe(256);
    expect(leadingZeroBits("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(0);
    expect(leadingZeroBits("0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(4);
    expect(leadingZeroBits("0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(8);
    expect(leadingZeroBits("0x000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(12);
  });

  test("hashSolution generates deterministic keccak256 hash", () => {
    const hash1 = hashSolution("seed123", "nonce456");
    const hash2 = hashSolution("seed123", "nonce456");
    expect(hash1).toBe(hash2);
    expect(hash1.startsWith("0x")).toBe(true);
    expect(hash1.length).toBe(66);
  });

  test("solve finds a valid nonce for a given difficulty", () => {
    const seed = "test-seed-12345";
    const difficulty = 8; // 8 bits (2 hex zeroes)
    const nonce = solve(seed, difficulty, 50000);
    expect(nonce).not.toBeNull();

    const digest = hashSolution(seed, nonce!);
    expect(leadingZeroBits(digest)).toBeGreaterThanOrEqual(difficulty);
  });

  test("computeAccrual scales with difficulty and multiplier", () => {
    const standard = computeAccrual(8, 1.0);
    expect(standard.powerDelta).toBe(10);
    expect(standard.monki).toBe(5);

    const withMultiplier = computeAccrual(8, 2.0);
    expect(withMultiplier.powerDelta).toBe(10); // power never inflates from staking
    expect(withMultiplier.monki).toBe(10);

    const maxIntensity = computeAccrual(10, 1.0);
    expect(maxIntensity.powerDelta).toBe(15);
    expect(maxIntensity.monki).toBe(8);
  });
});
