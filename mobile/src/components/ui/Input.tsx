import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";
import { Text } from "./Text";

interface Props extends TextInputProps {
  label?: string;
  /** Suffix label shown to the right (e.g. "meters", "₹"). */
  unit?: string;
  error?: string;
  /** Larger 64dp field used by the wizard's one-question screens. */
  large?: boolean;
}

export function Input({ label, unit, error, large, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" color={colors.neutral700} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View style={styles.row}>
        <TextInput
          placeholderTextColor={colors.neutral400}
          style={[
            styles.input,
            large && styles.large,
            error ? styles.errorBorder : null,
            style,
          ]}
          accessibilityLabel={label}
          {...rest}
        />
        {unit ? (
          <Text variant="title" color={colors.neutral500} style={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: {},
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  input: {
    flex: 1,
    minHeight: 52,
    borderWidth: 2,
    borderColor: colors.neutral300,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    color: colors.ink,
    ...typography.body,
  },
  large: { minHeight: 64, fontSize: 24, lineHeight: 30 },
  unit: {},
  errorBorder: { borderColor: colors.danger },
  error: {},
});
