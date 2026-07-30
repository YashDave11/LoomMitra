"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { ROLE_DASHBOARD_ROUTE, type Role } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

const ROLES: { value: Role; labelKey: string }[] = [
  { value: "WEAVER", labelKey: "register.roleWeaver" },
  { value: "BUSINESS", labelKey: "register.roleBusiness" },
  { value: "CUSTOMER", labelKey: "register.roleCustomer" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("WEAVER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const returnedRole = await register(email, password, role);
      router.push(ROLE_DASHBOARD_ROUTE[returnedRole]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("register.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {t("register.title")}
          </CardTitle>
          <CardDescription>{t("register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border-2 border-black bg-neutral-100 p-3 text-sm text-black">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("register.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("register.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("register.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-3">
              <Label>{t("register.roleLabel")}</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as Role)} name="role">
                {ROLES.map((r) => (
                  <div key={r.value} className="flex items-center gap-3">
                    <RadioGroupItem value={r.value} id={`role-${r.value}`} />
                    <Label htmlFor={`role-${r.value}`} className="cursor-pointer font-normal">
                      {t(r.labelKey)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("register.submitting") : t("register.submit")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            {t("register.haveAccount")}{" "}
            <Link href="/auth/login" className="font-semibold text-black underline underline-offset-4">
              {t("register.loginLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
      <LanguageSwitcher />
    </div>
  );
}
