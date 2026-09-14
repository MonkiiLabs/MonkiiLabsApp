import { useTranslation } from "react-i18next";

import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <StaticPageShell title={t("privacy.title")}>
      <p>{t("privacy.p1")}</p>
      <p>{t("privacy.p2")}</p>
      <p>{t("privacy.p3")}</p>
    </StaticPageShell>
  );
}
