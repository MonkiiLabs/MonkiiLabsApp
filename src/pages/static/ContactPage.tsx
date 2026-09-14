import { useTranslation } from "react-i18next";

import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <StaticPageShell title={t("contact.title")}>
      <p>{t("contact.p1")}</p>
      <p className="font-semibold">
        {t("contact.emailLabel")}{" "}
        <span className="font-mono">support@monkiilabs.example</span>
      </p>
      <p>{t("contact.p2")}</p>
      <p className="text-xs text-claw-gray-600">{t("contact.note")}</p>
    </StaticPageShell>
  );
}
