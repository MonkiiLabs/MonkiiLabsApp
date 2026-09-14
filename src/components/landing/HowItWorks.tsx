import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";

const STEPS = [
  { emoji: "🔐", key: "connect" },
  { emoji: "🫀", key: "heartbeat" },
  { emoji: "📈", key: "power" },
  { emoji: "🏦", key: "stake" },
  { emoji: "💸", key: "earn" },
  { emoji: "🍌", key: "equip" },
] as const;

const HowItWorks = () => {
  const { t } = useTranslation();

  return (
  <Section
    id="how-it-works"
    eyebrow={t("howItWorks.eyebrow")}
    title={t("howItWorks.title")}
    intro={t("howItWorks.intro")}
    className="bg-cream"
  >
    <ol className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {STEPS.map((step, i) => (
        <Reveal key={step.key} delay={i * 0.06}>
          <li className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-6 card-playful">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-2xl bg-coral text-white font-extrabold flex items-center justify-center shadow-coral">
                {i + 1}
              </span>
              <span className="text-2xl">{step.emoji}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal mb-2">
              {t(`howItWorks.steps.${step.key}.title`)}
            </h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">
              {t(`howItWorks.steps.${step.key}.body`)}
            </p>
          </li>
        </Reveal>
      ))}
    </ol>
    </Section>
  );
};

export default HowItWorks;
