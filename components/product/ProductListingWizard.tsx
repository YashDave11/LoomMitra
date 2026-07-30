"use client";

// Typeform-style one-question-at-a-time product listing flow.
//
// Driven by STEPS below: each step is one field, one screen. Single-choice
// steps render big tappable cards and auto-advance; text/number steps show a
// large input with an explicit Next; review shows everything and publishes.
// The step config is data, so a future voice-fill button only needs the
// current step's { field, type, options } to pre-fill the draft.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { apiClient, ApiError } from "@/lib/apiClient";
import type { ProductInput, ProductType, StockType } from "@/lib/types";
import {
  CATEGORIES,
  SUBCATEGORIES,
  CRAFT_CLUSTERS,
  FABRIC_MATERIALS,
  PATTERNS,
  COLORS,
  DEFAULT_CURRENCY,
  STOCK_TYPES,
  TARGET_AUDIENCES,
  USAGE_CONTEXTS,
  requiresLength,
  type ProductOption,
} from "@/lib/productOptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Loader2,
  X,
  Shirt,
  Ribbon,
  Scissors,
  Layers,
  Package,
  Wind,
} from "lucide-react";

// ── Draft state ─────────────────────────────────────────────────────────────
// All values are strings ("" = unanswered) so inputs bind directly; converted
// to the ProductInput payload only at publish time. Field names match the
// existing ProductInput keys.

