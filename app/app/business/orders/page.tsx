"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/apiClient";
import type { BulkOrderRequest } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRightLeft, CheckCircle, XCircle, PackageSearch } from "lucide-react";

export default function BusinessOrdersPage() {
  const { isAuthenticated, role, loading: authLoading } = useAuth();
  const { t } = useTranslation(["business", "common"]);

  const [orders, setOrders] = useState<BulkOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for bargaining
  const [bargainPrices, setBargainPrices] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated || role !== "BUSINESS") return;
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

  const handleNegotiate = async (id: string, action: "ACCEPT_QUOTE" | "BARGAIN" | "REJECT") => {
    setProcessingId(id);
    try {
      let price: number | undefined;
      
      if (action === "BARGAIN") {
        const val = parseFloat(bargainPrices[id]);
        if (isNaN(val) || val <= 0) {
          alert(t("business:orders.errors.invalidBargainPrice"));
          setProcessingId(null);
          return;
        }
        price = val;
      }

      await apiClient.negotiateBulkOrder(id, action, price);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || t("business:orders.errors.negotiateFailed"));
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

  // Actionable orders for business: WEAVER_RESPONDED
  const actionRequiredOrders = orders.filter(o => o.status === "WEAVER_RESPONDED");
  const otherOrders = orders.filter(o => o.status !== "WEAVER_RESPONDED");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("business:orders.title")}</h1>
        <p className="mt-2 text-neutral-600">{t("business:orders.subtitle")}</p>
      </div>

      {/* Action Required Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          {t("business:orders.actionRequired", { count: actionRequiredOrders.length })}
        </h2>
        
        {actionRequiredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-center">
            <PackageSearch className="h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-neutral-600 font-medium">{t("business:orders.noQuotes")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {actionRequiredOrders.map((order) => {
              const mainImage = order.product?.images?.[0]?.url || "/placeholder.svg";
              const weaverName = order.weaver?.weaverProfile?.name || t("business:orders.unknownWeaver");
              const quotedPrice = order.quotedPrice || 0;
              const totalCost = quotedPrice * order.quantity;

              return (
                <Card key={order.id} className="overflow-hidden border-2 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex shrink-0 p-4 border-b sm:border-b-0 sm:border-r border-blue-100 bg-blue-50/50 w-full sm:w-1/3">
                      <div className="flex gap-4 items-start w-full">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white border border-neutral-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mainImage} alt="Product" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1">{order.product?.title}</p>
                          <p className="text-sm text-neutral-500 mt-1">{t("business:orders.weaverLabel")}</p>
                          <p className="text-sm font-bold text-blue-700">{weaverName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">{t("business:orders.quoteForUnits", { count: order.quantity })}</p>
                          <p className="text-3xl font-extrabold text-neutral-900">₹{quotedPrice.toLocaleString("en-IN")} <span className="text-sm font-medium text-neutral-500">{t("business:orders.perUnit")}</span></p>
                          <p className="text-xs font-bold text-neutral-400 mt-1">{t("business:orders.totalAmount", { amount: totalCost.toLocaleString("en-IN") })}</p>
                        </div>
                        <Badge variant="dashed" className="bg-blue-100 text-blue-800 border-blue-200 uppercase tracking-wider">
                          {t("business:orders.quoteReceived")}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 items-end bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-sm font-bold text-neutral-700">{t("business:orders.counterPrice")}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 font-medium text-neutral-500">₹</span>
                            <Input 
                              type="number" 
                              className="pl-8 h-10 border-neutral-300" 
                              placeholder={t("business:orders.counterPlaceholder")}
                              value={bargainPrices[order.id] || ""}
                              onChange={(e) => setBargainPrices(prev => ({ ...prev, [order.id]: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={processingId === order.id}
                            onClick={() => handleNegotiate(order.id, "REJECT")}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t("common:actions.reject")}
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                            disabled={processingId === order.id}
                            onClick={() => handleNegotiate(order.id, "BARGAIN")}
                          >
                            {processingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                            )}
                            {t("business:orders.bargain")}
                          </Button>
                          <Button 
                            className="flex-1 bg-black hover:bg-neutral-800 text-white"
                            disabled={processingId === order.id}
                            onClick={() => handleNegotiate(order.id, "ACCEPT_QUOTE")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t("business:orders.acceptQuote")}
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

      {/* History Section */}
      {otherOrders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4 text-neutral-500 flex items-center gap-2">
            {t("business:orders.history")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherOrders.map((order) => {
              const mainImage = order.product?.images?.[0]?.url || "/placeholder.svg";
              let badgeColor = "bg-neutral-100 text-neutral-800";
              
              if (order.status === "ACCEPTED") badgeColor = "bg-green-100 text-green-800";
              else if (order.status === "REJECTED") badgeColor = "bg-red-100 text-red-800";
              else if (order.status === "BARGAINING") badgeColor = "bg-purple-100 text-purple-800";
              else if (order.status === "PENDING") badgeColor = "bg-yellow-100 text-yellow-800";

              return (
                <Card key={order.id} className={`border-neutral-200 transition-shadow hover:shadow-md ${order.status === "ACCEPTED" ? 'bg-green-50/30' : 'bg-neutral-50'}`}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="subtle" className={badgeColor}>
                        {order.status}
                      </Badge>
                      <span className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white border border-neutral-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mainImage} alt="Product" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{order.product?.title}</p>
                        <p className="text-xs text-neutral-500 mt-1">{t("business:orders.weaverLabel")} {order.weaver?.weaverProfile?.name}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-md p-2 mt-1 flex justify-between items-center text-sm border border-neutral-100">
                      <span className="text-neutral-500">{t("business:orders.qty")} <span className="font-bold text-neutral-900">{order.quantity}</span></span>
                      {order.finalPrice ? (
                        <span className="text-green-700 font-bold">{t("business:orders.pricePerUnit", { price: order.finalPrice })}</span>
                      ) : order.bargainPrice ? (
                        <span className="text-purple-700 font-bold">{t("business:orders.offer", { price: order.bargainPrice })}</span>
                      ) : order.quotedPrice ? (
                        <span className="text-blue-700 font-bold">{t("business:orders.quote", { price: order.quotedPrice })}</span>
                      ) : (
                        <span className="text-neutral-400">{t("business:orders.waitingForQuote")}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
