import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";
import { PONS_TOKEN_ADDRESS } from "@/lib/config";

const BENEFITS = [
  { emoji: "✖️", key: "multiplier" },
  { emoji: "🔓", key: "premium" },
  { emoji: "⏳", key: "epoch" },
  { emoji: "🔎", key: "transparency" },
] as const;

const LOOP = ["nurture", "earned", "stake", "reward", "more"] as const;

const Tokens = () => {
  const { t } = useTranslation();

  return (
  <Section
    id="tokens"
    eyebrow={t("tokens.eyebrow")}
    title={t("tokens.title")}
    intro={t("tokens.intro")}
    className="bg-cream"
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
      <Reveal>
        <article className="h-full bg-white rounded-3xl border-2 border-sky/40 p-6 card-playful">
          <h3 className="text-xl font-extrabold text-sky-dark mb-2">{BRAND.rewardToken}</h3>
          <p className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-3">
            {t("tokens.rewardLabel")}
          </p>
          <p className="text-sm text-claw-gray-600 leading-relaxed">
            {t("tokens.rewardBody")}
          </p>
        </article>
      </Reveal>
      <Reveal delay={0.08}>
        <article className="h-full bg-white rounded-3xl border-2 border-coral/40 p-6 card-playful">
          <h3 className="text-xl font-extrabold text-coral-dark mb-2">{BRAND.valueToken}</h3>
          <p className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-3">
            {t("tokens.valueLabel")}
          </p>
          <p className="text-sm text-claw-gray-600 leading-relaxed">
            {t("tokens.valueBody")}
          </p>
          <p className="mt-4 text-[11px] font-mono break-all text-claw-gray-600 bg-cream rounded-xl border-2 border-dashboard-border p-3">
            {PONS_TOKEN_ADDRESS}
          </p>
        </article>
      </Reveal>
    </div>

    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 mt-6">
      {BENEFITS.map((b, i) => (
        <Reveal key={b.key} delay={i * 0.06}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-5">
            <div className="text-2xl mb-3">{b.emoji}</div>
            <h3 className="text-sm font-extrabold text-claw-charcoal mb-1.5">
              {t(`tokens.benefits.${b.key}.title`)}
            </h3>
            <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed">
              {t(`tokens.benefits.${b.key}.body`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.15} className="mt-8">
      <div className="bg-white rounded-3xl border-2 border-dashboard-border p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal mb-4">
          {t("tokens.loopTitle")}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-claw-charcoal">
          {LOOP.map((node, i) => (
            <span key={node} className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-full bg-cream border-2 border-dashboard-border">
                {t(`tokens.loop.${node}`)}
              </span>
              {i < LOOP.length - 1 && <span className="text-coral">→</span>}
            </span>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed mt-5">
          {t("tokens.loopNote")}
        </p>
      </div>
    </Reveal>
    </Section>
  );
};

export default Tokens;