const EMPTY_DRAFT = {
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

type Draft = typeof EMPTY_DRAFT;
type DraftField = keyof Draft;

// ── Step configuration ──────────────────────────────────────────────────────

type StepType = "image_upload" | "text_input" | "number_input" | "single_choice" | "review";

interface Step {
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
  numberProps?: { min: string; step: string };
}

const YES_NO: ProductOption[] = [
  { value: "yes", labelKey: "product:wizard.yes" },
  { value: "no", labelKey: "product:wizard.no" },
];

const REQUIRED_STEPS: Step[] = [
  { id: "photos", field: "images", type: "image_upload", questionKey: "product:wizard.photosQuestion" },
  { id: "title", field: "title", type: "text_input", questionKey: "product:wizard.titleQuestion", placeholderKey: "product:form.title.placeholder" },
  { id: "category", field: "type", type: "single_choice", questionKey: "product:wizard.categoryQuestion", options: CATEGORIES },
  { id: "cluster", field: "location", type: "single_choice", questionKey: "product:wizard.clusterQuestion", options: CRAFT_CLUSTERS },
  { id: "material", field: "material", type: "single_choice", questionKey: "product:wizard.materialQuestion", options: FABRIC_MATERIALS },
  { id: "length", field: "lengthMeters", type: "number_input", questionKey: "product:wizard.lengthQuestion", placeholderKey: "product:form.length.placeholder", unitKey: "product:wizard.unitMeters", visible: (d) => requiresLength(d.type), numberProps: { min: "0", step: "0.1" } },
  { id: "price", field: "price", type: "number_input", questionKey: "product:wizard.priceQuestion", placeholderKey: "product:form.price.placeholder", unitKey: "product:wizard.unitRupees", numberProps: { min: "1", step: "0.01" } },
  { id: "stock", field: "stock", type: "number_input", questionKey: "product:wizard.stockQuestion", placeholderKey: "product:form.stock.placeholder", unitKey: "product:wizard.unitPieces", numberProps: { min: "1", step: "1" } },
];

const REVIEW_STEP: Step = { id: "review", field: "images", type: "review", questionKey: "product:wizard.reviewTitle" };

const OPTIONAL_STEPS: Step[] = [
  { id: "subcategory", field: "subcategory", type: "single_choice", questionKey: "product:wizard.subcategoryQuestion", options: (d) => (d.type ? SUBCATEGORIES[d.type] : []), visible: (d) => d.type !== "" && SUBCATEGORIES[d.type].length > 0, optional: true },
  { id: "primaryColor", field: "primaryColor", type: "single_choice", questionKey: "product:wizard.primaryColorQuestion", options: COLORS, optional: true },
  { id: "secondaryColor", field: "secondaryColor", type: "single_choice", questionKey: "product:wizard.secondaryColorQuestion", options: COLORS, optional: true },
  { id: "pattern", field: "designName", type: "single_choice", questionKey: "product:wizard.patternQuestion", options: PATTERNS, optional: true },
  { id: "lengthOpt", field: "lengthMeters", type: "number_input", questionKey: "product:wizard.lengthQuestion", placeholderKey: "product:form.length.placeholder", unitKey: "product:wizard.unitMeters", visible: (d) => !requiresLength(d.type), optional: true, numberProps: { min: "0", step: "0.1" } },
  { id: "width", field: "widthMeters", type: "number_input", questionKey: "product:wizard.widthQuestion", placeholderKey: "product:form.width.placeholder", unitKey: "product:wizard.unitMeters", optional: true, numberProps: { min: "0", step: "0.1" } },
  { id: "weight", field: "weightGrams", type: "number_input", questionKey: "product:wizard.weightQuestion", placeholderKey: "product:form.weight.placeholder", unitKey: "product:wizard.unitGrams", optional: true, numberProps: { min: "0", step: "1" } },
  { id: "minOrder", field: "minOrderQuantity", type: "number_input", questionKey: "product:wizard.minOrderQuestion", placeholderKey: "product:form.minOrderQuantity.placeholder", unitKey: "product:wizard.unitPieces", optional: true, numberProps: { min: "1", step: "1" } },
  { id: "stockType", field: "stockType", type: "single_choice", questionKey: "product:wizard.stockTypeQuestion", options: STOCK_TYPES, optional: true },
  { id: "leadTime", field: "productionLeadTimeDays", type: "number_input", questionKey: "product:wizard.leadTimeQuestion", placeholderKey: "product:form.leadTime.placeholder", unitKey: "product:wizard.unitDays", visible: (d) => d.stockType === "made_to_order", optional: true, numberProps: { min: "0", step: "1" } },
  { id: "maxCapacity", field: "maxOrderCapacity", type: "number_input", questionKey: "product:wizard.maxCapacityQuestion", placeholderKey: "product:form.maxOrderCapacity.placeholder", unitKey: "product:wizard.unitPieces", optional: true, numberProps: { min: "0", step: "1" } },
  { id: "isHandloom", field: "isHandloom", type: "single_choice", questionKey: "product:wizard.isHandloomQuestion", options: YES_NO, optional: true },
  { id: "giTag", field: "giTag", type: "text_input", questionKey: "product:wizard.giTagQuestion", placeholderKey: "product:form.giTag.placeholder", optional: true },
  { id: "certification", field: "certificationDetails", type: "text_input", questionKey: "product:wizard.certificationQuestion", placeholderKey: "product:form.certification.placeholder", optional: true },
  { id: "care", field: "careInstructions", type: "text_input", questionKey: "product:wizard.careQuestion", placeholderKey: "product:form.care.placeholder", optional: true },
  { id: "targetAudience", field: "targetAudience", type: "single_choice", questionKey: "product:wizard.targetAudienceQuestion", options: TARGET_AUDIENCES, optional: true },
  { id: "usageContext", field: "usageContext", type: "single_choice", questionKey: "product:wizard.usageContextQuestion", options: USAGE_CONTEXTS, optional: true },
];

// ── Visual cues for low-literacy users ──────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SAREE: Shirt,
  DUPATTA: Ribbon,
  STOLE: Wind,
  MUFFLER: Scissors,
  FABRIC: Layers,
  OTHER: Package,
};

const COLOR_SWATCHES: Record<string, string> = {
  red: "#dc2626", maroon: "#7f1d1d", pink: "#ec4899", orange: "#f97316",
  yellow: "#eab308", green: "#16a34a", blue: "#2563eb", indigo: "#4f46e5",
  purple: "#9333ea", black: "#000000", white: "#ffffff", cream: "#fdf6e3",
  grey: "#9ca3af", brown: "#92400e", gold: "#d4af37", silver: "#c0c0c0",
  multicolor: "linear-gradient(135deg,#dc2626,#eab308,#16a34a,#2563eb)",
};

// ── Component ───────────────────────────────────────────────────────────────

