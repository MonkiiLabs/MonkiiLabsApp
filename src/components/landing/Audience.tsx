import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";

const AUDIENCES = [
  {
    emoji: "🐒",
    who: "Retail nurturers",
    what: "Everyday crypto users and AI enthusiasts who want a low-effort, gamified way to participate in the agentic economy.",
    value: `Gamified engagement, ${BRAND.rewardToken} rewards, Companions, and a sense of ownership over the agents they support.`,
  },
  {
    emoji: "🤝",
    who: `The ${BRAND.valueToken} community`,
    what: "Existing holders and community members looking for real, ongoing utility beyond price speculation.",
    value: "A concrete, recurring reason to hold and stake — an active utility loop grafted onto an existing token.",
  },
  {
    emoji: "🧑‍🔬",
    who: "Agent developers",
    what: "Creators and teams who build AI agents and need reliable, community-backed operational support.",
    value: "Decentralised life support, reduced operating burden, and a built-in, motivated community.",
  },
  {
    emoji: "◎",
    who: "The Robinhood ecosystem",
    what: "Protocols and communities seeking richer agent infrastructure and real on-chain activity.",
    value: "A resilient agent-support layer and a showcase of retail-friendly Robinhood utility.",
  },
];

const Audience = () => (
  <Section
    eyebrow="Who it's for"
    title={<>Four groups, one loop.</>}
    className="bg-cream"
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
      {AUDIENCES.map((a, i) => (
        <Reveal key={a.who} delay={i * 0.07}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-12 h-12 rounded-2xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-xl">
                {a.emoji}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal">{a.who}</h3>
            </div>
            <p className="text-sm text-claw-gray-600 leading-relaxed mb-3">{a.what}</p>
            <p className="text-sm font-bold text-sky-dark leading-relaxed">{a.value}</p>
          </article>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Audience;
