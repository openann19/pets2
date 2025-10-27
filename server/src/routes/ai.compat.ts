import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import Pet from "../models/Pet";
import logger from "../utils/logger";

const router = Router();

/** simple matrices / weights */
const ENERGY = ["low","medium","high"] as const;
const SIZE = ["xs","s","m","l","xl"] as const;

type EnergyLevel = typeof ENERGY[number];
type SizeLevel = typeof SIZE[number];

function diffIndex<T extends readonly string[]>(arr: T, a?: string, b?: string): number {
  const i = arr.indexOf((a as any) ?? "");
  const j = arr.indexOf((b as any) ?? "");
  if (i < 0 || j < 0) return 1;
  return Math.abs(i - j);
}

interface CompatibilityBreakdown {
  energy: number;
  size: number;
  age: number;
  activity: number;
  temperament: number;
}

interface CompatibilityScore {
  score: number;
  breakdown: CompatibilityBreakdown;
}

function score(pA: any, pB: any): CompatibilityScore {
  // 0..1 per dimension
  const energy = 1 - Math.min(1, diffIndex(ENERGY, pA.energyLevel, pB.energyLevel) / 2);
  const size = 1 - Math.min(1, diffIndex(SIZE, pA.size, pB.size) / 4);
  const age = 1 - Math.min(1, Math.abs((pA.age ?? 0) - (pB.age ?? 0)) / 10);
  const activityOverlap = (() => {
    const a = new Set(pA.activities || []);
    const b = new Set(pB.activities || []);
    let inter = 0;
    for (const v of a) if (b.has(v)) inter++;
    const denom = Math.max(1, new Set([...(pA.activities||[]), ...(pB.activities||[])]).size);
    return inter / denom;
  })();
  const temperament = (() => {
    const a = new Set(pA.temperament || []); // e.g., ["playful","gentle","dominant","shy"]
    const b = new Set(pB.temperament || []);
    let bad = 0;
    if (a.has("dominant") && b.has("dominant")) bad += 0.4;
    if (a.has("shy") && b.has("high_energy")) bad += 0.2;
    const base = 1 - bad;
    // boost for overlap
    let overlap = 0;
    for (const t of a) if (b.has(t)) overlap += 0.1;
    return Math.max(0, Math.min(1, base + Math.min(0.3, overlap)));
  })();

  const breakdown: CompatibilityBreakdown = { energy, size, age, activity: activityOverlap, temperament };
  const score = Math.round(
    (energy*0.25 + size*0.15 + age*0.1 + activityOverlap*0.3 + temperament*0.2) * 100
  );
  return { score, breakdown };
}

/**
 * POST /api/ai/compatibility
 * body: { petAId, petBId }
 */
router.post("/compatibility", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { petAId, petBId } = req.body as { petAId: string; petBId: string };
    const [a,b] = await Promise.all([Pet.findById(petAId), Pet.findById(petBId)]);
    if (!a || !b) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }

    const { score: value, breakdown } = score(a, b);
    res.json({ data: { value, breakdown, compatible: value >= 65 } });
  } catch (error: any) {
    logger.error("Compatibility scoring error", { error: error.message });
    res.status(500).json({ error: "Failed to calculate compatibility" });
  }
});

export default router;

