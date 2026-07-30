import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shirt, Ribbon, Wind, Scissors, Layers, Package } from "lucide-react-native";

import { apiClient, ApiError, type LocalFile } from "@/lib/apiClient";
import type { ProductInput, ProductType, StockType } from "@/lib/types";
import { DEFAULT_CURRENCY, requiresLength } from "@/lib/productOptions";
import {
  COLOR_SWATCHES,
  EMPTY_DRAFT,
  OPTIONAL_STEPS,
  REQUIRED_STEPS,
  REVIEW_STEP,
  type Draft,
  type DraftField,
  type Step,
} from "@/features/wizard/steps";
import { Text, Button, Input, OptionCard, ProgressBar } from "@/components/ui";
import { ImageUploader } from "@/components/domain/ImageUploader";
import { colors, radius, spacing, touch } from "@/theme";

// Category icons — visual cues for low-literacy users (mirrors web).
const CATEGORY_ICONS: Record<string, typeof Shirt> = {
  SAREE: Shirt,
  DUPATTA: Ribbon,
  STOLE: Wind,
  MUFFLER: Scissors,
  FABRIC: Layers,
  OTHER: Package,
};

/**
 * Typeform-style one-question-at-a-time product listing flow.
 * Direct port of the web ProductListingWizard: same phases (required →
 * review → optional → review), same jump-to-edit behavior, same publish
 * payload. Voice-input hooks attach per-step (see steps.ts).
 */
