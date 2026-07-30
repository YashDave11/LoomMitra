"use client";

// Weaver's Auction House — list own auctions, cancel active ones.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRequireRole } from "@/lib/useRequireRole";
import { apiClient } from "@/lib/apiClient";
import type { Auction } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gavel, Plus, XCircle } from "lucide-react";
import {
  AuctionStatusBadge,
  AuctionCountdown,
  formatINR,
  auctionPreviewImage,
} from "@/components/auction/AuctionBits";

export default function WeaverAuctionsPage() {
  const { ready } = useRequireRole("WEAVER");
  const { t } = useTranslation("auction");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    apiClient
      .getAuctions(true)
      .then(setAuctions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready]);

  async function handleCancel(id: string) {
    if (!confirm(t("mine.cancelConfirm"))) return;
    setCancelling(id);
    try {
      const updated = await apiClient.cancelAuction(id);
      setAuctions((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("validation.generic"));
    } finally {
      setCancelling(null);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2">
            <Badge variant="dashed">{t("list.badge")}</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t("mine.title")}</h1>
          <p className="mt-1 text-sm text-neutral-600">{t("mine.subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/app/weaver/auctions/new">
            <Plus className="h-4 w-4" />
            {t("mine.newAuction")}
          </Link>
        </Button>
      </div>

      <Separator className="my-8" />

      {loading ? (
        <div className="py-20 text-center text-sm text-neutral-500">{t("list.loading")}</div>
      ) : auctions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Gavel className="mb-4 h-12 w-12 text-neutral-300" />
            <p className="text-neutral-500">{t("mine.empty")}</p>
            <Button className="mt-6" asChild>
              <Link href="/app/weaver/auctions/new">
                <Plus className="h-4 w-4" />
                {t("mine.newAuction")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <Card key={auction.id} className="flex flex-col">
              <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-black bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={auctionPreviewImage(auction)}
                  alt={auction.product.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-2 top-2">
                  <AuctionStatusBadge status={auction.status} />
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{auction.product.title}</CardTitle>
                <div className="text-xs text-neutral-500">
                  <AuctionCountdown auction={auction} />
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-1 pb-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("list.basePrice")}</span>
                  <span className="font-medium">{formatINR(auction.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("list.highestBid")}</span>
                  <span className="font-bold">
                    {auction.highestBid != null ? formatINR(auction.highestBid) : t("list.noBids")}
                  </span>
                </div>
                {auction.status === "ENDED" && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">
                      {auction.result === "WON" ? t("mine.finalPrice") : t("result.NO_SALE")}
                    </span>
                    {auction.result === "WON" && (
                      <span className="font-bold text-green-700">
                        {formatINR(auction.finalPrice!)}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/app/auctions/${auction.id}`}>{t("list.view")}</Link>
                </Button>
                {(auction.status === "UPCOMING" || auction.status === "LIVE") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={cancelling === auction.id}
                    onClick={() => handleCancel(auction.id)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {t("mine.cancelAuction")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
