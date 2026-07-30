"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useRequireRole } from "@/lib/useRequireRole";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CustomerProfilePage() {
  const { ready } = useRequireRole("CUSTOMER");
  const router = useRouter();
  const { t } = useTranslation(["customer", "common"]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    apiClient.getCustomerProfile().then((p) => {
      if (p) {
        setName(p.name);
        setCity(p.city ?? "");
      }
    });
  }, [ready]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await apiClient.saveCustomerProfile({ name, city: city || null });
      router.push("/app/customer/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("profile.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {t("profile.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
              <div className="border-2 border-black bg-neutral-50 p-3 text-sm text-black">
                {message}
              </div>
            )}
            {error && (
              <div className="border-2 border-black bg-neutral-100 p-3 text-sm text-black">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t("common:fields.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t("profile.cityOptional")}</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? t("profile.saving") : t("profile.saveProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
