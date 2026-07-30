// Central i18n configuration — single source of truth for supported languages.
// Add a language by extending SUPPORTED_LANGUAGES, adding a /locales/<lang>
// folder, and registering it in ./index.ts resources.

export const DEFAULT_LANGUAGE = "en";

export const SUPPORTED_LANGUAGES = ["en", "hi", "ta", "te", "bn"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Display names in each language's own script (used by the switcher). */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  te: "తెలుగు",
  bn: "বাংলা",
};

/** AsyncStorage key for the persisted language choice. */
export const LANGUAGE_STORAGE_KEY = "loommitra.lang";

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}
