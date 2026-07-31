import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { apiClient, ApiError } from "@/lib/apiClient";
import type { CustomerOrder, CustomerOrderStatus } from "@/lib/types";
import { Header, Text, Button, Card, Badge, LoadingState, ErrorState } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { colors, spacing } from "@/theme";

export default function WeaverCustomerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(["weaver", "common"]);

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

  async function updateStatus(newStatus: CustomerOrderStatus) {
    if (!order) return;
    setSubmitting(true);
    try {
      await apiClient.updateCustomerOrderStatus(order.id, newStatus);
      Alert.alert("Success", "Order status updated");
      load();
    } catch (err) {
      Alert.alert(err instanceof ApiError ? err.message : t("weaver:customerOrders.updateFailed", "Failed to update status"));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return <LoadingState />;
  if (status === "error" || !order) return <ErrorState title={t("common:errors.generic", "Failed to load order")} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} title={t("weaver:customerOrders.title", "Order Details")} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="h2">{t("weaver:customerOrders.orderNumber", "Order")} #{order.id.slice(0, 8)}</Text>
          <View style={styles.row}>
            <Text>{t("common:status", "Status")}:</Text>
            <Badge 
              label={order.status} 
              tone={
                order.status === "DELIVERED" ? "success" : 
                order.status === "SHIPPED" ? "warning" : "neutral"
              } 
            />
          </View>
          <View style={styles.row}>
            <Text>{t("weaver:customerOrders.total", "Total Price:")}</Text>
            <Text variant="bodyStrong" color={colors.success}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="h2">{t("weaver:customerOrders.shipTo", "Shipping Address")}</Text>
          <Text>{order.shippingAddress.fullName}</Text>
          <Text>{order.shippingAddress.phone}</Text>
          <Text>{order.shippingAddress.address}</Text>
          <Text>{order.shippingAddress.city} - {order.shippingAddress.pincode}</Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="h2">{t("common:items", "Items")}</Text>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{item.product?.title ?? t("weaver:dashboard.unknownProduct", "Unknown Product")}</Text>
                <Text variant="caption" color={colors.neutral500}>{t("weaver:dashboard.qty", { count: item.quantity })}</Text>
              </View>
              <Text variant="bodyStrong">{formatPrice(item.priceAtPurchase)}</Text>
            </View>
          ))}
        </Card>

        {order.status !== "DELIVERED" ? (
          <Card style={styles.card}>
            <Text variant="h2">Update Status</Text>
            
            {order.status === "PLACED" && (
              <Button
                label={t("weaver:customerOrders.markReady", "Mark as Ready")}
                onPress={() => updateStatus("READY")}
                loading={submitting}
              />
            )}
            
            {order.status === "READY" && (
              <Button
                label={t("weaver:customerOrders.markShipped", "Mark as Shipped")}
                onPress={() => updateStatus("SHIPPED")}
                loading={submitting}
              />
            )}
            
            {order.status === "SHIPPED" && (
              <Button
                label={t("weaver:customerOrders.markDelivered", "Mark as Delivered")}
                onPress={() => updateStatus("DELIVERED")}
                loading={submitting}
              />
            )}
          </Card>
        ) : null}
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
