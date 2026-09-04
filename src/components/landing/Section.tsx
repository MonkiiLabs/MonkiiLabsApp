import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BRAND, monkiiLogo } from "@/lib/brand";

interface SectionProps {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Section = ({ id, eyebrow, title, intro, children, className = "" }: SectionProps) => (
  <section id={id} className={`w-full py-16 sm:py-24 px-4 sm:px-6 ${className}`}>
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="max-w-3xl mb-10 sm:mb-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-sky/15 border-2 border-sky/30 text-xs font-extrabold uppercase tracking-wider text-sky-dark">
          {eyebrow}
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-claw-charcoal leading-tight">
          {title}
        </h2>
        {intro && (
          <p className="mt-4 text-sm sm:text-base md:text-lg text-claw-gray-600 leading-relaxed">{intro}</p>
        )}
      </motion.div>
      {children}
    </div>
  </section>
);

export const Reveal = ({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.45, delay }}
  >
    {children}
  </motion.div>
);

/**
 * The wordmark: the mascot tile, then MONKII LABS set in Nunito with the
 * first word in coral. The dashboard header and the landing navbar both
 * use it, so it lives here next to the other shared landing furniture.
 */
export const Wordmark = ({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const scale = {
    sm: { text: "text-base sm:text-lg", mark: "w-8 h-8 sm:w-9 sm:h-9", radius: "rounded-lg" },
    md: { text: "text-lg sm:text-xl", mark: "w-10 h-10 sm:w-12 sm:h-12", radius: "rounded-xl" },
    lg: { text: "text-2xl sm:text-3xl", mark: "w-14 h-14 sm:w-16 sm:h-16", radius: "rounded-2xl" },
  }[size];

  return (
    <span className={`inline-flex items-center gap-2 sm:gap-3 ${className}`} aria-label={BRAND.name}>
      <img
        src={monkiiLogo}
        alt=""
        aria-hidden
        className={`${scale.mark} ${scale.radius} shrink-0 object-cover shadow-playful transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
      />
      <span className={`font-extrabold tracking-tight ${scale.text}`}>
        <span className="text-coral">{BRAND.first}</span>
        <span className="text-claw-charcoal"> {BRAND.second}</span>
      </span>
    </span>
  );
};
