/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { usePhotoManager } from "../usePhotoManager";
import * as ImagePicker from "expo-image-picker";

// Mock ImagePicker
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
  },
}));

// Mock Alert
jest.spyOn(Alert, "alert");

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
});
