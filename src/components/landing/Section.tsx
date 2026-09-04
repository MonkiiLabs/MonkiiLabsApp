import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { monkiiMark, BRAND } from "@/lib/brand";

/* =====================================================================
   Landing primitives.

   The page used to alternate four grounds (sky, paper, cream, white)
   with one dark section punched into the middle. That was the cartoon
   read: a bright poster with a cockpit bolted on. The whole page now
   lives on the bench, and sections separate by *lightness* instead, one
   or two points apart. You feel the boundary; you never see a seam.

   Every section still opens the same way: an index, a hairline, a label,
   then a headline in the left two thirds with the standfirst in the
   right. That rule does most of the layout work, and it is why the page
   reads as one document rather than a stack of blocks.
   ===================================================================== */

type Tone = "bench" | "raised" | "lit";

const TONE: Record<Tone, { section: string; rule: string; index: string }> = {
  // The default ground.
  bench: { section: "bg-bench", rule: "bg-hair/15", index: "text-act-lit" },
  // One step up. Used where a section is a specimen tray rather than a
  // page: companions, roadmap.
  raised: { section: "bg-bench-2", rule: "bg-hair/15", index: "text-act-lit" },
  // The loop. The only section where green leads, because it is the only
  // section about something being alive.
  lit: { section: "bg-bench", rule: "bg-alive/40", index: "text-alive-lit" },
};

interface SectionProps {
  id?: string;
  /** Two-digit index. It is the spine of the document, always supply it. */
  index?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export const Section = ({
  id,
  index,
  eyebrow,
  title,
  intro,
  tone = "bench",
  children,
  className = "",
}: SectionProps) => {
  const t = TONE[tone];
  return (
    <section
      id={id}
      className={`relative w-full border-t border-hair/[0.06] py-fib6 lg:py-fib7 ${t.section} ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl px-fib3 sm:px-fib4">
        <SectionHeader index={index} eyebrow={eyebrow} title={title} intro={intro} tone={tone} />
        {children}
      </div>
    </section>
  );
};

export const SectionHeader = ({
  index,
  eyebrow,
  title,
  intro,
  tone = "bench",
}: Pick<SectionProps, "index" | "eyebrow" | "title" | "intro" | "tone">) => {
  const t = TONE[tone];
  return (
    <header className="mb-fib5 lg:mb-fib6">
      <Reveal>
        <div className="flex items-center gap-fib2">
          {index && <span className={`label-mono ${t.index}`}>{index}</span>}
          <span className={`h-px w-fib4 ${t.rule}`} aria-hidden />
          <span className="label-mono text-paper-3">{eyebrow}</span>
        </div>
      </Reveal>

      {/* Golden section: the title takes 1.618 parts, the standfirst 1.
          They meet on a baseline, not on a centre line. */}
      <div className="mt-fib3 grid gap-fib3 lg:grid-cols-golden lg:items-end lg:gap-fib5">
        <Reveal delay={0.05}>
          <h2 className="font-display text-d2 text-paper sm:text-d3 lg:text-d4">{title}</h2>
        </Reveal>
        {intro && (
          <Reveal delay={0.12}>
            <p className="max-w-[42ch] text-body text-paper-2">{intro}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
};

export const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 13 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

/**
 * The wordmark, built the way the brand spec asks for it: the scientist
 * face stands in for the O. Type carries the rest, so it stays crisp at
 * every size and needs no bitmap.
 */
export const Wordmark = ({
  size = "md",
  tone = "paper",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "paper" | "bone";
  className?: string;
}) => {
  const scale = {
    sm: { text: "text-[1.0625rem]", mark: "h-[1.05em] w-[1.05em]" },
    md: { text: "text-d1", mark: "h-[1.05em] w-[1.05em]" },
    lg: { text: "text-d2 sm:text-d3", mark: "h-[1.05em] w-[1.05em]" },
  }[size];

  return (
    <span
      className={`inline-flex items-center font-display font-extrabold leading-none tracking-[-0.03em] ${scale.text} ${className}`}
      aria-label={BRAND.name}
    >
      <span className="text-paper">M</span>
      {/* The source square is mostly sky. Scaling inside a clipped circle
          crops to the face, which is the only part that survives at
          nav size. */}
      <span
        className={`${scale.mark} relative mx-[0.04em] inline-block shrink-0 overflow-hidden rounded-full border border-hair/20 bg-bench-3 align-middle`}
      >
        <img
          src={monkiiMark}
          alt=""
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[168%] w-[168%] max-w-none -translate-x-1/2 -translate-y-[46%] object-cover"
        />
      </span>
      <span className="text-paper">NKII</span>
      <span className="ml-[0.26em] text-paper-3">LABS</span>
    </span>
  );
};

/** A single instrument reading: value over label. Used in stat rails. */
export const Readout = ({
  value,
  label,
  tone = "paper",
}: {
  value: ReactNode;
  label: string;
  tone?: "paper" | "alive" | "brass";
}) => (
  <div>
    <div
      className={`font-display text-d1 tabular-nums sm:text-d2 ${
        tone === "alive" ? "text-alive-lit" : tone === "brass" ? "text-brass" : "text-paper"
      }`}
    >
      {value}
    </div>
    <div className="label-mono mt-fib1 text-paper-3">{label}</div>
  </div>
);
