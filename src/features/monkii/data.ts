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
  Common: {
    text: "text-claw-gray-600",
    bg: "bg-cream",
    border: "border-ink",
    bonus: "+6-8% earn rate",
    effect: "—",
  },
  Uncommon: {
    text: "text-human-green",
    bg: "bg-human-green-bg",
    border: "border-ink",
    bonus: "+12-15% earn rate",
    effect: "10-15% decay shield",
  },
  Rare: {
    text: "text-claw-sky-dark",
    bg: "bg-sky/25",
    border: "border-ink",
    bonus: "+20% earn rate",
    effect: "25% decay shield",
  },
  Epic: {
    text: "text-ai-purple",
    bg: "bg-ai-purple-bg",
    border: "border-ink",
    bonus: "+30% earn rate",
    effect: "40% decay shield",
  },
  Legendary: {
    text: "text-coral-dark",
    bg: "bg-coral/15",
    border: "border-ink",
    bonus: "+35-50% earn rate",
    effect: "Decay shield + unique ability",
  },
};
