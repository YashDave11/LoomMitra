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

export default function BusinessProfilePage() {
  const { t } = useTranslation("business");
  const { ready } = useRequireRole("BUSINESS");
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    apiClient.getBusinessProfile().then((p) => {
      if (p) {
        setBusinessName(p.businessName);
        setContactEmail(p.contactEmail);
        setContactPhone(p.contactPhone);
        setGstNumber(p.gstNumber ?? "");
      }
    });
  }, [ready]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await apiClient.saveBusinessProfile({ businessName, contactEmail, contactPhone, gstNumber: gstNumber || null });
      router.push("/app/business/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("business:profile.saveFailed"));
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
            {t("business:profile.title")}
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
              <Label htmlFor="businessName">{t("business:profile.businessName")}</Label>
              <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">{t("business:profile.contactEmail")}</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">{t("business:profile.contactPhone")}</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstNumber">{t("business:profile.gstNumber")}</Label>
              <Input id="gstNumber" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? t("business:profile.saving") : t("business:profile.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
