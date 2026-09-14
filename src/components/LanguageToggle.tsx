import { useTranslation } from "react-i18next";

import { SUPPORTED_LANGUAGES } from "@/i18n";

/**
 * Two-state language switch.
 *
 * A segmented control rather than a dropdown: with exactly two languages a
 * menu costs an extra click to show one option, and the current language is
 * worth reading at a glance rather than hiding behind a globe icon.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const active = (i18n.resolvedLanguage ?? "en").split("-")[0];

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={`inline-flex items-center rounded-full border-2 border-dashboard-border bg-white/90 p-0.5 backdrop-blur ${className}`}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const selected = active === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            lang={lang.code === "zh" ? "zh-Hans" : lang.code}
            aria-pressed={selected}
            onClick={() => void i18n.changeLanguage(lang.code)}
            className={`rounded-full px-2.5 py-1 text-xs font-extrabold transition-colors duration-200 ${
              selected
                ? "bg-coral text-white"
                : "text-claw-gray-600 hover:text-coral"
            }`}
          >
            {lang.short}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageToggle;
