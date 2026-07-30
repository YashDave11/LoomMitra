"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import type { CustomerOrder, CustomerOrderStatus } from "@/lib/types";
import { CUSTOMER_ORDER_STATUS_FLOW } from "@/lib/types";
import { useRequireRole } from "@/lib/useRequireRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, CheckCircle2, CreditCard } from "lucide-react";

// We'll use t(`common:orderStatus.${status}`) instead of STEP_LABEL

const STATUS_STYLE: Record<CustomerOrderStatus, string> = {
  PLACED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  READY: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
};

export default function CustomerOrdersPage() {
  const { t } = useTranslation(["customer", "common"]);
  const { ready } = useRequireRole("CUSTOMER");

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    (async () => {
      try {
        const data = await apiClient.getCustomerOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready]);

  if (!ready) return null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
          <Package className="mb-4 h-16 w-16 text-neutral-300" strokeWidth={1.5} />
          <h3 className="text-xl font-bold">{t("customer:orders.emptyTitle")}</h3>
          <p className="mt-2 text-neutral-500">
            {t("customer:orders.emptyDesc")}
          </p>
          <Button asChild className="mt-6 bg-black hover:bg-neutral-800">
            <Link href="/app/discover">{t("customer:orders.browseProducts")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("customer:orders.title")}</h1>
        <p className="mt-2 text-neutral-600">
          {t("customer:orders.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const weaverName = order.weaver?.weaverProfile?.name || t("customer:orders.weaverFallback");
          const statusIndex = CUSTOMER_ORDER_STATUS_FLOW.indexOf(order.status);

          return (
            <Card
              key={order.id}
              className="overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
            >
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3">
                  <div>
                    <p className="text-xs text-neutral-500">
                      {t("customer:orders.orderLabel")}{" "}
                      <span className="font-mono font-bold text-neutral-800">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      {" · "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm font-bold text-neutral-900">
                      {t("customer:orders.wovenBy", { name: weaverName })}
                    </p>
                  </div>
                  <Badge
                    variant="dashed"
                    className={`uppercase tracking-wider ${STATUS_STYLE[order.status]}`}
                  >
                    {t(`common:orderStatus.${order.status}`)}
                  </Badge>
                </div>

                <div className="space-y-5 p-5">
                  {/* Status timeline */}
                  <div className="flex items-center">
                    {CUSTOMER_ORDER_STATUS_FLOW.map((step, i) => {
                      const done = i <= statusIndex;
                      const isLast = i === CUSTOMER_ORDER_STATUS_FLOW.length - 1;
                      return (
                        <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                                done
                                  ? "border-green-600 bg-green-600 text-white"
                                  : "border-neutral-300 bg-white text-neutral-400"
                              }`}
                            >
                              {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                            </div>
                            <span
                              className={`mt-1 text-[10px] font-medium sm:text-xs ${
                                done ? "text-green-700" : "text-neutral-400"
                              }`}
                            >
                              {t(`common:orderStatus.${step}`)}
                            </span>
                          </div>
                          {!isLast && (
                            <div
                              className={`mx-1 mb-4 h-0.5 flex-1 ${
                                i < statusIndex ? "bg-green-600" : "bg-neutral-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product?.images?.[0]?.url || "/placeholder.svg"}
                            alt={item.product?.title || "Product"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-neutral-900">
                            {item.product?.title || t("customer:orders.productFallback")}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.quantity} × ₹{item.priceAtPurchase.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <p className="text-sm font-bold">
                          ₹{(item.quantity * item.priceAtPurchase).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <CreditCard className="h-3.5 w-3.5" />
                      {order.paymentMethod === "cod"
                        ? t("customer:orders.cashOnDelivery")
                        : order.paymentMethod.toUpperCase()}
                    </span>
                    <span>
                      <span className="mr-2 text-neutral-500">{t("common:fields.total")}</span>
                      <span className="font-extrabold">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
