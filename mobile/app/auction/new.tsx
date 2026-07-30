import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

import { apiClient, ApiError } from "@/lib/apiClient";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Header, Text, Button, Card, Input, Chip, OptionCard, LoadingState, ErrorState } from "@/components/ui";
import { colors, spacing } from "@/theme";

// Simple duration presets instead of free datetime entry — starts now,
// ends after the chosen number of days. Codes keep labels translatable.
const DURATIONS = [1, 3, 5, 7] as const;

export default function NewAuctionScreen() {
  const { t } = useTranslation(["auction", "common", "weaver"]);

  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const [productId, setProductId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [days, setDays] = useState<number>(3);
  const [minIncrement, setMinIncrement] = useState("");
  const [buyNow, setBuyNow] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // Only published products can be auctioned.
      const all = await apiClient.getProducts();
      setProducts(all.filter((p) => p.status === "READY"));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function submit() {
    const price = Number(basePrice);
    if (!productId || !price || price <= 0) {
      setError(t("auction:validation.required_fields"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const start = new Date();
      const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      const auction = await apiClient.createAuction({
        productId,
        basePrice: price,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        minBidIncrement: minIncrement ? Number(minIncrement) : undefined,
        buyNowPrice: buyNow ? Number(buyNow) : undefined,
      });
      router.replace(`/auction/${auction.id}`);
    } catch (err) {
      const code = err instanceof ApiError ? err.message : "generic";
      setError(t(`auction:validation.${code}`, { defaultValue: t("auction:validation.generic") }));
      setSubmitting(false);
    }
  }

  if (status === "loading") return <LoadingState label={t("common:actions.loading")} />;
  if (status === "error") {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={() => router.back()} backLabel={t("common:actions.back")} />
        <ErrorState title={t("common:errors.generic")} retryLabel={t("common:actions.retry")} onRetry={load} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} backLabel={t("common:actions.back")} title={t("auction:form.title")} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text color={colors.neutral500}>{t("auction:form.subtitle")}</Text>

        {/* Product picker — big tappable cards, not a dropdown */}
        <View style={styles.group}>
          <Text variant="label" color={colors.neutral700}>{t("auction:form.product.label")}</Text>
          {products.length === 0 ? (
            <Card>
              <Text color={colors.neutral500}>{t("weaver:products.emptyTitle")}</Text>
            </Card>
          ) : (
            products.map((p) => (
              <OptionCard
                key={p.id}
                label={`${p.title} · ${formatPrice(p.price, p.currency)}`}
                selected={productId === p.id}
                onPress={() => setProductId(p.id)}
              />
            ))
          )}
        </View>

        <Input
          label={t("auction:form.base_price.label")}
          large
          keyboardType="number-pad"
          value={basePrice}
          onChangeText={setBasePrice}
          unit="₹"
        />

        {/* Duration presets */}
        <View style={styles.group}>
          <Text variant="label" color={colors.neutral700}>{t("auction:form.end_time.label")}</Text>
          <View style={styles.chips}>
            {DURATIONS.map((d) => (
              <Chip
                key={d}
                label={`${d} ${t("product:wizard.unitDays", { defaultValue: "days" })}`}
                selected={days === d}
                onPress={() => setDays(d)}
              />
            ))}
          </View>
        </View>

        <Input
          label={t("auction:form.min_bid_increment.label")}
          keyboardType="number-pad"
          value={minIncrement}
          onChangeText={setMinIncrement}
          unit="₹"
        />
        <Input
          label={t("auction:form.buy_now_price.label")}
          keyboardType="number-pad"
          value={buyNow}
          onChangeText={setBuyNow}
          unit="₹"
        />

        {error ? (
          <View style={styles.error} accessibilityRole="alert">
            <Text color={colors.danger}>{error}</Text>
          </View>
        ) : null}

        <Button
          label={submitting ? t("auction:form.submitting") : t("auction:form.submit")}
          size="lg"
          loading={submitting}
          disabled={!productId || !basePrice}
          onPress={submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  group: { gap: spacing.sm },
  chips: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  error: {
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    padding: spacing.md,
  },
});
