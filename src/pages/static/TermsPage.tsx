import { useTranslation } from "react-i18next";

import { StaticPageShell } from "@/pages/static/StaticPageShell";

/* Nine numbered sections. The numbers are the reading order of a legal
   document, so they carry real structure rather than decoration. */
const SECTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <StaticPageShell title={t("terms.title")} eyebrow={t("terms.eyebrow")}>
      <p>{t("terms.intro")}</p>

      {SECTIONS.map((n) => (
        <div key={n}>
          <h2>{t(`terms.h${n}`)}</h2>
          <p>{t(`terms.p${n}`)}</p>
        </div>
      ))}

      <p>
        {t("terms.closeA")} <a href="/contact">{t("terms.closeLink")}</a>
        {t("terms.closeB")}
      </p>
    </StaticPageShell>
  );
}
