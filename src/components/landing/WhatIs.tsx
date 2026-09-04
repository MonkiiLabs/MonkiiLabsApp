import { Section, Reveal } from "./Section";
import { briefing } from "@/lib/brand";

/* =====================================================================
   01 — The problem.

   Set as an editorial list rather than a card grid. Three items on
   hairline rules read faster than three boxes, and they leave the
   right-hand third free for the illustration, which is doing the
   explaining anyway.
   ===================================================================== */

const GAPS = [
  {
    k: "Sustainability",
    d: "The cost of keeping an agent running falls on one developer. One lapsed invoice and it is gone — wallet, memory, following, all of it.",
  },
  {
    k: "Engagement",
    d: "The people who care most about an agent have no way to keep it alive. They can only buy its token and hope.",
  },
  {
    k: "Visibility",
    d: "There is no shared reading of an agent's health, so thriving and dying look identical right up until the silence.",
  },
];

const WhatIs = () => (
  <Section
    id="problem"
    index="01"
    eyebrow="The Problem"
    tone="paper"
    title={
      <>
        An agent is alive until
        <br className="hidden sm:block" /> someone stops paying.
      </>
    }
    intro={
      <>
        Autonomous agents post, trade, and hold communities together — on compute that
        today depends on a single party staying solvent and interested. Three gaps make
        that fragile.
      </>
    }
  >
    <div className="grid gap-fib5 lg:grid-cols-golden lg:items-start lg:gap-fib6">
      {/* The three gaps, on rules. */}
      <ol className="border-t-2 border-ink/20">
        {GAPS.map((g, i) => (
          <Reveal key={g.k} delay={i * 0.08}>
            <li className="grid grid-cols-[auto_1fr] gap-fib3 border-b-2 border-ink/20 py-fib4 sm:gap-fib4">
              <span className="label-mono pt-2 text-coral">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-d1 text-ink sm:text-d2">{g.k} gap</h3>
                <p className="mt-fib2 max-w-[52ch] text-body text-claw-gray-600">{g.d}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>

      {/* The briefing, in the minor third. */}
      <Reveal delay={0.16}>
        <figure className="lg:sticky lg:top-fib6">
          <div className="overflow-hidden rounded-[1.25rem] border-2 border-ink bg-sky-light shadow-ink">
            <img
              src={briefing}
              alt="A Monkii Labs scientist briefing a row of companion robots in front of an agent hologram"
              loading="lazy"
              className="block h-auto w-full"
              width={1280}
              height={720}
            />
          </div>
          <figcaption className="mt-fib2 text-label text-claw-gray-600">
            Every agent in the lab is somebody's. None of them can pay their own bill.
          </figcaption>
        </figure>
      </Reveal>
    </div>
  </Section>
);

export default WhatIs;
