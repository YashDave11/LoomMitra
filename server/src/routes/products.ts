import { Router, Request, Response } from "express";
import multer from "multer";
import prisma from "../prisma";
import cloudinary from "../lib/cloudinary";
import { requireAuth, requireRole } from "../middleware/auth";
import { runCatalogGeneration } from "../services/catalogGenerator";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const MAX_IMAGES_PER_PRODUCT = 5;

const VALID_TYPES = ["SAREE", "MUFFLER", "DUPATTA", "STOLE", "FABRIC", "OTHER"];
const VALID_STATUSES = ["DRAFT", "READY", "ARCHIVED"];
const VALID_STOCK_TYPES = ["ready_stock", "made_to_order"];

/** Code-valued optional strings — stored as codes, empty means "not set". */
const CODE_FIELDS = [
  "location",
  "designName",
  "material",
  "subcategory",
  "primaryColor",
  "secondaryColor",
  "targetAudience",
  "usageContext",
  "giTag",
  "certificationDetails",
  "careInstructions",
] as const;

const FLOAT_FIELDS = ["lengthMeters", "widthMeters", "weightGrams", "basePrice"] as const;
// Nullable in the schema — clearing them back to null is legitimate.
const INT_FIELDS = ["productionLeadTimeDays", "maxOrderCapacity"] as const;

function toFiniteNumber(raw: unknown, integer: boolean): number | null {
  const n = integer ? parseInt(String(raw), 10) : parseFloat(String(raw));
  return Number.isFinite(n) ? n : null;
}

/**
 * Build a Prisma data object from a weaver-submitted body, skipping any key the
 * client did not send. Shared by create and update so validation lives in one
 * place. Returns an error message string if a value is invalid.
 */
function buildProductData(body: Record<string, unknown>): { data: Record<string, unknown> } | { error: string } {
  const data: Record<string, unknown> = {};

  if (body.type !== undefined) {
    if (!VALID_TYPES.includes(String(body.type)))
      return { error: `type must be one of: ${VALID_TYPES.join(", ")}` };
    data.type = body.type;
  }
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(String(body.status)))
      return { error: `status must be one of: ${VALID_STATUSES.join(", ")}` };
    data.status = body.status;
  }
  if (body.stockType !== undefined) {
    if (!VALID_STOCK_TYPES.includes(String(body.stockType)))
      return { error: `stockType must be one of: ${VALID_STOCK_TYPES.join(", ")}` };
    data.stockType = body.stockType;
  }

  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.description !== undefined) data.description = body.description || null;
  if (body.currency !== undefined) data.currency = String(body.currency).trim() || "INR";
  if (body.isAvailable !== undefined) data.isAvailable = Boolean(body.isAvailable);
  if (body.isHandloom !== undefined) data.isHandloom = Boolean(body.isHandloom);

  if (body.price !== undefined) {
    const price = toFiniteNumber(body.price, false);
    if (price === null || price <= 0) return { error: "price must be a number above 0" };
    data.price = price;
  }
  if (body.stock !== undefined) {
    const stock = toFiniteNumber(body.stock, true);
    if (stock === null || stock < 0) return { error: "stock must be 0 or more" };
    data.stock = stock;
  }
  if (body.minOrderQuantity !== undefined) {
    const moq = toFiniteNumber(body.minOrderQuantity, true);
    data.minOrderQuantity = moq !== null && moq >= 1 ? moq : 1;
  }

  for (const key of CODE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key] || null;
  }
  for (const key of FLOAT_FIELDS) {
    if (body[key] !== undefined) data[key] = toFiniteNumber(body[key], false);
  }
  for (const key of INT_FIELDS) {
    if (body[key] !== undefined) data[key] = toFiniteNumber(body[key], true);
  }

  return { data };
}

