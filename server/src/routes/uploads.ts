import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import crypto from "crypto";
import { getSignedPutUrl } from "../services/s3";

const router = Router();

router.post("/voice/presign", authenticateToken, async (req, res) => {
  const { contentType } = req.body as { contentType: string };
  const key = `voice/${req.user.id}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.webm`;
  const url = await getSignedPutUrl(key, contentType, 60);
  res.json({ key, url });
});

router.post("/photos/presign", authenticateToken, async (req, res) => {
  const { contentType } = req.body as { contentType: string };
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const key = `photos/${req.user.id}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const url = await getSignedPutUrl(key, contentType, 90);
  res.json({ key, url });
});

export default router;

