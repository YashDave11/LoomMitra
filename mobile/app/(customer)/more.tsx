import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Gavel, ChevronRight } from "lucide-react-native";

import { Header, Text, Card } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";

export default function MoreScreen() {
  const { t } = useTranslation(["nav", "common"]);

  const menuItems = [
    {
      id: "verify",
      title: t("nav.verify", "Verify Authenticity"),
      subtitle: "Scan or enter a product QR code",
      icon: <ShieldCheck size={24} color={colors.ink} />,
      route: "/(customer)/verify" as any,
    },
    {
      id: "auctions",
      title: t("nav.auctions", "Auction House"),
      subtitle: "Bid on exclusive handloom pieces",
      icon: <Gavel size={24} color={colors.ink} />,
      route: "/(customer)/auctions" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title="More Options" />
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
