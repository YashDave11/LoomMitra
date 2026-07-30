import { StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2 } from "lucide-react-native";

import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/format";
import { Text, Button, Card, EmptyState } from "@/components/ui";
import { colors, radius, spacing, touch } from "@/theme";

function QtyButton({ icon, onPress, label }: { icon: React.ReactNode; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.6 }]}
    >
      {icon}
    </Pressable>
  );
}

export default function CartScreen() {
  const { t } = useTranslation(["customer", "common"]);
  const { items, count, subtotal, updateQuantity, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <EmptyState title={t("customer:cart.emptyTitle")} subtitle={t("customer:cart.emptyDesc")} />
      </SafeAreaView>
    );
  }

  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="h1">{t("customer:cart.title")}</Text>
        <Text variant="caption" color={colors.neutral500}>
          {t("customer:cart.itemCount", { count })}
        </Text>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <Card key={item.productId} style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" />
            <View style={styles.itemBody}>
              <Text variant="bodyStrong" numberOfLines={1}>{item.title}</Text>
              <Text variant="caption" color={colors.neutral500}>
                {t("customer:cart.priceEach", { price: item.price })}
              </Text>
              <View style={styles.qtyRow}>
                <QtyButton
                  icon={<Minus size={18} color={colors.ink} />}
                  onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                  label={t("common:actions.remove")}
                />
                <Text variant="title" style={styles.qty}>{item.quantity}</Text>
                <QtyButton
                  icon={<Plus size={18} color={colors.ink} />}
                  onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                  label={t("common:actions.add")}
                />
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={() => removeItem(item.productId)}
                  accessibilityRole="button"
                  accessibilityLabel={t("common:actions.remove")}
                  hitSlop={8}
                  style={styles.trash}
                >
                  <Trash2 size={20} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Card style={styles.summary}>
        <Text variant="h2">{t("customer:cart.orderSummary")}</Text>
        <SummaryRow label={t("customer:cart.subtotalCount", { count })} value={formatPrice(subtotal)} />
        <SummaryRow label={t("customer:cart.gst")} value={formatPrice(gst)} />
        <View style={styles.divider} />
        <SummaryRow label={t("common:fields.total")} value={formatPrice(total)} strong />
        <Button label={t("customer:cart.proceedToCheckout")} size="lg" onPress={() => { /* checkout flow — see notes */ }} />
        <Button label={t("customer:cart.clearCart")} variant="ghost" onPress={clear} />
      </Card>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text variant={strong ? "title" : "body"} color={strong ? colors.ink : colors.neutral500}>{label}</Text>
      <Text variant={strong ? "title" : "bodyStrong"}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
  item: { flexDirection: "row", gap: spacing.md, padding: spacing.md },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.neutral100 },
  itemBody: { flex: 1, gap: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.xs },
  qtyBtn: {
    width: touch.min,
    height: touch.min - 8,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: { minWidth: 24, textAlign: "center" },
  trash: { width: touch.min, height: touch.min - 8, alignItems: "flex-end", justifyContent: "center" },
  summary: { margin: spacing.lg, gap: spacing.md },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  divider: { height: 1, backgroundColor: colors.neutral200 },
});
