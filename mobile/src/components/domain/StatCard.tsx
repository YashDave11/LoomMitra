import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { Card, Text } from "@/components/ui";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}

/** Compact metric tile for dashboards. */
export function StatCard({ label, value, hint, icon }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text variant="caption" color={colors.neutral500}>{label}</Text>
        {icon}
      </View>
      <Text variant="h1">{value}</Text>
      {hint ? <Text variant="caption" color={colors.neutral400}>{hint}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: spacing.xs, minWidth: 140 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
