import { Pressable, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "@/theme";

interface Props extends ViewProps {
  onPress?: () => void;
  /** Adds the offset sketch shadow. */
  raised?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Bordered surface. Tappable when `onPress` is given (min-height enforced). */
export function Card({ children, onPress, raised, padded = true, style, accessibilityLabel, ...rest }: Props) {
  const content = (
    <View
      style={[styles.card, padded && styles.padded, raised && shadow.card, style]}
      {...rest}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.neutral200,
  },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.9 },
});
