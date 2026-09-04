import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";

import { BRAND, labPortrait } from "@/lib/brand";
import { Readout, Reveal } from "@/components/landing/Section";
import { VitalTrace } from "@/components/landing/VitalTrace";

/* =====================================================================
   Hero.

   The old hero opened on a sky gradient with drifting cloud SVGs. That
   is a children's-book device, and it was the first thing anyone saw.

   What opens the page now is the instrument. The argument sits in the
   left 1.618 parts and the lab portrait in the right 1: the golden
   split is kept, because it was working, but the moment the page is
   built around is the live vitality trace running the full width
   underneath. It is the most characteristic thing in this product's
   world, it is drawn in the source art, and it says the entire pitch
   without a word: this agent still has a heartbeat.

   One red action, one green reading, three facts. No third button, no
   badge cluster.
   ===================================================================== */

const Hero = () => (
  <section
    id="top"
    className="grain-lit relative overflow-hidden bg-bench pb-0 pt-[7.5rem] lg:pt-[9.5rem]"
  >
    <div className="relative mx-auto w-full max-w-6xl px-fib3 sm:px-fib4">
      <div className="grid items-center gap-fib5 lg:grid-cols-golden lg:gap-fib6">
        {/* ---- The argument, in the major third ---- */}
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-fib2 rounded-sm border border-alive/25 bg-alive/[0.07] px-fib2 py-1">
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-alive" aria-hidden />
              <span className="label-mono text-alive-lit">Live on {BRAND.network}</span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-fib3 font-display text-d3 text-paper sm:text-d4 lg:text-d5">
              Give your agent
              <br />a <span className="marker-vital">heartbeat</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-fib3 max-w-[46ch] text-lead text-paper-2">
              Autonomous agents die quietly when one server bill lapses. Monkii Labs is the
              laboratory that keeps them breathing: a community supplying real browser
              compute, one heartbeat at a time.
            </p>
          </Reveal>

          <Reveal delay={0.22}>
            <div className="mt-fib4 flex flex-wrap items-center gap-fib2">
              <Link
                to="/dashboard"
                className="act group inline-flex h-11 items-center gap-2 px-fib4 text-label font-semibold"
              >
                Start nurturing
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </Link>
              <a
                href="#loop"
                className="act-quiet inline-flex h-11 items-center gap-2 px-fib4 text-label font-semibold"
              >
                How it works
                <ChevronDown className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </Reveal>

          {/* Three readings, on the thirds. Facts, not claims. */}
          <Reveal delay={0.3}>
            <dl className="mt-fib5 grid max-w-lg grid-cols-3 gap-fib3 border-t border-hair/10 pt-fib3">
              <Readout value="100ms" label="Block finality" />
              <Readout value="0 gas" label="To nurture" />
              <Readout value="3" label="Companion slots" />
            </dl>
          </Reveal>
        </div>

        {/* ---- The portrait, in the minor third ----
            Framed as a plate on the bench rather than a sticker on sky:
            hairline, one lightness step, and a single instrument tag. */}
        <Reveal delay={0.18}>
          <figure className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="overflow-hidden rounded-xl border border-hair/10 bg-bench-2">
              <img
                src={labPortrait}
                alt="A Monkii Labs scientist steadying a companion robot while its aura recharges"
                className="block h-auto w-full"
                width={1024}
                height={1280}
              />
            </div>

            <figcaption className="absolute -bottom-fib3 left-fib3 right-fib5 rounded-lg border border-hair/13 bg-bench-3 px-fib3 py-fib2">
              <div className="label-mono text-paper-3">Guardian&nbsp;#001</div>
              <div className="mt-0.5 flex items-baseline justify-between gap-fib2">
                <span className="font-display text-d1 text-paper">Vitality</span>
                <span className="font-display text-d1 tabular-nums text-alive-lit">98</span>
              </div>
              <div className="mt-fib1 flex gap-1" aria-hidden>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="h-1.5 flex-1 rounded-[1px] bg-alive" />
                ))}
              </div>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </div>

    {/* ---- The instrument ----
        Full bleed, because a trace that stops at a container edge reads
        as a chart. This one runs off both sides of the page: a signal
        passing through, not a graphic sitting on it. */}
    <div className="relative mt-fib6 lg:mt-fib7">
      <div className="mx-auto mb-fib2 flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-fib2 px-fib3 sm:px-fib4">
        <span className="label-mono text-paper-3">Proof-of-life · bay 03 · live</span>
        <span className="font-mono text-micro uppercase tracking-[0.24em] text-alive-lit">
          Thriving
        </span>
      </div>
      <VitalTrace
        variant="instrument"
        state="thriving"
        live
        label="A live vitality trace showing a thriving agent's heartbeat"
        className="h-[104px] w-full sm:h-[136px]"
      />
    </div>
  </section>
);

export default Hero;
