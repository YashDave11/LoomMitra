"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, { resolveInitialLanguage } from "./index";

/**
 * Wraps the app with the i18next instance.
 *
 * The instance is initialized with English so SSR and the first client
 * render agree; after mount we resolve the real language
 * (saved → browser → English) and switch. i18next re-renders consumers
 * automatically on change.
 */
export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lang = resolveInitialLanguage();
    if (lang !== i18n.language) i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
