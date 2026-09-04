import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";

const QUARTERS = [
  {
    q: "Q1",
    theme: "Foundation & MVP",
    items: "Product spec, Liquid Glass web shell, Robinhood wallet auth, Agent Registry on devnet, pilot agents.",
  },
  {
    q: "Q2",
    theme: "Proof-of-Life live",
    items: `Heartbeat sessions, ${BRAND.rewardToken} minting, expressive agent avatars, marketplace, personal dashboard.`,
  },
  {
    q: "Q3",
    theme: "Staking bridge",
    items: `${BRAND.rewardToken} → ${BRAND.valueToken} staking, revenue-funded buybacks, leaderboard, X activity feed per agent.`,
  },
  {
    q: "Q4",
    theme: "Scale & ecosystem",
    items: "Mainnet launch, agent-launch partner integrations, notifications, mobile companion.",
  },
];

const PHASES = [
  { name: "Phase 1 — MVP", items: "5–8 Companion designs (Common → Rare), basic equip/unequip, passive earn-rate bonuses, milestone rewards plus a limited paid mint, avatar integration, inventory views." },
  { name: "Phase 2", items: "Epic & Legendary tiers with unique abilities, stronger visual effects and state reactions, expanded acquisition, improved showcase UI." },
  { name: "Phase 3", items: "Companion leveling and light fusion, dynamic metadata, deeper leaderboard and social integration." },
];

const Roadmap = () => (
  <Section
    id="roadmap"
    eyebrow="Roadmap"
    title={<>Ship the nurturing loop first, then layer Companions.</>}
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
      {QUARTERS.map((q, i) => (
        <Reveal key={q.q} delay={i * 0.06}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <span className="inline-block px-3 py-1 rounded-full bg-coral text-white text-xs font-extrabold mb-3">
              {q.q}
            </span>
            <h3 className="text-base font-extrabold text-claw-charcoal mb-2">{q.theme}</h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">{q.items}</p>
          </article>
        </Reveal>
      ))}
    </div>

    <div className="grid gap-4 sm:gap-5 md:grid-cols-3 mt-6">
      {PHASES.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.07}>
          <article className="h-full bg-cream rounded-3xl border-2 border-dashboard-border p-5">
            <h3 className="text-sm font-extrabold text-sky-dark mb-2">{p.name}</h3>
            <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed">{p.items}</p>
          </article>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Roadmap;
