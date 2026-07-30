"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/apiClient";
import type { WeaverProfile, Product, BulkOrderRequest, CustomerOrder, CustomerOrderStatus } from "@/lib/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { PanelCard } from "@/components/dashboard/PanelCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  QrCode,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";

/* ── Helpers ── */

const CATALOG_BADGE_CLASS: Record<string, string> = {
  DONE: "border-green-300 bg-green-50 text-green-800",
  PROCESSING: "border-amber-300 bg-amber-50 text-amber-800",
  FAILED: "border-red-300 bg-red-50 text-red-800",
  NOT_STARTED: "border-neutral-200 text-neutral-600",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "border-black bg-neutral-50 text-black font-medium",
  BARGAINING: "border-black bg-neutral-50 text-black font-medium",
  ACCEPTED: "border-green-200 bg-green-50 text-green-800",
  REJECTED: "border-red-200 bg-red-50 text-red-800",
  WEAVER_RESPONDED: "border-neutral-200 text-neutral-600",
};

const CUSTOMER_ORDER_BADGE: Record<CustomerOrderStatus, string> = {
  PLACED: "border-yellow-300 bg-yellow-50 text-yellow-800 font-medium",
  READY: "border-blue-200 bg-blue-50 text-blue-800",
  SHIPPED: "border-purple-200 bg-purple-50 text-purple-800",
  DELIVERED: "border-green-200 bg-green-50 text-green-800",
};

