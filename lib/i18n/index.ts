"use client";

// i18next initialization for LoomMitra.
//
// All translation resources are bundled statically (small JSON files per
// language + namespace under /locales). i18next falls back to English for
// any missing key, and missing keys render the English text rather than
// crashing or showing raw key paths.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  resolveInitialLanguage,
  type SupportedLanguage,
} from "./settings";

// ── English ──
import enCommon from "@/locales/en/common.json";
import enNav from "@/locales/en/nav.json";
import enAuth from "@/locales/en/auth.json";
import enWeaver from "@/locales/en/weaver.json";
import enCustomer from "@/locales/en/customer.json";
import enBusiness from "@/locales/en/business.json";
import enProduct from "@/locales/en/product.json";
import enDiscover from "@/locales/en/discover.json";
import enVerify from "@/locales/en/verify.json";
// Auction namespace currently English-only; other languages fall back to
// English (fallbackLng) until locales/<lang>/auction.json is translated.
import enAuction from "@/locales/en/auction.json";

// ── Hindi ──
import hiCommon from "@/locales/hi/common.json";
import hiNav from "@/locales/hi/nav.json";
import hiAuth from "@/locales/hi/auth.json";
import hiWeaver from "@/locales/hi/weaver.json";
import hiCustomer from "@/locales/hi/customer.json";
import hiBusiness from "@/locales/hi/business.json";
import hiProduct from "@/locales/hi/product.json";
import hiDiscover from "@/locales/hi/discover.json";
import hiVerify from "@/locales/hi/verify.json";
import hiAuction from "@/locales/hi/auction.json";

// ── Tamil ──
import taCommon from "@/locales/ta/common.json";
import taNav from "@/locales/ta/nav.json";
import taAuth from "@/locales/ta/auth.json";
import taWeaver from "@/locales/ta/weaver.json";
import taCustomer from "@/locales/ta/customer.json";
import taBusiness from "@/locales/ta/business.json";
import taProduct from "@/locales/ta/product.json";
import taDiscover from "@/locales/ta/discover.json";
import taVerify from "@/locales/ta/verify.json";
import taAuction from "@/locales/ta/auction.json";

// ── Telugu ──
import teCommon from "@/locales/te/common.json";
import teNav from "@/locales/te/nav.json";
import teAuth from "@/locales/te/auth.json";
import teWeaver from "@/locales/te/weaver.json";
import teCustomer from "@/locales/te/customer.json";
import teBusiness from "@/locales/te/business.json";
import teProduct from "@/locales/te/product.json";
import teDiscover from "@/locales/te/discover.json";
import teVerify from "@/locales/te/verify.json";
import teAuction from "@/locales/te/auction.json";

// ── Bengali ──
import bnCommon from "@/locales/bn/common.json";
import bnNav from "@/locales/bn/nav.json";
import bnAuth from "@/locales/bn/auth.json";
import bnWeaver from "@/locales/bn/weaver.json";
import bnCustomer from "@/locales/bn/customer.json";
import bnBusiness from "@/locales/bn/business.json";
import bnProduct from "@/locales/bn/product.json";
import bnDiscover from "@/locales/bn/discover.json";
import bnVerify from "@/locales/bn/verify.json";
import bnAuction from "@/locales/bn/auction.json";

export const NAMESPACES = [
  "common",
  "nav",
  "auth",
  "weaver",
  "customer",
  "business",
  "product",
  "discover",
  "verify",
  "auction",
] as const;

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    weaver: enWeaver,
    customer: enCustomer,
    business: enBusiness,
    product: enProduct,
    discover: enDiscover,
    verify: enVerify,
    auction: enAuction,
  },
  hi: {
    common: hiCommon,
    nav: hiNav,
    auth: hiAuth,
    weaver: hiWeaver,
    customer: hiCustomer,
    business: hiBusiness,
    product: hiProduct,
    discover: hiDiscover,
    verify: hiVerify,
    auction: hiAuction,
  },
  ta: {
    common: taCommon,
    nav: taNav,
    auth: taAuth,
    weaver: taWeaver,
    customer: taCustomer,
    business: taBusiness,
    product: taProduct,
    discover: taDiscover,
    verify: taVerify,
    auction: taAuction,
  },
  te: {
    common: teCommon,
    nav: teNav,
    auth: teAuth,
    weaver: teWeaver,
    customer: teCustomer,
    business: teBusiness,
    product: teProduct,
    discover: teDiscover,
    verify: teVerify,
    auction: teAuction,
  },
  bn: {
    common: bnCommon,
    nav: bnNav,
    auth: bnAuth,
    weaver: bnWeaver,
    customer: bnCustomer,
    business: bnBusiness,
    product: bnProduct,
    discover: bnDiscover,
    verify: bnVerify,
    auction: bnAuction,
  },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    // Always start on the default language so the server render and the
    // first client render match (avoids hydration mismatches). The
    // I18nProvider switches to the saved/browser language after mount.
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: "common",
    ns: [...NAMESPACES],
    interpolation: {
      // React already escapes rendered values.
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation key: ${key}`);
      }
      return key;
    },
  });
}

/** Switch language and persist the choice. */
export function changeLanguage(lang: SupportedLanguage) {
  i18n.changeLanguage(lang);
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable — language still changes for this session
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
}

export { resolveInitialLanguage };
export default i18n;
