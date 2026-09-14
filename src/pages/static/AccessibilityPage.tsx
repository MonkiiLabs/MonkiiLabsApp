import { useTranslation } from "react-i18next";

import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function AccessibilityPage() {
  const { t } = useTranslation();

  return (
    <StaticPageShell title={t("accessibility.title")}>
      <p>{t("accessibility.p1")}</p>
      <p>{t("accessibility.p2")}</p>
      <p>{t("accessibility.p3")}</p>
    </StaticPageShell>
  );
}
