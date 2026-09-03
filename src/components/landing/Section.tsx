import { motion } from "framer-motion";
import type { ReactNode } from "react";

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
