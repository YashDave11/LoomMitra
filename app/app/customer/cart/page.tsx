"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/lib/useRequireRole";
import { useCart } from "@/lib/CartContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useTranslation } from "react-i18next";

export default function CartPage() {
  const { t } = useTranslation(["customer", "common"]);
  const { ready } = useRequireRole("CUSTOMER");
  const router = useRouter();
  const { items, hydrated, subtotal, count, updateQuantity, removeItem, clear } = useCart();

  // Shipping + tax (dummy values for the demo payment flow)
  const shipping = items.length > 0 ? 99 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + shipping + tax;

  if (!ready) return null;

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => router.push("/app/discover")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("customer:cart.continueShopping")}
      </Button>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="sketch-box-alt flex h-10 w-10 items-center justify-center border-2 border-black">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{t("customer:cart.title")}</h1>
            <p className="text-sm text-neutral-500">
              {count === 0 ? t("customer:cart.noItemsYet") : t("customer:cart.itemCount", { count })}
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-1" />
            {t("customer:cart.clearCart")}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-neutral-300" strokeWidth={1.5} />
          <h3 className="text-xl font-bold">{t("customer:cart.emptyTitle")}</h3>
          <p className="mt-2 text-neutral-500 max-w-md">
            {t("customer:cart.emptyDesc")}
          </p>
          <Button asChild className="mt-6 bg-black hover:bg-neutral-800">
            <Link href="/app/discover">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t("customer:cart.browseProducts")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Cart Items ── */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <Card key={item.productId} className="border-neutral-200">
                <CardContent className="flex gap-4 p-4">
                  {/* Image */}
                  <Link
                    href={`/app/product/${item.productId}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/app/product/${item.productId}`}
                          className="font-bold text-neutral-900 line-clamp-1 hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.weaverName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center rounded-md border border-neutral-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-none"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-none"
                          disabled={item.quantity >= item.stock}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-neutral-500">{t("customer:cart.priceEach", { price: item.price.toLocaleString("en-IN") })}</p>
                        <p className="font-bold text-neutral-900">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {item.quantity >= item.stock && (
                      <Badge variant="dashed" className="mt-2 w-fit text-amber-700 border-amber-300 bg-amber-50">
                        {t("customer:cart.maxStock", { stock: item.stock })}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">{t("customer:cart.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{t("customer:cart.subtotalCount", { count })}</span>
                  <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{t("customer:cart.shipping")}</span>
                  <span className="font-medium">₹{shipping.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{t("customer:cart.gst")}</span>
                  <span className="font-medium">₹{tax.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between">
                  <span className="font-bold">{t("common:payment.total")}</span>
                  <span className="font-extrabold text-lg">₹{total.toLocaleString("en-IN")}</span>
                </div>

                <Button
                  asChild
                  className="w-full mt-4 h-12 bg-black hover:bg-neutral-800 text-base"
                >
                  <Link href="/app/customer/checkout">
                    {t("customer:cart.proceedToCheckout")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-center text-neutral-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("customer:cart.secureNote")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