// ── Create Product ──
router.post(
  "/",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, type, price } = req.body;

      if (!title || !type || price === undefined) {
        res.status(400).json({ error: "Required fields: title, type, price" });
        return;
      }

      const built = buildProductData(req.body);
      if ("error" in built) {
        res.status(400).json({ error: built.error });
        return;
      }

      const product = await prisma.product.create({
        data: {
          ...built.data,
          userId: req.user!.userId,
          status: "DRAFT",
        } as never,
        include: { images: true },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Product create error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── List Products (current weaver) ──
router.get(
  "/",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await prisma.product.findMany({
        where: { userId: req.user!.userId },
        include: { images: true },
        orderBy: { createdAt: "desc" },
      });
      res.json(products);
    } catch (error) {
      console.error("Product list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Get Single Product ──
router.get(
  "/:id",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (product.userId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error("Product get error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Update Product ──
router.put(
  "/:id",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (existing.userId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const built = buildProductData(req.body);
      if ("error" in built) {
        res.status(400).json({ error: built.error });
        return;
      }

      const product = await prisma.product.update({
        where: { id },
        data: built.data as never,
        include: { images: true },
      });

      res.json(product);
    } catch (error) {
      console.error("Product update error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Delete Product ──
router.delete(
  "/:id",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
      if (!existing) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (existing.userId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      // Delete images from Cloudinary
      for (const img of existing.images) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }

      // Cascade deletes MediaAsset rows (via onDelete: Cascade)
      await prisma.product.delete({ where: { id } });
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error("Product delete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Upload RAW Images ──
router.post(
  "/:id/raw-images",
  requireAuth,
  requireRole("WEAVER"),
  upload.array("images", MAX_IMAGES_PER_PRODUCT),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (product.userId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files provided" });
        return;
      }

      const currentCount = product.images.length;
      const remaining = MAX_IMAGES_PER_PRODUCT - currentCount;

      if (remaining <= 0) {
        res.status(400).json({
          error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed. Delete existing images first.`,
        });
        return;
      }

      if (files.length > remaining) {
        res.status(400).json({
          error: `Can only upload ${remaining} more image(s). Current: ${currentCount}/${MAX_IMAGES_PER_PRODUCT}.`,
        });
        return;
      }

      const uploaded: { url: string; publicId: string }[] = [];

      for (const file of files) {
        const result = await new Promise<{ secure_url: string; public_id: string }>(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: `loommitra/products/${product.id}`,
                resource_type: "image",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as { secure_url: string; public_id: string });
              }
            );
            stream.end(file.buffer);
          }
        );

        uploaded.push({ url: result.secure_url, publicId: result.public_id });
      }

      // Save all to database
      const assets = await prisma.$transaction(
        uploaded.map((u) =>
          prisma.mediaAsset.create({
            data: {
              productId: product.id,
              url: u.url,
              publicId: u.publicId,
              type: "RAW",
            },
          })
        )
      );

      // Auto-update product status to READY when it has enough images (>= 3)
      const newTotal = currentCount + assets.length;
      if (newTotal >= 3 && product.status === "DRAFT") {
        await prisma.product.update({
          where: { id: product.id },
          data: { status: "READY" },
        });
      }

      res.status(201).json(assets);
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Delete Single Image ──
router.delete(
  "/:id/images/:imageId",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const imageId = String(req.params.imageId);
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (product.userId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const asset = await prisma.mediaAsset.findUnique({ where: { id: imageId } });
      if (!asset || asset.productId !== product.id) {
        res.status(404).json({ error: "Image not found" });
        return;
      }

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(asset.publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }

      await prisma.mediaAsset.delete({ where: { id: asset.id } });

      // Check if dropping below 3 images should revert status
      const remainingCount = await prisma.mediaAsset.count({ where: { productId: product.id } });
      if (remainingCount < 3 && product.status === "READY") {
        await prisma.product.update({
          where: { id: product.id },
          data: { status: "DRAFT" },
        });
      }

      res.json({ message: "Image deleted" });
    } catch (error) {
      console.error("Image delete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Generate Catalog ──
router.post(
  "/:id/generate-catalog",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (product.userId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const rawImages = product.images.filter((img) => img.type === "RAW");
      if (rawImages.length === 0) {
        res.status(400).json({
          error: "Upload at least 1 raw product image before generating a catalog.",
        });
        return;
      }

      res.json({ catalogStatus: "PROCESSING" });

      setImmediate(() => {
        runCatalogGeneration(id).catch((err) => {
          console.error("Catalog generation error:", err);
        });
      });
    } catch (error) {
      console.error("Generate catalog error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── Catalog Status ──
router.get(
  "/:id/catalog-status",
  requireAuth,
  requireRole("WEAVER"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          userId: true,
          catalogStatus: true,
          catalogPlan: true,
        },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (product.userId !== req.user!.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      res.json({
        catalogStatus: product.catalogStatus,
        catalogPlan: product.catalogPlan,
      });
    } catch (error) {
      console.error("Catalog status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
