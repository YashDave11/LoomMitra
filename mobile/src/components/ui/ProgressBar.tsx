import { StyleSheet, View } from "react-native";
import { colors, radius } from "@/theme";

interface Props {
  /** 0..1 */
  value: number;
  label?: string;
}

/** Step indicator for the wizard. Accessible as a progressbar. */
export function ProgressBar({ value }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
    >
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.neutral200, overflow: "hidden" },
  fill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.ink },
});
