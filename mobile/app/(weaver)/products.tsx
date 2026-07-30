import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react-native";

import { apiClient } from "@/lib/apiClient";
import type { Product } from "@/lib/types";
import { Text, Button, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { ProductCard } from "@/components/domain/ProductCard";
import { colors, spacing } from "@/theme";

export default function WeaverProducts() {
  const { t } = useTranslation(["weaver", "common"]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setProducts(await apiClient.getProducts());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (status === "loading") return <LoadingState label={t("weaver:products.loading")} />;
  if (status === "error") {
    return (
      <ErrorState
        title={t("common:errors.generic")}
        retryLabel={t("common:actions.retry")}
        onRetry={load}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="h1">{t("weaver:products.title")}</Text>
          <Text variant="caption" color={colors.neutral500}>{t("weaver:products.subtitle")}</Text>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard product={item} showStatus onPress={() => router.push(`/product/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={t("weaver:products.emptyTitle")}
            subtitle={t("weaver:products.emptyDesc")}
            actionLabel={t("weaver:products.addFirst")}
            onAction={() => router.push("/product/new")}
          />
        }
      />

      <View style={styles.fab}>
        <Button
          label={t("weaver:products.addProduct")}
          size="lg"
          icon={<Plus size={22} color={colors.inkOnDark} />}
          onPress={() => router.push("/product/new")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 96, gap: spacing.md, flexGrow: 1 },
  row: { gap: spacing.md },
  cell: { flex: 1 },
  fab: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
