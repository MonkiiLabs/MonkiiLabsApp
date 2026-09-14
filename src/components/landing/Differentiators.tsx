import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";

const POINTS = [
  { emoji: "🛠️", key: "maintenance" },
  { emoji: "🥚", key: "framing" },
  { emoji: "🪶", key: "light" },
  { emoji: "📦", key: "footprint" },
  { emoji: "🫂", key: "community" },
  { emoji: "🏆", key: "collectible" },
] as const;

const Differentiators = () => {
  const { t } = useTranslation();

  return (
  <Section
    eyebrow={t("differentiators.eyebrow")}
    title={t("differentiators.title")}
    intro={t("differentiators.intro")}
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {POINTS.map((p, i) => (
        <Reveal key={p.key} delay={i * 0.06}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="text-2xl mb-3">{p.emoji}</div>
            <h3 className="text-base font-extrabold text-claw-charcoal mb-2">
              {t(`differentiators.points.${p.key}.title`)}
            </h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">
              {t(`differentiators.points.${p.key}.body`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
    </Section>
  );
};

export default Differentiators;
