// Data-driven config for the one-question-at-a-time listing wizard.
//
// Ported verbatim from the web app: each step is one field / one screen. Because
// the flow is pure data, a future voice-fill button only needs the current
// step's { field, type, options } to pre-fill the draft — no screen rewrites.
// `voicePromptKey` is reserved for guided audio prompts (Phase 6) and is unused
// by the current UI.

import {
  CATEGORIES,
  SUBCATEGORIES,
  CRAFT_CLUSTERS,
  FABRIC_MATERIALS,
  PATTERNS,
  COLORS,
  STOCK_TYPES,
  TARGET_AUDIENCES,
  USAGE_CONTEXTS,
  requiresLength,
  type ProductOption,
} from "@/lib/productOptions";
import type { ProductType, StockType } from "@/lib/types";

// All values are strings ("" = unanswered) so inputs bind directly; converted
// to the ProductInput payload only at publish time.
export const EMPTY_DRAFT = {
  title: "",
  type: "" as "" | ProductType,
  location: "",
  material: "",
  lengthMeters: "",
  price: "",
  stock: "",
  subcategory: "",
  primaryColor: "",
  secondaryColor: "",
  designName: "",
  widthMeters: "",
  weightGrams: "",
  minOrderQuantity: "",
  stockType: "" as "" | StockType,
  productionLeadTimeDays: "",
  maxOrderCapacity: "",
  isHandloom: "",
  giTag: "",
  certificationDetails: "",
  careInstructions: "",
  targetAudience: "",
  usageContext: "",
};

export type Draft = typeof EMPTY_DRAFT;
export type DraftField = keyof Draft;

export type StepType =
  | "image_upload"
  | "text_input"
  | "number_input"
  | "single_choice"
  | "review";

export interface Step {
  id: string;
  field: DraftField | "images";
  type: StepType;
  /** product:wizard.* question shown as the screen title */
  questionKey: string;
  /** product:form.*.placeholder for inputs */
  placeholderKey?: string;
  /** product:wizard.unit* label shown beside number inputs */
  unitKey?: string;
  /** options for single_choice; a function when they depend on earlier answers */
  options?: ProductOption[] | ((draft: Draft) => ProductOption[]);
  /** hide the step for the current draft (e.g. length only for draped goods) */
  visible?: (draft: Draft) => boolean;
  /** optional steps show a Skip action and never block Next */
  optional?: boolean;
  numberProps?: { keyboardType: "decimal-pad" | "number-pad" };
}

const YES_NO: ProductOption[] = [
  { value: "yes", labelKey: "product:wizard.yes" },
  { value: "no", labelKey: "product:wizard.no" },
];

export const REQUIRED_STEPS: Step[] = [
  { id: "photos", field: "images", type: "image_upload", questionKey: "product:wizard.photosQuestion" },
  { id: "title", field: "title", type: "text_input", questionKey: "product:wizard.titleQuestion", placeholderKey: "product:form.title.placeholder" },
  { id: "category", field: "type", type: "single_choice", questionKey: "product:wizard.categoryQuestion", options: CATEGORIES },
  { id: "cluster", field: "location", type: "single_choice", questionKey: "product:wizard.clusterQuestion", options: CRAFT_CLUSTERS },
  { id: "material", field: "material", type: "single_choice", questionKey: "product:wizard.materialQuestion", options: FABRIC_MATERIALS },
  { id: "length", field: "lengthMeters", type: "number_input", questionKey: "product:wizard.lengthQuestion", placeholderKey: "product:form.length.placeholder", unitKey: "product:wizard.unitMeters", visible: (d) => requiresLength(d.type), numberProps: { keyboardType: "decimal-pad" } },
  { id: "price", field: "price", type: "number_input", questionKey: "product:wizard.priceQuestion", placeholderKey: "product:form.price.placeholder", unitKey: "product:wizard.unitRupees", numberProps: { keyboardType: "decimal-pad" } },
  { id: "stock", field: "stock", type: "number_input", questionKey: "product:wizard.stockQuestion", placeholderKey: "product:form.stock.placeholder", unitKey: "product:wizard.unitPieces", numberProps: { keyboardType: "number-pad" } },
];

export const REVIEW_STEP: Step = { id: "review", field: "images", type: "review", questionKey: "product:wizard.reviewTitle" };