export default function ProductWizardScreen() {
  const { t } = useTranslation(["product", "common"]);

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [phase, setPhase] = useState<"required" | "optional">("required");
  const [index, setIndex] = useState(0);
  const [onReview, setOnReview] = useState(false);
  const [cameFromReview, setCameFromReview] = useState(false);
  // "Other" free-text entry: step id currently typing + the typed text.
  const [customFor, setCustomFor] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phaseSteps = (phase === "required" ? REQUIRED_STEPS : OPTIONAL_STEPS).filter(
    (s) => !s.visible || s.visible(draft)
  );
  const step: Step = onReview ? REVIEW_STEP : phaseSteps[index];

  const set = (field: DraftField, value: string) =>
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      // Category change invalidates the chosen subcategory.
      if (field === "type") next.subcategory = "";
      return next;
    });

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
      setOnReview(true);
    }
  }

  function goBack() {
    setError(null);
    if (customFor) {
      setCustomFor(null);
      return;
    }
    if (onReview) {
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
      router.back();
    }
  }

  /** Jump from a review row back to that question (in whichever phase it lives). */
  function jumpTo(stepId: string) {
    for (const p of ["required", "optional"] as const) {
      const steps = (p === "required" ? REQUIRED_STEPS : OPTIONAL_STEPS).filter(
        (s) => !s.visible || s.visible(draft)
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
      router.replace(`/product/${product.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("product:form.errors.save"));
      setSaving(false);
    }
  }

  // ── "Other" free-text (same routing rules as web) ──

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
    set(customTarget(s), s.field === "type" ? text : text || "other");
    goNext();
  }

  // ── Renderers ──

  function renderSingleChoice(s: Step) {
    if (customFor === s.id) {
      return (
        <View style={styles.gap}>
          <Text color={colors.neutral500}>{t("product:wizard.otherQuestion")}</Text>
          <Input
            autoFocus
            large
            placeholder={t("product:wizard.otherPlaceholder")}
            value={customText}
            onChangeText={setCustomText}
            onSubmitEditing={() => submitCustom(s)}
            returnKeyType="done"
          />
          <Button label={t("product:wizard.next")} size="lg" onPress={() => submitCustom(s)} />
        </View>
      );
    }

    const options = typeof s.options === "function" ? s.options(draft) : (s.options ?? []);
    const current = draft[s.field as DraftField];

    return (
      <View style={styles.gap}>
        <View style={styles.optionGrid}>
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
              <OptionCard
                key={o.value}
                label={t(o.labelKey)}
                selected={selected}
                style={styles.optionCell}
                leading={
                  Icon ? (
                    <Icon size={26} color={selected ? colors.inkOnDark : colors.ink} />
                  ) : swatch ? (
                    <View style={[styles.swatch, { backgroundColor: swatch }]} />
                  ) : undefined
                }
                onPress={() => {
                  if (isOther) {
                    openCustom(s);
                    return;
                  }
                  set(s.field as DraftField, o.value);
                  goNext();
                }}
              />
            );
          })}
        </View>
        {s.optional ? (
          <Button
            label={t("product:wizard.skip")}
            variant="ghost"
            onPress={() => {
              set(s.field as DraftField, "");
              goNext();
            }}
          />
        ) : null}
      </View>
    );
  }

  function renderInput(s: Step) {
    const isNumber = s.type === "number_input";
    const submit = () => {
      if (!validateStep()) {
        setError(stepError(s.id));
        return;
      }
      goNext();
    };
    return (
      <View style={styles.gap}>
        <Input
          autoFocus
          large
          keyboardType={isNumber ? s.numberProps?.keyboardType ?? "decimal-pad" : "default"}
          placeholder={s.placeholderKey ? t(s.placeholderKey) : undefined}
          unit={s.unitKey ? t(s.unitKey) : undefined}
          value={draft[s.field as DraftField]}
          onChangeText={(v) => set(s.field as DraftField, v)}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Button label={t("product:wizard.next")} size="lg" onPress={submit} />
        {s.optional ? (
          <Button
            label={t("product:wizard.skip")}
            variant="ghost"
            onPress={() => {
              set(s.field as DraftField, "");
              goNext();
            }}
          />
        ) : null}
      </View>
    );
  }

  function renderImageUpload() {
    return (
      <View style={styles.gap}>
        <ImageUploader files={files} onChange={setFiles} />
        {files.length > 0 ? (
          <Button label={t("product:wizard.next")} size="lg" onPress={goNext} />
        ) : null}
      </View>
    );
  }

  function renderReview() {
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
      <View style={styles.gap}>
        <Text color={colors.neutral500}>{t("product:wizard.reviewSubtitle")}</Text>

        {/* Photos row */}
        <Pressable
          onPress={() => jumpTo("photos")}
          accessibilityRole="button"
          accessibilityLabel={t("product:wizard.photos")}
          style={styles.photosRow}
        >
          <Text variant="label" color={colors.neutral500}>{t("product:wizard.photos")}</Text>
          <View style={styles.photoStrip}>
            {files.map((f) => (
              <Image key={f.uri} source={{ uri: f.uri }} style={styles.photoThumb} contentFit="cover" />
            ))}
          </View>
        </Pressable>

        <View style={styles.reviewList}>
          {rows.map((row, i) => (
            <Pressable
              key={row.stepId}
              onPress={() => jumpTo(row.stepId)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              style={({ pressed }) => [
                styles.reviewRow,
                i > 0 && styles.reviewRowBorder,
                pressed && { backgroundColor: colors.neutral100 },
              ]}
            >
              <Text variant="label" color={colors.neutral500}>{row.label}</Text>
              <Text variant="bodyStrong" style={styles.reviewValue} numberOfLines={1}>
                {row.value || "—"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          label={saving ? t("product:wizard.publishing") : t("product:wizard.publish")}
          size="lg"
          loading={saving}
          onPress={publish}
        />
        {phase === "required" ? (
          <Button label={t("product:wizard.addMore")} variant="outline" onPress={startOptional} />
        ) : null}
      </View>
    );
  }

  const progressCurrent = onReview ? phaseSteps.length : index + 1;
  const progressTotal = phaseSteps.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header: back + progress */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={goBack}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={t("product:wizard.back")}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <ArrowLeft size={24} color={colors.ink} />
        </Pressable>
        {!onReview ? (
          <View style={styles.progressWrap}>
            <Text variant="label" color={colors.neutral500}>
              {t("product:wizard.progress", { current: progressCurrent, total: progressTotal })}
            </Text>
            <ProgressBar value={progressCurrent / progressTotal} />
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* One question per screen */}
        <Text variant="h1" style={styles.question}>{t(step.questionKey)}</Text>

        {error ? (
          <View style={styles.error} accessibilityRole="alert">
            <Text color={colors.danger}>{error}</Text>
          </View>
        ) : null}

        {step.type === "image_upload" && renderImageUpload()}
        {step.type === "single_choice" && renderSingleChoice(step)}
        {(step.type === "text_input" || step.type === "number_input") && renderInput(step)}
        {step.type === "review" && renderReview()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: touch.min,
    height: touch.min,
    borderRadius: touch.min / 2,
    borderWidth: 2,
    borderColor: colors.neutral300,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrap: { flex: 1, gap: spacing.xs },
  content: { padding: spacing.lg, paddingBottom: spacing["4xl"] },
  question: { marginBottom: spacing.xl },
  error: {
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  gap: { gap: spacing.md },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  optionCell: { width: "47.5%", flexGrow: 1 },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },
  photosRow: {
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  photoStrip: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  photoThumb: { width: 56, height: 56, borderRadius: radius.sm },
  reviewList: {
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
  },
  reviewRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  reviewRowBorder: { borderTopWidth: 1, borderTopColor: colors.neutral200 },
  reviewValue: { flexShrink: 1, textAlign: "right" },
});
