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
import { getPreviewImage, formatPrice } from "@/lib/format";
import { Header, Text, Button, Card, Badge, LoadingState, ErrorState, Input } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";

const { width: SCREEN_W } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(["product", "weaver", "common", "discover"]);
  const { role } = useAuth();
  const { addItem } = useCart();

  const isWeaver = role === "WEAVER";
  const isBusiness = role === "BUSINESS";
  const [product, setProduct] = useState<(Product & Partial<DiscoverProduct>) | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [added, setAdded] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [bulkQty, setBulkQty] = useState("");
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    try {
      // Weavers own the product; customers/business view it via the discover endpoint.
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
      image: getPreviewImage(product) ?? "",
      weaverName: product.user?.weaverProfile?.name ?? t("discover:unknownWeaver"),
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  async function onRequestBulkOrder() {
    if (!product) return;
    const qty = parseInt(bulkQty, 10);
    if (isNaN(qty) || qty < product.minOrderQuantity) {
      Alert.alert(`Minimum order quantity is ${product.minOrderQuantity}`);
      return;
    }
    setRequesting(true);
    try {
      await apiClient.createBulkOrder(product.id, qty);
      Alert.alert("Bulk Order Requested", "Your request has been sent to the weaver.", [
        { text: "OK", onPress: () => router.push("/(business)/orders" as any) }
      ]);
    } catch (err) {
      Alert.alert("Failed to request bulk order");
    } finally {
      setRequesting(false);
    }
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

  // Merge standard images and generated catalog images
  const baseImages = product.images ?? [];
  const catalogImages = product.catalogPlan
    ? product.catalogPlan.filter((s) => s.status === "SUCCESS" && s.imageUrl).map((s) => ({
        id: `cat-${s.order}`,
        url: s.imageUrl!,
        type: "IMAGE" as const,
      }))
    : [];
  const staticCatalog = product.catalogStatus === "DONE" ? [{
    id: "cat-static",
    url: `${process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:4000"}/CatalogOutput/shot_0.jpg`,
    type: "IMAGE" as const,
  }] : [];
  
  const images = [...staticCatalog, ...catalogImages, ...baseImages];
  
  const hero = images[heroIndex]?.url ?? null;
  const weaverName = product.user?.weaverProfile?.name;

  async function onGenerateCatalog() {
    if (!product) return;
    try {
      await apiClient.generateCatalog(product.id);
      Alert.alert("Catalog Generation Started", "This usually takes 1-2 minutes. Check back later!");
      load();
    } catch {
      Alert.alert("Failed to start generation");
    }
  }

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

        {isWeaver ? (
          <View style={styles.section}>
            <Text variant="h2">AI Catalog</Text>
            {product.catalogStatus === "DONE" ? (
              <Text color={colors.success}>AI Catalog successfully generated! You can see the new images in the gallery above.</Text>
            ) : product.catalogStatus === "PROCESSING" ? (
              <Text color={colors.warning}>Generating AI Catalog... Please check back in a few minutes.</Text>
            ) : (
              <Button 
                label="Generate AI Catalog" 
                variant="outline" 
                onPress={onGenerateCatalog} 
              />
            )}
          </View>
        ) : null}

        {isWeaver && product.status === "DRAFT" ? (
          <View style={styles.section}>
            <Text variant="h2">Publish</Text>
            <Text color={colors.neutral700} style={{ marginBottom: spacing.sm }}>
              This product is currently a draft. You can publish it directly to make it visible to buyers without generating an AI catalog.
            </Text>
            <Button 
              label="Publish Now" 
              onPress={async () => {
                try {
                  await apiClient.updateProduct(product.id, { status: "READY" });
                  Alert.alert("Success", "Product published successfully!");
                  load();
                } catch {
                  Alert.alert("Error", "Failed to publish product.");
                }
              }} 
            />
          </View>
        ) : null}

        {/* Authenticity QR Code */}
        <View style={styles.section}>
          <Card style={{ alignItems: "center", padding: spacing.xl, gap: spacing.md, marginTop: spacing.lg }}>
            <BadgeCheck size={32} color={colors.success} />
            <Text variant="h2">Blockchain Authenticity</Text>
            <Text variant="caption" color={colors.neutral500} style={{ textAlign: "center" }}>
              Scan this QR code in the Verify tab to trace this product's origin on the blockchain.
            </Text>
            <View style={{ padding: spacing.md, backgroundColor: colors.inkOnDark, borderRadius: radius.md }}>
              <Image 
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://www.loommitra.live/verify?p=${product.id}`)}` }} 
                style={{ width: 150, height: 150 }} 
                contentFit="contain" 
              />
            </View>
            <Text variant="caption" color={colors.neutral400}>{product.id}</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      <View style={styles.actions}>
        {isWeaver ? (
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              style={{ flex: 1 }}
              label="Edit"
              variant="outline"
              onPress={() => router.push(`/product/edit/${product.id}` as any)}
            />
            <Button
              style={{ flex: 1 }}
              label={t("common:actions.delete")}
              variant="outline"
              icon={<Trash2 size={20} color={colors.ink} />}
              onPress={onDelete}
            />
          </View>
        ) : isBusiness ? (
          <View style={{ gap: spacing.md }}>
            <Input
              label={`Bulk Quantity (Min: ${product.minOrderQuantity})`}
              keyboardType="number-pad"
              value={bulkQty}
              onChangeText={setBulkQty}
              placeholder="Enter quantity"
            />
            <Button
              label={requesting ? "Requesting..." : "Request Bulk Order"}
              size="lg"
              loading={requesting}
              onPress={onRequestBulkOrder}
            />
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              style={{ flex: 1 }}
              label={added ? "✓" : t("product:addToCart")}
              size="lg"
              variant="outline"
              disabled={product.stock <= 0}
              icon={<ShoppingCart size={22} color={colors.ink} />}
              onPress={onAddToCart}
            />
            <Button
              style={{ flex: 1 }}
              label="Buy Now"
              size="lg"
              disabled={product.stock <= 0}
              onPress={() => {
                onAddToCart();
                router.push("/(customer)/checkout" as any);
              }}
            />
          </View>
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
