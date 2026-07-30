import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Clock, Gavel } from "lucide-react-native";

import { apiClient, ApiError } from "@/lib/apiClient";
import { useAuth } from "@/lib/AuthContext";
import type { Auction } from "@/lib/types";
import { firstImage, formatPrice, timeLeft } from "@/lib/format";
import {
  Header,
  Text,
  Button,
  Card,
  Input,
  Badge,
  Chip,
  auctionTone,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { colors, radius, spacing } from "@/theme";

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(["auction", "common"]);
  const { role } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [now, setNow] = useState(Date.now());
  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  // 10s clock + light polling keeps LIVE auctions fresh.
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(clock);
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setAuction(await apiClient.getAuction(id));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Poll bids every 15s while live.
  useEffect(() => {
    if (auction?.status !== "LIVE") return;
    const poll = setInterval(load, 15000);
    return () => clearInterval(poll);
  }, [auction?.status, load]);

  async function placeBid() {
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) return;
    setPlacing(true);
    setBidError(null);
    setBidSuccess(false);
    try {
      const updated = await apiClient.placeBid(id!, amount);
      setAuction(updated);
      setBidAmount("");
      setBidSuccess(true);
    } catch (err) {
      // Backend returns validation codes — map to translated messages.
      const code = err instanceof ApiError ? err.message : "generic";
      setBidError(t(`auction:validation.${code}`, { defaultValue: t("auction:validation.generic") }));
    } finally {
      setPlacing(false);
    }
  }

  if (status === "loading") return <LoadingState label={t("auction:list.loading")} />;
  if (status === "error" || !auction) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={() => router.back()} backLabel={t("auction:detail.backToList")} />
        <ErrorState title={t("common:errors.generic")} retryLabel={t("common:actions.retry")} onRetry={load} />
      </SafeAreaView>
    );
  }

  const img = firstImage(auction.product?.images);
  const isLive = auction.status === "LIVE";
  const left = isLive ? timeLeft(auction.endTime, now) : null;
  const current = auction.highestBid ?? auction.basePrice;
  const minNext = (auction.highestBid ?? auction.basePrice) + (auction.minBidIncrement ?? 1);
  const canBid = isLive && role === "CUSTOMER";
  const weaverName = auction.product?.user?.weaverProfile?.name;

  // Quick bid suggestions: min valid, +5%, +10% (rounded).
  const suggestions = [minNext, Math.ceil(minNext * 1.05), Math.ceil(minNext * 1.1)].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header
        onBack={() => router.back()}
        backLabel={t("auction:detail.backToList")}
        title={auction.product?.title}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Product visual + status */}
        <View style={styles.hero}>
          {img ? (
            <Image source={{ uri: img }} style={styles.heroImage} contentFit="cover" transition={150} />
          ) : (
            <View style={styles.heroEmpty}>
              <Gavel size={48} color={colors.neutral400} />
            </View>
          )}
          <View style={styles.heroBadges}>
            <Badge
              label={t(`auction:status.${auction.status}`, { defaultValue: auction.status })}
              tone={auctionTone(auction.status)}
            />
            {left ? (
              <View style={styles.timePill}>
                <Clock size={14} color={colors.inkOnDark} />
                <Text variant="caption" color={colors.inkOnDark}>
                  {t("auction:detail.timeLeft")}: {left}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h1">{auction.product?.title}</Text>
          {weaverName ? (
            <Text variant="caption" color={colors.neutral500}>
              {t("auction:detail.byWeaver", { name: weaverName })}
            </Text>
          ) : null}
        </View>

        {/* Price summary — the two numbers that matter, big */}
        <View style={styles.priceCards}>
          <Card style={styles.priceCard}>
            <Text variant="caption" color={colors.neutral500}>{t("auction:detail.basePrice")}</Text>
            <Text variant="h2">{formatPrice(auction.basePrice, auction.currency)}</Text>
          </Card>
          <Card style={[styles.priceCard, styles.priceCardHot]}>
            <Text variant="caption" color={colors.neutral500}>{t("auction:detail.highestBid")}</Text>
            <Text variant="h2">
              {auction.highestBid ? formatPrice(auction.highestBid, auction.currency) : t("auction:list.noBids")}
            </Text>
          </Card>
        </View>

        {auction.minBidIncrement ? (
          <Text variant="caption" color={colors.neutral500} style={styles.increment}>
            {t("auction:detail.minIncrement")}: {formatPrice(auction.minBidIncrement, auction.currency)}
          </Text>
        ) : null}

        {/* Ended states */}
        {auction.status === "ENDED" ? (
          <Card style={styles.endedCard}>
            {auction.result === "WON" ? (
              <>
                <Text variant="bodyStrong">
                  {t("auction:detail.winner")}: {formatPrice(auction.finalPrice, auction.currency)}
                </Text>
                <Text variant="caption" color={colors.neutral500}>
                  {t("auction:detail.reservedForWinner")}
                </Text>
              </>
            ) : (
              <Text color={colors.neutral500}>{t("auction:detail.noSale")}</Text>
            )}
          </Card>
        ) : null}

        {/* Bid form (customers on live auctions) */}
        {canBid ? (
          <Card style={styles.bidCard}>
            <Text variant="h2">{t("auction:place_bid.title")}</Text>

            <View style={styles.suggestions}>
              {suggestions.map((s) => (
                <Chip
                  key={s}
                  label={formatPrice(s, auction.currency)}
                  selected={bidAmount === String(s)}
                  onPress={() => setBidAmount(String(s))}
                />
              ))}
            </View>

            <Input
              label={t("auction:place_bid.amountLabel")}
              large
              keyboardType="number-pad"
              value={bidAmount}
              onChangeText={setBidAmount}
              unit="₹"
            />

            {bidError ? (
              <View accessibilityRole="alert">
                <Text color={colors.danger}>{bidError}</Text>
              </View>
            ) : null}
            {bidSuccess ? <Text color={colors.success}>{t("auction:place_bid.success")}</Text> : null}

            <Button
              label={placing ? t("auction:place_bid.submitting") : t("auction:place_bid.submit")}
              size="lg"
              loading={placing}
              disabled={!bidAmount || Number(bidAmount) <= 0}
              onPress={placeBid}
            />
          </Card>
        ) : isLive && role !== "CUSTOMER" ? (
          <Card style={styles.bidCard}>
            <Text color={colors.neutral500}>{t("auction:place_bid.customersOnly")}</Text>
          </Card>
        ) : null}

        {/* Bid history */}
        <View style={styles.section}>
          <Text variant="h2">{t("auction:detail.bidHistory")}</Text>
        </View>
        {auction.bids.length === 0 ? (
          <Card style={styles.historyEmpty}>
            <Text color={colors.neutral500}>{t("auction:detail.noBidsYet")}</Text>
          </Card>
        ) : (
          <View style={styles.history}>
            {auction.bids.map((bid, i) => (
              <View key={bid.id} style={[styles.bidRow, i > 0 && styles.bidRowBorder]}>
                <Text variant={i === 0 ? "bodyStrong" : "body"}>
                  {bid.isMine ? t("auction:detail.you") : bid.bidderMask}
                </Text>
                <Text variant={i === 0 ? "title" : "bodyStrong"}>
                  {formatPrice(bid.amount, bid.currency)}
                </Text>
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
  content: { paddingBottom: spacing["4xl"] },
  hero: { height: 260, backgroundColor: colors.neutral100 },
  heroImage: { width: "100%", height: "100%" },
  heroEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroBadges: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.xs },
  priceCards: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  priceCard: { flex: 1, gap: spacing.xs },
  priceCardHot: { borderColor: colors.ink },
  increment: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  endedCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.xs },
  bidCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.md },
  suggestions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  history: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
  },
  historyEmpty: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
  bidRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  bidRowBorder: { borderTopWidth: 1, borderTopColor: colors.neutral200 },
});
