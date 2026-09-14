import { describe, expect, test } from "bun:test";

import { companionIdForType, toOwnedCompanion } from "../src/lib/companions";

describe("Companion on-chain type mapping", () => {
  test("maps contract archetype ids to inventory ids", () => {
    expect(companionIdForType(1n)).toBe("cyber-chimp-drone");
    expect(companionIdForType("2")).toBe("nano-baboon-core");
    expect(companionIdForType(6)).toBe("celestial-king-monkii");
  });

  test("fails closed for unknown archetype ids", () => {
    expect(companionIdForType(0)).toBeUndefined();
    expect(companionIdForType(99)).toBeUndefined();
  });

  test("normalizes database inventory fields for the frontend contract", () => {
    const companion = toOwnedCompanion({
      id: 19,
      user_address: "0x56f1",
      companion_id: "mecha-mandrill",
      equipped_agent_id: null,
      slot_index: null,
      acquired_at: "2026-09-14T07:10:00.000Z",
      on_chain_mint: "18",
      mint_tx_hash: "0xabc",
      name: "Mecha Mandrill",
      slug: "mecha-mandrill",
      description: "",
      category: "guardian",
      rarity: "Uncommon",
      image_url: "/companions/mecha-mandrill.jpg",
      earn_boost_pct: 15,
      decay_reduction_pct: 15,
      agent_name: null,
    });

    expect(companion.companionId).toBe("mecha-mandrill");
    expect(companion.imageUrl).toBe("/companions/mecha-mandrill.jpg");
    expect(companion.on_chain_mint).toBe("18");
    expect(companion.earnBoostPct).toBe(15);
  });
});
