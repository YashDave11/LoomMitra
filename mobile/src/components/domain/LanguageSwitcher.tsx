import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react-native";
import { changeLanguage } from "@/lib/i18n";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/lib/i18n/settings";
import { colors, radius, spacing, touch } from "@/theme";
import { Text } from "@/components/ui";

/** Globe button that opens a bottom-sheet-style language picker. */
export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const current = i18n.language as SupportedLanguage;

  async function select(lang: SupportedLanguage) {
    await changeLanguage(lang);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("language.label")}
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.6 }]}
        hitSlop={8}
      >
        <Globe size={22} color={colors.ink} />
        {!compact ? (
          <Text variant="label">{LANGUAGE_LABELS[current] ?? current}</Text>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text variant="h2" style={styles.sheetTitle}>{t("language.label")}</Text>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = lang === current;
              return (
                <Pressable
                  key={lang}
                  onPress={() => select(lang)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.neutral100 }]}
                >
                  <Text variant="title">{LANGUAGE_LABELS[lang]}</Text>
                  {selected ? <Check size={22} color={colors.ink} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: touch.min,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing["4xl"],
    gap: spacing.xs,
  },
  sheetTitle: { marginBottom: spacing.md },
  row: {
    minHeight: touch.comfortable,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
});
