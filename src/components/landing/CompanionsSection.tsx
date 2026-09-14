import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";
import { RARITY_ORDER, RARITY_STYLES } from "@/features/monkii/data";

const ACQUISITION = [
  { emoji: "🏅", key: "milestone" },
  { emoji: "🛒", key: "paid" },
  { emoji: "🔁", key: "secondary" },
  { emoji: "⚗️", key: "craft" },
] as const;

const CompanionsSection = () => {
  const { t } = useTranslation();

  return (
  <Section
    id="companions"
    eyebrow={t("companions.eyebrow")}
    title={t("companions.title")}
    intro={t("companions.intro")}
  >
    <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[620px] bg-white rounded-3xl border-2 border-dashboard-border overflow-hidden">
        <thead>
          <tr className="bg-cream text-left">
            <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-claw-gray-600">
              {t("companions.tableRarity")}
            </th>
            <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-claw-gray-600">
              {t("companions.tableBonus")}
            </th>
            <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-claw-gray-600">
              {t("companions.tableEffects")}
            </th>
          </tr>
        </thead>
        <tbody>
          {RARITY_ORDER.map((rarity) => {
            const s = RARITY_STYLES[rarity];
            return (
              <tr key={rarity} className="border-t-2 border-dashboard-border">
                <td className="p-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border-2 ${s.bg} ${s.text} ${s.border}`}>
                    {t(`companions.rarity.${rarity}.name`)}
                  </span>
                </td>
                <td className="p-4 text-sm font-bold text-claw-charcoal">
                  {t(`companions.rarity.${rarity}.bonus`)}
                </td>
                <td className="p-4 text-sm text-claw-gray-600">
                  {t(`companions.rarity.${rarity}.effect`)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 mt-8">
      {ACQUISITION.map((item, i) => (
        <Reveal key={item.key} delay={i * 0.07}>
          <article className="h-full bg-cream rounded-3xl border-2 border-dashboard-border p-5">
            <div className="text-2xl mb-3">{item.emoji}</div>
            <h3 className="text-sm font-extrabold text-claw-charcoal mb-1.5">
              {t(`companions.acquisition.${item.key}.title`)}
            </h3>
            <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed">
              {t(`companions.acquisition.${item.key}.body`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.15} className="mt-8">
      <div className="rounded-3xl border-2 border-coral/30 bg-coral/10 p-6">
        <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal mb-2">
          {t("companions.legendaryTitle")}
        </h3>
        <ul className="text-sm text-claw-gray-600 space-y-1.5 leading-relaxed">
          <li>{t("companions.legendary1")}</li>
          <li>{t("companions.legendary2")}</li>
          <li>{t("companions.legendary3")}</li>
        </ul>
        <p className="text-xs text-claw-gray-600 mt-4">
          {t("companions.legendaryNote")}
        </p>
      </div>
    </Reveal>
    </Section>
  );
};

export default CompanionsSection;
