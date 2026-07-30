import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";

interface Props {
  children: React.ReactNode;
  /** Wrap content in a ScrollView (default true). Set false for FlatList screens. */
  scroll?: boolean;
  /** Horizontal padding on the content (default true). */
  padded?: boolean;
  /** Safe-area edges to inset (default top+bottom). */
  edges?: Edge[];
  contentStyle?: ViewStyle;
  /** Sticky footer pinned above the keyboard (e.g. a primary CTA). */
  footer?: React.ReactNode;
}

/**
 * Standard screen frame: safe-area insets, keyboard avoidance, and optional
 * scrolling. Keeps every screen consistent and prevents keyboard overlap on
 * small phones.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ["top", "bottom"],
  contentStyle,
  footer,
}: Props) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[padded && styles.padded, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.flex} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {inner}
        {footer ? <View style={[styles.footer, padded && styles.footerPad]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  padded: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  footer: { borderTopWidth: 1, borderTopColor: colors.neutral200, backgroundColor: colors.bg },
  footerPad: { padding: spacing.lg },
});
