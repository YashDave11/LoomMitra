import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, touch } from "@/theme";
import { Text } from "./Text";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Compact filter/selection pill (e.g. discover filters). */
export function Chip({ label, selected, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Text variant="label" color={selected ? colors.inkOnDark : colors.neutral700}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touch.min - 8, // 40dp — chips sit in scroll rows, still comfortable
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  unselected: { borderColor: colors.neutral300, backgroundColor: colors.surface },
  selected: { borderColor: colors.ink, backgroundColor: colors.ink },
});
