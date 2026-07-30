import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Search, Gavel, ShoppingCart, User } from "lucide-react-native";

import { useRequireRole } from "@/lib/useRequireRole";
import { useCart } from "@/lib/CartContext";
import { LoadingState } from "@/components/ui";
import { colors, touch } from "@/theme";
import { View, Text, StyleSheet } from "react-native";

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={badge.wrap}>
      <Text style={badge.text}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  text: { color: colors.inkOnDark, fontSize: 11, fontWeight: "700" },
});

export default function CustomerLayout() {
  const { t } = useTranslation("nav");
  const { ready } = useRequireRole(["CUSTOMER"]);
  const { count } = useCart();

  if (!ready) return <LoadingState />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.neutral400,
        tabBarStyle: { height: touch.large + 12, paddingTop: 6, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="browse"
        options={{
          title: t("discover"),
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="auctions"
        options={{
          title: t("auctionHouse"),
          tabBarIcon: ({ color, size }) => <Gavel color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("cart"),
          tabBarIcon: ({ color, size }) => (
            <View>
              <ShoppingCart color={color} size={size} />
              <CartBadge count={count} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
