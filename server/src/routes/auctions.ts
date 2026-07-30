import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// ── Notification stub ──
// ponytail: console.log placeholder; swap for a Notification table + push/email when notifications are built.
function notify(userId: string, event: string, payload: Record<string, unknown>) {
  console.log(`[notify] user=${userId} event=${event}`, payload);
}

const ACTIVE_STATUSES = ["UPCOMING", "LIVE"] as const;

/**
 * Lazily advance auction lifecycle based on the clock:
 *   UPCOMING -> LIVE  (startTime passed)
 *   LIVE     -> ENDED (endTime passed) + winner selection
 *
 * Called on-demand at the top of every auction read/write route instead of a
 * background scheduler — correct enough for a prototype since state only
 * matters when someone looks at it. Also exposed as POST /sync for manual runs.
 */
async function syncAuctions() {
  const now = new Date();

  await prisma.auction.updateMany({
    where: { status: "UPCOMING", startTime: { lte: now }, endTime: { gt: now } },
    data: { status: "LIVE" },
  });

  // Skipped past start AND end without ever going live, or live and expired
  const expired = await prisma.auction.findMany({
    where: { status: { in: ["UPCOMING", "LIVE"] }, endTime: { lte: now } },
  });
  for (const auction of expired) {
    await endAuction(auction.id);
  }
}

/** Transition an auction to ENDED, pick the winner, honour reserve price. */
async function endAuction(auctionId: string) {
  const ended = await prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { bids: { orderBy: [{ amount: "desc" }, { createdAt: "asc" }] } },
    });
    if (!auction || auction.status === "ENDED" || auction.status === "CANCELLED") return null;

    const highest = auction.bids[0];
    const reserveMet =
      !!highest && (auction.reservedPrice == null || highest.amount >= auction.reservedPrice);

    return tx.auction.update({
      where: { id: auction.id },
      data: reserveMet
        ? {
            status: "ENDED",
            result: "WON",
            winningBidId: highest.id,
            winningBidderUserId: highest.bidderUserId,
            finalPrice: highest.amount,
            // Placeholder reservation until the payment flow exists —
            // product is considered "reserved for auction winner".
            orderStatus: "pending_payment",
          }
        : { status: "ENDED", result: "NO_SALE" },
    });
  });

  if (ended) {
    notify(ended.weaverId, "auction.ended", { auctionId: ended.id, result: ended.result });
    if (ended.winningBidderUserId) {
      notify(ended.winningBidderUserId, "auction.won", {
        auctionId: ended.id,
        finalPrice: ended.finalPrice,
      });
    }
  }
  return ended;
}

const AUCTION_INCLUDE: Prisma.AuctionInclude = {
  product: {
    include: { images: true, user: { include: { weaverProfile: true } } },
  },
  bids: {
    orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
    include: { bidder: { include: { customerProfile: true } } },
  },
};

/** Mask bidder identity for public bid history ("Ravi K." -> "R***"). */
function serializeAuction(auction: any, viewerUserId?: string) {
  const bids = auction.bids || [];
  return {
    ...auction,
    highestBid: bids[0]?.amount ?? null,
    bidCount: bids.length,
    bids: bids.map((b: any) => ({
      id: b.id,
      amount: b.amount,
      currency: b.currency,
      createdAt: b.createdAt,
      isMine: viewerUserId ? b.bidderUserId === viewerUserId : false,
      bidderMask: `${(b.bidder?.customerProfile?.name || "B").charAt(0).toUpperCase()}***`,
    })),
  };
}

// ── Manual sync endpoint ("Update auctions now") ──
router.post("/sync", requireAuth, async (_req: Request, res: Response) => {
  await syncAuctions();
  res.json({ message: "Auctions synced" });
});

