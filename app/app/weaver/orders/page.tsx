"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/apiClient";
import type { BulkOrderRequest } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Box, XCircle, CheckCircle, PackageSearch } from "lucide-react";

export default function WeaverOrdersPage() {
  const { isAuthenticated, role, loading: authLoading } = useAuth();
  const { t } = useTranslation(["weaver", "common"]);

  const [orders, setOrders] = useState<BulkOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for quoting a price
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated || role !== "WEAVER") return;
    
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, role]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBulkOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (order: BulkOrderRequest, action: "ACCEPT" | "REJECT" | "ACCEPT_BARGAIN" | "REJECT_BARGAIN") => {
    setProcessingId(order.id);
    try {
      if (order.status === "PENDING") {
        let price: number | undefined;
        if (action === "ACCEPT") {
          const val = parseFloat(quotePrices[order.id]);
          if (isNaN(val) || val <= 0) {
            alert(t("orders.invalidPrice"));
            setProcessingId(null);
            return;
          }
          price = val;
        }
        // Respond to initial request
        await apiClient.respondToBulkOrder(order.id, action as "ACCEPT" | "REJECT", price);
      } else if (order.status === "BARGAINING") {
        // Handle bargaining final decision
        await apiClient.negotiateBulkOrder(order.id, action as "ACCEPT_BARGAIN" | "REJECT_BARGAIN");
      }
      
      // Refresh list
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || t("orders.respondFailed"));
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

  // Filter actionable orders for weaver (PENDING or BARGAINING)
  const actionRequiredOrders = orders.filter(o => o.status === "PENDING" || o.status === "BARGAINING");
  const otherOrders = orders.filter(o => o.status !== "PENDING" && o.status !== "BARGAINING");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("orders.title")}</h1>
        <p className="mt-2 text-neutral-600">
          {t("orders.subtitle")}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Box className="h-5 w-5" />
          {t("orders.actionRequired", { count: actionRequiredOrders.length })}
        </h2>

        {actionRequiredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-center">
            <PackageSearch className="h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-neutral-600 font-medium">{t("orders.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {actionRequiredOrders.map((order) => {
              const mainImage = order.product?.images?.[0]?.url || "/placeholder.svg";
              const businessName = order.business?.businessProfile?.businessName || t("orders.unknownBusiness");
              const isBargaining = order.status === "BARGAINING";
              
              return (
                <Card key={order.id} className={`overflow-hidden border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isBargaining ? 'border-purple-900 shadow-[4px_4px_0px_0px_rgba(88,28,135,1)]' : 'border-black'}`}>
                  <div className="flex flex-col sm:flex-row">
                    {/* Left: Product Info */}
                    <div className={`flex shrink-0 p-4 border-b sm:border-b-0 sm:border-r w-full sm:w-1/3 ${isBargaining ? 'border-purple-100 bg-purple-50' : 'border-neutral-200 bg-neutral-50'}`}>
                      <div className="flex gap-4 items-start w-full">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white border border-neutral-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mainImage} alt={order.product?.title || t("dashboard.unknownProduct")} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1">{order.product?.title}</p>
                          <p className="text-sm text-neutral-500 mt-1">{t("orders.requestFrom")}</p>
                          <p className="text-sm font-bold text-blue-700">{businessName}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Negotiation Action */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">{t("orders.requestedQuantity")}</p>
                          <p className="text-3xl font-extrabold text-neutral-900">{order.quantity} <span className="text-base font-medium text-neutral-500">{t("orders.units")}</span></p>
                        </div>
                        <Badge variant="dashed" className={`uppercase tracking-wider ${isBargaining ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                          {isBargaining ? t("orders.counterReceived") : t("orders.pendingResponse")}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-end bg-neutral-100 p-4 rounded-xl border border-neutral-200">
                        {isBargaining ? (
                          <div className="flex-1 w-full space-y-2">
                            <p className="text-sm font-bold text-neutral-700">{t("orders.counterOffer")}</p>
                            <p className="text-2xl font-bold text-purple-700">₹{order.bargainPrice?.toLocaleString("en-IN")} <span className="text-sm font-medium text-neutral-500">{t("orders.perUnit")}</span></p>
                            <p className="text-xs text-neutral-500 mt-1">{t("orders.notAcceptedQuote", { price: order.quotedPrice })}</p>
                          </div>
                        ) : (
                          <div className="flex-1 w-full space-y-2">
                            <label className="text-sm font-bold text-neutral-700">{t("orders.yourQuote")}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 font-medium text-neutral-500">₹</span>
                              <Input
                                type="number"
                                className="pl-8 h-10 border-neutral-300"
                                placeholder={t("orders.quotePlaceholder")}
                                value={quotePrices[order.id] || ""}
                                onChange={(e) => setQuotePrices(prev => ({ ...prev, [order.id]: e.target.value }))}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={processingId === order.id}
                            onClick={() => handleRespond(order, isBargaining ? "REJECT_BARGAIN" : "REJECT")}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t("orders.reject")}
                          </Button>
                          <Button 
                            className={`flex-1 text-white hover:bg-neutral-800 ${isBargaining ? 'bg-purple-700 hover:bg-purple-800' : 'bg-black'}`}
                            disabled={processingId === order.id}
                            onClick={() => handleRespond(order, isBargaining ? "ACCEPT_BARGAIN" : "ACCEPT")}
                          >
                            {processingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {isBargaining ? t("orders.acceptOffer") : t("orders.sendQuote")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {otherOrders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4 text-neutral-500 flex items-center gap-2">
            {t("orders.historyTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherOrders.map((order) => (
              <Card key={order.id} className="bg-neutral-50 border-neutral-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-white border border-neutral-200">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={order.product?.images?.[0]?.url || "/placeholder.svg"} alt={order.product?.title || t("dashboard.unknownProduct")} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{order.product?.title}</p>
                      <p className="text-xs text-neutral-500">{t("orders.qtyTo", { qty: order.quantity, business: order.business?.businessProfile?.businessName })}</p>
                    </div>
                  </div>
                  <div>
                    <Badge variant="subtle" className="text-[10px]">
                      {t(`common:orderStatus.${order.status}`)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
