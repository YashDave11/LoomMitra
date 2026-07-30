// i18n configuration for React Native.
// Same namespaces and locale files as the web app; loaded via require() so
// Metro bundles them at build time (no dynamic filesystem reads on device).

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SupportedLanguage } from "./settings";
import { DEFAULT_LANGUAGE, isSupportedLanguage, LANGUAGE_STORAGE_KEY } from "./settings";

// ── Locale bundles (Metro-bundled) ──────────────────────────────────────────

const resources = {
  en: {
    common: require("../../../../locales/en/common.json"),
    auth: require("../../../../locales/en/auth.json"),
    nav: require("../../../../locales/en/nav.json"),
    product: require("../../../../locales/en/product.json"),
    weaver: require("../../../../locales/en/weaver.json"),
    customer: require("../../../../locales/en/customer.json"),
    business: require("../../../../locales/en/business.json"),
    auction: require("../../../../locales/en/auction.json"),
    discover: require("../../../../locales/en/discover.json"),
    verify: require("../../../../locales/en/verify.json"),
  },
  hi: {
    common: require("../../../../locales/hi/common.json"),
    auth: require("../../../../locales/hi/auth.json"),
    nav: require("../../../../locales/hi/nav.json"),
    product: require("../../../../locales/hi/product.json"),
    weaver: require("../../../../locales/hi/weaver.json"),
    customer: require("../../../../locales/hi/customer.json"),
    business: require("../../../../locales/hi/business.json"),
    auction: require("../../../../locales/hi/auction.json"),
    discover: require("../../../../locales/hi/discover.json"),
    verify: require("../../../../locales/hi/verify.json"),
  },
  ta: {
    common: require("../../../../locales/ta/common.json"),
    auth: require("../../../../locales/ta/auth.json"),
    nav: require("../../../../locales/ta/nav.json"),
    product: require("../../../../locales/ta/product.json"),
    weaver: require("../../../../locales/ta/weaver.json"),
    customer: require("../../../../locales/ta/customer.json"),
    business: require("../../../../locales/ta/business.json"),
    auction: require("../../../../locales/ta/auction.json"),
    discover: require("../../../../locales/ta/discover.json"),
    verify: require("../../../../locales/ta/verify.json"),
  },
  te: {
    common: require("../../../../locales/te/common.json"),
    auth: require("../../../../locales/te/auth.json"),
    nav: require("../../../../locales/te/nav.json"),
    product: require("../../../../locales/te/product.json"),
    weaver: require("../../../../locales/te/weaver.json"),
    customer: require("../../../../locales/te/customer.json"),
    business: require("../../../../locales/te/business.json"),
    auction: require("../../../../locales/te/auction.json"),
    discover: require("../../../../locales/te/discover.json"),
    verify: require("../../../../locales/te/verify.json"),
  },
  bn: {
    common: require("../../../../locales/bn/common.json"),
    auth: require("../../../../locales/bn/auth.json"),
    nav: require("../../../../locales/bn/nav.json"),
    product: require("../../../../locales/bn/product.json"),
    weaver: require("../../../../locales/bn/weaver.json"),
    customer: require("../../../../locales/bn/customer.json"),
    business: require("../../../../locales/bn/business.json"),
    auction: require("../../../../locales/bn/auction.json"),
    discover: require("../../../../locales/bn/discover.json"),
    verify: require("../../../../locales/bn/verify.json"),
  },
};

async function resolveLanguage(): Promise<SupportedLanguage> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && isSupportedLanguage(saved)) return saved;
  } catch {}

  const tag = Localization.getLocales()[0]?.languageCode ?? "";
  const base = tag.toLowerCase().split("-")[0];
  if (isSupportedLanguage(base)) return base;

  return DEFAULT_LANGUAGE;
}

export async function initI18n(): Promise<void> {
  const lng = await resolveLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: "common",
    compatibilityJSON: 'v3',
    interpolation: { escapeValue: false },
  });
}

export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export { i18n };
