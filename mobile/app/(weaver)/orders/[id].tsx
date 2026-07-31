import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { apiClient, ApiError } from "@/lib/apiClient";
import type { BulkOrderRequest } from "@/lib/types";
import { Header, Text, Button, Card, Badge, LoadingState, ErrorState, Input } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { colors, spacing } from "@/theme";

export default function WeaverOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<BulkOrderRequest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [submitting, setSubmitting] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    try {
      const orders = await apiClient.getBulkOrders();
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

  async function respond(action: "ACCEPT" | "REJECT") {
    if (!order) return;
    const qp = action === "ACCEPT" ? parseFloat(quotedPrice) : undefined;
    if (action === "ACCEPT" && (!qp || isNaN(qp) || qp <= 0)) {
      Alert.alert("Please enter a valid quoted price per unit");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.respondToBulkOrder(order.id, action, qp);
      Alert.alert("Success", "Response sent to buyer");
      load();
    } catch (err) {
      Alert.alert(err instanceof ApiError ? err.message : "Failed to respond");
    } finally {
      setSubmitting(false);
    }
  }

  async function negotiate(action: "ACCEPT_BARGAIN" | "REJECT_BARGAIN") {
    if (!order) return;
    setSubmitting(true);
    try {
      await apiClient.negotiateBulkOrder(order.id, action);
      Alert.alert("Success", "Bargain response sent");
      load();
    } catch (err) {
      Alert.alert(err instanceof ApiError ? err.message : "Failed to respond");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return <LoadingState />;
  if (status === "error" || !order) return <ErrorState title="Failed to load order" onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} title="Order Request" />
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
          <View style={styles.row}>
            <Text>Buyer:</Text>
            <Text variant="bodyStrong">{order.business?.businessProfile?.businessName || "Unknown Buyer"}</Text>
          </View>
          {order.quotedPrice ? (
            <View style={styles.row}>
              <Text>Your Quote:</Text>
              <Text variant="bodyStrong">{formatPrice(order.quotedPrice)}</Text>
            </View>
          ) : null}
          {order.bargainPrice ? (
            <View style={styles.row}>
              <Text>Buyer's Bargain Offer:</Text>
              <Text variant="bodyStrong" color={colors.danger}>{formatPrice(order.bargainPrice)}</Text>
            </View>
          ) : null}
          {order.finalPrice ? (
            <View style={styles.row}>
              <Text>Final Accepted Price:</Text>
              <Text variant="bodyStrong" color={colors.success}>{formatPrice(order.finalPrice)}</Text>
            </View>
          ) : null}
        </Card>

        {order.status === "PENDING" ? (
          <Card style={styles.card}>
            <Text variant="h2">Provide Quote</Text>
            <Input
              label="Quoted Price Per Unit"
              keyboardType="decimal-pad"
              value={quotedPrice}
              onChangeText={setQuotedPrice}
              placeholder="Enter your quote"
            />
            <Button
              label="Send Quote"
              onPress={() => respond("ACCEPT")}
              loading={submitting}
              disabled={!quotedPrice}
            />
            <View style={{ height: spacing.lg }} />
            <Button
              label="Reject Request"
              variant="outline"
              onPress={() => respond("REJECT")}
              loading={submitting}
            />
          </Card>
        ) : null}

        {order.status === "BARGAINING" ? (
          <Card style={styles.card}>
            <Text variant="h2">Buyer Counter Offer</Text>
            <Text>The buyer has countered with {formatPrice(order.bargainPrice || 0)} per unit.</Text>
            <View style={{ height: spacing.sm }} />
            <Button
              label="Accept Bargain"
              onPress={() => negotiate("ACCEPT_BARGAIN")}
              loading={submitting}
            />
            <View style={{ height: spacing.lg }} />
            <Button
              label="Reject Bargain"
              variant="outline"
              onPress={() => negotiate("REJECT_BARGAIN")}
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
