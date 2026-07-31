// Central product options library for LoomMitra.
//
// Every static option list a weaver picks from lives here. Options store a
// stable `value` (the code persisted to the DB) plus a `labelKey` (the i18n
// key used to render it). No literal user-facing English lives in this file —
// labels come from /locales/<lang>/product.json.

import type { ProductType } from "./types";

export interface ProductOption {
  value: string;
  labelKey: string;
}

/** Minimal shape of i18next's `t` — avoids importing its generic types. */
type Translate = (key: string, opts?: Record<string, unknown>) => string;

function group(name: string, values: string[]): ProductOption[] {
  return values.map((value) => ({
    value,
    labelKey: `product:${name}.${value.toLowerCase()}`,
  }));
}

/**
 * Label for an option code. Falls back to the raw code so legacy free-text
 * rows (written before the options library existed) still render readably
 * instead of showing a raw key path.
 */
export function optionLabel(t: Translate, name: string, code: string): string {
  if (!code) return "";
  const key = `product:${name}.${code.toLowerCase()}`;
  const translated = t(key, { defaultValue: code });
  
  // If the translation engine fails to fall back and returns the raw key path
  if (translated === key || translated === `${name}.${code.toLowerCase()}`) {
    // Return a nicely capitalized version of the code
    return code
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  return translated;
}

// ── A) Identification ──

/** Category reuses the existing ProductType enum codes. */
export const CATEGORIES = group("category", [
  "SAREE",
  "DUPATTA",
  "STOLE",
  "MUFFLER",
  "FABRIC",
  "OTHER",
] satisfies ProductType[]);

export const SUBCATEGORIES: Record<ProductType, ProductOption[]> = {
  SAREE: group("subcategory", [
    "cotton_saree",
    "silk_saree",
    "cotton_silk_saree",
    "linen_saree",
    "tussar_saree",
  ]),
  DUPATTA: group("subcategory", ["cotton_dupatta", "silk_dupatta", "wool_dupatta"]),
  STOLE: group("subcategory", ["cotton_stole", "silk_stole", "wool_stole"]),
  MUFFLER: group("subcategory", ["cotton_muffler", "wool_muffler"]),
  FABRIC: group("subcategory", ["running_fabric", "yardage", "furnishing"]),
  OTHER: [],
};

export const CRAFT_CLUSTERS = group("cluster", [
  "chanderi",
  "maheshwari",
  "kanchipuram",
  "banarasi",
  "pochampally",
  "bhagalpur",
  "kullu",
  "kota_doria",
  "sambalpuri",
  "venkatagiri",
  "uppada",
  "jamdani",
  "ilkal",
  "mangalagiri",
  "bomkai",
  "patan_patola",
  "muga_assam",
  "independent",
  "other",
]);

export const COLORS = group("color", [
  "red",
  "maroon",
  "pink",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "black",
  "white",
  "cream",
  "grey",
  "brown",
  "gold",
  "silver",
  "multicolor",
]);

export const PATTERNS = group("pattern", [
  "plain",
  "checks",
  "stripes",
  "floral",
  "temple_border",
  "zari_border",
  "buti",
  "geometric",
  "ikat",
  "other",
]);

// ── B) Material ──

export const FABRIC_MATERIALS = group("material", [
  "cotton",
  "silk",
  "cotton_silk",
  "linen",
  "wool",
  "tussar",
  "jute",
  "blend",
  "other",
]);

// ── C) Pricing ──

export const CURRENCIES = group("currency", ["INR"]);
export const DEFAULT_CURRENCY = "INR";

// ── D) Production ──

export const STOCK_TYPES = group("stock_type", ["ready_stock", "made_to_order"]);

// ── F) Target buyer ──

export const TARGET_AUDIENCES = group("target_audience", [
  "women",
  "men",
  "unisex",
  "kids",
  "home_decor",
  "fabric",
]);

export const USAGE_CONTEXTS = group("usage_context", [
  "daily_wear",
  "festive",
  "bridal",
  "office",
  "export",
  "other",
]);

// ── G) Listing status ──
// Maps to the existing ProductStatus enum: DRAFT | READY | ARCHIVED, where
// READY is what the marketplace treats as "published".
export const STATUSES = group("status", ["DRAFT", "READY", "ARCHIVED"]);

/** Length is meaningful for draped goods; it is noise for cut fabric. */
export function requiresLength(category: string): boolean {
  return category === "SAREE" || category === "DUPATTA" || category === "STOLE";
}
