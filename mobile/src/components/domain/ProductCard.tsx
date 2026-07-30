import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ImageOff } from "lucide-react-native";
import type { Product } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { formatPrice, firstImage } from "@/lib/format";
import { colors, radius, spacing } from "@/theme";
import { Card, Text, Badge, orderTone } from "@/components/ui";

interface Props {
  product: Product;
  weaverName?: string;
  onPress?: () => void;
  /** Show DRAFT/READY status (weaver "my listings" view). */
  showStatus?: boolean;
}

/** Product tile used in grids (browse) and lists (my listings). */
export function ProductCard({ product, weaverName, onPress, showStatus }: Props) {
  const { t } = useTranslation(["product", "common"]);
  const img = firstImage(product.images);

  return (
    <Card onPress={onPress} padded={false} accessibilityLabel={product.title} style={styles.card}>
      <View style={styles.imageWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.image} contentFit="cover" transition={150} />
        ) : (
          <View style={styles.placeholder}>
            <ImageOff size={28} color={colors.neutral400} />
          </View>
        )}
        {showStatus ? (
          <Badge
            label={t(`common:productStatus.${product.status}`, { defaultValue: product.status })}
            tone={product.status === "READY" ? "success" : "neutral"}
            style={styles.statusBadge}
          />
        ) : null}
      </View>

      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>{product.title}</Text>
        <Text variant="caption" color={colors.neutral500} numberOfLines={1}>
          {optionLabel(t, "category", product.type)}
          {weaverName ? ` · ${weaverName}` : ""}
        </Text>
        <Text variant="title">{formatPrice(product.price, product.currency)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden" },
  imageWrap: { aspectRatio: 1, backgroundColor: colors.neutral100 },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  statusBadge: { position: "absolute", top: spacing.sm, left: spacing.sm },
  body: { padding: spacing.md, gap: 2 },
});
