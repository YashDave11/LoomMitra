"use client";

// Create auction — weaver picks one of their own products and sets terms.
// Supports ?productId=... prefill (from the product edit page).

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useRequireRole } from "@/lib/useRequireRole";
import { apiClient, ApiError } from "@/lib/apiClient";
import type { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function AuctionForm() {
  const { ready } = useRequireRole("WEAVER");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation("auction");

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(searchParams.get("productId") || "");
  const [basePrice, setBasePrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minBidIncrement, setMinBidIncrement] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [reservedPrice, setReservedPrice] = useState("");
  const [maxBidsPerUser, setMaxBidsPerUser] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    apiClient.getProducts().then(setProducts).catch(console.error);
  }, [ready]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!productId || !basePrice || !startTime || !endTime) {
      setError(t("validation.required_fields"));
      return;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      setError(t("validation.end_after_start"));
      return;
    }
    if (end <= new Date()) {
      setError(t("validation.end_in_future"));
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.createAuction({
        productId,
        basePrice: Number(basePrice),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        minBidIncrement: minBidIncrement ? Number(minBidIncrement) : undefined,
        buyNowPrice: buyNowPrice ? Number(buyNowPrice) : undefined,
        reservedPrice: reservedPrice ? Number(reservedPrice) : undefined,
        maxBidsPerUser: maxBidsPerUser ? Number(maxBidsPerUser) : undefined,
      });
      router.push("/app/weaver/auctions");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("validation.generic"));
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2">
        <Badge variant="dashed">{t("form.badge")}</Badge>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">{t("form.title")}</h1>
      <p className="mt-1 text-sm text-neutral-600">{t("form.subtitle")}</p>

      <Separator className="my-8" />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="product">{t("form.product.label")}</Label>
              <select
                id="product"
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const p = products.find((x) => x.id === e.target.value);
                  if (p && !basePrice) setBasePrice(String(p.price));
                }}
                required
              >
                <option value="">{t("form.productPlaceholder")}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="basePrice">{t("form.base_price.label")}</Label>
              <Input
                id="basePrice"
                type="number"
                min="1"
                step="any"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">{t("form.start_time.label")}</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">{t("form.end_time.label")}</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="minBidIncrement">{t("form.min_bid_increment.label")}</Label>
                <Input
                  id="minBidIncrement"
                  type="number"
                  min="1"
                  step="any"
                  value={minBidIncrement}
                  onChange={(e) => setMinBidIncrement(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="buyNowPrice">{t("form.buy_now_price.label")}</Label>
                <Input
                  id="buyNowPrice"
                  type="number"
                  min="1"
                  step="any"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reservedPrice">{t("form.reserved_price.label")}</Label>
                <Input
                  id="reservedPrice"
                  type="number"
                  min="1"
                  step="any"
                  value={reservedPrice}
                  onChange={(e) => setReservedPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxBidsPerUser">{t("form.max_bids_per_user.label")}</Label>
                <Input
                  id="maxBidsPerUser"
                  type="number"
                  min="1"
                  step="1"
                  value={maxBidsPerUser}
                  onChange={(e) => setMaxBidsPerUser(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? t("form.submitting") : t("form.submit")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/app/weaver/auctions")}
              >
                {t("form.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewAuctionPage() {
  return (
    <Suspense fallback={null}>
      <AuctionForm />
    </Suspense>
  );
}
