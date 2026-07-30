import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react-native";

import { apiClient, ApiError } from "@/lib/apiClient";
import { useAuth } from "@/lib/AuthContext";
import type { CustomerProfile } from "@/lib/types";
import { Screen, Text, Input, Button, Card, LoadingState } from "@/components/ui";
import { LanguageSwitcher } from "@/components/domain/LanguageSwitcher";
import { colors, spacing } from "@/theme";

export default function CustomerProfileScreen() {
  const { t } = useTranslation(["customer", "common", "nav"]);
  const { logout } = useAuth();

  const [form, setForm] = useState({ name: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      apiClient
        .getCustomerProfile()
        .then((p: CustomerProfile | null) => {
          if (p) setForm({ name: p.name, city: p.city ?? "" });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiClient.saveCustomerProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("customer:profile.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  if (loading) return <LoadingState />;

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text variant="h1">{t("customer:profile.title")}</Text>
        <LanguageSwitcher compact />
      </View>

      <Card style={styles.form}>
        <Input
          label={t("common:fields.name")}
          value={form.name}
          onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); setSaved(false); }}
        />
        <Input
          label={t("customer:profile.cityOptional")}
          value={form.city}
          onChangeText={(v) => { setForm((f) => ({ ...f, city: v })); setSaved(false); }}
        />

        {error ? <Text color={colors.danger}>{error}</Text> : null}
        {saved ? <Text color={colors.success}>{t("common:actions.save")} ✓</Text> : null}

        <Button
          label={saving ? t("customer:profile.saving") : t("customer:profile.saveProfile")}
          loading={saving}
          onPress={save}
        />
      </Card>

      <Button
        label={t("nav:signOut")}
        variant="outline"
        icon={<LogOut size={20} color={colors.ink} />}
        onPress={onLogout}
        style={styles.logout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: spacing.md },
  form: { gap: spacing.lg },
  logout: { marginTop: spacing.xl },
});
