import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const STATUS_FLOW = ["PLACED", "READY", "SHIPPED", "DELIVERED"] as const;
type OrderStatus = (typeof STATUS_FLOW)[number];

// ── Create Customer Order(s) from cart (Customer only) ──
router.post(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { items, shippingAddress, paymentMethod } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: "Cart items are required" });
        return;
      }

      for (const item of items) {
        const qty = Number(item?.quantity);
        if (!item?.productId || !Number.isInteger(qty) || qty <= 0) {
          res.status(400).json({ error: "Each item needs a productId and a positive quantity" });
          return;
        }
      }

      const requiredAddressFields = ["fullName", "phone", "address", "city", "pincode"];
      if (
        !shippingAddress ||
        requiredAddressFields.some((f) => !String(shippingAddress[f] || "").trim())
      ) {
        res.status(400).json({ error: "Complete shipping address is required" });
        return;
      }

      if (!paymentMethod || typeof paymentMethod !== "string") {
        res.status(400).json({ error: "Payment method is required" });
        return;
      }

      const productIds = items.map((i: any) => String(i.productId));
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(String(item.productId));
        if (!product) {
          res.status(404).json({ error: `Product not found: ${item.productId}` });
          return;
        }
        if (product.stock < Number(item.quantity)) {
          res.status(400).json({ error: `Insufficient stock for "${product.title}"` });
          return;
        }
      }

      // Group items by weaver (product owner) — one order per weaver
      const itemsByWeaver = new Map<string, { productId: string; quantity: number; price: number }[]>();
      for (const item of items) {
        const product = productMap.get(String(item.productId))!;
        const group = itemsByWeaver.get(product.userId) || [];
        group.push({
          productId: product.id,
          quantity: Number(item.quantity),
          price: product.price,
        });
        itemsByWeaver.set(product.userId, group);
      }

      const orders = await prisma.$transaction(async (tx) => {
        const created = [];

        for (const [weaverId, orderItems] of Array.from(itemsByWeaver.entries())) {
          // Decrement stock with a race guard
          for (const item of orderItems) {
            const result = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (result.count === 0) {
              throw new Error("STOCK_CONFLICT");
            }
          }

          const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const order = await tx.customerOrder.create({
            data: {
              customerId: req.user!.userId,
              weaverId,
              shippingAddress: {
                fullName: String(shippingAddress.fullName),
                phone: String(shippingAddress.phone),
                address: String(shippingAddress.address),
                city: String(shippingAddress.city),
                pincode: String(shippingAddress.pincode),
              },
              paymentMethod,
              totalAmount,
              items: {
                create: orderItems.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  priceAtPurchase: item.price,
                })),
              },
            },
            include: {
              items: { include: { product: { include: { images: true } } } },
            },
          });

          created.push(order);
        }

        return created;
      });

      res.status(201).json(orders);
    } catch (error) {
      if (error instanceof Error && error.message === "STOCK_CONFLICT") {
        res.status(400).json({ error: "One or more items just went out of stock" });
        return;
      }
      console.error("Customer order create error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── List Customer Orders (Customer sees own, Weaver sees incoming) ──
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { role, userId } = req.user!;

      let orders = [];

      if (role === "CUSTOMER") {
        orders = await prisma.customerOrder.findMany({
          where: { customerId: userId },
          include: {
            items: { include: { product: { include: { images: true } } } },
            weaver: { include: { weaverProfile: true } },
          },
          orderBy: { createdAt: "desc" },
        });
      } else if (role === "WEAVER") {
        orders = await prisma.customerOrder.findMany({
          where: { weaverId: userId },
          include: {
            items: { include: { product: { include: { images: true } } } },
            customer: { include: { customerProfile: true } },
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      res.json(orders);
    } catch (error) {
      console.error("Customer order list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Update Order Status (Weaver only, forward one step at a time) ──
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { status } = req.body as { status?: OrderStatus };

      const order = await prisma.customerOrder.findUnique({ where: { id } });

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      if (order.weaverId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
      const nextIndex = STATUS_FLOW.indexOf(status as OrderStatus);

      if (nextIndex === -1 || nextIndex !== currentIndex + 1) {
        res.status(400).json({ error: `Invalid transition ${order.status} → ${status}` });
        return;
      }

      const updatedOrder = await prisma.customerOrder.update({
        where: { id },
        data: { status: status as OrderStatus },
        include: {
          items: { include: { product: { include: { images: true } } } },
          customer: { include: { customerProfile: true } },
        },
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Customer order status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
