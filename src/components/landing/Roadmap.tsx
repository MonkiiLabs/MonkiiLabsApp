import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";

/* =====================================================================
   06. Roadmap.

   A bench, not a timeline. Four stations on one rule, read left to
   right, with a marker on each, the same way the props are laid out
   across the desk in the source art. Vertical zig-zag timelines cost a
   lot of height and buy nothing that four columns on a line don't.
   ===================================================================== */

const PHASES = [
  {
    phase: "Phase 1",
    title: "Proof-of-Life core",
    items: ["Web cockpit", "Wallet auth (SIWE)", "Keccak-256 solver", `${BRAND.rewardToken} ledger`],
    state: "shipping" as const,
  },
  {
    phase: "Phase 2",
    title: `${BRAND.valueToken} staking bridge`,
    items: ["24h epoch engine", "Reward pool disbursal", "Companion mint & equip", "Vitality alerts"],
    state: "next" as const,
  },
  {
    phase: "Phase 3",
    title: `50:50 ${BRAND.stockToken} split`,
    items: ["Stock token integration", "Dual disbursal engine", "Portfolio cockpit"],
    state: "planned" as const,
  },
  {
    phase: "Phase 4",
    title: "Mobile node & fleet",
    items: ["Ambient background nurturing", "Multi-agent marketplace"],
    state: "planned" as const,
  },
];

/* The marker says where a phase stands, so it uses the product's own
   vocabulary: alive for what is running, act-red for what is being built
   next, and a hollow ring for what has not been started. */
const MARKER = {
  shipping: "bg-alive",
  next: "bg-act",
  planned: "border border-hair/25 bg-bench",
} as const;

const Roadmap = () => (
  <Section
    id="roadmap"
    index="06"
    eyebrow="Roadmap"
    tone="raised"
    title={
      <>
        From a heartbeat
        <br className="hidden sm:block" /> to a living network.
      </>
    }
    intro={
      <>
        Four phases, each shipping something a nurturer can actually use before the next
        one starts.
      </>
    }
  >
    <div className="relative">
      {/* The bench rule the stations sit on. */}
      <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-hair/12 lg:block" aria-hidden />

      <div className="grid gap-fib4 lg:grid-cols-4 lg:gap-fib3">
        {PHASES.map((p, i) => (
          <Reveal key={p.phase} delay={i * 0.08}>
            <div className="relative lg:pt-fib4">
              <span
                className={`absolute left-0 top-[1px] hidden h-3 w-3 rounded-full lg:block ${MARKER[p.state]}`}
                aria-hidden
              />
              <div className="label-mono text-act-lit lg:mt-0">{p.phase}</div>
              {/* Reserve two lines so the rules under every station land on
                  the same baseline, however long a phase title runs. */}
              <h3 className="mt-fib2 font-display text-d1 text-paper lg:min-h-[3.125rem]">
                {p.title}
              </h3>
              <ul className="mt-fib3 space-y-fib2 border-t border-hair/10 pt-fib3">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-fib2 text-label text-paper-2">
                    <span
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-paper-4"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </Section>
);

export default Roadmap;
