import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { LayoutGrid, Package, Gavel, User, Menu } from "lucide-react-native";

import { useRequireRole } from "@/lib/useRequireRole";
import { LoadingState } from "@/components/ui";
import { colors, touch } from "@/theme";

// Weaver shell
const ALLOWED = ["WEAVER"] as const;

export default function WeaverLayout() {
  const { t } = useTranslation("nav");
  const { ready } = useRequireRole([...ALLOWED]);

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
        name="dashboard"
        options={{ title: t("dashboard"), tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: t("products"), tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: t("nav.bulkOrders", "Bulk Orders"), tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: t("nav.more", "More"), tabBarIcon: ({ color, size }) => <Menu color={color} size={size} /> }}
      />
      {/* Hide these from bottom bar */}
      <Tabs.Screen name="auctions" options={{ href: null }} />
      <Tabs.Screen name="customer-orders" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{ title: t("profile"), tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
