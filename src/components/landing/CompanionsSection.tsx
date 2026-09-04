import { Section, Reveal } from "./Section";
import { RARITY_ORDER, RARITY_STYLES } from "@/features/monkii/data";
import { BRAND } from "@/lib/brand";

/* =====================================================================
   04. Companions.

   Collectible art carries this one, so the tiles are mostly image: a
   square plate, an ink keyline, and one line of consequence underneath.
   The rarity ladder is a rail rather than a table: five tiers is a
   scale, and a scale should look like one.
   ===================================================================== */

const ROSTER = [
  {
    slug: "cyber-chimp-drone",
    name: "Cyber-Chimp Drone",
    rarity: "Common" as const,
    boost: "+6%",
    note: "Optimises heartbeat transmission.",
  },
  {
    slug: "nano-baboon-core",
    name: "Nano-Baboon Core",
    rarity: "Common" as const,
    boost: "+8%",
    note: "Regulates hash throughput.",
  },
  {
    slug: "plasma-lemur",
    name: "Plasma Lemur",
    rarity: "Uncommon" as const,
    boost: "+12%",
    note: "Buffers power against thermal decay.",
  },
  {
    slug: "mecha-mandrill",
    name: "Mecha Mandrill",
    rarity: "Uncommon" as const,
    boost: "+15%",
    note: "Enhances heartbeat resonance.",
  },
  {
    slug: "quantum-ape-sentinel",
    name: "Quantum Ape Sentinel",
    rarity: "Rare" as const,
    boost: "+20%",
    note: "Shields against ambient entropy.",
  },
  {
    slug: "celestial-king-monkii",
    name: "Celestial King Monkii",
    rarity: "Epic" as const,
    boost: "+30%",
    note: "Legendary neural synchronisation.",
  },
];

const CompanionsSection = () => (
  <Section
    id="companions"
    index="04"
    eyebrow="Companions"
    tone="raised"
    title={
      <>
        Three slots per agent.
        <br className="hidden sm:block" /> Permanent buffs.
      </>
    }
    intro={
      <>
        Companions are ERC-721 collectibles on {BRAND.network}. Ownership is verified
        on-chain; equipping is off-chain, instant and gasless, so the loop never waits on a
        block.
      </>
    }
  >
    <div className="grid gap-fib3 sm:grid-cols-2 lg:grid-cols-3">
      {ROSTER.map((c, i) => {
        const s = RARITY_STYLES[c.rarity];
        return (
          <Reveal key={c.slug} delay={(i % 3) * 0.08}>
            {/* Both chips ride on the plate, so the caption below is name
                over note on every tile and the notes share one baseline
                across the row however long a name runs. */}
            <article className="panel-raised raise flex h-full flex-col overflow-hidden">
              <div className="relative aspect-square overflow-hidden border-b border-hair/8 bg-bench">
                <img
                  src={`/companions/${c.slug}.jpg`}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-fib2 top-fib2 rounded-sm border px-fib2 py-0.5 text-micro font-semibold uppercase ${s.border} ${s.bg} ${s.text}`}
                >
                  {c.rarity}
                </span>
                <span className="absolute right-fib2 top-fib2 rounded-sm border border-alive/35 bg-bench/85 px-fib2 py-0.5 font-mono text-micro font-semibold tabular-nums text-alive-lit backdrop-blur-sm">
                  {c.boost}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-fib3">
                <h3 className="font-display text-d1 text-paper">{c.name}</h3>
                <p className="mt-fib2 text-label text-paper-3">{c.note}</p>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>

    {/* The ladder. Five tiers read as a scale, left to right. */}
    <Reveal delay={0.16}>
      <div className="mt-fib5">
        <h3 className="label-mono text-paper-3">Rarity ladder</h3>
        <div className="mt-fib3 grid gap-fib2 sm:grid-cols-2 lg:grid-cols-5">
          {RARITY_ORDER.map((rarity) => {
            const s = RARITY_STYLES[rarity];
            return (
              <div key={rarity} className="panel-raised p-fib3">
                <span
                  className={`inline-block rounded-sm border px-fib2 py-0.5 text-micro font-semibold uppercase ${s.border} ${s.bg} ${s.text}`}
                >
                  {rarity}
                </span>
                <div className="mt-fib2 font-mono text-label font-semibold tabular-nums text-brass">
                  {s.bonus}
                </div>
                <p className="mt-fib1 text-label text-paper-3">{s.effect}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-fib3 max-w-[68ch] text-label text-paper-2">
          Legendary abilities go further: <em>never fully fades</em>, a second nurture
          reward once a day, or a boosted {BRAND.stockToken} allocation. Buffs apply only
          while the Companion is equipped to an agent you are actively nurturing.
        </p>
      </div>
    </Reveal>
  </Section>
);

export default CompanionsSection;
