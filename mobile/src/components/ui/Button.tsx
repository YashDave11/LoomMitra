import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, touch, typography } from "@/theme";
import { Text } from "./Text";

type Variant = "primary" | "outline" | "ghost";
type Size = "default" | "lg";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  /** Leading icon element (e.g. a lucide icon). */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  /** Accessibility label; defaults to `label`. */
  accessibilityLabel?: string;
  style?: ViewStyle;
}

/**
 * Primary action button. Mirrors the web Button variants (default / outline /
 * ghost). Height respects the 48dp touch minimum; `lg` is 56dp for the
 * primary calls-to-action low-literacy weavers tap most.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "default",
  disabled,
  loading,
  icon,
  fullWidth = true,
  accessibilityLabel,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const height = size === "lg" ? touch.comfortable : touch.min;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { height, minHeight: height },
        fullWidth && styles.fullWidth,
        variantStyle[variant],
        pressed && !isDisabled && pressedStyle[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? colors.inkOnDark : colors.ink} />
        ) : (
          <>
            {icon}
            <Text
              variant={size === "lg" ? "title" : "bodyStrong"}
              color={variant === "primary" ? colors.inkOnDark : colors.ink}
            >
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  fullWidth: { alignSelf: "stretch" },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
  disabled: { opacity: 0.45 },
});

const variantStyle: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.ink },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.ink,
  },
  ghost: { backgroundColor: "transparent" },
};

const pressedStyle: Record<Variant, ViewStyle> = {
  primary: { opacity: 0.85 },
  outline: { backgroundColor: colors.neutral100 },
  ghost: { opacity: 0.6 },
};
