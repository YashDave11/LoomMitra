import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { colors, typography } from "@/theme";

type Variant = keyof typeof typography;

interface Props extends RNTextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

/** Typography-scale text. Use `variant` instead of raw fontSize. */
export function Text({ variant = "body", color = colors.ink, center, style, ...rest }: Props) {
  return (
    <RNText
      style={[typography[variant], { color }, center && { textAlign: "center" }, style]}
      {...rest}
    />
  );
}
