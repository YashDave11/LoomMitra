import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react-native";

import { apiClient, ApiError } from "@/lib/apiClient";
import { useAuth } from "@/lib/AuthContext";
import type { BusinessProfile } from "@/lib/types";
import { Screen, Text, Input, Button, Card, LoadingState } from "@/components/ui";
import { LanguageSwitcher } from "@/components/domain/LanguageSwitcher";
import { colors, spacing } from "@/theme";

export default function BusinessProfileScreen() {
  const { t } = useTranslation(["common", "nav"]);
  const { logout } = useAuth();

  const [form, setForm] = useState({ businessName: "", contactEmail: "", contactPhone: "", gstNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      apiClient
        .getBusinessProfile()
        .then((p: BusinessProfile | null) => {
          if (p) setForm({ businessName: p.businessName, contactEmail: p.contactEmail, contactPhone: p.contactPhone, gstNumber: p.gstNumber ?? "" });
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
      await apiClient.saveBusinessProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common:errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  if (loading) return <LoadingState />;

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text variant="h1">{t("nav:profile")}</Text>
        <LanguageSwitcher compact />
      </View>

      <Card style={styles.form}>
        <Input label="Business Name" value={form.businessName} onChangeText={set("businessName")} />
        <Input label="Contact Email" value={form.contactEmail} onChangeText={set("contactEmail")} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Contact Phone" value={form.contactPhone} onChangeText={set("contactPhone")} keyboardType="phone-pad" />
        <Input label="GST Number (Optional)" value={form.gstNumber} onChangeText={set("gstNumber")} />

        {error ? <Text color={colors.danger}>{error}</Text> : null}
        {saved ? <Text color={colors.success}>{t("common:actions.save")} ✓</Text> : null}

        <Button
          label={saving ? "Saving..." : t("common:actions.save")}
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
