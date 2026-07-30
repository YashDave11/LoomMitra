import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react-native";

import { apiClient } from "@/lib/apiClient";
import type { Auction } from "@/lib/types";
import { Text, Button, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { AuctionCard } from "@/components/domain/AuctionCard";
import { colors, spacing } from "@/theme";

export default function WeaverAuctions() {
  const { t } = useTranslation(["auction", "common"]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Tick every 30s so LIVE countdowns stay fresh without thrashing.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    try {
      setAuctions(await apiClient.getAuctions(true));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (status === "loading") return <LoadingState label={t("auction:list.loading")} />;
  if (status === "error") {
    return <ErrorState title={t("common:errors.generic")} retryLabel={t("common:actions.retry")} onRetry={load} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="h1">{t("auction:mine.title")}</Text>
        <Text variant="caption" color={colors.neutral500}>{t("auction:mine.subtitle")}</Text>
      </View>

      <FlatList
        data={auctions}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <AuctionCard auction={item} now={now} onPress={() => router.push(`/auction/${item.id}`)} />
        )}
        ListEmptyComponent={<EmptyState title={t("auction:mine.empty")} />}
      />

      <View style={styles.fab}>
        <Button
          label={t("auction:mine.newAuction")}
          size="lg"
          icon={<Plus size={22} color={colors.inkOnDark} />}
          onPress={() => router.push("/auction/new")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 96, gap: spacing.md, flexGrow: 1 },
  fab: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
