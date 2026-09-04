import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { monkiiMark, BRAND } from "@/lib/brand";

/* =====================================================================
   Landing primitives.

   Every section on the page opens the same way: an index, a hairline
   rule, a label — then a headline that occupies the left two thirds and
   a standfirst that occupies the right one. That single rule does most
   of the layout work, and it is why the page reads as one document
   rather than a stack of unrelated blocks.
   ===================================================================== */

type Tone = "paper" | "white" | "cream" | "chamber";

const TONE: Record<Tone, { section: string; rule: string; index: string; label: string; title: string; intro: string }> = {
  paper: {
    section: "bg-background text-ink",
    rule: "bg-ink/25",
    index: "text-coral",
    label: "text-claw-gray-600",
    title: "text-ink",
    intro: "text-claw-gray-600",
  },
  white: {
    section: "bg-white text-ink",
    rule: "bg-ink/25",
    index: "text-coral",
    label: "text-claw-gray-600",
    title: "text-ink",
    intro: "text-claw-gray-600",
  },
  cream: {
    section: "bg-cream text-ink",
    rule: "bg-ink/25",
    index: "text-coral",
    label: "text-claw-gray-600",
    title: "text-ink",
    intro: "text-claw-gray-600",
  },
  chamber: {
    section: "chamber-ground",
    rule: "bg-vital/40",
    index: "text-vital",
    label: "text-bone-2",
    title: "text-bone",
    intro: "text-bone-2",
  },
};

interface SectionProps {
  id?: string;
  /** Two-digit index. It is the spine of the document — always supply it. */
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
  tone = "paper",
  children,
  className = "",
}: SectionProps) => {
  const t = TONE[tone];
  return (
    <section id={id} className={`relative w-full py-fib6 lg:py-fib7 ${t.section} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-fib3 sm:px-fib4">
        <SectionHeader
          index={index}
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          tone={tone}
        />
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
  tone = "paper",
}: Pick<SectionProps, "index" | "eyebrow" | "title" | "intro" | "tone">) => {
  const t = TONE[tone];
  return (
    <header className="mb-fib5 lg:mb-fib6">
      <Reveal>
        <div className="flex items-center gap-fib2">
          {index && <span className={`label-mono ${t.index}`}>{index}</span>}
          <span className={`h-px w-fib4 ${t.rule}`} aria-hidden />
          <span className={`label-mono ${t.label}`}>{eyebrow}</span>
        </div>
      </Reveal>

      {/* Golden section: the title takes 1.618 parts, the standfirst 1.
          They meet on a baseline, not on a centre line. */}
      <div className="mt-fib3 grid gap-fib3 lg:grid-cols-golden lg:items-end lg:gap-fib5">
        <Reveal delay={0.05}>
          <h2 className={`font-display text-d2 sm:text-d3 lg:text-d4 ${t.title}`}>{title}</h2>
        </Reveal>
        {intro && (
          <Reveal delay={0.12}>
            <p className={`max-w-[42ch] text-body ${t.intro}`}>{intro}</p>
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
    transition={{ duration: 0.5, delay, ease: [0.2, 0, 0, 1] }}
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
  tone = "ink",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "bone";
  className?: string;
}) => {
  const scale = {
    sm: { text: "text-[1.0625rem]", mark: "h-[1.05em] w-[1.05em]" },
    md: { text: "text-d1", mark: "h-[1.05em] w-[1.05em]" },
    lg: { text: "text-d2 sm:text-d3", mark: "h-[1.05em] w-[1.05em]" },
  }[size];

  const first = tone === "bone" ? "text-bone" : "text-coral";
  const second = tone === "bone" ? "text-bone-2" : "text-ink";

  return (
    <span
      className={`inline-flex items-center font-display font-black leading-none tracking-[-0.03em] ${scale.text} ${className}`}
      aria-label={BRAND.name}
    >
      <span className={first}>M</span>
      {/* The source square is mostly sky. Scaling inside a clipped circle
          crops to the face, which is the only part that survives at
          nav size. */}
      <span
        className={`${scale.mark} relative mx-[0.04em] inline-block shrink-0 overflow-hidden rounded-full border-2 border-ink bg-sky align-middle`}
      >
        <img
          src={monkiiMark}
          alt=""
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[168%] w-[168%] max-w-none -translate-x-1/2 -translate-y-[46%] object-cover"
        />
      </span>
      <span className={first}>NKII</span>
      <span className={`${second} ml-[0.26em]`}>LABS</span>
    </span>
  );
};

/** A single instrument reading: value over label. Used in stat rails. */
export const Readout = ({
  value,
  label,
  tone = "ink",
}: {
  value: ReactNode;
  label: string;
  tone?: "ink" | "bone";
}) => (
  <div>
    <div
      className={`font-display text-d1 sm:text-d2 ${tone === "bone" ? "text-bone" : "text-ink"}`}
    >
      {value}
    </div>
    <div
      className={`label-mono mt-fib1 ${tone === "bone" ? "text-bone-3" : "text-claw-gray-600"}`}
    >
      {label}
    </div>
  </div>
);
