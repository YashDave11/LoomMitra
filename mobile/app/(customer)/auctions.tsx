import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { useTranslation } from "react-i18next";

import { apiClient } from "@/lib/apiClient";
import type { Auction } from "@/lib/types";
import { Text, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { AuctionCard } from "@/components/domain/AuctionCard";
import { colors, spacing } from "@/theme";

export default function CustomerAuctions() {
  const { t } = useTranslation(["auction", "common"]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    try {
      setAuctions(await apiClient.getAuctions(false));
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
        <Text variant="h1">{t("auction:list.title")}</Text>
        <Text variant="caption" color={colors.neutral500}>{t("auction:list.subtitle")}</Text>
      </View>

      <FlatList
        data={auctions}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <AuctionCard auction={item} now={now} onPress={() => router.push(`/auction/${item.id}`)} />
        )}
        ListEmptyComponent={<EmptyState title={t("auction:list.empty")} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing["4xl"], gap: spacing.md, flexGrow: 1 },
});
