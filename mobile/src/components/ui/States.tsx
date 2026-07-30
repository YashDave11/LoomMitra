import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AlertTriangle, CheckCircle2, Inbox } from "lucide-react-native";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";
import { Button } from "./Button";

const box = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["3xl"],
    gap: spacing.lg,
  },
  text: { gap: spacing.xs, alignItems: "center" },
});

/** Full-area loading spinner. */
export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={box.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.ink} />
      {label ? <Text color={colors.neutral500}>{label}</Text> : null}
    </View>
  );
}

/** Empty list placeholder. */
export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={box.center}>
      <Inbox size={48} color={colors.neutral400} />
      <View style={box.text}>
        <Text variant="h2" center>{title}</Text>
        {subtitle ? <Text color={colors.neutral500} center>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} />
      ) : null}
    </View>
  );
}

/** Error placeholder with retry. */
export function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
}: {
  title: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={box.center}>
      <AlertTriangle size={48} color={colors.danger} />
      <View style={box.text}>
        <Text variant="h2" center>{title}</Text>
        {message ? <Text color={colors.neutral500} center>{message}</Text> : null}
      </View>
      {retryLabel && onRetry ? (
        <Button label={retryLabel} onPress={onRetry} variant="outline" fullWidth={false} />
      ) : null}
    </View>
  );
}

/** Success confirmation. */
export function SuccessState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={box.center}>
      <CheckCircle2 size={56} color={colors.success} />
      <View style={box.text}>
        <Text variant="h1" center>{title}</Text>
        {subtitle ? <Text color={colors.neutral500} center>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
