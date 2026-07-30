import { useCallback, useState } from "react";
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Trash2, BadgeCheck } from "lucide-react-native";

import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import type { DiscoverProduct, Product } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { firstImage, formatPrice } from "@/lib/format";
import { Header, Text, Button, Card, Badge, LoadingState, ErrorState } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";

const { width: SCREEN_W } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(["product", "weaver", "common", "discover"]);
  const { role } = useAuth();
  const { addItem } = useCart();

  const isWeaver = role === "WEAVER" || role === "BUSINESS";
  const [product, setProduct] = useState<(Product & Partial<DiscoverProduct>) | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [added, setAdded] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    try {
      // Weavers own the product; customers view it via the discover endpoint.
      const p = isWeaver ? await apiClient.getProduct(id) : await apiClient.getDiscoverProduct(id);
      setProduct(p);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [id, isWeaver]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function onDelete() {
    Alert.alert(t("weaver:products.deleteConfirm"), undefined, [
      { text: t("common:actions.cancel"), style: "cancel" },
      {
        text: t("common:actions.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.deleteProduct(id!);
            router.back();
          } catch {
            Alert.alert(t("weaver:products.deleteFailed"));
          }
        },
      },
    ]);
  }

  function onAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: firstImage(product.images) ?? "",
      weaverName: product.user?.weaverProfile?.name ?? t("discover:unknownWeaver"),
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (status === "loading") return <LoadingState label={t("common:actions.loading")} />;
  if (status === "error" || !product) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={() => router.back()} backLabel={t("common:actions.back")} />
        <ErrorState title={t("common:errors.generic")} retryLabel={t("common:actions.retry")} onRetry={load} />
      </SafeAreaView>
    );
  }

  const images = product.images ?? [];
  const hero = images[heroIndex]?.url ?? null;
  const weaverName = product.user?.weaverProfile?.name;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} backLabel={t("common:actions.back")} title={product.title} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gallery */}
        <View style={styles.hero}>
          {hero ? (
            <Image source={{ uri: hero }} style={styles.heroImage} contentFit="cover" transition={150} />
          ) : (
            <View style={styles.heroEmpty}>
              <Text color={colors.neutral400}>{t("product:noImages")}</Text>
            </View>
          )}
        </View>
        {images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
            {images.map((img, i) => (
              <Pressable
                key={img.id}
                onPress={() => setHeroIndex(i)}
                accessibilityRole="button"
                accessibilityLabel={t("product:galleryThumbAlt")}
              >
                <Image
                  source={{ uri: img.url }}
                  style={[styles.thumb, i === heroIndex && styles.thumbActive]}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {/* Title + price */}
        <View style={styles.section}>
          <Text variant="h1">{product.title}</Text>
          <Text variant="caption" color={colors.neutral500}>
            {optionLabel(t, "category", product.type)}
            {product.location ? ` · ${optionLabel(t, "cluster", product.location)}` : ""}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="amount">{formatPrice(product.price, product.currency)}</Text>
            <Text variant="caption" color={colors.neutral500}> {t("product:perUnit")}</Text>
          </View>
          <Badge
            label={t("product:stockUnits", { count: product.stock })}
            tone={product.stock > 0 ? "success" : "danger"}
          />
        </View>

        {/* Weaver credit (customer view) */}
        {weaverName ? (
          <Card style={styles.weaverCard}>
            <BadgeCheck size={22} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{weaverName}</Text>
              <Text variant="caption" color={colors.neutral500}>{t("product:verifiedWeaver")}</Text>
            </View>
          </Card>
        ) : null}

        {/* Description + attributes */}
        {product.description ? (
          <View style={styles.section}>
            <Text variant="h2">{t("product:descriptionHeading")}</Text>
            <Text color={colors.neutral700}>{product.description}</Text>
          </View>
        ) : null}

        <Card style={styles.attrs}>
          {product.material ? (
            <AttrRow label={t("common:fields.material")} value={optionLabel(t, "material", product.material)} />
          ) : null}
          {product.designName ? (
            <AttrRow label={t("product:designMotif")} value={optionLabel(t, "pattern", product.designName)} />
          ) : null}
          {product.primaryColor ? (
            <AttrRow label={t("product:form.primaryColor.label")} value={optionLabel(t, "color", product.primaryColor)} />
          ) : null}
          {product.lengthMeters ? (
            <AttrRow label={t("product:form.length.label")} value={`${product.lengthMeters} m`} />
          ) : null}
          {product.giTag ? <AttrRow label={t("product:form.giTag.label")} value={product.giTag} /> : null}
          {product.careInstructions ? (
            <AttrRow label={t("product:form.care.label")} value={product.careInstructions} />
          ) : null}
        </Card>
      </ScrollView>

      {/* Sticky action bar */}
      <View style={styles.actions}>
        {isWeaver ? (
          <Button
            label={t("common:actions.delete")}
            variant="outline"
            icon={<Trash2 size={20} color={colors.ink} />}
            onPress={onDelete}
          />
        ) : (
          <Button
            label={added ? "✓" : t("product:addToCart")}
            size="lg"
            disabled={product.stock <= 0}
            icon={<ShoppingCart size={22} color={colors.inkOnDark} />}
            onPress={onAddToCart}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function AttrRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.attrRow}>
      <Text variant="label" color={colors.neutral500}>{label}</Text>
      <Text variant="bodyStrong" style={{ flexShrink: 1, textAlign: "right" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing["3xl"] },
  hero: { width: SCREEN_W, height: SCREEN_W, backgroundColor: colors.neutral100 },
  heroImage: { width: "100%", height: "100%" },
  heroEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  thumbs: { gap: spacing.sm, padding: spacing.md },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, opacity: 0.6 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: colors.ink },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.xs },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: spacing.xs },
  weaverCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  attrs: { marginHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.md },
  attrRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.lg },
  actions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.bg,
  },
});
