import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { BRAND, monkiiMark } from "@/lib/brand";
import { Reveal } from "@/components/landing/Section";
import { VitalTrace } from "@/components/landing/VitalTrace";

/* =====================================================================
   Close.

   The bookend to the hero, and the trace's last placement. The page
   opened on a thriving trace and it closes on one: the argument in
   between is what happens if nobody keeps it running.

   Centred here, and only here. The whole page has been asymmetric, so
   symmetry reads as arrival rather than as the default.
   ===================================================================== */

const CTA = () => (
  <section id="cta" className="lamp relative overflow-hidden border-t border-hair/[0.06] bg-bench py-fib6 lg:py-fib7">
    <div className="relative mx-auto w-full max-w-3xl px-fib3 text-center sm:px-fib4">
      <Reveal>
        <img
          src={monkiiMark}
          alt=""
          aria-hidden
          className="mx-auto h-fib6 w-fib6 rounded-full border border-hair/13 object-cover"
        />
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="mt-fib4 font-display text-d3 text-paper sm:text-d4">
          An agent is waiting
          <br className="hidden sm:block" /> on somebody. Be somebody.
        </h2>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="mx-auto mt-fib3 max-w-[46ch] text-lead text-paper-2">
          Connect a wallet, start a heartbeat, and keep something alive that would
          otherwise go quiet.
        </p>
      </Reveal>

      <Reveal delay={0.22}>
        <div className="mt-fib4 flex flex-wrap items-center justify-center gap-fib2">
          <Link
            to="/dashboard"
            className="act group inline-flex h-11 items-center gap-2 px-fib4 text-label font-semibold"
          >
            Enter the lab
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
            />
          </Link>
          <Link
            to="/about"
            className="act-quiet inline-flex h-11 items-center gap-2 px-fib4 text-label font-semibold"
          >
            Read the brief
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <p className="label-mono mt-fib4 text-paper-4">
          {BRAND.rewardToken} is a compute receipt, not an investment.
        </p>
      </Reveal>
    </div>

    <div className="mt-fib5">
      <VitalTrace variant="rule" state="thriving" live className="h-10 w-full" />
    </div>
  </section>
);

export default CTA;
