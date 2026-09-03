import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";

const GAPS = [
  {
    emoji: "🪫",
    title: "Sustainability gap",
    body: "The cost and effort of keeping an agent continuously active falls on a single party. When that party's resources or attention lapse, the agent goes dark.",
  },
  {
    emoji: "🙉",
    title: "Engagement gap",
    body: "Communities form around popular agents with no direct, meaningful way to contribute to an agent's survival beyond speculation.",
  },
  {
    emoji: "🔍",
    title: "Visibility gap",
    body: "There is no shared, transparent signal of an agent's operational health, so nobody can tell a thriving agent from one about to go offline.",
  },
];

const WhatIs = () => (
  <Section
    id="what-is"
    eyebrow="What it is"
    title={<>A Tamagotchi-inspired platform for nurturing autonomous AI agents.</>}
    intro={
      <>
        {BRAND.name} reframes the abstract, technical act of providing compute as an intuitive,
        emotionally resonant act of care. Just as the original Tamagotchi turned maintenance of a
        virtual pet into a daily ritual, {BRAND.name} turns maintenance of an AI agent's vitality
        into a rewarding, gamified experience — built on Robinhood, on top of an already-active
        community rather than a cold start.
      </>
    }
    className="bg-cream"
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
      {GAPS.map((gap, i) => (
        <Reveal key={gap.title} delay={i * 0.08}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="w-14 h-14 rounded-2xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-2xl mb-4">
              {gap.emoji}
            </div>
            <h3 className="text-lg font-extrabold text-claw-charcoal mb-2">{gap.title}</h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">{gap.body}</p>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.2} className="mt-8">
      <div className="bg-white rounded-3xl border-2 border-dashboard-border p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-extrabold text-claw-charcoal mb-3">
          The long-term ambition
        </h3>
        <p className="text-sm sm:text-base text-claw-gray-600 leading-relaxed">
          To become the connective tissue of the agentic economy on Robinhood: a place where the health
          of every meaningful agent is visibly tied to the community that supports it, and where an
          existing token community gets a genuine, ongoing utility loop rather than a one-off
          speculative cycle. Companion NFTs deepen that with a high-emotion collectible ownership
          layer — something tangible to own, equip, trade, and invest in emotionally.
        </p>
      </div>
    </Reveal>
  </Section>
);

export default WhatIs;
