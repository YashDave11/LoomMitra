import prisma from "../prisma";
import cloudinary from "../lib/cloudinary";
import { planCatalog, SHOT_KIND_TO_MEDIA_TYPE, ShotKind } from "./catalogPlanner";

const DEMO_CATALOG_IMAGES: Record<ShotKind, string> = {
  MODEL_FRONT: "/CatalogOutput/modelsarree.png",
  MODEL_SIDE: "/CatalogOutput/ModelSidewise.png",
  HANGER_DISPLAY: "/CatalogOutput/sarree_onhanger.png",
  CLOSEUP_TEXTURE: "/CatalogOutput/fabricOrineted.png",
  CLOSEUP_BORDER: "/CatalogOutput/FullView.png",
};

export async function runCatalogGeneration(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
    },
  });

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  const plan = planCatalog(product.type);

  await prisma.product.update({
    where: { id: productId },
    data: {
      catalogStatus: "PROCESSING",
      catalogPlan: plan as any,
    },
  });

  // Delete any existing catalog media assets from previous runs
  const existingCatalogAssets = product.images.filter((img) => img.type.startsWith("CATALOG_"));
  for (const asset of existingCatalogAssets) {
    if (asset.publicId.startsWith("cloudinary_")) {
      try {
        await cloudinary.uploader.destroy(asset.publicId);
      } catch (err) {
        console.error("Failed to delete old catalog image from Cloudinary:", err);
      }
    }
    await prisma.mediaAsset.delete({ where: { id: asset.id } });
  }

  let successCount = 0;

  for (let i = 0; i < plan.length; i++) {
    const shot = plan[i];
    const imageUrl = DEMO_CATALOG_IMAGES[shot.kind] || "/CatalogOutput/modelsarree.png";

    try {
      const mediaType = SHOT_KIND_TO_MEDIA_TYPE[shot.kind];
      await prisma.mediaAsset.create({
        data: {
          productId,
          url: imageUrl,
          publicId: `demo_catalog_${productId}_${shot.kind}_${Date.now()}`,
          type: mediaType,
        },
      });

      plan[i] = { ...shot, status: "SUCCESS", imageUrl };
      successCount++;
    } catch (err) {
      console.error(`Demo catalog shot ${shot.kind} failed for product ${productId}:`, err);
      plan[i] = { ...shot, status: "FAILED" };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { catalogPlan: plan as any },
    });

    // Small delay between shots for smooth progress animation in UI
    if (i < plan.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const finalStatus = successCount >= 3 ? "DONE" : "FAILED";

  await prisma.product.update({
    where: { id: productId },
    data: {
      catalogStatus: finalStatus,
      catalogPlan: plan as any,
    },
  });
}
