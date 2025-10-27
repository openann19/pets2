import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import sharp from "sharp";
import logger from "../utils/logger";

const router = Router();
const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const rk = new RekognitionClient({ region: process.env.AWS_REGION || "us-east-1" });
const BUCKET = process.env.S3_BUCKET || "";

// breed extraction from Rekognition labels
const BREED_WORDS = [
  "Labrador", "Golden Retriever", "German Shepherd", "Bulldog", "Poodle", "Beagle",
  "Rottweiler", "Dachshund", "Siberian Husky", "Doberman", "Chihuahua", "Persian Cat",
  "Maine Coon", "Siamese Cat", "Bengal"
];

interface LabelWithConfidence {
  Name?: string;
  Confidence?: number;
}

interface BreedCandidate {
  name: string;
  confidence: number;
}

interface ImageScore {
  dims: { width?: number; height?: number };
  exposure: number;
  contrast: number;
  sharpness: number;
}

function guessBreeds(labels: LabelWithConfidence[]): BreedCandidate[] {
  const hits = labels
    .filter(l => l.Name)
    .flatMap(l => BREED_WORDS.filter(b => l.Name!.toLowerCase().includes(b.toLowerCase()))
      .map(name => ({ name, confidence: l.Confidence ?? 50 })));
  // dedupe by highest confidence
  const map = new Map<string, number>();
  for (const h of hits) map.set(h.name, Math.max(map.get(h.name) ?? 0, h.confidence));
  return [...map.entries()].sort((a,b)=>b[1]-a[1]).map(([name, confidence])=>({name, confidence}));
}

async function bufferFromS3(key: string): Promise<Buffer> {
  const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const chunks: Uint8Array[] = [];
  for await (const chunk of out.Body as any) chunks.push(chunk as Uint8Array);
  return Buffer.concat(chunks);
}

async function scoreImage(buf: Buffer): Promise<ImageScore> {
  const img = sharp(buf).ensureAlpha();
  const { width, height } = await img.metadata();
  const stats = await img.stats();

  // brightness: mean of channels (0-255) -> 0..1
  const mean = (stats.channels?.slice(0,3).reduce((a,c)=>a+c.mean,0) ?? 380) / (3*255);
  // contrast proxy: stdev
  const stdev = (stats.channels?.slice(0,3).reduce((a,c)=>a+c.stdev,0) ?? 50) / (3*128);
  // sharpness: Laplacian variance proxy via convolution
  const lap = await img
    .convolve({ width:3, height:3, kernel:[0,1,0,1,-4,1,0,1,0] })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const lpix = new Uint8Array(lap.data);
  let sum = 0, sum2 = 0;
  for (let i = 0; i < lpix.length; i++) { const v = lpix[i]; sum += v; sum2 += v*v; }
  const n = lpix.length || 1;
  const variance = sum2/n - (sum/n)*(sum/n);
  const sharpness = Math.max(0, Math.min(1, variance / 5000)); // normalize

  return {
    dims: { width, height },
    exposure: Number(mean.toFixed(3)),
    contrast: Number(stdev.toFixed(3)),
    sharpness: Number(sharpness.toFixed(3)),
  };
}

interface RekognitionLabel {
  name: string | undefined;
  confidence: number | undefined;
}

/**
 * POST /api/ai/analyze-photo
 * body: { s3Key: string }
 */
router.post("/analyze-photo", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { s3Key } = req.body as { s3Key: string };
    if (!s3Key) {
      res.status(400).json({ error: "s3Key required" });
      return;
    }

    const buf = await bufferFromS3(s3Key);

    const rkResp = await rk.send(new DetectLabelsCommand({
      Image: { Bytes: buf },
      MaxLabels: 25,
      MinConfidence: 70
    }));

    const labels: RekognitionLabel[] = (rkResp.Labels ?? []).map(l => ({ name: l.Name, confidence: l.Confidence }));
    const breeds = guessBreeds(rkResp.Labels ?? []);
    const animals = labels.filter(l => /dog|cat|animal/i.test(l.name ?? ""));
    const isPet = animals.length > 0;

    const score = await scoreImage(buf);

    // overall score (0..100)
    const overall =
      (isPet ? 20 : 0) +
      (score.sharpness * 35) +
      ((1 - Math.abs(score.exposure - 0.55)) * 25) + // target mid exposure
      (score.contrast * 20);

    const suggestions: string[] = [];
    if (score.sharpness < 0.4) suggestions.push("Photo appears soft; try better focus or more light.");
    if (score.exposure < 0.35) suggestions.push("Looks underexposed; increase brightness or shoot in daylight.");
    if (score.exposure > 0.75) suggestions.push("Highlights may be clipped; reduce exposure.");
    if (!isPet) suggestions.push("No clear pet detected; try a closer framing.");

    res.json({
      data: {
        labels,
        breedCandidates: breeds.slice(0, 5),
        quality: score,
        overall: Math.round(Math.max(0, Math.min(100, overall))),
        isPet,
        suggestions
      }
    });
  } catch (error: unknown) {
    logger.error("Photo analysis error", { error: error.message });
    res.status(500).json({ error: "Failed to analyze photo" });
  }
});

export default router;

