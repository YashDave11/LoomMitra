import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Scissors, Store, ShoppingBag } from "lucide-react-native";

import { useAuth } from "@/lib/AuthContext";
import { ApiError } from "@/lib/apiClient";
import type { Role } from "@/lib/types";
import { Screen, Text, Input, Button, OptionCard } from "@/components/ui";
import { colors, spacing } from "@/theme";

const ROLE_OPTIONS: { role: Role; labelKey: string; icon: typeof Scissors }[] = [
  { role: "WEAVER", labelKey: "auth:register.roleWeaver", icon: Scissors },
  { role: "BUSINESS", labelKey: "auth:register.roleBusiness", icon: Store },
  { role: "CUSTOMER", labelKey: "auth:register.roleCustomer", icon: ShoppingBag },
];

export default function RegisterScreen() {
  const { t } = useTranslation(["auth", "common"]);
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!role) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await register(email.trim(), password, role);
      const dest = r === "CUSTOMER" ? "/(customer)/browse" : "/(weaver)/dashboard";
      router.replace(dest);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth:register.failed"));
      setSubmitting(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !!role && !submitting;

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h1">{t("auth:register.title")}</Text>
        <Text color={colors.neutral500}>{t("auth:register.subtitle")}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.roleGroup}>
          <Text variant="label" color={colors.neutral700}>{t("auth:register.roleLabel")}</Text>
          {ROLE_OPTIONS.map(({ role: r, labelKey, icon: Icon }) => (
            <OptionCard
              key={r}
              label={t(labelKey)}
              selected={role === r}
              onPress={() => setRole(r)}
              leading={<Icon size={26} color={role === r ? colors.inkOnDark : colors.ink} />}
            />
          ))}
        </View>

        <Input
          label={t("auth:register.email")}
          placeholder={t("auth:register.emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Input
          label={t("auth:register.password")}
          placeholder={t("auth:register.passwordPlaceholder")}
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
          label={submitting ? t("auth:register.submitting") : t("auth:register.submit")}
          size="lg"
          loading={submitting}
          disabled={!canSubmit}
          onPress={onSubmit}
        />

        <View style={styles.footer}>
          <Text color={colors.neutral500}>{t("auth:register.haveAccount")} </Text>
          <Link href="/(auth)/login">
            <Text variant="bodyStrong">{t("auth:register.loginLink")}</Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing["2xl"], marginBottom: spacing.xl },
  form: { gap: spacing.lg },
  roleGroup: { gap: spacing.sm },
  error: {
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    padding: spacing.md,
  },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: spacing.md },
});
