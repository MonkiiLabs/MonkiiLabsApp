/**
 * Presentation constants for companion rarity.
 *
 * All live data now comes from the API (see src/features/api). What is
 * left here is purely how a rarity tier should *look*, which is a design
 * decision rather than server state.
 */

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export const RARITY_ORDER: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

export const RARITY_STYLES: Record<
  Rarity,
  { text: string; bg: string; border: string; bonus: string; effect: string }
> = {
  // A rarity chip is a reading, so it is a tinted hairline chip rather
  // than a solid sticker. The tiers climb in heat, not in hue count:
  // paper → brass → alive → act. Five colours would read as a party.
  Common: {
    text: "text-paper-3",
    bg: "bg-hair/[0.04]",
    border: "border-hair/10",
    bonus: "+6-8% earn rate",
    effect: "None",
  },
  Uncommon: {
    text: "text-paper-2",
    bg: "bg-hair/[0.07]",
    border: "border-hair/16",
    bonus: "+12-15% earn rate",
    effect: "10-15% decay shield",
  },
  Rare: {
    text: "text-brass",
    bg: "bg-brass/10",
    border: "border-brass/30",
    bonus: "+20% earn rate",
    effect: "25% decay shield",
  },
  Epic: {
    text: "text-alive-lit",
    bg: "bg-alive/10",
    border: "border-alive/30",
    bonus: "+30% earn rate",
    effect: "40% decay shield",
  },
  Legendary: {
    text: "text-act-lit",
    bg: "bg-act/12",
    border: "border-act/35",
    bonus: "+35-50% earn rate",
    effect: "Decay shield + unique ability",
  },
};
