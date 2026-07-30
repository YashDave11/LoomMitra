import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Plus, Package, CheckCircle2, ShoppingBag } from "lucide-react-native";

import { apiClient } from "@/lib/apiClient";
import type { CustomerOrder, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, Card, LoadingState, ErrorState } from "@/components/ui";
import { LanguageSwitcher } from "@/components/domain/LanguageSwitcher";
import { StatCard } from "@/components/domain/StatCard";
import { ProductCard } from "@/components/domain/ProductCard";
import { colors, spacing } from "@/theme";

export default function WeaverDashboard() {
  const { t } = useTranslation(["weaver", "nav", "common"]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCustomerOrders().catch(() => [] as CustomerOrder[]),
      ]);
      setProducts(p);
      setOrders(o);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (status === "loading") return <LoadingState label={t("common:actions.loading")} />;
  if (status === "error") {
    return (
      <ErrorState
        title={t("common:errors.generic")}
        message={t("common:errors.tryAgain")}
        retryLabel={t("common:actions.retry")}
        onRetry={load}
      />
    );
  }

  const readyCount = products.filter((p) => p.status === "READY").length;
  const toFulfil = orders.filter((o) => o.status !== "DELIVERED").length;
  const revenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  const recent = products.slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="h1">{t("weaver:dashboard.welcomeBack")}</Text>
            <Text color={colors.neutral500}>{t("weaver:dashboard.subtitle")}</Text>
          </View>
          <LanguageSwitcher compact />
        </View>

        <Button
          label={t("weaver:dashboard.newProduct")}
          size="lg"
          icon={<Plus size={22} color={colors.inkOnDark} />}
          onPress={() => router.push("/product/new")}
        />

        {toFulfil > 0 ? (
          <Card raised style={styles.banner}>
            <Text variant="bodyStrong">
              {t("weaver:dashboard.newOrdersBanner", { count: toFulfil })}
            </Text>
            <Text variant="caption" color={colors.neutral500}>
              {t("weaver:dashboard.newOrdersBannerDesc")}
            </Text>
          </Card>
        ) : null}

        <View style={styles.statsRow}>
          <StatCard
            label={t("weaver:dashboard.stats.totalProducts")}
            value={products.length}
            icon={<Package size={18} color={colors.neutral400} />}
          />
          <StatCard
            label={t("weaver:dashboard.stats.readyForCatalog")}
            value={readyCount}
            icon={<CheckCircle2 size={18} color={colors.neutral400} />}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label={t("weaver:dashboard.stats.customerOrders")}
            value={orders.length}
            hint={t("weaver:dashboard.stats.toFulfil", { count: toFulfil })}
            icon={<ShoppingBag size={18} color={colors.neutral400} />}
          />
          <StatCard
            label={t("weaver:dashboard.stats.orderRevenue")}
            value={formatPrice(revenue)}
          />
        </View>

        <View style={styles.sectionHead}>
          <Text variant="h2">{t("weaver:dashboard.recentProducts")}</Text>
          <Text variant="label" color={colors.info} onPress={() => router.push("/(weaver)/products")}>
            {t("weaver:dashboard.viewAll")}
          </Text>
        </View>

        {recent.length === 0 ? (
          <Card>
            <Text color={colors.neutral500}>{t("weaver:dashboard.noProducts")}</Text>
          </Card>
        ) : (
          <View style={styles.grid}>
            {recent.map((p) => (
              <View key={p.id} style={styles.gridItem}>
                <ProductCard
                  product={p}
                  showStatus
                  onPress={() => router.push(`/product/${p.id}`)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  banner: { gap: spacing.xs, borderColor: colors.ink },
  statsRow: { flexDirection: "row", gap: spacing.md },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { width: "47.5%", flexGrow: 1 },
});
