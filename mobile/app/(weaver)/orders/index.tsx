import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import { apiClient } from "@/lib/apiClient";
import type { BulkOrderRequest } from "@/lib/types";
import { Text, Badge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { colors, spacing, radius } from "@/theme";

export default function BusinessOrdersListScreen() {
  const [orders, setOrders] = useState<BulkOrderRequest[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await apiClient.getBulkOrders();
      setOrders(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState title="Failed to load orders" onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="h1">Bulk Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(weaver)/orders/${item.id}` as any)}
          >
            <View style={styles.cardHeader}>
              <Text variant="bodyStrong">{item.product?.title ?? "Unknown Product"}</Text>
              <Badge label={item.status} tone={item.status === "ACCEPTED" ? "success" : item.status === "REJECTED" ? "danger" : "warning"} />
            </View>
            <View style={styles.cardBody}>
              <Text variant="caption" color={colors.neutral500}>Qty: {item.quantity}</Text>
              {item.quotedPrice ? (
                <Text variant="caption" color={colors.neutral500}>Quote: {formatPrice(item.quotedPrice)}</Text>
              ) : null}
              {item.finalPrice ? (
                <Text variant="caption" color={colors.success}>Final: {formatPrice(item.finalPrice)}</Text>
              ) : null}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState title="No Bulk Orders" subtitle="You haven't requested any bulk orders yet." />}
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
  cardBody: { flexDirection: "row", gap: spacing.md },
});
