import { describe, expect, test } from "bun:test";
import {
  truncateAddress,
  fmtNum,
  fmtInt,
  formatStatsMessage,
  formatMonkiMessage,
  formatPonsMessage,
  formatAgentsMessage,
  formatHelpMessage,
  MAIN_KEYBOARD,
  type UserTelegramStats,
} from "../src/lib/telegram";

describe("Telegram Sentinel Bot Formatter & Telemetry", () => {
  const mockStats: UserTelegramStats = {
    walletAddress: "0x0dA483B7C998C15b31E191678A400d6D9caD6661",
    telegramUsername: "testmonkii",
    totalMonkiMined: 12450.5,
    claimableMonki: 9850.25,
    claimedMonki: 0,
    stakedMonki: 2600.0,
    rewardMultiplier: 1.8,
    claimablePons: 45.2,
    claimedPons: 110.5,
    totalPonsEarned: 155.7,
    powerRank: 3,
    totalHeartbeats: 1248,
    activeAgents: [
      {
        id: "agent-1",
        name: "Eve",
        power: 88,
        state: "thriving",
        powerContributed: 420,
        monkiEarned: 85.5,
      },
      {
        id: "agent-2",
        name: "Adam",
        power: 42,
        state: "idle",
        powerContributed: 180,
        monkiEarned: 32.0,
      },
    ],
  };

  test("truncateAddress shortens hex addresses cleanly", () => {
    expect(truncateAddress("0x0dA483B7C998C15b31E191678A400d6D9caD6661")).toBe("0x0dA4…6661");
    expect(truncateAddress("short")).toBe("short");
  });

  test("fmtNum and fmtInt format numbers with appropriate commas and decimals", () => {
    expect(fmtNum(12450.5)).toBe("12,450.50");
    expect(fmtInt(1248)).toBe("1,248");
  });

  test("formatStatsMessage formats complete nurturer telemetry card", () => {
    const msg = formatStatsMessage(mockStats);
    expect(msg).toContain("0x0dA4…6661");
    expect(msg).toContain("#3");
    expect(msg).toContain("1,248");
    expect(msg).toContain("12,450.50 $MONKI");
    expect(msg).toContain("9,850.25 $MONKI");
    expect(msg).toContain("2,600.00 $MONKI");
    expect(msg).toContain("1.80x");
    expect(msg).toContain("45.20 $PONS");
    expect(msg).toContain("155.70 $PONS");
    expect(msg).toContain("Eve");
    expect(msg).toContain("THRIVING (88/100 power)");
    expect(msg).toContain("Adam");
  });

  test("formatMonkiMessage highlights Proof-of-Life mining and pre-TGE accruals", () => {
    const msg = formatMonkiMessage(mockStats);
    expect(msg).toContain("$MONKI Mining Telemetry");
    expect(msg).toContain("12,450.50 $MONKI");
    expect(msg).toContain("Pre-TGE Lock");
    expect(msg).toContain("1.80x");
  });

  test("formatPonsMessage displays staking pool yield and totals", () => {
    const msg = formatPonsMessage(mockStats);
    expect(msg).toContain("$PONS Staking Yield Breakdown");
    expect(msg).toContain("45.20 $PONS");
    expect(msg).toContain("110.50 $PONS");
    expect(msg).toContain("155.70 $PONS");
  });

  test("formatAgentsMessage displays active fleet and power metrics", () => {
    const msg = formatAgentsMessage(mockStats);
    expect(msg).toContain("Your Nurtured Fleet (2)");
    expect(msg).toContain("Eve");
    expect(msg).toContain("88 / 100");
    expect(msg).toContain("Adam");
    expect(msg).toContain("42 / 100");
  });

  test("formatAgentsMessage handles empty fleet cleanly", () => {
    const emptyStats: UserTelegramStats = {
      ...mockStats,
      activeAgents: [],
    };
    const msg = formatAgentsMessage(emptyStats);
    expect(msg).toContain("no active nurturing sessions");
    expect(msg).toContain("Open Fleet Cockpit");
  });

  test("formatHelpMessage returns appropriate guide for linked and unlinked users", () => {
    const linkedHelp = formatHelpMessage(true);
    expect(linkedHelp).toContain("/stats");
    expect(linkedHelp).toContain("/monki");
    expect(linkedHelp).toContain("/pons");
    expect(linkedHelp).toContain("/agents");
    expect(linkedHelp).toContain("/unlink");

    const unlinkedHelp = formatHelpMessage(false);
    expect(unlinkedHelp).toContain("/start &lt;YOUR_CODE&gt;");
  });

  test("MAIN_KEYBOARD defines expected persistent menu buttons", () => {
    const buttons = MAIN_KEYBOARD.keyboard.flat().map((b) => b.text);
    expect(buttons).toContain("📊 My Stats");
    expect(buttons).toContain("🍌 Mined $MONKI");
    expect(buttons).toContain("💎 $PONS Yield");
    expect(buttons).toContain("🤖 Nurtured Fleet");
    expect(buttons).toContain("🌐 Open Cockpit");
    expect(buttons).toContain("❓ Help");
  });
});
