import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, Link } from "expo-router";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/lib/AuthContext";
import { ApiError } from "@/lib/apiClient";
import { ROLE_DASHBOARD_ROUTE } from "@/lib/types";
import { Screen, Text, Input, Button } from "@/components/ui";
import { LanguageSwitcher } from "@/components/domain/LanguageSwitcher";
import { colors, spacing } from "@/theme";

export default function LoginScreen() {
  const { t } = useTranslation(["auth", "common"]);
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const role = await login(email.trim(), password);
      const dest = role === "CUSTOMER" ? "/(customer)/browse" : role === "BUSINESS" ? "/(business)/browse" : "/(weaver)/dashboard";
      router.replace(dest as any);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth:login.failed"));
      setSubmitting(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  return (
    <Screen>
      <View style={styles.langRow}>
        <LanguageSwitcher />
      </View>

      <View style={styles.header}>
        <Text variant="display">{t("common:appName")}</Text>
        <Text variant="h2" style={styles.title}>{t("auth:login.title")}</Text>
        <Text color={colors.neutral500}>{t("auth:login.subtitle")}</Text>
      </View>

      <View style={styles.form}>
        <Input
          label={t("auth:login.email")}
          placeholder={t("auth:login.emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Input
          label={t("auth:login.password")}
          placeholder={t("auth:login.passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <View style={styles.error} accessibilityRole="alert">
            <Text color={colors.danger}>{error}</Text>
          </View>
        ) : null}

        <Button
          label={submitting ? t("auth:login.submitting") : t("auth:login.submit")}
          size="lg"
          loading={submitting}
          disabled={!canSubmit}
          onPress={onSubmit}
        />

        <View style={styles.footer}>
          <Text color={colors.neutral500}>{t("auth:login.newHere")} </Text>
          <Link href="/(auth)/register">
            <Text variant="bodyStrong">{t("auth:login.registerLink")}</Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: { alignItems: "flex-end", paddingTop: spacing.sm },
  header: { gap: spacing.xs, marginTop: spacing["3xl"], marginBottom: spacing["2xl"] },
  title: { marginTop: spacing.md },
  form: { gap: spacing.lg },
  error: {
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    padding: spacing.md,
  },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: spacing.md },
});
