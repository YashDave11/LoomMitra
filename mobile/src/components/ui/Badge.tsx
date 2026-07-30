import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius } from "@/theme";
import { Text } from "./Text";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "live";

interface Props {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.neutral100, fg: colors.neutral700 },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.infoBg, fg: colors.info },
  live: { bg: colors.live, fg: colors.inkOnDark },
};

export function Badge({ label, tone = "neutral", style }: Props) {
  const c = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text variant="caption" color={c.fg}>
        {label}
      </Text>
    </View>
  );
}

/** Map an auction status code to a badge tone. */
export function auctionTone(status: string): Tone {
  switch (status) {
    case "LIVE":
      return "live";
    case "UPCOMING":
      return "info";
    case "ENDED":
      return "neutral";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

/** Map an order status code to a badge tone. */
export function orderTone(status: string): Tone {
  switch (status) {
    case "DELIVERED":
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "danger";
    case "SHIPPED":
    case "READY":
      return "info";
    default:
      return "warning";
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
});
