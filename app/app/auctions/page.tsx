"use client";

// Auction House — browse live & upcoming auctions (all authenticated roles).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/lib/apiClient";
import type { Auction } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, Loader2, MapPin } from "lucide-react";
import {
  AuctionStatusBadge,
  AuctionCountdown,
  formatINR,
  auctionPreviewImage,
} from "@/components/auction/AuctionBits";

export default function AuctionListPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation(["auction", "product"]);
  const { t: tp } = useTranslation("product");

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    apiClient
      .getAuctions()
      .then(setAuctions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <Badge variant="dashed" className="mb-2">{t("auction:list.badge")}</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight">{t("auction:list.title")}</h1>
        <p className="mt-2 max-w-2xl text-lg text-neutral-600">{t("auction:list.subtitle")}</p>
      </div>

      {auctions.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
          <Gavel className="mb-4 h-12 w-12 text-neutral-300" />
          <p className="text-neutral-500">{t("auction:list.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {auctions.map((auction) => {
            const cluster =
              auction.product.location ||
              auction.product.user?.weaverProfile?.cluster ||
              "";
            return (
              <Card key={auction.id} className="group overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={auctionPreviewImage(auction)}
                    alt={auction.product.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <AuctionStatusBadge status={auction.status} />
                  </div>
                </div>

                <CardHeader className="p-4 pb-0">
                  <CardTitle className="line-clamp-1 text-lg font-bold">
                    {auction.product.title}
                  </CardTitle>
                  {cluster && (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{optionLabel(tp, "cluster", cluster)}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-3 grow space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t("auction:list.basePrice")}</span>
                    <span className="font-medium">{formatINR(auction.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t("auction:list.highestBid")}</span>
                    <span className="font-bold">
                      {auction.highestBid != null
                        ? formatINR(auction.highestBid)
                        : t("auction:list.noBids")}
                    </span>
                  </div>
                  <div className="pt-1 text-xs text-neutral-500">
                    <AuctionCountdown auction={auction} />
                  </div>
                </CardContent>

                <CardFooter className="border-t border-neutral-100 p-4 mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/app/auctions/${auction.id}`}>
                      <Gavel className="h-4 w-4" />
                      {t("auction:list.view")}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