export default function ProductListingWizard() {
  const router = useRouter();
  const { t } = useTranslation(["product", "common"]);

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [files, setFiles] = useState<File[]>([]);
  // Object URLs for thumbnails, parallel to `files`.
  const [previews, setPreviews] = useState<string[]>([]);
  const [phase, setPhase] = useState<"required" | "optional">("required");
  const [index, setIndex] = useState(0);
  const [onReview, setOnReview] = useState(false);
  // Set when the weaver taps a review row to edit — answering returns to review.
  const [cameFromReview, setCameFromReview] = useState(false);
  // "Other" free-text entry: step id currently typing + the typed text.
  const [customFor, setCustomFor] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const phaseSteps = (phase === "required" ? REQUIRED_STEPS : OPTIONAL_STEPS).filter(
    (s) => !s.visible || s.visible(draft),
  );
  const step: Step = onReview ? REVIEW_STEP : phaseSteps[index];

  const set = (field: DraftField, value: string) =>
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      // Category change invalidates the chosen subcategory.
      if (field === "type") next.subcategory = "";
      return next;
    });

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const added = Array.from(list);
    setFiles((prev) => [...prev, ...added]);
    setPreviews((prev) => [...prev, ...added.map((f) => URL.createObjectURL(f))]);
  }

  function removeFile(i: number) {
    URL.revokeObjectURL(previews[i]);
    setFiles((prev) => prev.filter((_, j) => j !== i));
    setPreviews((prev) => prev.filter((_, j) => j !== i));
  }

  function goNext() {
    setError(null);
    setCustomFor(null);
    if (cameFromReview) {
      setCameFromReview(false);
      setOnReview(true);
      return;
    }
    if (index + 1 < phaseSteps.length) {
      setIndex(index + 1);
    } else {
      // End of either phase lands on the review screen.
      setOnReview(true);
    }
  }

  function goBack() {
    setError(null);
    // Back out of the "Other" text entry to the option cards first.
    if (customFor) {
      setCustomFor(null);
      return;
    }
    if (onReview) {
      // Back from review returns to the last question of the current phase.
      setOnReview(false);
      setIndex(phaseSteps.length - 1);
      return;
    }
    if (cameFromReview) {
      setCameFromReview(false);
      setOnReview(true);
      return;
    }
    if (index > 0) {
      setIndex(index - 1);
    } else if (phase === "optional") {
      setPhase("required");
      setOnReview(true);
    } else {
      router.push("/app/weaver/products");
    }
  }

  /** Jump from a review row back to that question (in whichever phase it lives). */
  function jumpTo(stepId: string) {
    for (const p of ["required", "optional"] as const) {
      const steps = (p === "required" ? REQUIRED_STEPS : OPTIONAL_STEPS).filter(
        (s) => !s.visible || s.visible(draft),
      );
      const i = steps.findIndex((s) => s.id === stepId);
      if (i >= 0) {
        setPhase(p);
        setIndex(i);
        setOnReview(false);
        setCustomFor(null);
        setCameFromReview(true);
        return;
      }
    }
  }

  function startOptional() {
    setPhase("optional");
    setIndex(0);
    setOnReview(false);
  }

  function validateStep(): boolean {
    if (step.optional) return true;
    switch (step.id) {
      case "photos":
        return files.length > 0;
      case "title":
        return draft.title.trim().length > 0;
      case "length":
        return parseFloat(draft.lengthMeters) > 0;
      case "price":
        return parseFloat(draft.price) > 0;
      case "stock":
        return parseInt(draft.stock, 10) >= 1;
      default:
        return true;
    }
  }

  const num = (v: string) => (v.trim() === "" ? undefined : Number(v));

  async function publish() {
    const input: ProductInput = {
      title: draft.title.trim(),
      type: draft.type as ProductType,
      price: Number(draft.price),
      stock: parseInt(draft.stock, 10),
      location: draft.location,
      material: draft.material,
      lengthMeters: num(draft.lengthMeters),
      subcategory: draft.subcategory || undefined,
      primaryColor: draft.primaryColor || undefined,
      secondaryColor: draft.secondaryColor || undefined,
      designName: draft.designName || undefined,
      widthMeters: num(draft.widthMeters),
      weightGrams: num(draft.weightGrams),
      currency: DEFAULT_CURRENCY,
      minOrderQuantity: num(draft.minOrderQuantity),
      isAvailable: true,
      stockType: (draft.stockType || "ready_stock") as StockType,
      productionLeadTimeDays:
        draft.stockType === "made_to_order" ? num(draft.productionLeadTimeDays) : undefined,
      maxOrderCapacity: num(draft.maxOrderCapacity),
      isHandloom: draft.isHandloom !== "no",
      giTag: draft.giTag.trim() || undefined,
      certificationDetails: draft.certificationDetails.trim() || undefined,
      careInstructions: draft.careInstructions.trim() || undefined,
      targetAudience: draft.targetAudience || undefined,
      usageContext: draft.usageContext || undefined,
    };

    setSaving(true);
    setError(null);
    try {
      const product = await apiClient.createProduct(input);
      if (files.length > 0) {
        await apiClient.uploadProductImages(product.id, files);
      }
      router.push(`/app/weaver/products/${product.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("product:form.errors.save"));
      setSaving(false);
    }
  }

  // ── Render helpers ──

  /** Where the typed "Other" text lives. Category must stay the OTHER enum,
      so its free text goes to `subcategory`; every other choice field is a
      free string in the schema and stores the text directly. */
  const customTarget = (s: Step): DraftField =>
    s.field === "type" ? "subcategory" : (s.field as DraftField);

  function openCustom(s: Step) {
    if (s.field === "type") set("type", "OTHER");
    const existing = draft[customTarget(s)];
    setCustomText(existing && existing.toLowerCase() !== "other" ? existing : "");
    setCustomFor(s.id);
  }

  function submitCustom(s: Step) {
    const text = customText.trim();
    // Blank entry falls back to the plain "other" code so required fields
    // (cluster, material) stay valid.
    set(customTarget(s), s.field === "type" ? text : text || "other");
    goNext();
  }

  function renderSingleChoice(s: Step) {
    if (customFor === s.id) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCustom(s);
          }}
          className="space-y-6"
        >
          <p className="text-lg text-neutral-600">{t("product:wizard.otherQuestion")}</p>
          <Input
            autoFocus
            placeholder={t("product:wizard.otherPlaceholder")}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="h-16 text-2xl"
          />
          <Button type="submit" size="lg" className="h-14 w-full text-lg">
            {t("product:wizard.next")}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>
      );
    }

    const options = typeof s.options === "function" ? s.options(draft) : (s.options ?? []);
    const current = draft[s.field as DraftField];
    return (
      <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const Icon = s.id === "category" ? CATEGORY_ICONS[o.value] : undefined;
          const swatch =
            s.id === "primaryColor" || s.id === "secondaryColor"
              ? COLOR_SWATCHES[o.value]
              : undefined;
          const isOther = o.value.toLowerCase() === "other";
          // A typed custom value matches no card — light up "Other" for it.
          const selected =
            current === o.value ||
            (isOther && current !== "" && !options.some((op) => op.value === current));
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                if (isOther) {
                  openCustom(s);
                  return;
                }
                set(s.field as DraftField, o.value);
                goNext();
              }}
              aria-pressed={selected}
              className={`flex min-h-[64px] items-center gap-3 rounded-xl border-2 p-4 text-left text-lg font-semibold transition-colors active:scale-[0.98] ${
                selected ? "border-black bg-black text-white" : "border-neutral-300 bg-white hover:border-black"
              }`}
            >
              {Icon && <Icon className="h-7 w-7 shrink-0" />}
              {swatch && (
                <span
                  aria-hidden
                  className="h-7 w-7 shrink-0 rounded-full border border-neutral-300"
                  style={{ background: swatch }}
                />
              )}
              <span>{t(o.labelKey)}</span>
            </button>
          );
        })}
      </div>
      {s.optional && (
        <Button
          type="button"
          variant="ghost"
          className="h-12 w-full text-base text-neutral-500"
          onClick={() => {
            set(s.field as DraftField, "");
            goNext();
          }}
        >
          {t("product:wizard.skip")}
        </Button>
      )}
      </div>
    );
  }

  function renderInput(s: Step) {
    const isNumber = s.type === "number_input";
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!validateStep()) {
            setError(stepError(s.id));
            return;
          }
          goNext();
        }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Input
            autoFocus
            type={isNumber ? "number" : "text"}
            inputMode={isNumber ? "decimal" : undefined}
            {...(isNumber ? s.numberProps : {})}
            placeholder={s.placeholderKey ? t(s.placeholderKey) : undefined}
            value={draft[s.field as DraftField]}
            onChange={(e) => set(s.field as DraftField, e.target.value)}
            className="h-16 flex-1 text-2xl"
          />
          {s.unitKey && (
            <span className="text-xl font-semibold text-neutral-500">{t(s.unitKey)}</span>
          )}
        </div>
        <Button type="submit" size="lg" className="h-14 w-full text-lg">
          {t("product:wizard.next")}
          <ArrowRight className="h-5 w-5" />
        </Button>
        {s.optional && (
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full text-base text-neutral-500"
            onClick={() => {
              set(s.field as DraftField, "");
              goNext();
            }}
          >
            {t("product:wizard.skip")}
          </Button>
        )}
      </form>
    );
  }

  function stepError(id: string): string {
    const map: Record<string, string> = {
      photos: t("product:form.images.hint"),
      title: t("product:form.errors.title"),
      length: t("product:form.errors.length"),
      price: t("product:form.errors.price"),
      stock: t("product:form.errors.stock"),
    };
    return map[id] ?? t("product:form.errors.save");
  }

  function renderImageUpload() {
    return (
      <div className="space-y-4">
        {/* Hidden inputs: camera capture vs. gallery picker */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          size="lg"
          className="h-16 w-full text-lg"
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="h-6 w-6" />
          {t("product:wizard.takePhoto")}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-16 w-full text-lg"
          onClick={() => galleryRef.current?.click()}
        >
          <ImageIcon className="h-6 w-6" />
          {t("product:wizard.gallery")}
        </Button>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label={t("product:wizard.removePhoto")}
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <Button type="button" size="lg" className="h-14 w-full text-lg" onClick={goNext}>
            {t("product:wizard.next")}
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  }

  function renderReview() {
    // Rows: labelKey from the existing form, display value, step to jump to.
    const optionValue = (group: string, code: string) =>
      code ? t(`product:${group}.${code.toLowerCase()}`, { defaultValue: code }) : "";
    const rows: Array<{ stepId: string; label: string; value: string }> = [
      { stepId: "title", label: t("product:form.title.label"), value: draft.title },
      { stepId: "category", label: t("product:form.category.label"), value: optionValue("category", draft.type) },
      { stepId: "cluster", label: t("product:form.cluster.label"), value: optionValue("cluster", draft.location) },
      { stepId: "material", label: t("product:form.material.label"), value: optionValue("material", draft.material) },
      ...(draft.lengthMeters
        ? [{ stepId: requiresLength(draft.type) ? "length" : "lengthOpt", label: t("product:form.length.label"), value: draft.lengthMeters }]
        : requiresLength(draft.type)
          ? [{ stepId: "length", label: t("product:form.length.label"), value: "" }]
          : []),
      { stepId: "price", label: t("product:form.price.label"), value: draft.price ? `₹${draft.price}` : "" },
      { stepId: "stock", label: t("product:form.stock.label"), value: draft.stock },
      // Optional rows appear only once answered.
      ...(draft.subcategory ? [{ stepId: "subcategory", label: t("product:form.subcategory.label"), value: optionValue("subcategory", draft.subcategory) }] : []),
      ...(draft.primaryColor ? [{ stepId: "primaryColor", label: t("product:form.primaryColor.label"), value: optionValue("color", draft.primaryColor) }] : []),
      ...(draft.secondaryColor ? [{ stepId: "secondaryColor", label: t("product:form.secondaryColor.label"), value: optionValue("color", draft.secondaryColor) }] : []),
      ...(draft.designName ? [{ stepId: "pattern", label: t("product:form.pattern.label"), value: optionValue("pattern", draft.designName) }] : []),
      ...(draft.widthMeters ? [{ stepId: "width", label: t("product:form.width.label"), value: draft.widthMeters }] : []),
      ...(draft.weightGrams ? [{ stepId: "weight", label: t("product:form.weight.label"), value: draft.weightGrams }] : []),
      ...(draft.minOrderQuantity ? [{ stepId: "minOrder", label: t("product:form.minOrderQuantity.label"), value: draft.minOrderQuantity }] : []),
      ...(draft.stockType ? [{ stepId: "stockType", label: t("product:form.stockType.label"), value: optionValue("stock_type", draft.stockType) }] : []),
      ...(draft.productionLeadTimeDays ? [{ stepId: "leadTime", label: t("product:form.leadTime.label"), value: draft.productionLeadTimeDays }] : []),
      ...(draft.maxOrderCapacity ? [{ stepId: "maxCapacity", label: t("product:form.maxOrderCapacity.label"), value: draft.maxOrderCapacity }] : []),
      ...(draft.isHandloom ? [{ stepId: "isHandloom", label: t("product:form.isHandloom.label"), value: t(`product:wizard.${draft.isHandloom}`) }] : []),
      ...(draft.giTag ? [{ stepId: "giTag", label: t("product:form.giTag.label"), value: draft.giTag }] : []),
      ...(draft.certificationDetails ? [{ stepId: "certification", label: t("product:form.certification.label"), value: draft.certificationDetails }] : []),
      ...(draft.careInstructions ? [{ stepId: "care", label: t("product:form.care.label"), value: draft.careInstructions }] : []),
      ...(draft.targetAudience ? [{ stepId: "targetAudience", label: t("product:form.targetAudience.label"), value: optionValue("target_audience", draft.targetAudience) }] : []),
      ...(draft.usageContext ? [{ stepId: "usageContext", label: t("product:form.usageContext.label"), value: optionValue("usage_context", draft.usageContext) }] : []),
    ];

    return (
      <div className="space-y-6">
        <p className="text-neutral-600">{t("product:wizard.reviewSubtitle")}</p>

        {/* Photos row */}
        <button
          type="button"
          onClick={() => jumpTo("photos")}
          className="w-full rounded-xl border-2 border-neutral-200 p-3 text-left hover:border-black"
        >
          <span className="mb-2 block text-sm font-semibold text-neutral-500">
            {t("product:wizard.photos")}
          </span>
          <span className="flex gap-2">
            {previews.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img key={src} src={src} alt="" className="h-14 w-14 rounded-lg object-cover" />
            ))}
          </span>
        </button>

        <div className="divide-y rounded-xl border-2 border-neutral-200">
          {rows.map((row) => (
            <button
              key={row.stepId}
              type="button"
              onClick={() => jumpTo(row.stepId)}
              className="flex min-h-[52px] w-full items-center justify-between gap-4 p-4 text-left hover:bg-neutral-50"
            >
              <span className="text-sm font-semibold text-neutral-500">{row.label}</span>
              <span className="text-base font-semibold">{row.value || "—"}</span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          size="lg"
          className="h-16 w-full text-xl"
          disabled={saving}
          onClick={publish}
        >
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {saving ? t("product:wizard.publishing") : t("product:wizard.publish")}
        </Button>

        {phase === "required" && (
          <Button
            type="button"
            variant="outline"
            className="h-14 w-full text-lg"
            onClick={startOptional}
          >
            {t("product:wizard.addMore")}
          </Button>
        )}
      </div>
    );
  }

  // ── Screen ──

  const progressCurrent = onReview ? phaseSteps.length : index + 1;
  const progressTotal = phaseSteps.length;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col px-4 py-4">
      {/* Header: back + progress */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          aria-label={t("product:wizard.back")}
          onClick={goBack}
          disabled={saving}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 hover:border-black"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        {!onReview && (
          <div className="flex-1">
            <p className="mb-1 text-sm font-semibold text-neutral-500">
              {t("product:wizard.progress", { current: progressCurrent, total: progressTotal })}
            </p>
            <div className="h-2 rounded-full bg-neutral-200">
              <div
                className="h-2 rounded-full bg-black transition-all"
                style={{ width: `${(progressCurrent / progressTotal) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* One question per screen */}
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
        {t(step.questionKey)}
      </h1>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border-2 border-black bg-neutral-50 p-3 text-sm">
          {error}
        </div>
      )}

      {step.type === "image_upload" && renderImageUpload()}
      {step.type === "single_choice" && renderSingleChoice(step)}
      {(step.type === "text_input" || step.type === "number_input") && renderInput(step)}
      {step.type === "review" && renderReview()}
    </div>
  );
}
