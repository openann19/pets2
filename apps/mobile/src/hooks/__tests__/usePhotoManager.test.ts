/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { usePhotoManager } from "../usePhotoManager";
import * as ImagePicker from "expo-image-picker";
import { multipartUpload } from "../../services/multipartUpload";

// Mock ImagePicker
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
  },
  MediaTypeOptions: {
    Images: "Images",
  },
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock multipartUpload service
jest.mock("../../services/multipartUpload", () => ({
  multipartUpload: jest.fn(),
}));

// Mock logger
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMultipartUpload = multipartUpload as jest.MockedFunction<typeof multipartUpload>;

describe("usePhotoManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with empty photos array", () => {
    const { result } = renderHook(() => usePhotoManager());

    expect(result.current.photos).toEqual([]);
  });

  it("should request permissions when picking image", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
  });

  it("should show alert when permissions denied", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "denied",
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Permission needed",
      "Please grant permission to access your photos",
    );
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("should add photos when image picker succeeds", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo1.jpg" }, { uri: "file://photo2.jpg" }],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos).toHaveLength(2);
    expect(result.current.photos[0].uri).toBe("file://photo1.jpg");
    expect(result.current.photos[1].uri).toBe("file://photo2.jpg");
  });

  it("should mark first photo as primary", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo1.jpg" }],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos[0].isPrimary).toBe(true);
  });

  it("should not mark additional photos as primary", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });

    // First pick
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo1.jpg" }],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    // Second pick
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo2.jpg" }],
    });

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos[0].isPrimary).toBe(true);
    expect(result.current.photos[1].isPrimary).toBe(false);
  });

  it("should remove photo by index", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        { uri: "file://photo1.jpg" },
        { uri: "file://photo2.jpg" },
        { uri: "file://photo3.jpg" },
      ],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos).toHaveLength(3);

    act(() => {
      result.current.removePhoto(1);
    });

    expect(result.current.photos).toHaveLength(2);
    expect(result.current.photos[0].uri).toBe("file://photo1.jpg");
    expect(result.current.photos[1].uri).toBe("file://photo3.jpg");
  });

  it("should make first photo primary when removing primary photo", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo1.jpg" }, { uri: "file://photo2.jpg" }],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos[0].isPrimary).toBe(true);

    act(() => {
      result.current.removePhoto(0);
    });

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].uri).toBe("file://photo2.jpg");
    expect(result.current.photos[0].isPrimary).toBe(true);
  });

  it("should set primary photo by index", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        { uri: "file://photo1.jpg" },
        { uri: "file://photo2.jpg" },
        { uri: "file://photo3.jpg" },
      ],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos[0].isPrimary).toBe(true);

    act(() => {
      result.current.setPrimaryPhoto(2);
    });

    expect(result.current.photos[0].isPrimary).toBe(false);
    expect(result.current.photos[1].isPrimary).toBe(false);
    expect(result.current.photos[2].isPrimary).toBe(true);
  });

  it("should handle canceled image picker", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos).toEqual([]);
  });

  it("should generate unique file names", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo1.jpg" }, { uri: "file://photo2.jpg" }],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    const file1 = result.current.photos[0].fileName;
    const file2 = result.current.photos[1].fileName;

    expect(file1).toContain("pet-photo-");
    expect(file2).toContain("pet-photo-");
    expect(file1).not.toBe(file2);
  });

  it("should set image type to image/jpeg", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo1.jpg" }],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos[0].type).toBe("image/jpeg");
  });

  it("should respect photo limit (10 photos)", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        { uri: "file://photo1.jpg" },
        { uri: "file://photo2.jpg" },
        { uri: "file://photo3.jpg" },
      ],
    });

    const { result } = renderHook(() => usePhotoManager());

    // Add 3 photos
    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos).toHaveLength(3);

    // Check that selection limit is calculated correctly
    await act(async () => {
      await result.current.pickImage();
    });

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        selectionLimit: 7, // 10 - 3
      }),
    );
  });

  it("should preserve photo data structure", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo1.jpg" }],
    });

    const { result } = renderHook(() => usePhotoManager());

    await act(async () => {
      await result.current.pickImage();
    });

    const photo = result.current.photos[0];

    expect(photo).toHaveProperty("uri");
    expect(photo).toHaveProperty("type");
    expect(photo).toHaveProperty("fileName");
    expect(photo).toHaveProperty("isPrimary");
  });

  describe("Multipart Upload Functionality", () => {
    beforeEach(() => {
      mockMultipartUpload.mockResolvedValue({
        url: "https://s3.amazonaws.com/bucket/uploads/photo.jpg",
        key: "uploads/photo.jpg",
        thumbnails: {
          jpg: "https://s3.amazonaws.com/bucket/thumbnails/photo.jpg",
          webp: "https://s3.amazonaws.com/bucket/thumbnails/photo.webp",
        },
      });
    });

    it("should automatically upload photos when picked", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo1.jpg", type: "image/jpeg" }],
      });

      const { result } = renderHook(() => usePhotoManager());

      await act(async () => {
        await result.current.pickImage();
      });

      await waitFor(() => {
        expect(mockMultipartUpload).toHaveBeenCalled();
      });
    });

    it("should track upload progress", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo1.jpg", type: "image/jpeg" }],
      });

      mockMultipartUpload.mockImplementation(({ onProgress }) => {
        if (onProgress) {
          onProgress(50, 100);
          onProgress(100, 100);
        }
        return Promise.resolve({
          url: "https://s3.amazonaws.com/bucket/uploads/photo.jpg",
          key: "uploads/photo.jpg",
          thumbnails: {
            jpg: "https://s3.amazonaws.com/bucket/thumbnails/photo.jpg",
            webp: "https://s3.amazonaws.com/bucket/thumbnails/photo.webp",
          },
        });
      });

      const { result } = renderHook(() => usePhotoManager());

      await act(async () => {
        await result.current.pickImage();
      });

      await waitFor(() => {
        expect(mockMultipartUpload).toHaveBeenCalled();
      });
    });

    it("should mark photo as uploaded successfully", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo1.jpg", type: "image/jpeg" }],
      });

      const { result } = renderHook(() => usePhotoManager());

      await act(async () => {
        await result.current.pickImage();
      });

      await waitFor(() => {
        const photo = result.current.photos[0];
        expect(photo).toHaveProperty("uploadedUrl");
        expect(photo).toHaveProperty("thumbnailUrl");
        expect(photo).toHaveProperty("s3Key");
        expect(photo.isUploading).toBe(false);
      });
    });

    it("should handle upload errors gracefully", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo1.jpg", type: "image/jpeg" }],
      });

      mockMultipartUpload.mockRejectedValue(new Error("Upload failed"));

      const { result } = renderHook(() => usePhotoManager());

      await act(async () => {
        await result.current.pickImage();
      });

      await waitFor(() => {
        const photo = result.current.photos[0];
        expect(photo.error).toBe("Upload failed");
        expect(photo.isUploading).toBe(false);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Failed",
        expect.stringContaining("Failed to upload"),
      );
    });

    it("should not allow submission when photos are uploading", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo1.jpg", type: "image/jpeg" }],
      });

      // Mock a slow upload
      mockMultipartUpload.mockImplementation(
        ({ onProgress }) =>
          new Promise((resolve) => {
            setTimeout(() => {
              if (onProgress) onProgress(50, 100);
              resolve({
                url: "https://s3.amazonaws.com/bucket/uploads/photo.jpg",
                key: "uploads/photo.jpg",
                thumbnails: {
                  jpg: "https://s3.amazonaws.com/bucket/thumbnails/photo.jpg",
                  webp: "https://s3.amazonaws.com/bucket/thumbnails/photo.webp",
                },
              });
            }, 100);
          }),
      );

      const { result } = renderHook(() => usePhotoManager());

      await act(async () => {
        await result.current.pickImage();
      });

      // Check immediately after - should still be uploading
      const photo = result.current.photos[0];
      expect(photo.isUploading).toBe(true);

      // Wait for upload to complete
      await waitFor(
        () => {
          expect(result.current.photos[0].isUploading).toBe(false);
        },
        { timeout: 200 },
      );
    });

    it("should provide uploadPendingPhotos method", () => {
      const { result } = renderHook(() => usePhotoManager());
      expect(result.current.uploadPendingPhotos).toBeDefined();
      expect(typeof result.current.uploadPendingPhotos).toBe("function");
    });
  });
});