export const OPTIONAL_STEPS: Step[] = [
  { id: "subcategory", field: "subcategory", type: "single_choice", questionKey: "product:wizard.subcategoryQuestion", options: (d) => (d.type ? SUBCATEGORIES[d.type] : []), visible: (d) => d.type !== "" && SUBCATEGORIES[d.type].length > 0, optional: true },
  { id: "primaryColor", field: "primaryColor", type: "single_choice", questionKey: "product:wizard.primaryColorQuestion", options: COLORS, optional: true },
  { id: "secondaryColor", field: "secondaryColor", type: "single_choice", questionKey: "product:wizard.secondaryColorQuestion", options: COLORS, optional: true },
  { id: "pattern", field: "designName", type: "single_choice", questionKey: "product:wizard.patternQuestion", options: PATTERNS, optional: true },
  { id: "lengthOpt", field: "lengthMeters", type: "number_input", questionKey: "product:wizard.lengthQuestion", placeholderKey: "product:form.length.placeholder", unitKey: "product:wizard.unitMeters", visible: (d) => !requiresLength(d.type), optional: true, numberProps: { keyboardType: "decimal-pad" } },
  { id: "width", field: "widthMeters", type: "number_input", questionKey: "product:wizard.widthQuestion", placeholderKey: "product:form.width.placeholder", unitKey: "product:wizard.unitMeters", optional: true, numberProps: { keyboardType: "decimal-pad" } },
  { id: "weight", field: "weightGrams", type: "number_input", questionKey: "product:wizard.weightQuestion", placeholderKey: "product:form.weight.placeholder", unitKey: "product:wizard.unitGrams", optional: true, numberProps: { keyboardType: "number-pad" } },
  { id: "minOrder", field: "minOrderQuantity", type: "number_input", questionKey: "product:wizard.minOrderQuestion", placeholderKey: "product:form.minOrderQuantity.placeholder", unitKey: "product:wizard.unitPieces", optional: true, numberProps: { keyboardType: "number-pad" } },
  { id: "stockType", field: "stockType", type: "single_choice", questionKey: "product:wizard.stockTypeQuestion", options: STOCK_TYPES, optional: true },
  { id: "leadTime", field: "productionLeadTimeDays", type: "number_input", questionKey: "product:wizard.leadTimeQuestion", placeholderKey: "product:form.leadTime.placeholder", unitKey: "product:wizard.unitDays", visible: (d) => d.stockType === "made_to_order", optional: true, numberProps: { keyboardType: "number-pad" } },
  { id: "maxCapacity", field: "maxOrderCapacity", type: "number_input", questionKey: "product:wizard.maxCapacityQuestion", placeholderKey: "product:form.maxOrderCapacity.placeholder", unitKey: "product:wizard.unitPieces", optional: true, numberProps: { keyboardType: "number-pad" } },
  { id: "isHandloom", field: "isHandloom", type: "single_choice", questionKey: "product:wizard.isHandloomQuestion", options: YES_NO, optional: true },
  { id: "giTag", field: "giTag", type: "text_input", questionKey: "product:wizard.giTagQuestion", placeholderKey: "product:form.giTag.placeholder", optional: true },
  { id: "certification", field: "certificationDetails", type: "text_input", questionKey: "product:wizard.certificationQuestion", placeholderKey: "product:form.certification.placeholder", optional: true },
  { id: "care", field: "careInstructions", type: "text_input", questionKey: "product:wizard.careQuestion", placeholderKey: "product:form.care.placeholder", optional: true },
  { id: "targetAudience", field: "targetAudience", type: "single_choice", questionKey: "product:wizard.targetAudienceQuestion", options: TARGET_AUDIENCES, optional: true },
  { id: "usageContext", field: "usageContext", type: "single_choice", questionKey: "product:wizard.usageContextQuestion", options: USAGE_CONTEXTS, optional: true },
];

// ── Visual cues for low-literacy users ──
export const COLOR_SWATCHES: Record<string, string> = {
  red: "#dc2626", maroon: "#7f1d1d", pink: "#ec4899", orange: "#f97316",
  yellow: "#eab308", green: "#16a34a", blue: "#2563eb", indigo: "#4f46e5",
  purple: "#9333ea", black: "#000000", white: "#ffffff", cream: "#fdf6e3",
  grey: "#9ca3af", brown: "#92400e", gold: "#d4af37", silver: "#c0c0c0",
  multicolor: "#dc2626",
};
