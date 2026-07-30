import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, spacing, touch } from "@/theme";
import { Text } from "./Text";

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** Optional leading visual (icon element or color swatch). */
  leading?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Large tappable choice card for the listing wizard — the low-literacy
 * alternative to a dropdown. Min height 64dp, high-contrast selected state
 * (black fill + white text) matching the web wizard.
 */
export function OptionCard({ label, selected, onPress, leading, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <Text variant="bodyStrong" color={selected ? colors.inkOnDark : colors.ink} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: touch.large,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: spacing.lg,
  },
  unselected: { borderColor: colors.neutral300, backgroundColor: colors.surface },
  selected: { borderColor: colors.ink, backgroundColor: colors.ink },
  pressed: { transform: [{ scale: 0.98 }] },
  leading: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
});
