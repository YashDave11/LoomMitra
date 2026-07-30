import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Gavel, Clock } from "lucide-react-native";
import type { Auction } from "@/lib/types";
import { formatPrice, firstImage, timeLeft } from "@/lib/format";
import { colors, radius, spacing } from "@/theme";
import { Card, Text, Badge, auctionTone } from "@/components/ui";

interface Props {
  auction: Auction;
  now: number;
  onPress?: () => void;
}

/** Auction summary tile for the auction house list. */
export function AuctionCard({ auction, now, onPress }: Props) {
  const { t } = useTranslation(["auction", "common"]);
  const img = firstImage(auction.product?.images);
  const left = auction.status === "LIVE" ? timeLeft(auction.endTime, now) : null;
  const current = auction.highestBid ?? auction.basePrice;

  return (
    <Card onPress={onPress} accessibilityLabel={auction.product?.title} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.imageWrap}>
          {img ? (
            <Image source={{ uri: img }} style={styles.image} contentFit="cover" transition={150} />
          ) : (
            <Gavel size={28} color={colors.neutral400} />
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <Badge
              label={t(`auction:status.${auction.status}`, { defaultValue: auction.status })}
              tone={auctionTone(auction.status)}
            />
            {left ? (
              <View style={styles.timeRow}>
                <Clock size={14} color={colors.neutral500} />
                <Text variant="caption" color={colors.neutral500}>{left}</Text>
              </View>
            ) : null}
          </View>

          <Text variant="bodyStrong" numberOfLines={1}>{auction.product?.title}</Text>

          <Text variant="caption" color={colors.neutral500}>
            {auction.highestBid ? t("auction:list.highestBid") : t("auction:list.basePrice")}
          </Text>
          <Text variant="title">{formatPrice(current, auction.currency)}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: { flexDirection: "row", gap: spacing.md },
  imageWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  info: { flex: 1, gap: 2 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
});
