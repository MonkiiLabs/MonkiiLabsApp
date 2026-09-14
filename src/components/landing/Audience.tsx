import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";

const AUDIENCES = [
  { emoji: "🐒", key: "retail" },
  { emoji: "🤝", key: "community" },
  { emoji: "🧑‍🔬", key: "developers" },
  { emoji: "◎", key: "ecosystem" },
] as const;

const Audience = () => {
  const { t } = useTranslation();

  return (
  <Section
    eyebrow={t("audience.eyebrow")}
    title={t("audience.title")}
    className="bg-cream"
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
      {AUDIENCES.map((a, i) => (
        <Reveal key={a.key} delay={i * 0.07}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-12 h-12 rounded-2xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-xl">
                {a.emoji}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal">
                {t(`audience.groups.${a.key}.who`)}
              </h3>
            </div>
            <p className="text-sm text-claw-gray-600 leading-relaxed mb-3">
              {t(`audience.groups.${a.key}.what`)}
            </p>
            <p className="text-sm font-bold text-sky-dark leading-relaxed">
              {t(`audience.groups.${a.key}.value`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
    </Section>
  );
};

export default Audience;
