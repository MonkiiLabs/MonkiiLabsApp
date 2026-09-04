import { Link } from "react-router-dom";
import { ArrowUpRight, Heart } from "lucide-react";

import { BRAND, monkiiMark } from "@/lib/brand";
import { Reveal } from "@/components/landing/Section";

/* =====================================================================
   Close.

   The bookend to the hero: back on sky, back to one action. Centred
   here, and only here — the whole page has been asymmetric, so
   symmetry reads as arrival rather than as the default.
   ===================================================================== */

const CTA = () => (
  <section id="cta" className="relative overflow-hidden sky-gradient py-fib6 lg:py-fib7">
    <div className="mx-auto w-full max-w-3xl px-fib3 text-center sm:px-fib4">
      <Reveal>
        <img
          src={monkiiMark}
          alt=""
          aria-hidden
          className="mx-auto h-fib7 w-fib7 animate-float rounded-full border-2 border-ink object-cover shadow-ink-lg"
        />
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="mt-fib4 font-display text-d3 text-ink sm:text-d4">
          An agent is waiting
          <br className="hidden sm:block" /> on somebody. Be somebody.
        </h2>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="mx-auto mt-fib3 max-w-[46ch] text-lead text-claw-gray-900">
          Connect a wallet, start a heartbeat, and keep something alive that would
          otherwise go quiet.
        </p>
      </Reveal>

      <Reveal delay={0.22}>
        <div className="mt-fib4 flex flex-wrap items-center justify-center gap-fib2">
          <Link
            to="/dashboard"
            className="ink-slab group inline-flex items-center gap-2 px-fib4 py-fib2 text-label font-bold uppercase tracking-[0.1em]"
          >
            <Heart className="h-4 w-4 animate-heartbeat" strokeWidth={2.5} />
            Enter the lab
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45"
              strokeWidth={2.5}
            />
          </Link>
          <Link
            to="/about"
            className="ink-slab-ghost inline-flex items-center gap-2 px-fib4 py-fib2 text-label font-bold uppercase tracking-[0.1em]"
          >
            Read the brief
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <p className="label-mono mt-fib4 text-claw-sky-dark">
          {BRAND.rewardToken} is a compute receipt, not an investment.
        </p>
      </Reveal>
    </div>
  </section>
);

export default CTA;
