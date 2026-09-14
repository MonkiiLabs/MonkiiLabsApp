import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";

const QUARTERS = [
  { q: "Q1", key: "q1" },
  { q: "Q2", key: "q2" },
  { q: "Q3", key: "q3" },
  { q: "Q4", key: "q4" },
] as const;

const PHASES = ["p1", "p2", "p3"] as const;

const Roadmap = () => {
  const { t } = useTranslation();

  return (
  <Section
    id="roadmap"
    eyebrow={t("roadmap.eyebrow")}
    title={t("roadmap.title")}
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
      {QUARTERS.map((q, i) => (
        <Reveal key={q.q} delay={i * 0.06}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <span className="inline-block px-3 py-1 rounded-full bg-coral text-white text-xs font-extrabold mb-3">
              {q.q}
            </span>
            <h3 className="text-base font-extrabold text-claw-charcoal mb-2">
              {t(`roadmap.quarters.${q.key}.theme`)}
            </h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">
              {t(`roadmap.quarters.${q.key}.items`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>

    <div className="grid gap-4 sm:gap-5 md:grid-cols-3 mt-6">
      {PHASES.map((phase, i) => (
        <Reveal key={phase} delay={i * 0.07}>
          <article className="h-full bg-cream rounded-3xl border-2 border-dashboard-border p-5">
            <h3 className="text-sm font-extrabold text-sky-dark mb-2">
              {t(`roadmap.phases.${phase}.name`)}
            </h3>
            <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed">
              {t(`roadmap.phases.${phase}.items`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
    </Section>
  );
};

export default Roadmap;
