import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { createMultipart, getPartUrl, completeMultipart, generateKey, extFromMime, getObjectBuffer } from "../services/s3Service";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const r = Router();

const s3 = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
const BUCKET = process.env.S3_BUCKET || "pawfectmatch-media";

/** POST /api/upload/multipart/create */
r.post("/multipart/create", authenticateToken, async (req, res, next) => {
  try {
    const { contentType } = req.body as { contentType: string };
    const key = generateKey((req as any).userId, extFromMime(contentType));
    const { uploadId } = await createMultipart(key, contentType);
    res.json({ key, uploadId });
  } catch (e) { next(e); }
});

/** GET /api/upload/multipart/part-url?key=&uploadId=&partNumber= */
r.get("/multipart/part-url", authenticateToken, async (req, res, next) => {
  try {
    const { key, uploadId, partNumber } = req.query as any;
    const url = await getPartUrl(key, uploadId, Number(partNumber));
    res.json({ url });
  } catch (e) { next(e); }
});

/** POST /api/upload/multipart/complete { key, uploadId, parts:[{ETag,PartNumber}] } */
r.post("/multipart/complete", authenticateToken, async (req, res, next) => {
  try {
    const { key, uploadId, parts } = req.body as { 
      key: string; 
      uploadId: string; 
      parts: { ETag: string; PartNumber: number; }[] 
    };
    const url = await completeMultipart(key, uploadId, parts);

    // Synchronous thumbnail + webp
    const buf = await getObjectBuffer(key);
    const base = sharp(buf).rotate();
    const thumbJpg = await base.resize(512).jpeg({ quality: 82, chromaSubsampling: "4:4:4" }).toBuffer();
    const thumbWebp = await base.resize(512).webp({ quality: 80 }).toBuffer();

    const jpgKey = key.replace("/uploads/", "/thumbnails/").replace(/\.[^.]+$/, ".jpg");
    const webpKey = key.replace("/uploads/", "/thumbnails/").replace(/\.[^.]+$/, ".webp");

    await s3.send(new PutObjectCommand({ 
      Bucket: BUCKET, 
      Key: jpgKey, 
      Body: thumbJpg, 
      ContentType: "image/jpeg", 
      ACL: "public-read" 
    }));
    await s3.send(new PutObjectCommand({ 
      Bucket: BUCKET, 
      Key: webpKey, 
      Body: thumbWebp, 
      ContentType: "image/webp", 
      ACL: "public-read" 
    }));

    res.json({
      url,
      key,
      thumbnails: {
        jpg: `${process.env.S3_PUBLIC_BASE}/${jpgKey}`,
        webp: `${process.env.S3_PUBLIC_BASE}/${webpKey}`,
      },
    });
  } catch (e) { next(e); }
});

// Legacy presign endpoint for backward compatibility
r.post("/presign", authenticateToken, async (req, res) => {
  const { contentType } = req.body;
  // Mock implementation - in production, generate real S3 presigned URL
  const key = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const url = `https://mock-s3-url.s3.amazonaws.com/${key}`;
  const publicUrl = `https://mock-s3-url.s3.amazonaws.com/${key}`;
  res.json({ url, key, publicUrl });
});

export default r;

