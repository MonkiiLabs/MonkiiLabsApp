import { useTranslation } from "react-i18next";

import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <StaticPageShell title={t("about.title")} eyebrow={t("about.eyebrow")}>
      <p>{t("about.p1")}</p>

      <h2>{t("about.h1")}</h2>
      <p>
        <strong>{t("about.sustainabilityLabel")}</strong> {t("about.sustainability")}
      </p>
      <p>
        <strong>{t("about.engagementLabel")}</strong> {t("about.engagement")}
      </p>
      <p>
        <strong>{t("about.visibilityLabel")}</strong> {t("about.visibility")}
      </p>

      <h2>{t("about.h2")}</h2>
      <p>{t("about.p2")}</p>

      <h2>{t("about.h3")}</h2>
      <p>{t("about.p3")}</p>

      <h2>{t("about.h4")}</h2>
      <p>{t("about.p4")}</p>
      <p>{t("about.p5")}</p>

      <p>
        {t("about.p6a")} <a href="/terms">{t("about.p6link")}</a>
        {t("about.p6b")}
      </p>
    </StaticPageShell>
  );
}
