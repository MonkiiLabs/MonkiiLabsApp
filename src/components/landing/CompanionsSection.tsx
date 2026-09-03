import { Section, Reveal } from "./Section";
import { RARITY_ORDER, RARITY_STYLES } from "@/features/monkii/data";
import { BRAND } from "@/lib/brand";

const ACQUISITION = [
  { emoji: "🏅", title: "Milestone rewards", body: "Free mints for a 7-day thriving streak or a top leaderboard placement." },
  { emoji: "🛒", title: "Paid mints", body: `Limited waves priced in SOL or ${BRAND.valueToken}.` },
  { emoji: "🔁", title: "Secondary market", body: "Fully tradeable on Magic Eden, Tensor and other Robinhood marketplaces." },
  { emoji: "⚗️", title: "Craft & fusion", body: "Phase 2: light fusion, leveling, and dynamic metadata that reacts to agent state." },
];

const CompanionsSection = () => (
  <Section
    id="companions"
    eyebrow="Companion NFTs"
    title={<>Every agent can equip 1–3 Companions.</>}
    intro={
      <>
        Companions are Robinhood NFTs — compressed cNFTs for cost efficiency — that appear next to the
        agent avatar, provide passive bonuses based on rarity and type, can be freely
        equipped and unequipped, and trade on secondary markets. The nurturing loop stays primary;
        Companions are the collectible enhancement layer on top of it.
      </>
    }
  >
    <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[620px] bg-white rounded-3xl border-2 border-dashboard-border overflow-hidden">
        <thead>
          <tr className="bg-cream text-left">
            <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-claw-gray-600">Rarity</th>
            <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-claw-gray-600">Bonus range</th>
            <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-claw-gray-600">Additional effects</th>
          </tr>
        </thead>
        <tbody>
          {RARITY_ORDER.map((rarity) => {
            const s = RARITY_STYLES[rarity];
            return (
              <tr key={rarity} className="border-t-2 border-dashboard-border">
                <td className="p-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border-2 ${s.bg} ${s.text} ${s.border}`}>
                    {rarity}
                  </span>
                </td>
                <td className="p-4 text-sm font-bold text-claw-charcoal">{s.bonus}</td>
                <td className="p-4 text-sm text-claw-gray-600">{s.effect}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 mt-8">
      {ACQUISITION.map((item, i) => (
        <Reveal key={item.title} delay={i * 0.07}>
          <article className="h-full bg-cream rounded-3xl border-2 border-dashboard-border p-5">
            <div className="text-2xl mb-3">{item.emoji}</div>
            <h3 className="text-sm font-extrabold text-claw-charcoal mb-1.5">{item.title}</h3>
            <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed">{item.body}</p>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.15} className="mt-8">
      <div className="rounded-3xl border-2 border-coral/30 bg-coral/10 p-6">
        <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal mb-2">
          Legendary abilities
        </h3>
        <ul className="text-sm text-claw-gray-600 space-y-1.5 leading-relaxed">
          <li>🍌 “Never fully fades” — the agent stays at least Idle.</li>
          <li>🐵 “Double nurture reward once per day.”</li>
          <li>💎 “Bonus {BRAND.valueToken} claim multiplier.”</li>
        </ul>
        <p className="text-xs text-claw-gray-600 mt-4">
          Bonuses apply only while a Companion is equipped to an active agent you are nurturing.
        </p>
      </div>
    </Reveal>
  </Section>
);

export default CompanionsSection;
