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

export default function WeaverProfilePage() {
  const { ready } = useRequireRole("WEAVER");
  const router = useRouter();
  const { t } = useTranslation("weaver");
  const [name, setName] = useState("");
  const [cluster, setCluster] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [handloomId, setHandloomId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    apiClient.getWeaverProfile().then((p) => {
      if (p) {
        setName(p.name);
        setCluster(p.cluster);
        setAadhaarNumber(p.aadhaarNumber);
        setHandloomId(p.handloomId);
      }
    });
  }, [ready]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await apiClient.saveWeaverProfile({ name, cluster, aadhaarNumber, handloomId });
      router.push("/app/weaver/dashboard");
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
              <Label htmlFor="name">{t("profile.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster">{t("profile.cluster")}</Label>
              <Input id="cluster" value={cluster} onChange={(e) => setCluster(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaar">{t("profile.aadhaar")}</Label>
              <Input id="aadhaar" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handloomId">{t("profile.handloomId")}</Label>
              <Input id="handloomId" value={handloomId} onChange={(e) => setHandloomId(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? t("profile.saving") : t("profile.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
