import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

import { apiClient } from "@/lib/apiClient";
import type { CustomerOrder } from "@/lib/types";
import { Text, Badge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { colors, spacing, radius } from "@/theme";

export default function WeaverCustomerOrdersListScreen() {
  const { t } = useTranslation(["weaver", "common"]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await apiClient.getCustomerOrders();
      setOrders(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState title={t("common:errors.generic", "Failed to load orders")} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="h1">{t("weaver:customerOrders.title", "Retail Orders")}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(weaver)/customer-orders/${item.id}` as any)}
          >
            <View style={styles.cardHeader}>
              <Text variant="bodyStrong">{t("weaver:customerOrders.orderNumber", "Order")} #{item.id.slice(0, 8)}</Text>
              <Badge 
                label={item.status} 
                tone={
                  item.status === "DELIVERED" ? "success" : 
                  item.status === "SHIPPED" ? "warning" : "neutral"
                } 
              />
            </View>
            <View style={styles.cardBody}>
              <Text variant="caption" color={colors.neutral500}>{t("common:itemsCount", { count: item.items.length, defaultValue: `${item.items.length} items` })}</Text>
              <Text variant="caption" color={colors.success}>{t("weaver:customerOrders.total", "Total:")} {formatPrice(item.totalAmount)}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState title={t("weaver:customerOrders.emptyTitle", "No Retail Orders")} subtitle={t("weaver:customerOrders.empty", "You haven't received any retail orders yet.")} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing["4xl"], gap: spacing.md },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBody: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xs },
});
