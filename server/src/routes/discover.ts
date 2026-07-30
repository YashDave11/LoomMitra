import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// ── Get Discover Filters ──
router.get(
  "/filters",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Find all unique values for location, designName, material, and type where product status is READY
      const products = await prisma.product.findMany({
        where: { status: "READY" },
        select: {
          location: true,
          designName: true,
          material: true,
          type: true,
        },
      });

      const locations = Array.from(new Set(products.map((p) => p.location).filter(Boolean))) as string[];
      const designNames = Array.from(new Set(products.map((p) => p.designName).filter(Boolean))) as string[];
      const materials = Array.from(new Set(products.map((p) => p.material).filter(Boolean))) as string[];
      const types = Array.from(new Set(products.map((p) => p.type).filter(Boolean))) as string[];

      res.json({
        locations,
        designNames,
        materials,
        types,
      });
    } catch (error) {
      console.error("Discover filters error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── List Discover Products ──
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, location, type, designName, material } = req.query;

      const whereClause: Prisma.ProductWhereInput = {
        status: "READY",
      };

      if (search) {
        const searchStr = String(search);
        whereClause.OR = [
          { title: { contains: searchStr, mode: "insensitive" } },
          { description: { contains: searchStr, mode: "insensitive" } },
        ];
      }

      if (location) {
        whereClause.location = String(location);
      }
      if (type) {
        whereClause.type = String(type) as any;
      }
      if (designName) {
        whereClause.designName = String(designName);
      }
      if (material) {
        whereClause.material = String(material);
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          images: true,
          user: {
            include: {
              weaverProfile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(products);
    } catch (error) {
      console.error("Discover list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Get Single Discover Product ──
// Public: powers the QR verification page, scanners are not logged in.
router.get(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          user: {
            include: {
              weaverProfile: true,
            },
          },
        },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      
      // Normally we might check if status === "READY" but allowing direct access
      // is okay for now if someone has the ID.
      
      res.json(product);
    } catch (error) {
      console.error("Discover single product error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
