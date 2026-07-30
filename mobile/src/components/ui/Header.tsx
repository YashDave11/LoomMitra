import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { colors, spacing, touch } from "@/theme";
import { Text } from "./Text";

interface Props {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  /** Right-aligned action element (e.g. a cart icon button). */
  right?: React.ReactNode;
}

/** Top app bar. Back button is a 48dp circular target. */
export function Header({ title, onBack, backLabel = "Back", right }: Props) {
  return (
    <View style={styles.bar}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <ArrowLeft size={24} color={colors.ink} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}

      {title ? (
        <Text variant="title" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      ) : (
        <View style={styles.title} />
      )}

      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: touch.comfortable,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backBtn: {
    width: touch.min,
    height: touch.min,
    borderRadius: touch.min / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.neutral300,
  },
  spacer: { width: touch.min },
  title: { flex: 1 },
});
