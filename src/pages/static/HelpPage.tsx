import { useTranslation } from "react-i18next";

import { StaticPageShell } from "@/pages/static/StaticPageShell";

/* Six entries, numbered rather than named, because the order is the reading
   order and the text itself lives in the locale bundle. */
const FAQ = ["1", "2", "3", "4", "5", "6"] as const;

export default function HelpPage() {
  const { t } = useTranslation();

  return (
    <StaticPageShell title={t("help.title")}>
      {FAQ.map((n) => (
        <div key={n}>
          <h2 className="text-base sm:text-lg font-extrabold text-claw-charcoal">
            {t(`help.q${n}`)}
          </h2>
          <p className="mt-1">{t(`help.a${n}`)}</p>
        </div>
      ))}
    </StaticPageShell>
  );
}
