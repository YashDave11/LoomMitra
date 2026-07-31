import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { apiClient, ApiError } from "@/lib/apiClient";
import type { BulkOrderRequest } from "@/lib/types";
import { Header, Text, Button, Card, Badge, LoadingState, ErrorState, Input } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { colors, spacing } from "@/theme";

export default function BusinessOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<BulkOrderRequest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [submitting, setSubmitting] = useState(false);
  const [bargainPrice, setBargainPrice] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    try {
      // The API doesn't have a getBulkOrder(id) right now, but getBulkOrders() returns all of them.
      // A more robust implementation would add getBulkOrder(id) to the backend.
      const orders = await apiClient.getBulkOrders();
      const match = orders.find(o => o.id === id);
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

  async function negotiate(action: "ACCEPT_QUOTE" | "BARGAIN" | "REJECT") {
    if (!order) return;
    const bp = action === "BARGAIN" ? parseFloat(bargainPrice) : undefined;
    if (action === "BARGAIN" && (!bp || isNaN(bp) || bp <= 0)) {
      Alert.alert("Please enter a valid bargain price");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.negotiateBulkOrder(order.id, action, bp);
      Alert.alert("Success", "Order updated");
      load();
    } catch (err) {
      Alert.alert(err instanceof ApiError ? err.message : "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return <LoadingState />;
  if (status === "error" || !order) return <ErrorState title="Failed to load order" onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} title="Order Details" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="h2">{order.product?.title ?? "Unknown Product"}</Text>
          <View style={styles.row}>
            <Text>Status:</Text>
            <Badge label={order.status} tone={order.status === "ACCEPTED" ? "success" : order.status === "REJECTED" ? "danger" : "warning"} />
          </View>
          <View style={styles.row}>
            <Text>Quantity requested:</Text>
            <Text variant="bodyStrong">{order.quantity}</Text>
          </View>
          {order.quotedPrice ? (
            <View style={styles.row}>
              <Text>Weaver's Quote:</Text>
              <Text variant="bodyStrong">{formatPrice(order.quotedPrice)}</Text>
            </View>
          ) : null}
          {order.bargainPrice ? (
            <View style={styles.row}>
              <Text>Your Bargain:</Text>
              <Text variant="bodyStrong">{formatPrice(order.bargainPrice)}</Text>
            </View>
          ) : null}
          {order.finalPrice ? (
            <View style={styles.row}>
              <Text>Final Price:</Text>
              <Text variant="bodyStrong" color={colors.success}>{formatPrice(order.finalPrice)}</Text>
            </View>
          ) : null}
        </Card>

        {order.status === "WEAVER_RESPONDED" ? (
          <Card style={styles.card}>
            <Text variant="h2">Negotiate</Text>
            <Button
              label="Accept Quote"
              onPress={() => negotiate("ACCEPT_QUOTE")}
              loading={submitting}
            />
            <View style={{ height: spacing.lg }} />
            <Input
              label="Counter Offer Price"
              keyboardType="decimal-pad"
              value={bargainPrice}
              onChangeText={setBargainPrice}
              placeholder="Enter your bargain price"
            />
            <Button
              label="Send Counter Offer"
              variant="outline"
              onPress={() => negotiate("BARGAIN")}
              loading={submitting}
              disabled={!bargainPrice}
            />
            <View style={{ height: spacing.lg }} />
            <Button
              label="Reject Order"
              variant="outline"
              onPress={() => negotiate("REJECT")}
              loading={submitting}
            />
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
});
