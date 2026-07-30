"use client";

// Auction detail — product info, bid history, countdown, place-bid form.
// Polls every 10s to refresh the highest bid (prototype; no websockets).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { apiClient, ApiError } from "@/lib/apiClient";
import type { Auction } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Gavel, Loader2, MapPin, Trophy } from "lucide-react";
import {
  AuctionStatusBadge,
  AuctionCountdown,
  formatINR,
  auctionPreviewImage,
} from "@/components/auction/AuctionBits";

const POLL_MS = 10_000;

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading, role } = useAuth();
  const { t } = useTranslation(["auction", "product"]);
  const { t: tp } = useTranslation("product");

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const refresh = useCallback(() => {
    if (!id) return;
    apiClient.getAuction(id).then(setAuction).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !id) return;
    apiClient
      .getAuction(id)
      .then(setAuction)
      .catch(console.error)
      .finally(() => setLoading(false));
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [authLoading, isAuthenticated, id, refresh]);

  async function handlePlaceBid(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    setPlacing(true);
    try {
      const updated = await apiClient.placeBid(id, amount);
      setAuction(updated);
      setBidAmount("");
      setSuccess(true);
    } catch (err) {
      // Backend returns stable codes (BID_TOO_LOW etc.) — translate them,
      // fall back to the raw message for anything else.
      const code = err instanceof ApiError ? err.message : "generic";
      const key = `validation.${code}`;
      setError(t(`auction:${key}`) === key ? String(code) : t(`auction:${key}`));
    } finally {
      setPlacing(false);
    }
  }

  if (authLoading || !isAuthenticated || loading || !auction) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const product = auction.product;
  const weaverName = product.user?.weaverProfile?.name;
  const cluster = product.location || product.user?.weaverProfile?.cluster || "";
  const minNextBid =
    auction.highestBid != null
      ? auction.highestBid + (auction.minBidIncrement ?? 0.01)
      : auction.basePrice;

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/app/auctions">
          <ArrowLeft className="h-4 w-4" />
          {t("auction:detail.backToList")}
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Product ── */}
        <div>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={auctionPreviewImage(auction)}
              alt={product.title}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>

        {/* ── Auction info ── */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <AuctionStatusBadge status={auction.status} />
              <span className="text-sm text-neutral-500">
                <AuctionCountdown auction={auction} />
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{product.title}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
              {weaverName && <span>{t("auction:detail.byWeaver", { name: weaverName })}</span>}
              {cluster && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {optionLabel(tp, "cluster", cluster)}
                </span>
              )}
            </div>
            {product.description && (
              <p className="mt-3 text-neutral-600">{product.description}</p>
            )}
          </div>

          <Card>
            <CardContent className="grid grid-cols-2 gap-4 pt-6 text-sm">
              <div>
                <div className="text-neutral-500">{t("auction:detail.basePrice")}</div>
                <div className="text-lg font-bold">{formatINR(auction.basePrice)}</div>
              </div>
              <div>
                <div className="text-neutral-500">{t("auction:detail.highestBid")}</div>
                <div className="text-lg font-bold">
                  {auction.highestBid != null
                    ? formatINR(auction.highestBid)
                    : t("auction:list.noBids")}
                </div>
              </div>
              {auction.minBidIncrement != null && (
                <div>
                  <div className="text-neutral-500">{t("auction:detail.minIncrement")}</div>
                  <div className="font-medium">{formatINR(auction.minBidIncrement)}</div>
                </div>
              )}
              {auction.buyNowPrice != null && (
                <div>
                  <div className="text-neutral-500">{t("auction:detail.buyNow")}</div>
                  <div className="font-medium">{formatINR(auction.buyNowPrice)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Ended banner ── */}
          {auction.status === "ENDED" && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
              {auction.result === "WON" ? (
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span>
                    {t("auction:detail.winner")}: <b>{formatINR(auction.finalPrice!)}</b> —{" "}
                    {t("auction:detail.reservedForWinner")}
                  </span>
                </div>
              ) : (
                <span>{t("auction:detail.noSale")}</span>
              )}
            </div>
          )}

          {/* ── Place bid (B2C customers, live only) ── */}
          {auction.status === "LIVE" &&
            (role === "CUSTOMER" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gavel className="h-5 w-5" />
                    {t("auction:place_bid.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePlaceBid} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="bidAmount">{t("auction:place_bid.amountLabel")}</Label>
                      <Input
                        id="bidAmount"
                        type="number"
                        min={minNextBid}
                        step="any"
                        required
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={String(minNextBid)}
                      />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && (
                      <p className="text-sm text-green-600">{t("auction:place_bid.success")}</p>
                    )}
                    <Button type="submit" disabled={placing} className="w-full">
                      {placing
                        ? t("auction:place_bid.submitting")
                        : t("auction:place_bid.submit")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-neutral-500">{t("auction:place_bid.customersOnly")}</p>
            ))}

          {/* ── Bid history ── */}
          <div>
            <h2 className="mb-3 text-lg font-bold">{t("auction:detail.bidHistory")}</h2>
            {auction.bids.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("auction:detail.noBidsYet")}</p>
            ) : (
              <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                {auction.bids.map((bid) => (
                  <li key={bid.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="font-medium">
                      {bid.isMine ? t("auction:detail.you") : bid.bidderMask}
                    </span>
                    <span className="font-bold">{formatINR(bid.amount)}</span>
                    <span className="text-xs text-neutral-500">
                      {new Date(bid.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
