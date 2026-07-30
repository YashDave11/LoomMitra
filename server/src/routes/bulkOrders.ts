import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// ── Create Bulk Order Request (Business only) ──
router.post(
  "/",
  requireAuth,
  requireRole("BUSINESS"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, quantity } = req.body;

      if (!productId || !quantity || quantity <= 0) {
        res.status(400).json({ error: "Invalid product ID or quantity" });
        return;
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: String(productId) },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const bulkOrder = await prisma.bulkOrderRequest.create({
        data: {
          productId: product.id,
          businessId: req.user!.userId,
          weaverId: product.userId,
          quantity: parseInt(String(quantity), 10),
          status: "PENDING",
        },
      });

      res.status(201).json(bulkOrder);
    } catch (error) {
      console.error("Bulk order create error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── List Bulk Orders (for both Business and Weaver) ──
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { role, userId } = req.user!;

      let orders = [];

      if (role === "BUSINESS") {
        orders = await prisma.bulkOrderRequest.findMany({
          where: { businessId: userId },
          include: {
            product: {
              include: { images: true }
            },
            weaver: {
              include: { weaverProfile: true }
            }
          },
          orderBy: { createdAt: "desc" },
        });
      } else if (role === "WEAVER") {
        orders = await prisma.bulkOrderRequest.findMany({
          where: { weaverId: userId },
          include: {
            product: {
              include: { images: true }
            },
            business: {
              include: { businessProfile: true }
            }
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      res.json(orders);
    } catch (error) {
      console.error("Bulk order list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Respond to Bulk Order (Phase 1: Weaver responds with quote) ──
router.post(
  "/:id/respond",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { action, quotedPrice } = req.body; // action: "ACCEPT" or "REJECT"

      const order = await prisma.bulkOrderRequest.findUnique({
        where: { id },
      });

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      if (order.weaverId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      if (order.status !== "PENDING") {
        res.status(400).json({ error: "Can only respond to PENDING orders" });
        return;
      }

      let updatedOrder;

      if (action === "REJECT") {
        updatedOrder = await prisma.bulkOrderRequest.update({
          where: { id },
          data: { status: "REJECTED" },
        });
      } else if (action === "ACCEPT") {
        if (!quotedPrice || quotedPrice <= 0) {
          res.status(400).json({ error: "Valid quoted price is required to accept" });
          return;
        }
        updatedOrder = await prisma.bulkOrderRequest.update({
          where: { id },
          data: {
            status: "WEAVER_RESPONDED",
            quotedPrice: parseFloat(String(quotedPrice)),
          },
        });
      } else {
        res.status(400).json({ error: "Invalid action" });
        return;
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Bulk order respond error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Negotiate Bulk Order (Phase 2) ──
router.post(
  "/:id/negotiate",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { action, bargainPrice } = req.body;
      const userRole = req.user!.role;

      const order = await prisma.bulkOrderRequest.findUnique({
        where: { id },
      });

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      let updatedOrder;

      // Business Actions
      if (userRole === "BUSINESS") {
        if (order.businessId !== req.user!.userId) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        if (order.status !== "WEAVER_RESPONDED") {
          res.status(400).json({ error: "Can only negotiate when weaver has responded" });
          return;
        }

        if (action === "ACCEPT_QUOTE") {
          updatedOrder = await prisma.bulkOrderRequest.update({
            where: { id },
            data: { status: "ACCEPTED", finalPrice: order.quotedPrice },
          });
        } else if (action === "BARGAIN") {
          if (!bargainPrice || bargainPrice <= 0) {
            res.status(400).json({ error: "Valid bargain price required" });
            return;
          }
          updatedOrder = await prisma.bulkOrderRequest.update({
            where: { id },
            data: { status: "BARGAINING", bargainPrice: parseFloat(String(bargainPrice)) },
          });
        } else if (action === "REJECT") {
          updatedOrder = await prisma.bulkOrderRequest.update({
            where: { id },
            data: { status: "REJECTED" },
          });
        } else {
          res.status(400).json({ error: "Invalid action for BUSINESS" });
          return;
        }
      }
      
      // Weaver Actions
      else if (userRole === "WEAVER") {
        if (order.weaverId !== req.user!.userId) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        if (order.status !== "BARGAINING") {
          res.status(400).json({ error: "Can only respond to bargains in BARGAINING status" });
          return;
        }

        if (action === "ACCEPT_BARGAIN") {
          updatedOrder = await prisma.bulkOrderRequest.update({
            where: { id },
            data: { status: "ACCEPTED", finalPrice: order.bargainPrice },
          });
        } else if (action === "REJECT_BARGAIN") {
          updatedOrder = await prisma.bulkOrderRequest.update({
            where: { id },
            data: { status: "REJECTED" },
          });
        } else {
          res.status(400).json({ error: "Invalid action for WEAVER" });
          return;
        }
      } 
      
      else {
        res.status(403).json({ error: "Invalid role for negotiation" });
        return;
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Bulk order negotiate error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
