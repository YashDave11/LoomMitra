"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRequireRole } from "@/lib/useRequireRole";
import { apiClient } from "@/lib/apiClient";
import type { CustomerProfile, CustomerOrder, CustomerOrderStatus } from "@/lib/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { PanelCard } from "@/components/dashboard/PanelCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Compass,
  QrCode,
  Package,
  ShoppingBag,
  Truck,
  ArrowRight,
  Loader2,
  IndianRupee,
} from "lucide-react";

const STATUS_BADGE: Record<CustomerOrderStatus, string> = {
  PLACED: "border-yellow-300 bg-yellow-50 text-yellow-800 font-medium",
  READY: "border-blue-200 bg-blue-50 text-blue-800",
  SHIPPED: "border-purple-200 bg-purple-50 text-purple-800",
  DELIVERED: "border-green-200 bg-green-50 text-green-800",
};

export default function CustomerDashboardPage() {
  const { ready } = useRequireRole("CUSTOMER");
  const { t } = useTranslation(["customer", "common"]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([apiClient.getCustomerProfile(), apiClient.getCustomerOrders()])
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

  const hasProfile = Boolean(profile?.name);
  const inTransit = orders.filter((o) => o.status !== "DELIVERED");
  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const totalSpent = orders.reduce((a, o) => a + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-black">
            {profile?.name
              ? t("dashboard.welcomeBack", { name: profile.name })
              : t("dashboard.welcome")}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <Button asChild size="sm" className="mt-3 sm:mt-0">
          <Link href="/app/discover">
            <Compass className="h-4 w-4" />
            {t("dashboard.exploreCatalog")}
          </Link>
        </Button>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label={t("dashboard.ordersPlaced")} value={orders.length} icon={ShoppingBag} />
        <StatCard label={t("dashboard.inProgress")} value={inTransit.length} icon={Truck} />
        <StatCard label={t("dashboard.delivered")} value={delivered.length} icon={Package} />
        <StatCard
          label={t("dashboard.totalSpent")}
          value={`₹${totalSpent.toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />
      </div>

      {/* ── Recent orders ── */}
      <PanelCard
        title={t("dashboard.yourOrders")}
        description={t("dashboard.yourOrdersDesc")}
        headerRight={
          orders.length > 0 ? (
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/app/customer/orders">
                {t("dashboard.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          ) : undefined
        }
        noPadding
      >
        {orders.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="mb-2 h-8 w-8 text-neutral-300" />
            <p className="text-sm text-neutral-500">{t("dashboard.noOrdersYet")}</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/app/discover">{t("dashboard.browseHandloom")}</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {orders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href="/app/customer/orders"
                className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">
                    {o.items.map((i) => i.product?.title).filter(Boolean).join(", ") ||
                      t("dashboard.orderFallback")}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {o.weaver?.weaverProfile?.name || t("dashboard.weaverFallback")} · ₹
                    {o.totalAmount.toLocaleString("en-IN")} ·{" "}
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Badge
                  variant="dashed"
                  className={`ml-3 shrink-0 text-[11px] font-normal ${STATUS_BADGE[o.status]}`}
                >
                  {t(`common:orderStatus.${o.status}`)}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </PanelCard>

      {/* ── Panels: Products + Actions ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PanelCard
          title={t("dashboard.discoverTitle")}
          description={t("dashboard.discoverDesc")}
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/app/discover"
              className="group flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center hover:border-black transition-colors"
            >
              <div className="sketch-box-alt flex h-12 w-12 items-center justify-center border-2 border-black mb-3">
                <Compass className="h-6 w-6 text-neutral-700" strokeWidth={1.5} />
              </div>
              <p className="font-bold text-black group-hover:underline">{t("dashboard.browseCatalog")}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {t("dashboard.browseCatalogDesc")}
              </p>
            </Link>
            <Link
              href="/app/verify"
              className="group flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center hover:border-black transition-colors"
            >
              <div className="sketch-box flex h-12 w-12 items-center justify-center border-2 border-black mb-3">
                <QrCode className="h-6 w-6 text-neutral-700" strokeWidth={1.5} />
              </div>
              <p className="font-bold text-black group-hover:underline">{t("dashboard.scanQr")}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {t("dashboard.scanQrDesc")}
              </p>
            </Link>
          </div>
        </PanelCard>

        <PanelCard
          title={t("dashboard.quickActions")}
          description={t("dashboard.quickActionsDesc")}
          className="lg:col-span-1"
        >
          <div className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/customer/orders">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("dashboard.myOrders")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/discover">
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  {t("dashboard.discover")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/verify">
                <span className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  {t("dashboard.verifyProduct")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            {!hasProfile ? (
              <Button asChild variant="default" size="sm" className="w-full justify-between">
                <Link href="/app/customer/profile">
                  <span className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    {t("dashboard.completeProfile")}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="w-full justify-between">
                <Link href="/app/customer/profile">
                  <span className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    {t("dashboard.updateProfile")}
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
