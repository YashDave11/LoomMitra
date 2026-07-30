"use client";

// Small shared pieces for Auction House screens: status badge + countdown.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { Auction, AuctionStatus } from "@/lib/types";

const STATUS_STYLES: Record<AuctionStatus, string> = {
  LIVE: "bg-green-600 text-white border-none",
  UPCOMING: "bg-blue-600 text-white border-none",
  ENDED: "bg-neutral-400 text-white border-none",
  CANCELLED: "bg-red-500 text-white border-none",
  DRAFT: "",
};

export function AuctionStatusBadge({ status }: { status: AuctionStatus }) {
  const { t } = useTranslation("auction");
  return <Badge className={STATUS_STYLES[status]}>{t(`status.${status}`)}</Badge>;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

/** Ticking countdown to the auction's next transition (start or end). */
export function AuctionCountdown({ auction }: { auction: Auction }) {
  const { t } = useTranslation("auction");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (auction.status === "UPCOMING") {
    return (
      <span>
        {t("detail.startsIn")}: {formatRemaining(new Date(auction.startTime).getTime() - now)}
      </span>
    );
  }
  if (auction.status === "LIVE") {
    return (
      <span>
        {t("detail.timeLeft")}: {formatRemaining(new Date(auction.endTime).getTime() - now)}
      </span>
    );
  }
  return (
    <span>
      {t("detail.endedOn")}: {new Date(auction.endTime).toLocaleString()}
    </span>
  );
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function auctionPreviewImage(auction: Auction): string {
  const images = auction.product?.images || [];
  const catalog = images.find((img) => img.type.startsWith("CATALOG_"));
  return catalog?.url || images[0]?.url || "/placeholder.svg";
}
