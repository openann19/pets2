import { AutoCropEngine } from "../AutoCropEngine";
import * as ImageManipulator from "expo-image-manipulator";
import { Image as RNImage } from "react-native";

// Mock dependencies
jest.mock("react-native", () => ({
  Image: {
    getSize: jest.fn(),
  },
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
  },
}));

jest.mock("expo-face-detector", () => ({
  FaceDetector: {
    processImageAsync: jest.fn(),
    mode: {
      fast: "fast",
      accurate: "accurate",
    },
    landmarks: {
      all: "all",
      none: "none",
    },
    classifications: {
      all: "all",
      none: "none",
    },
  },
}), { virtual: true });

describe("AutoCropEngine", () => {
  const mockImageUri = "file://test-image.jpg";

  beforeEach(() => {
    jest.clearAllMocks();
    (RNImage.getSize as jest.Mock).mockImplementation((uri, callback) => {
      callback(1024, 768); // 1024x768 image
    });
  });

  describe("detect", () => {
    it("should return fallback crop when no faces detected", async () => {
      const result = await AutoCropEngine.detect(mockImageUri);

      expect(result).toBeTruthy();
      expect(result?.method).toBe("fallback");
      expect(result?.size).toEqual({ w: 1024, h: 768 });
      expect(result?.focus).toHaveProperty("x");
      expect(result?.focus).toHaveProperty("y");
      expect(result?.focus).toHaveProperty("width");
      expect(result?.focus).toHaveProperty("height");
    });

    it("should return face detection result when faces are found", async () => {
      // Mock face detector
      const mockFaceDetector = require("expo-face-detector");
      mockFaceDetector.FaceDetector.processImageAsync.mockResolvedValue([
        {
          bounds: {
            origin: { x: 200, y: 150 },
            size: { width: 300, height: 300 },
          },
          LEFT_EYE: { x: 220, y: 200 },
          RIGHT_EYE: { x: 380, y: 200 },
        },
      ]);

      const result = await AutoCropEngine.detect(mockImageUri, { eyeWeight: 0.6, padPct: 0.18 });

      expect(result).toBeTruthy();
      expect(result?.method).toBe("eyes");
      expect(result?.size).toEqual({ w: 1024, h: 768 });
    });

    it("should handle edge cases when image dimensions are zero", async () => {
      (RNImage.getSize as jest.Mock).mockImplementation((uri, callback) => {
        callback(0, 0);
      });

      const result = await AutoCropEngine.detect(mockImageUri);
      expect(result).toBeNull();
    });

    it("should accept custom eye weight and padding options", async () => {
      const result = await AutoCropEngine.detect(mockImageUri, {
        eyeWeight: 0.7,
        padPct: 0.2,
      });

      expect(result).toBeTruthy();
      // Fallback still works with custom options
      expect(result?.method).toBe("fallback");
    });
  });

  describe("suggestCrops", () => {
    it("should generate suggestions for multiple ratios", async () => {
      const ratios = ["1:1", "4:5", "9:16"];
      const suggestions = await AutoCropEngine.suggestCrops(mockImageUri, ratios);

      expect(suggestions).toHaveLength(3);
      suggestions.forEach((s, i) => {
        expect(s.ratio).toBe(ratios[i]);
        expect(s.focus).toBeDefined();
        expect(s.crop).toBeDefined();
        expect(s.method).toBe("fallback");
      });
    });

    it("should return empty array when detection fails", async () => {
      (RNImage.getSize as jest.Mock).mockImplementation((uri, callback) => {
        callback(0, 0);
      });

      const suggestions = await AutoCropEngine.suggestCrops(mockImageUri, ["1:1"]);
      expect(suggestions).toEqual([]);
    });

    it("should use default ratios when none provided", async () => {
      const suggestions = await AutoCropEngine.suggestCrops(mockImageUri);

      expect(suggestions).toHaveLength(3);
      expect(suggestions.map((s) => s.ratio)).toEqual(["1:1", "4:5", "9:16"]);
    });

    it("should apply custom padding to suggestions", async () => {
      const suggestions = await AutoCropEngine.suggestCrops(mockImageUri, ["1:1"], {
        padPct: 0.25, // More padding
      });

      expect(suggestions).toHaveLength(1);
      const suggestion = suggestions[0];
      // Crop should be larger than focus with extra padding
      expect(suggestion.crop.width).toBeGreaterThan(0);
      expect(suggestion.crop.height).toBeGreaterThan(0);
    });
  });

  describe("makeThumbnails", () => {
    beforeEach(() => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: "file://thumbnail.jpg",
        width: 240,
        height: 240,
      });
    });

    it("should generate thumbnails for suggestions", async () => {
      const suggestions = await AutoCropEngine.suggestCrops(mockImageUri, ["1:1"]);
      const withThumbs = await AutoCropEngine.makeThumbnails(mockImageUri, suggestions);

      expect(withThumbs).toHaveLength(1);
      expect(withThumbs[0].thumbUri).toBe("file://thumbnail.jpg");
      expect(withThumbs[0].ratio).toBe("1:1");
    });

    it("should use custom thumbnail size", async () => {
      const suggestions = await AutoCropEngine.suggestCrops(mockImageUri, ["1:1"]);
      const withThumbs = await AutoCropEngine.makeThumbnails(mockImageUri, suggestions, {
        size: 300,
      });

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockImageUri,
        expect.arrayContaining([expect.objectContaining({ resize: { width: 300 } })]),
        expect.any(Object)
      );
    });

    it("should use custom quality setting", async () => {
      const suggestions = await AutoCropEngine.suggestCrops(mockImageUri, ["1:1"]);
      await AutoCropEngine.makeThumbnails(mockImageUri, suggestions, { quality: 0.7 });

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ compress: 0.7 })
      );
    });
  });

  describe("applyCrop", () => {
    beforeEach(() => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: "file://cropped.jpg",
        width: 512,
        height: 384,
      });
    });

    it("should apply crop to image", async () => {
      const rect = { x: 100, y: 100, width: 400, height: 300 };
      const result = await AutoCropEngine.applyCrop(mockImageUri, rect);

      expect(result).toBe("file://cropped.jpg");
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockImageUri,
        expect.arrayContaining([
          expect.objectContaining({
            crop: {
              originX: 100,
              originY: 100,
              width: 400,
              height: 300,
            },
          }),
        ]),
        expect.objectContaining({ compress: 1, format: "jpeg" })
      );
    });

    it("should use custom quality setting", async () => {
      const rect = { x: 100, y: 100, width: 400, height: 300 };
      await AutoCropEngine.applyCrop(mockImageUri, rect, 0.85);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ compress: 0.85 })
      );
    });

    it("should round crop coordinates", async () => {
      const rect = { x: 100.7, y: 150.3, width: 400.9, height: 300.1 };
      await AutoCropEngine.applyCrop(mockImageUri, rect);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({
            crop: expect.objectContaining({
              originX: 101,
              originY: 150,
              width: 401,
              height: 300,
            }),
          }),
        ]),
        expect.any(Object)
      );
    });
  });

  describe("edge cases", () => {
    it("should handle very small images", async () => {
      (RNImage.getSize as jest.Mock).mockImplementation((uri, callback) => {
        callback(100, 100); // 100x100 image
      });

      const result = await AutoCropEngine.detect(mockImageUri);
      expect(result).toBeTruthy();
      expect(result?.focus.width).toBeLessThanOrEqual(100);
      expect(result?.focus.height).toBeLessThanOrEqual(100);
    });

    it("should handle very large images", async () => {
      (RNImage.getSize as jest.Mock).mockImplementation((uri, callback) => {
        callback(4000, 3000); // 4K image
      });

      const result = await AutoCropEngine.detect(mockImageUri);
      expect(result).toBeTruthy();
      expect(result?.size).toEqual({ w: 4000, h: 3000 });
    });

    it("should handle portrait orientation", async () => {
      (RNImage.getSize as jest.Mock).mockImplementation((uri, callback) => {
        callback(768, 1024); // Portrait
      });

      const result = await AutoCropEngine.detect(mockImageUri);
      expect(result).toBeTruthy();
      expect(result?.size.h).toBeGreaterThan(result?.size.w);
    });

    it("should handle landscape orientation", async () => {
      (RNImage.getSize as jest.Mock).mockImplementation((uri, callback) => {
        callback(2048, 1024); // Landscape
      });

      const result = await AutoCropEngine.detect(mockImageUri);
      expect(result).toBeTruthy();
      expect(result?.size.w).toBeGreaterThan(result?.size.h);
    });
  });
});

