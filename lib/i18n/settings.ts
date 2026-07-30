// Central i18n configuration — single source of truth for supported
// languages. Add a new language by extending SUPPORTED_LANGUAGES and
// adding a matching folder under /locales.

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

/** localStorage key for the persisted language choice. */
export const LANGUAGE_STORAGE_KEY = "loommitra.lang";

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

/**
 * Resolve the initial language:
 * 1. saved choice in localStorage
 * 2. browser language (base tag, e.g. "hi-IN" → "hi") if supported
 * 3. English
 * Safe to call on the server (returns the default).
 */
export function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && isSupportedLanguage(saved)) return saved;
  } catch {
    // localStorage unavailable (private mode etc.) — fall through
  }

  const candidates = navigator.languages ?? [navigator.language];
  for (const tag of candidates) {
    const base = tag?.toLowerCase().split("-")[0];
    if (base && isSupportedLanguage(base)) return base;
  }

  return DEFAULT_LANGUAGE;
}
