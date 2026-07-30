import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { apiClient } from "@/lib/apiClient";
import type { DiscoverProduct } from "@/lib/types";
import { CATEGORIES, optionLabel } from "@/lib/productOptions";
import { Text, Input, Chip, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { LanguageSwitcher } from "@/components/domain/LanguageSwitcher";
import { ProductCard } from "@/components/domain/ProductCard";
import { colors, spacing } from "@/theme";

export default function BrowseScreen() {
  const { t } = useTranslation(["discover", "product", "common"]);
  const [products, setProducts] = useState<DiscoverProduct[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setProducts(await apiClient.getDiscoverProducts(type ? { type } : undefined));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  // Search is client-side over the fetched list (title + design).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.designName ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="h1">{t("discover:title")}</Text>
          <LanguageSwitcher compact />
        </View>
        <Input
          placeholder={t("discover:filters.searchPlaceholder")}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label={t("discover:filters.allCategories")} selected={type === ""} onPress={() => setType("")} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              label={optionLabel(t, "category", c.value)}
              selected={type === c.value}
              onPress={() => setType(c.value)}
            />
          ))}
        </ScrollView>
      </View>

      {status === "loading" ? (
        <LoadingState />
      ) : status === "error" ? (
        <ErrorState title={t("common:errors.generic")} retryLabel={t("common:actions.retry")} onRetry={load} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <ProductCard
                product={item}
                weaverName={item.user?.weaverProfile?.name}
                onPress={() => router.push(`/product/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title={t("discover:empty.title")}
              subtitle={t("discover:empty.hint")}
              actionLabel={t("discover:empty.clearAll")}
              onAction={() => { setType(""); setSearch(""); }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chipsWrap: { paddingVertical: spacing.md },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing["4xl"], gap: spacing.md, flexGrow: 1 },
  row: { gap: spacing.md },
  cell: { flex: 1 },
});
