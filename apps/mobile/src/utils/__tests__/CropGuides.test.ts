import {
  ruleOfThirds,
  goldenRatio,
  diagonalGuide,
  centerGuide,
  eyeLineGuide,
  contentAwareBorder,
  safeTextZones,
  compositionScore,
} from "../CropGuides";

describe("CropGuides", () => {
  describe("ruleOfThirds", () => {
    it("should generate correct grid lines", () => {
      const guide = ruleOfThirds(1080, 1920);

      expect(guide.type).toBe("thirds");
      expect(guide.lines).toHaveLength(4);
      expect(guide.lines[0]).toEqual({ x: 360, style: "vertical" });
      expect(guide.lines[1]).toEqual({ x: 720, style: "vertical" });
      expect(guide.lines[2]).toEqual({ y: 640, style: "horizontal" });
      expect(guide.lines[3]).toEqual({ y: 1280, style: "horizontal" });
    });

    it("should work with different aspect ratios", () => {
      const guide = ruleOfThirds(1000, 1000);

      expect(guide.lines[0].x).toBeCloseTo(333.33, 1); // Allow 0.1 difference
      expect(guide.lines[1].x).toBeCloseTo(666.67, 1); // Allow 0.1 difference
      expect(guide.lines[2].y).toBeCloseTo(333.33);
      expect(guide.lines[3].y).toBeCloseTo(666.66);
    });
  });

  describe("goldenRatio", () => {
    it("should generate correct golden ratio lines", () => {
      const guide = goldenRatio(1080, 1920);

      expect(guide.type).toBe("golden");
      expect(guide.lines).toHaveLength(4);
      
      const goldenW = 1080 * 0.618;
      expect(guide.lines[0].x).toBeCloseTo(goldenW);
      expect(guide.lines[1].x).toBeCloseTo(1080 - goldenW);
      expect(guide.lines[2].y).toBeCloseTo(1920 * 0.618);
      expect(guide.lines[3].y).toBeCloseTo(1920 * (1 - 0.618));
    });
  });

  describe("diagonalGuide", () => {
    it("should generate diagonal lines", () => {
      const guide = diagonalGuide(1080, 1920);

      expect(guide.type).toBe("diagonal");
      expect(guide.lines).toHaveLength(2);
      expect(guide.lines.every(line => line.style === "diagonal")).toBe(true);
    });
  });

  describe("centerGuide", () => {
    it("should generate center crosshair", () => {
      const guide = centerGuide(1080, 1920);

      expect(guide.type).toBe("center");
      expect(guide.lines).toHaveLength(2);
      expect(guide.lines[0]).toEqual({ x: 540, style: "vertical" });
      expect(guide.lines[1]).toEqual({ y: 960, style: "horizontal" });
    });
  });

  describe("eyeLineGuide", () => {
    it("should generate eye-level lines for portraits", () => {
      const guide = eyeLineGuide(1080, 1920);

      expect(guide.type).toBe("eye-line");
      expect(guide.lines).toHaveLength(3);
      
      // Eye level at 40% (768px)
      expect(guide.lines[0].y).toBe(768);
      // Top bound at 10% (192px)
      expect(guide.lines[1].y).toBe(192);
      // Bottom bound at 70% (1344px)
      expect(guide.lines[2].y).toBe(1344);
    });
  });

  describe("contentAwareBorder", () => {
    it("should expand crop to protect edges", () => {
      const focus = { x: 100, y: 100, width: 400, height: 300 };
      const imgW = 1080;
      const imgH = 1920;
      const targetRatio = 4 / 5;
      const protection = 0.15;

      const result = contentAwareBorder(focus, imgW, imgH, targetRatio, protection);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.width).toBeGreaterThanOrEqual(400);
      expect(result.height).toBeGreaterThanOrEqual(300);
    });

    it("should respect image boundaries", () => {
      const focus = { x: 5, y: 5, width: 50, height: 50 };
      const imgW = 100;
      const imgH = 100;

      const result = contentAwareBorder(focus, imgW, imgH, 1, 0.15);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(imgW);
      expect(result.y + result.height).toBeLessThanOrEqual(imgH);
    });

    it("should maintain target aspect ratio", () => {
      const focus = { x: 100, y: 100, width: 400, height: 300 };
      const targetRatio = 1; // Square

      const result = contentAwareBorder(focus, 1080, 1920, targetRatio, 0.15);

      const resultRatio = result.width / result.height;
      expect(resultRatio).toBeCloseTo(1, 1);
    });
  });

  describe("safeTextZones", () => {
    it("should generate zones for Instagram", () => {
      const zones = safeTextZones(1080, 1920, "instagram");

      expect(zones).toHaveLength(2);
      
      // Top 15% zone
      expect(zones[0]).toMatchObject({
        x: 0,
        y: 0,
        width: 1080,
        height: 288, // 15% of 1920
      });

      // Bottom 20% zone
      expect(zones[1]).toMatchObject({
        x: 0,
        y: 1536, // 80% of 1920
        width: 1080,
        height: 384, // 20% of 1920
      });
    });

    it("should generate zones for TikTok", () => {
      const zones = safeTextZones(1080, 1920, "tiktok");

      expect(zones).toHaveLength(2);
      expect(zones[0].height).toBe(192); // 10% of 1920
      expect(zones[1].height).toBe(288); // 15% of 1920
    });

    it("should generate zones for YouTube", () => {
      const zones = safeTextZones(1920, 1080, "youtube");

      expect(zones).toHaveLength(2);
      expect(zones[0].height).toBeCloseTo(86.4, 1); // 8% of 1080 ≈ 86.4
      expect(zones[1].height).toBe(130); // 12% of 1080
    });
  });

  describe("compositionScore", () => {
    it("should give high score for rule of thirds position", () => {
      const focus = { x: 300, y: 600, width: 400, height: 500 };
      const crop = { x: 100, y: 200, width: 800, height: 1000 };
      const score = compositionScore(focus, crop, 1080, 1920);

      // Should have decent score for near-third positioning
      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should give high score for center positioning", () => {
      const focus = { x: 340, y: 610, width: 400, height: 500 };
      const crop = { x: 100, y: 200, width: 800, height: 1000 };
      const score = compositionScore(focus, crop, 1080, 1920);

      // Center should get bonus points
      expect(score).toBeGreaterThan(50);
    });

    it("should give bonus for aspect ratio match", () => {
      const focus = { x: 100, y: 100, width: 400, height: 500 };
      const crop = { x: 50, y: 50, width: 450, height: 550 };
      const score = compositionScore(focus, crop, 1080, 1920);

      // Should include aspect ratio match bonus
      expect(score).toBeGreaterThan(0);
    });

    it("should return 0-100 range", () => {
      const focus = { x: 0, y: 0, width: 100, height: 100 };
      const crop = { x: 0, y: 0, width: 1080, height: 1920 };
      const score = compositionScore(focus, crop, 1080, 1920);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

