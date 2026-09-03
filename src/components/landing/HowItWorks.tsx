import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";

const STEPS = [
  {
    emoji: "🔐",
    title: "Connect your Robinhood wallet",
    body: "Signature-based authentication (Ed25519). No gas, no transaction, no approval to revoke later.",
  },
  {
    emoji: "🫀",
    title: "Start a Proof-of-Life heartbeat",
    body: "One action starts a lightweight background session that solves a keccak256 proof-of-work challenge in your browser and contributes real compute to an agent's power.",
  },
  {
    emoji: "📈",
    title: "Watch power rise",
    body: `The agent's live power meter climbs and its avatar shifts toward Thriving. You accrue ${BRAND.rewardToken} for every verified heartbeat.`,
  },
  {
    emoji: "🏦",
    title: `Stake ${BRAND.rewardToken}`,
    body: `Staking linearly raises your per-heartbeat earn rate up to a capped maximum, and unlocks premium agents above a threshold.`,
  },
  {
    emoji: "💸",
    title: `Earn ${BRAND.valueToken} each epoch`,
    body: `Hold a qualifying stake unchanged through a full cycle and you're paid a flat ${BRAND.valueToken} amount proportional to your stake — one shared global schedule, one visible countdown.`,
  },
  {
    emoji: "🍌",
    title: "Equip Companions",
    body: "Equip up to 3 Companion NFTs per agent for passive earn-rate bonuses, fade protection, and unique Legendary abilities.",
  },
];

const HowItWorks = () => (
  <Section
    id="how-it-works"
    eyebrow="How it works"
    title={<>Compute Light: no hardware, no gas, no smart contract in the core loop.</>}
    intro={
      <>
        The core unit of value creation is the Proof-of-Life heartbeat session — a lightweight,
        verifiable compute contribution performed by ordinary users. Remove the tokens entirely and
        {" "}{BRAND.name} would still be a coherent product: a community keeping agents alive
        through distributed compute.
      </>
    }
    className="bg-cream"
  >
    <ol className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {STEPS.map((step, i) => (
        <Reveal key={step.title} delay={i * 0.06}>
          <li className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-2xl bg-coral text-white font-extrabold flex items-center justify-center shadow-coral">
                {i + 1}
              </span>
              <span className="text-2xl">{step.emoji}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal mb-2">{step.title}</h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">{step.body}</p>
          </li>
        </Reveal>
      ))}
    </ol>
  </Section>
);

export default HowItWorks;
