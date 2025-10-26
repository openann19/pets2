import sharp from "sharp";
import { getSSIM } from "ssim.js";
import fs from "fs";
import path from "path";

/** Example "editor" – mirror your mobile adjustments for determinism */
async function applyAdjustments(buf: Buffer): Promise<Buffer> {
  // brightness/contrast/saturation approximations via linear / modulate
  const base = sharp(buf).rotate();
  const mod = base.modulate({ brightness: 1.05, saturation: 1.15, hue: 0 });
  // clarity (local contrast) ≈ unsharp mask with low sigma
  const usm = await mod.sharpen(0.5, 1, 2).toBuffer();
  return sharp(usm).jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer();
}

function img(p: string): string {
  return path.resolve(__dirname, "golden", p);
}

async function readPNGBuffer(jpegBuf: Buffer) {
  // ssim.js prefers RGBA PNGs of same size
  const png = await sharp(jpegBuf).png({ compressionLevel: 0 }).toBuffer();
  const meta = await sharp(png).metadata();
  return { png, width: meta.width!, height: meta.height! };
}

async function ssimScore(aBuf: Buffer, bBuf: Buffer): Promise<number> {
  const [A, B] = await Promise.all([readPNGBuffer(aBuf), readPNGBuffer(bBuf)]);
  if (A.width !== B.width || A.height !== B.height) {
    // fit B to A
    const bResized = await sharp(B.png).resize(A.width, A.height).png().toBuffer();
    const bMeta = await sharp(bResized).metadata();
    B.png = bResized;
    B.width = bMeta.width!;
    B.height = bMeta.height!;
  }
  const { mssim } = getSSIM(
    { data: new Uint8Array(A.png), width: A.width, height: A.height },
    { data: new Uint8Array(B.png), width: B.width, height: B.height }
  );
  return mssim; // 0..1
}

const cases = [
  ["dog-1.jpg", "dog-1.edited.jpg"],
  ["cat-1.jpg", "cat-1.edited.jpg"],
  ["dog-2.jpg", "dog-2.edited.jpg"],
  ["cat-2.jpg", "cat-2.edited.jpg"],
];

describe("Editor golden outputs (SSIM ≥ 0.98)", () => {
  for (const [input, expected] of cases) {
    it(`${input} matches golden`, async () => {
      const inputPath = img(`input/${input}`);
      const expectedPath = img(`expected/${expected}`);
      
      // Skip test if files don't exist (they need to be added manually)
      if (!fs.existsSync(inputPath) || !fs.existsSync(expectedPath)) {
        console.warn(`Skipping test: ${input} - files not found`);
        return;
      }
      
      const src = fs.readFileSync(inputPath);
      const out = await applyAdjustments(src); // CURRENT pipeline
      const golden = fs.readFileSync(expectedPath); // LOCKED
      const score = await ssimScore(out, golden);
      
      expect(score).toBeGreaterThanOrEqual(0.98);
    }, 20000);
  }
});

