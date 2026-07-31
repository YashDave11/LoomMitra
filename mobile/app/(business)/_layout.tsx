import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Search, PackageSearch, User } from "lucide-react-native";

import { useRequireRole } from "@/lib/useRequireRole";
import { LoadingState } from "@/components/ui";
import { colors, touch } from "@/theme";

export default function BusinessLayout() {
  const { t } = useTranslation("nav");
  // Allow only BUSINESS role
  const { ready } = useRequireRole(["BUSINESS"]);

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
          title: t("discover", "Discover"),
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("bulkOrders", "Bulk Orders"),
          tabBarIcon: ({ color, size }) => <PackageSearch color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile", "Profile"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
