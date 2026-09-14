import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { BRAND } from "@/lib/brand";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "中文", short: "中" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const STORAGE_KEY = "monkii.lang";

/**
 * Brand nouns are interpolated rather than translated.
 *
 * "$MONKI", "$PONS" and the wordmark are the same in every language, and
 * they appear in dozens of strings. Holding them here means a rename lands
 * in one place instead of being re-typed across two locale files, and it
 * keeps a translator from having to preserve a ticker symbol by hand.
 */
const defaultVariables = {
  brand: BRAND.name,
  rewardToken: BRAND.rewardToken,
  valueToken: BRAND.valueToken,
  network: BRAND.network,
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    // A browser reporting zh-CN, zh-TW or zh-Hans should all resolve to the
    // single "zh" bundle rather than falling through to English.
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      // React escapes for us; escaping again turns an apostrophe into &#39;.
      escapeValue: false,
      defaultVariables,
    },
    returnEmptyString: false,
  });

/** Keep the document language in sync so screen readers and CJK font stacks resolve. */
function applyDocumentLanguage(lng: string) {
  if (typeof document === "undefined") return;
  const base = lng.split("-")[0];
  document.documentElement.lang = base === "zh" ? "zh-Hans" : base;
}

applyDocumentLanguage(i18n.resolvedLanguage ?? "en");
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
