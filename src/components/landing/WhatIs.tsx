import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";

const GAPS = [
  { emoji: "🪫", key: "sustainability" },
  { emoji: "🙉", key: "engagement" },
  { emoji: "🔍", key: "visibility" },
] as const;

const WhatIs = () => {
  const { t } = useTranslation();

  return (
  <Section
    id="what-is"
    eyebrow={t("whatIs.eyebrow")}
    title={t("whatIs.title")}
    intro={t("whatIs.intro")}
    className="bg-cream"
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
      {GAPS.map((gap, i) => (
        <Reveal key={gap.key} delay={i * 0.08}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="w-14 h-14 rounded-2xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-2xl mb-4">
              {gap.emoji}
            </div>
            <h3 className="text-lg font-extrabold text-claw-charcoal mb-2">
              {t(`whatIs.gaps.${gap.key}.title`)}
            </h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">
              {t(`whatIs.gaps.${gap.key}.body`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.2} className="mt-8">
      <div className="bg-white rounded-3xl border-2 border-dashboard-border p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-extrabold text-claw-charcoal mb-3">
          {t("whatIs.ambitionTitle")}
        </h3>
        <p className="text-sm sm:text-base text-claw-gray-600 leading-relaxed">
          {t("whatIs.ambitionBody")}
        </p>
      </div>
    </Reveal>
    </Section>
  );
};

export default WhatIs;
