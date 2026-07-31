import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { apiClient } from "@/lib/apiClient";
import { useCart } from "@/lib/CartContext";
import { Header, Input, Button, Text, Card } from "@/components/ui";
import { colors, spacing } from "@/theme";

export default function CheckoutScreen() {
  const { t } = useTranslation(["customer", "common"]);
  const { items, clear } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    fullName.trim() &&
    phone.trim() &&
    address.trim() &&
    city.trim() &&
    pincode.trim() &&
    items.length > 0 &&
    !submitting;

  async function onPlaceOrder() {
    setSubmitting(true);
    try {
      await apiClient.createCustomerOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },
        paymentMethod: "CASH_ON_DELIVERY", // Defaulting to COD for now
      });

      clear();
      Alert.alert(
        t("customer:checkout.successTitle", "Order Placed"),
        t("customer:checkout.successMessage", "Your order has been placed successfully!"),
        [{ text: t("common:actions.ok", "OK"), onPress: () => router.replace("/(customer)/browse" as any) }]
      );
    } catch (err) {
      setSubmitting(false);
      Alert.alert(t("common:errors.generic", "Something went wrong"));
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} title={t("customer:checkout.title", "Checkout")} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text variant="h2" style={styles.heading}>
            {t("customer:checkout.shippingDetails", "Shipping Details")}
          </Text>
          
          <View style={styles.form}>
            <Input
              label={t("customer:checkout.fullName", "Full Name")}
              placeholder="e.g. Rahul Kumar"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              label={t("customer:checkout.phone", "Phone Number")}
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              label={t("customer:checkout.address", "Street Address")}
              placeholder="House/Flat No., Street, Area"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <Input
              label={t("customer:checkout.city", "City")}
              placeholder="e.g. Varanasi"
              value={city}
              onChangeText={setCity}
            />
            <Input
              label={t("customer:checkout.pincode", "Pincode")}
              placeholder="e.g. 221001"
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label={submitting ? t("common:actions.loading", "Placing Order...") : t("customer:checkout.placeOrder", "Place Order (Cash on Delivery)")}
          size="lg"
          loading={submitting}
          disabled={!canSubmit}
          onPress={onPlaceOrder}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing["2xl"] },
  card: { padding: spacing.lg },
  heading: { marginBottom: spacing.lg },
  form: { gap: spacing.md },
  actions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.bg,
  },
});
