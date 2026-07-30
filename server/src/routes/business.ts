import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/profile", requireAuth, requireRole("BUSINESS"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessName, contactEmail, contactPhone, gstNumber } = req.body;

    if (!businessName || !contactEmail || !contactPhone) {
      res.status(400).json({ error: "businessName, contactEmail, and contactPhone are required" });
      return;
    }

    const profile = await prisma.businessProfile.upsert({
      where: { userId: req.user!.userId },
      update: { businessName, contactEmail, contactPhone, gstNumber: gstNumber || null },
      create: { userId: req.user!.userId, businessName, contactEmail, contactPhone, gstNumber: gstNumber || null },
    });

    res.json(profile);
  } catch (error) {
    console.error("Business profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile/me", requireAuth, requireRole("BUSINESS"), async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    res.json(profile);
  } catch (error) {
    console.error("Business profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
