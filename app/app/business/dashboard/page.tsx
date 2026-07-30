"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRequireRole } from "@/lib/useRequireRole";
import { apiClient } from "@/lib/apiClient";
import type { BusinessProfile, BulkOrderRequest } from "@/lib/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { PanelCard } from "@/components/dashboard/PanelCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Building2,
  Search,
  QrCode,
  ArrowRight,
  Loader2,
} from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "border-black bg-neutral-50 text-black font-medium",
  BARGAINING: "border-black bg-neutral-50 text-black font-medium",
  ACCEPTED: "border-green-200 bg-green-50 text-green-800",
  REJECTED: "border-red-200 bg-red-50 text-red-800",
  WEAVER_RESPONDED: "border-neutral-200 text-neutral-600",
};

export default function BusinessDashboardPage() {
  const { ready } = useRequireRole("BUSINESS");
  const { t } = useTranslation(["business", "common"]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [orders, setOrders] = useState<BulkOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([
      apiClient.getBusinessProfile(),
      apiClient.getBulkOrders(),
    ])
      .then(([p, o]) => {
        setProfile(p);
        setOrders(o);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const hasProfile = Boolean(profile?.businessName);
  const activeOrders = orders.filter((o) => o.status === "PENDING" || o.status === "BARGAINING" || o.status === "WEAVER_RESPONDED");
  const acceptedOrders = orders.filter((o) => o.status === "ACCEPTED");
  const bargainingOrders = orders.filter((o) => o.status === "BARGAINING");
  const totalRequested = orders.reduce((a, o) => a + o.quantity, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-black">
            {profile?.businessName
              ? t("business:dashboard.welcomeBack", { name: profile.businessName })
              : t("business:dashboard.welcome")}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t("business:dashboard.subtitle")}</p>
        </div>
        <Button asChild size="sm" className="mt-3 sm:mt-0">
          <Link href="/app/discover">
            <Search className="h-4 w-4" />
            {t("business:dashboard.discoverProducts")}
          </Link>
        </Button>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={t("business:dashboard.stats.rfqsSent")} value={orders.length} icon={FileText} />
        <StatCard label={t("business:dashboard.stats.active")} value={activeOrders.length} icon={MessageSquare} />
        <StatCard label={t("business:dashboard.stats.inNegotiation")} value={bargainingOrders.length} icon={MessageSquare} />
        <StatCard label={t("business:dashboard.stats.accepted")} value={acceptedOrders.length} icon={CheckCircle} />
        <StatCard
          label={t("business:dashboard.stats.totalUnits")}
          value={totalRequested}
          icon={TrendingUp}
        />
      </div>

      {/* ── Panels: Recent RFQs + Actions ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PanelCard
          title={t("business:dashboard.recentRfqs.title")}
          description={t("business:dashboard.recentRfqs.description")}
          headerRight={
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/app/business/orders">
                {t("business:dashboard.recentRfqs.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          }
          noPadding
          className="lg:col-span-2"
        >
          {orders.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center p-6">
              <FileText className="mb-2 h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-500">{t("business:dashboard.recentRfqs.empty")}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/app/discover">{t("business:dashboard.recentRfqs.browse")}</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {orders.slice(0, 6).map((o) => (
                <Link
                  key={o.id}
                  href="/app/business/orders"
                  className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">
                      {o.product?.title || t("business:dashboard.recentRfqs.unknownProduct")}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t("business:dashboard.recentRfqs.qty", { count: o.quantity })} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <Badge
                    variant="dashed"
                    className={`ml-3 shrink-0 text-[11px] font-normal ${STATUS_BADGE[o.status] || ""}`}
                  >
                    {t(`common:orderStatus.${o.status}`, { defaultValue: o.status.replace("_", " ") })}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard
          title={t("business:dashboard.quickActions.title")}
          description={t("business:dashboard.quickActions.description")}
          className="lg:col-span-1"
        >
          <div className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/discover">
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {t("business:dashboard.discoverProducts")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/business/orders">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t("business:dashboard.quickActions.viewAllRfqs")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/verify">
                <span className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  {t("business:dashboard.quickActions.verifyProduct")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            {!hasProfile && (
              <Button asChild variant="default" size="sm" className="w-full justify-between">
                <Link href="/app/business/profile">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t("business:dashboard.quickActions.completeProfile")}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
