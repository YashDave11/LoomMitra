import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/profile", requireAuth, requireRole("CUSTOMER"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, city } = req.body;

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const profile = await prisma.customerProfile.upsert({
      where: { userId: req.user!.userId },
      update: { name, city: city || null },
      create: { userId: req.user!.userId, name, city: city || null },
    });

    res.json(profile);
  } catch (error) {
    console.error("Customer profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile/me", requireAuth, requireRole("CUSTOMER"), async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    res.json(profile);
  } catch (error) {
    console.error("Customer profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
