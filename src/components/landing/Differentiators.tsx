import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";

const POINTS = [
  {
    emoji: "🛠️",
    title: "Maintenance, not creation",
    body: "Most projects focus on creating agents or selling raw enterprise compute. We focus squarely on decentralised, retail-driven maintenance of agents that already exist.",
  },
  {
    emoji: "🥚",
    title: "Tamagotchi framing",
    body: "A technical activity becomes an emotionally engaging daily ritual, which dramatically lowers the barrier to participation.",
  },
  {
    emoji: "🪶",
    title: "Compute Light architecture",
    body: "No specialised hardware, no technical expertise. It runs in a browser tab, which makes it accessible to a mass retail audience.",
  },
  {
    emoji: "📦",
    title: "Minimal engineering footprint",
    body: "No on-chain contract layer for the agent registry, Proof-of-Life verification, or reward accounting. Robinhood is touched only for wallet-signature auth and final settlement.",
  },
  {
    emoji: "🫂",
    title: "Builds on an existing community",
    body: `Rather than bootstrapping a token and community from zero, ${BRAND.name} builds on ${BRAND.valueToken}, so the value-capture side has a real audience from day one.`,
  },
  {
    emoji: "🏆",
    title: "Collectible ownership layer",
    body: "Companion NFTs add scarcity, secondary-market potential and emotional attachment without turning the product into a full pet-breeding game.",
  },
];

const Differentiators = () => (
  <Section
    eyebrow="Why us"
    title={<>A compute network with a community it didn't have to build from scratch.</>}
    intro={
      <>
        Compute is the product that makes the experience honest. The community is what gives it an
        audience from day one. Companions are the ownership layer that turns daily care into lasting
        attachment.
      </>
    }
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {POINTS.map((p, i) => (
        <Reveal key={p.title} delay={i * 0.06}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="text-2xl mb-3">{p.emoji}</div>
            <h3 className="text-base font-extrabold text-claw-charcoal mb-2">{p.title}</h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">{p.body}</p>
          </article>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Differentiators;