export default function WeaverDashboardPage() {
  const { t } = useTranslation(["weaver", "common"]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<WeaverProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<BulkOrderRequest[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, prod, ord, custOrd] = await Promise.all([
          apiClient.getWeaverProfile(),
          apiClient.getProducts(),
          apiClient.getBulkOrders(),
          apiClient.getCustomerOrders(),
        ]);
        setProfile(p);
        setProducts(prod);
        setOrders(ord);
        setCustomerOrders(custOrd);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const catalogLabel = (status: string) =>
    t(`weaver:catalogBadge.${status}`, { defaultValue: status });

  const hasProfile = Boolean(profile?.name && profile?.aadhaarNumber && profile?.handloomId);
  const readyProducts = products.filter((p) => p.status === "READY");
  const activeRFQs = orders.filter((o) => o.status === "PENDING" || o.status === "BARGAINING").length;
  const acceptedOrders = orders.filter((o) => o.status === "ACCEPTED");
  const unitsSold = acceptedOrders.reduce((a, o) => a + o.quantity, 0);
  const totalImages = products.reduce((a, p) => a + (p.images?.length || 0), 0);

  const newCustomerOrders = customerOrders.filter((o) => o.status === "PLACED");
  const pendingFulfilment = customerOrders.filter((o) => o.status !== "DELIVERED");
  const customerRevenue = customerOrders.reduce((a, o) => a + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* ── Header + greeting ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-black">
            {profile?.name
              ? t("weaver:dashboard.welcomeBackName", { name: profile.name.split(" ")[0] })
              : t("weaver:dashboard.welcomeBack")}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t("weaver:dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <Button asChild size="sm" variant="outline">
            <Link href="/app/weaver/products/new">{t("weaver:dashboard.newProduct")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/app/weaver/products">{t("weaver:dashboard.viewAllProducts")}</Link>
          </Button>
        </div>
      </div>

      {/* ── Verification banner ── */}
      {!hasProfile && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-neutral-600" />
            <div>
              <p className="text-sm font-bold text-black">{t("weaver:dashboard.verificationPending")}</p>
              <p className="text-xs text-neutral-500">{t("weaver:dashboard.verificationPendingDesc")}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/weaver/profile">{t("weaver:dashboard.updateProfile")}</Link>
          </Button>
        </div>
      )}

      {/* ── New customer orders banner ── */}
      {newCustomerOrders.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border-2 border-yellow-500 bg-yellow-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 shrink-0 text-yellow-700" />
            <div>
              <p className="text-sm font-bold text-black">
                {t("weaver:dashboard.newOrdersBanner", { count: newCustomerOrders.length })}
              </p>
              <p className="text-xs text-neutral-600">{t("weaver:dashboard.newOrdersBannerDesc")}</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/app/weaver/customer-orders">{t("weaver:dashboard.viewOrders")}</Link>
          </Button>
        </div>
      )}

      {/* ── Row 1: Stat strip (5 tight cards spanning full width) ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t("weaver:dashboard.stats.totalProducts")} value={products.length} icon={Package} />
        <StatCard
          label={t("weaver:dashboard.stats.readyForCatalog")}
          value={readyProducts.length}
          icon={CheckCircle}
          trend={{ direction: "up", value: t("weaver:dashboard.stats.images", { count: totalImages }) }}
        />
        <StatCard label={t("weaver:dashboard.stats.activeRfqs")} value={activeRFQs} icon={MessageSquare} />
        <StatCard
          label={t("weaver:dashboard.stats.customerOrders")}
          value={customerOrders.length}
          icon={ShoppingBag}
          trend={
            pendingFulfilment.length > 0
              ? { direction: "up", value: t("weaver:dashboard.stats.toFulfil", { count: pendingFulfilment.length }) }
              : undefined
          }
        />
        <StatCard
          label={t("weaver:dashboard.stats.orderRevenue")}
          value={`₹${customerRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />
        <StatCard label={t("weaver:dashboard.stats.unitsSold")} value={unitsSold} icon={CheckCircle} />
      </div>

      {/* ── Row 2: Two side-by-side panels (products + orders) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <PanelCard
          title={t("weaver:dashboard.recentProducts")}
          description={t("weaver:dashboard.recentProductsDesc")}
          headerRight={
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/app/weaver/products">
                {t("weaver:dashboard.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          }
          noPadding
          className="lg:col-span-1"
        >
          {products.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center p-6">
              <Package className="mb-2 h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-500">{t("weaver:dashboard.noProducts")}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/app/weaver/products/new">{t("weaver:dashboard.addFirstProduct")}</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {products.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">{p.title}</p>
                    <p className="text-xs text-neutral-500">
                      {t(`common:productTypes.${p.type}`, { defaultValue: p.type })} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <Badge variant="dashed" className={`text-[11px] font-normal ${CATALOG_BADGE_CLASS[p.catalogStatus] || ""}`}>
                      {catalogLabel(p.catalogStatus)}
                    </Badge>
                    {/* QR Code generation link */}
                    <Link
                      href={`/app/weaver/products/${p.id}?tab=qr`}
                      title={t("weaver:dashboard.generateQrCodes")}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors"
                    >
                      <QrCode className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

        {/* Recent Bulk Orders */}
        <PanelCard
          title={t("weaver:dashboard.recentBulkOrders")}
          description={t("weaver:dashboard.recentBulkOrdersDesc")}
          headerRight={
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/app/weaver/orders">
                {t("weaver:dashboard.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          }
          noPadding
          className="lg:col-span-1"
        >
          {orders.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center p-6">
              <MessageSquare className="mb-2 h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-500">{t("weaver:dashboard.noBulkOrders")}</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {orders.slice(0, 5).map((o) => (
                <Link
                  key={o.id}
                  href="/app/weaver/orders"
                  className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">
                      {o.product?.title || t("weaver:dashboard.unknownProduct")}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {o.business?.businessProfile?.businessName || t("weaver:dashboard.buyerFallback")} ·{" "}
                      {t("weaver:dashboard.qty", { count: o.quantity })} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <Badge variant="dashed" className={`ml-3 shrink-0 text-[11px] font-normal ${STATUS_BADGE[o.status] || ""}`}>
                    {t(`common:orderStatus.${o.status}`, { defaultValue: o.status.replace("_", " ") })}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </PanelCard>
      </div>

      {/* ── Recent Customer Orders ── */}
      <PanelCard
        title={t("weaver:dashboard.recentCustomerOrders")}
        description={t("weaver:dashboard.recentCustomerOrdersDesc")}
        headerRight={
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/app/weaver/customer-orders">
              {t("weaver:dashboard.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        }
        noPadding
      >
        {customerOrders.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="mb-2 h-8 w-8 text-neutral-300" />
            <p className="text-sm text-neutral-500">{t("weaver:dashboard.noCustomerOrders")}</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {customerOrders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href="/app/weaver/customer-orders"
                className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">
                    {o.items.map((i) => i.product?.title).filter(Boolean).join(", ") ||
                      t("weaver:dashboard.orderFallback")}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {o.customer?.customerProfile?.name || o.customer?.email || t("weaver:dashboard.customerFallback")} · ₹
                    {o.totalAmount.toLocaleString("en-IN")} ·{" "}
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Badge
                  variant="dashed"
                  className={`ml-3 shrink-0 text-[11px] font-normal ${CUSTOMER_ORDER_BADGE[o.status]}`}
                >
                  {t(`common:orderStatus.${o.status}`, { defaultValue: o.status })}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </PanelCard>

      {/* ── Row 3: Analytics mini-panel + Catalog summary ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PanelCard
          title={t("weaver:dashboard.catalogStatus")}
          description={t("weaver:dashboard.catalogStatusDesc")}
          className="lg:col-span-2"
        >
          {products.length === 0 ? (
            <p className="text-sm text-neutral-500 py-6 text-center">
              {t("weaver:dashboard.catalogStatusEmpty")}
            </p>
          ) : (
            <div className="space-y-3">
              {(["DONE", "PROCESSING", "NOT_STARTED", "FAILED"] as const).map((status) => {
                const count = products.filter((p) => p.catalogStatus === status).length;
                const pct = products.length ? Math.round((count / products.length) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs font-medium text-neutral-600">
                      {catalogLabel(status)}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-black transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-neutral-700">{count}</span>
                    <span className="w-10 text-right text-[11px] text-neutral-400">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>

        <PanelCard
          title={t("weaver:dashboard.quickActions")}
          description={t("weaver:dashboard.quickActionsDesc")}
          className="lg:col-span-1"
        >
          <div className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/weaver/products/new">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("weaver:dashboard.addNewProduct")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/weaver/customer-orders">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  {t("weaver:dashboard.stats.customerOrders")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/weaver/orders">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("weaver:dashboard.reviewRfqs")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/weaver/profile">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t("weaver:dashboard.updateProfile")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href="/app/weaver/products">
                <span className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  {t("weaver:dashboard.generateQrCodes")}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
