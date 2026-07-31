import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { apiClient } from "@/lib/apiClient";
import type { CustomerOrder } from "@/lib/types";
import { Header, Text, Card, Badge, LoadingState, ErrorState } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { colors, spacing } from "@/theme";

export default function CustomerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const { t } = useTranslation(["customer", "common"]);

  const load = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    try {
      const orders = await apiClient.getCustomerOrders();
      const match = orders.find((o) => o.id === id);
      if (match) {
        setOrder(match);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (status === "loading") return <LoadingState />;
  if (status === "error" || !order) return <ErrorState title={t("customer:orders.failedLoad", "Failed to load order")} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} title={t("customer:orders.details", "Order Details")} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="h2">{t("customer:orders.orderNum", { id: order.id.slice(0, 8) })}</Text>
          <View style={styles.row}>
            <Text>{t("customer:orders.status", "Status:")}</Text>
            <Badge 
              label={order.status} 
              tone={
                order.status === "DELIVERED" ? "success" : 
                order.status === "SHIPPED" ? "warning" : "neutral"
              } 
            />
          </View>
          <View style={styles.row}>
            <Text>{t("customer:orders.totalPrice", "Total Price:")}</Text>
            <Text variant="bodyStrong" color={colors.success}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="h2">{t("customer:orders.shippingAddress", "Shipping Address")}</Text>
          <Text>{order.shippingAddress.fullName}</Text>
          <Text>{order.shippingAddress.phone}</Text>
          <Text>{order.shippingAddress.address}</Text>
          <Text>{order.shippingAddress.city} - {order.shippingAddress.pincode}</Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="h2">{t("customer:orders.itemsHeading", "Items")}</Text>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{item.product?.title ?? t("customer:orders.unknownProduct", "Unknown Product")}</Text>
                <Text variant="caption" color={colors.neutral500}>{t("customer:orders.qty", { count: item.quantity })}</Text>
              </View>
              <Text variant="bodyStrong">{formatPrice(item.priceAtPurchase)}</Text>
            </View>
          ))}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  card: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral200 },
});