// ── Create auction (weaver, own product only) ──
router.post(
  "/",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        productId,
        basePrice,
        startTime,
        endTime,
        minBidIncrement,
        buyNowPrice,
        reservedPrice,
        maxBidsPerUser,
      } = req.body;

      const base = Number(basePrice);
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (!productId || !Number.isFinite(base) || base <= 0) {
        res.status(400).json({ error: "productId and a positive basePrice are required" });
        return;
      }
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        res.status(400).json({ error: "endTime must be after startTime" });
        return;
      }
      if (end <= new Date()) {
        res.status(400).json({ error: "endTime must be in the future" });
        return;
      }
      for (const [name, v] of [
        ["minBidIncrement", minBidIncrement],
        ["buyNowPrice", buyNowPrice],
        ["reservedPrice", reservedPrice],
      ] as const) {
        if (v != null && (!Number.isFinite(Number(v)) || Number(v) <= 0)) {
          res.status(400).json({ error: `${name} must be a positive number` });
          return;
        }
      }
      if (buyNowPrice != null && Number(buyNowPrice) < base) {
        res.status(400).json({ error: "buyNowPrice must be >= basePrice" });
        return;
      }

      const product = await prisma.product.findUnique({ where: { id: String(productId) } });
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (product.userId !== req.user!.userId) {
        res.status(403).json({ error: "You can only auction your own products" });
        return;
      }

      const existing = await prisma.auction.findFirst({
        where: { productId: product.id, status: { in: [...ACTIVE_STATUSES] } },
      });
      if (existing) {
        res.status(409).json({ error: "Product already has an active auction" });
        return;
      }

      const now = new Date();
      const auction = await prisma.auction.create({
        data: {
          productId: product.id,
          weaverId: req.user!.userId,
          basePrice: base,
          currency: product.currency || "INR",
          startTime: start,
          endTime: end,
          status: start > now ? "UPCOMING" : "LIVE",
          minBidIncrement: minBidIncrement != null ? Number(minBidIncrement) : null,
          buyNowPrice: buyNowPrice != null ? Number(buyNowPrice) : null,
          reservedPrice: reservedPrice != null ? Number(reservedPrice) : null,
          maxBidsPerUser: maxBidsPerUser != null ? Number(maxBidsPerUser) : null,
        },
        include: AUCTION_INCLUDE,
      });

      res.status(201).json(serializeAuction(auction, req.user!.userId));
    } catch (error) {
      console.error("Auction create error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── List auctions ──
// Default: LIVE + UPCOMING (public browsing). ?mine=1 => weaver's own, all statuses.
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await syncAuctions();

    const mine = req.query.mine === "1";
    const auctions = await prisma.auction.findMany({
      where: mine
        ? { weaverId: req.user!.userId }
        : { status: { in: [...ACTIVE_STATUSES] } },
      include: AUCTION_INCLUDE,
      orderBy: [{ status: "desc" }, { endTime: "asc" }],
    });

    res.json(auctions.map((a) => serializeAuction(a, req.user!.userId)));
  } catch (error) {
    console.error("Auction list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Auction detail ──
router.get("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await syncAuctions();

    const auction = await prisma.auction.findUnique({
      where: { id: String(req.params.id) },
      include: AUCTION_INCLUDE,
    });
    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }
    res.json(serializeAuction(auction, req.user!.userId));
  } catch (error) {
    console.error("Auction detail error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Place bid (B2C customer only) ──
router.post(
  "/:id/bids",
  requireAuth,
  requireRole("CUSTOMER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      await syncAuctions();

      const auctionId = String(req.params.id);
      const amount = Number(req.body?.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ error: "A positive bid amount is required" });
        return;
      }

      // Transaction so two concurrent bids validate against the same highest bid.
      // ponytail: serializable-ish via re-read inside tx; row locking if bid volume ever matters.
      const outcome = await prisma.$transaction(async (tx) => {
        const auction = await tx.auction.findUnique({
          where: { id: auctionId },
          include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
        });
        if (!auction) return { error: "Auction not found", status: 404 };
        if (auction.status !== "LIVE") return { error: "AUCTION_NOT_LIVE", status: 400 };
        if (amount < auction.basePrice) return { error: "BID_BELOW_BASE", status: 400 };

        const highest = auction.bids[0];
        if (highest) {
          const minNext = highest.amount + (auction.minBidIncrement ?? 0.01);
          if (amount < minNext) return { error: "BID_TOO_LOW", status: 400, minNext };
        }

        if (auction.maxBidsPerUser != null) {
          const count = await tx.bid.count({
            where: { auctionId, bidderUserId: req.user!.userId },
          });
          if (count >= auction.maxBidsPerUser)
            return { error: "MAX_BIDS_REACHED", status: 400 };
        }

        const bid = await tx.bid.create({
          data: {
            auctionId,
            bidderUserId: req.user!.userId,
            amount,
            currency: auction.currency,
          },
        });

        return { bid, auction };
      });

      if ("error" in outcome && outcome.error) {
        res.status(outcome.status).json({ error: outcome.error, minNext: (outcome as any).minNext });
        return;
      }

      const { bid, auction } = outcome as { bid: { id: string; amount: number }; auction: { weaverId: string; buyNowPrice: number | null } };
      notify(auction.weaverId, "auction.new_bid", { auctionId, amount });

      // Buy-now: bid at/above buyNowPrice ends the auction immediately
      if (auction.buyNowPrice != null && amount >= auction.buyNowPrice) {
        await endAuction(auctionId);
      }

      const fresh = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: AUCTION_INCLUDE,
      });
      res.status(201).json(serializeAuction(fresh, req.user!.userId));
    } catch (error) {
      console.error("Bid create error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Cancel auction (weaver, own; only UPCOMING/LIVE) ──
router.post(
  "/:id/cancel",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auction = await prisma.auction.findUnique({ where: { id: String(req.params.id) } });
      if (!auction) {
        res.status(404).json({ error: "Auction not found" });
        return;
      }
      if (auction.weaverId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (!ACTIVE_STATUSES.includes(auction.status as any)) {
        res.status(400).json({ error: "Only upcoming or live auctions can be cancelled" });
        return;
      }
      const updated = await prisma.auction.update({
        where: { id: auction.id },
        data: { status: "CANCELLED" },
        include: AUCTION_INCLUDE,
      });
      res.json(serializeAuction(updated, req.user!.userId));
    } catch (error) {
      console.error("Auction cancel error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
