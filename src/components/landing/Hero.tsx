import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Heart } from "lucide-react";

import { BRAND, labPortrait } from "@/lib/brand";
import { Readout, Reveal } from "@/components/landing/Section";

/* =====================================================================
   Hero.

   Composition follows the golden section rather than a centred stack:
   the argument sits in the left 1.618 parts, the portrait in the right 1.
   The headline's baseline lands near the upper third of the viewport, so
   the eye enters at the strongest point of the frame and travels down
   and right into the illustration — the same diagonal the scientist in
   the artwork is already looking along.

   Everything else is held back. One red action, one green word, three
   readings. No third button, no badge cluster, no floating emoji.
   ===================================================================== */

const CLOUDS = [
  { top: "9%", width: "w-40", delay: "0s", dur: "82s", opacity: "opacity-90" },
  { top: "26%", width: "w-24", delay: "-30s", dur: "104s", opacity: "opacity-70" },
  { top: "58%", width: "w-52", delay: "-58s", dur: "126s", opacity: "opacity-60" },
];

/** A flat white cloud, drawn the way the source art draws them. */
const Cloud = ({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg viewBox="0 0 220 92" className={className} style={style} fill="white" aria-hidden>
    <ellipse cx="62" cy="58" rx="46" ry="30" />
    <ellipse cx="114" cy="40" rx="40" ry="34" />
    <ellipse cx="162" cy="60" rx="42" ry="28" />
    <rect x="32" y="56" width="156" height="32" rx="16" />
  </svg>
);

const Hero = () => {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      className="hero-gradient relative overflow-hidden pb-fib6 pt-[7.5rem] lg:pb-fib7 lg:pt-[9.5rem]"
    >
      {/* Sky lives on the section itself — a negative z-index here would
          drop it behind the page background instead of behind the copy. */}
      {!reduced &&
        CLOUDS.map((c, i) => (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 hidden md:block"
            style={{ top: c.top }}
          >
            <Cloud
              className={`${c.width} h-auto animate-cloud-drift ${c.opacity}`}
              style={{ animationDelay: c.delay, animationDuration: c.dur }}
            />
          </div>
        ))}

      <div className="relative mx-auto w-full max-w-6xl px-fib3 sm:px-fib4">
        <div className="grid items-center gap-fib5 lg:grid-cols-golden lg:gap-fib6">
          {/* ---- The argument, in the major third ---- */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-fib2 rounded-full border border-ink/15 bg-white/90 px-fib3 py-1.5 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vital-deep opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-vital-deep" />
                </span>
                <span className="label-mono text-ink">Live on {BRAND.network}</span>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-fib3 font-display text-d3 text-ink sm:text-d4 lg:text-d5">
                Give your agent
                <br />a <span className="marker-vital">heartbeat</span>.
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-fib3 max-w-[46ch] text-lead text-claw-gray-900">
                Autonomous agents die quietly when one server bill lapses. Monkii Labs is
                the laboratory that keeps them breathing — a community supplying real
                browser compute, one heartbeat at a time.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-fib4 flex flex-wrap items-center gap-fib2">
                <Link
                  to="/dashboard"
                  className="ink-slab group inline-flex items-center gap-2 px-fib4 py-fib2 text-label font-bold uppercase tracking-[0.1em]"
                >
                  <Heart className="h-4 w-4 animate-heartbeat" strokeWidth={2.5} />
                  Start nurturing
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45"
                    strokeWidth={2.5}
                  />
                </Link>
                <a
                  href="#loop"
                  className="ink-slab-ghost inline-flex items-center gap-2 px-fib4 py-fib2 text-label font-bold uppercase tracking-[0.1em]"
                >
                  How it works
                  <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
                </a>
              </div>
            </Reveal>

            {/* Three readings, on the thirds. Facts, not claims. */}
            <Reveal delay={0.3}>
              <dl className="mt-fib5 grid max-w-lg grid-cols-3 gap-fib3 border-t-2 border-ink/20 pt-fib3">
                <Readout value="100ms" label="Block finality" />
                <Readout value="0 gas" label="To nurture" />
                <Readout value="3" label="Companion slots" />
              </dl>
            </Reveal>
          </div>

          {/* ---- The portrait, in the minor third ---- */}
          <Reveal delay={0.18}>
            <motion.figure
              className="relative mx-auto w-full max-w-sm lg:max-w-none"
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="overflow-hidden rounded-2xl border border-ink/15 bg-sky/20 shadow-2xl backdrop-blur-sm">
                <img
                  src={labPortrait}
                  alt="A Monkii Labs scientist steadying a companion robot while its aura recharges"
                  className="block h-auto w-full"
                  width={1024}
                  height={1280}
                />
              </div>

              {/* A single instrument tag, pinned to the lower-left third of
                  the frame — the only overlay the image gets. */}
              <figcaption className="absolute -bottom-fib3 left-fib3 right-fib5 rounded-xl border-2 border-ink bg-white px-fib3 py-fib2 shadow-ink">
                <div className="label-mono text-claw-gray-600">Guardian&nbsp;#001</div>
                <div className="mt-0.5 flex items-baseline justify-between gap-fib2">
                  <span className="font-display text-d1 text-ink">Vitality</span>
                  <span className="font-display text-d1 text-vital-deep">98%</span>
                </div>
                <div className="mt-fib1 flex gap-1" aria-hidden>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 flex-1 rounded-sm border border-ink ${
                        i < 7 ? "bg-vital-deep" : "bg-cream-dark"
                      }`}
                    />
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Hero;
