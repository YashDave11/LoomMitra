import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Gavel, Package, ChevronRight } from "lucide-react-native";

import { Header, Text, Card } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";

export default function WeaverMoreScreen() {
  const { t } = useTranslation(["nav", "common", "weaver"]);

  const menuItems = [
    {
      id: "customer-orders",
      title: t("nav.retailOrders", "Retail Orders"),
      subtitle: t("weaver:nav.retailOrdersSubtitle", "Manage direct customer orders"),
      icon: <Package size={24} color={colors.ink} />,
      route: "/(weaver)/customer-orders" as any,
    },
    {
      id: "auctions",
      title: t("nav.auctions", "Auction House"),
      subtitle: t("weaver:nav.auctionsSubtitle", "Manage your live auctions"),
      icon: <Gavel size={24} color={colors.ink} />,
      route: "/(weaver)/auctions" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title={t("nav.more", "More Options")} />
      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.route)}
          >
            <Card style={styles.card}>
              <View style={styles.iconBox}>{item.icon}</View>
              <View style={styles.textContainer}>
                <Text variant="bodyStrong">{item.title}</Text>
                <Text variant="caption" color={colors.neutral500}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={colors.neutral400} />
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
});
