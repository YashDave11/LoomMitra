import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/profile", requireAuth, requireRole("WEAVER"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, cluster, aadhaarNumber, handloomId } = req.body;

    if (!name || !cluster || !aadhaarNumber || !handloomId) {
      res.status(400).json({ error: "All fields are required: name, cluster, aadhaarNumber, handloomId" });
      return;
    }

    const profile = await prisma.weaverProfile.upsert({
      where: { userId: req.user!.userId },
      update: { name, cluster, aadhaarNumber, handloomId },
      create: { userId: req.user!.userId, name, cluster, aadhaarNumber, handloomId },
    });

    res.json(profile);
  } catch (error) {
    console.error("Weaver profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile/me", requireAuth, requireRole("WEAVER"), async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await prisma.weaverProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    res.json(profile);
  } catch (error) {
    console.error("Weaver profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
