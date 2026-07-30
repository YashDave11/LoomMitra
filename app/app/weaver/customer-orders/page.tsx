"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/apiClient";
import type { CustomerOrder, CustomerOrderStatus } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  PackageSearch,
  ShoppingBag,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
  Truck,
  PackageCheck,
} from "lucide-react";

const NEXT_STATUS: Partial<Record<CustomerOrderStatus, CustomerOrderStatus>> = {
  PLACED: "READY",
  READY: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const NEXT_LABEL_KEY: Partial<Record<CustomerOrderStatus, string>> = {
  PLACED: "customerOrders.markReady",
  READY: "customerOrders.markShipped",
  SHIPPED: "customerOrders.markDelivered",
};

const STATUS_STYLE: Record<CustomerOrderStatus, string> = {
  PLACED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  READY: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
};

const STATUS_LABEL_KEY: Record<CustomerOrderStatus, string> = {
  PLACED: "customerOrders.statusPlaced",
  READY: "customerOrders.statusReady",
  SHIPPED: "customerOrders.statusShipped",
  DELIVERED: "customerOrders.statusDelivered",
};

export default function WeaverCustomerOrdersPage() {
  const { isAuthenticated, role, loading: authLoading } = useAuth();
  const { t } = useTranslation(["weaver", "common"]);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated || role !== "WEAVER") return;

    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, role]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCustomerOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch customer orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (order: CustomerOrder) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    setProcessingId(order.id);
    try {
      await apiClient.updateCustomerOrderStatus(order.id, next);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "DELIVERED");
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("weaver:customerOrders.title")}</h1>
        <p className="mt-2 text-neutral-600">
          {t("weaver:customerOrders.subtitle")}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          {t("weaver:customerOrders.activeOrders", { count: activeOrders.length })}
        </h2>

        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-center">
            <PackageSearch className="h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-neutral-600 font-medium">{t("weaver:customerOrders.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeOrders.map((order) => {
              const customerName =
                order.customer?.customerProfile?.name || order.customer?.email || "Customer";
              const next = NEXT_STATUS[order.status];
              const isNew = order.status === "PLACED";

              return (
                <Card
                  key={order.id}
                  className={`overflow-hidden border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    isNew ? "border-yellow-600 shadow-[4px_4px_0px_0px_rgba(202,138,4,0.6)]" : "border-black"
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Header row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3">
                      <div>
                        <p className="text-xs text-neutral-500">
                          {t("weaver:customerOrders.orderNumber")} <span className="font-mono font-bold text-neutral-800">#{order.id.slice(0, 8).toUpperCase()}</span>
                          {" · "}
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="font-bold text-neutral-900">{customerName}</p>
                      </div>
                      <Badge
                        variant="dashed"
                        className={`uppercase tracking-wider ${STATUS_STYLE[order.status]}`}
                      >
                        {t(STATUS_LABEL_KEY[order.status])}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-5 p-5 sm:flex-row">
                      {/* Items */}
                      <div className="flex-1 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.product?.images?.[0]?.url || "/placeholder.svg"}
                                alt={item.product?.title || "Product"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-sm text-neutral-900">
                                {item.product?.title || "Product"}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {item.quantity} × ₹{item.priceAtPurchase.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <p className="font-bold text-sm">
                              ₹{(item.quantity * item.priceAtPurchase).toLocaleString("en-IN")}
                            </p>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm">
                          <span className="font-bold">{t("common:fields.total")}</span>
                          <span className="font-extrabold">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Shipping + action */}
                      <div className="w-full sm:w-72 shrink-0 space-y-3">
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                          <p className="mb-2 flex items-center gap-1.5 font-bold text-neutral-700">
                            <MapPin className="h-4 w-4" /> {t("weaver:customerOrders.shipTo")}
                          </p>
                          <p className="font-medium text-neutral-900">
                            {order.shippingAddress.fullName}
                          </p>
                          <p className="text-neutral-600">{order.shippingAddress.address}</p>
                          <p className="text-neutral-600">
                            {order.shippingAddress.city} — {order.shippingAddress.pincode}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-neutral-600">
                            <Phone className="h-3.5 w-3.5" /> {order.shippingAddress.phone}
                          </p>
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                            <CreditCard className="h-3.5 w-3.5" />
                            {order.paymentMethod === "cod"
                              ? t("weaver:customerOrders.cashOnDelivery")
                              : t("weaver:customerOrders.paidVia", { method: order.paymentMethod.toUpperCase() })}
                          </p>
                        </div>

                        {next && (
                          <Button
                            className="w-full bg-black text-white hover:bg-neutral-800"
                            disabled={processingId === order.id}
                            onClick={() => handleAdvance(order)}
                          >
                            {processingId === order.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : order.status === "PLACED" ? (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            ) : order.status === "READY" ? (
                              <Truck className="mr-2 h-4 w-4" />
                            ) : (
                              <PackageCheck className="mr-2 h-4 w-4" />
                            )}
                            {t(NEXT_LABEL_KEY[order.status] as string)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {deliveredOrders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4 text-neutral-500 flex items-center gap-2">
            {t("weaver:customerOrders.deliveredSection", { count: deliveredOrders.length })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveredOrders.map((order) => (
              <Card key={order.id} className="bg-neutral-50 border-neutral-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-white border border-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.items[0]?.product?.images?.[0]?.url || "/placeholder.svg"}
                        alt="Product"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm line-clamp-1">
                        {order.items.map((i) => i.product?.title).filter(Boolean).join(", ") ||
                          t("common:fields.name")}
                      </p>
                      <p className="text-xs text-neutral-500">
                        ₹{order.totalAmount.toLocaleString("en-IN")} | To:{" "}
                        {order.customer?.customerProfile?.name || order.customer?.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="subtle" className="text-[10px] bg-green-100 text-green-800">
                    {t("common:orderStatus.DELIVERED")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
