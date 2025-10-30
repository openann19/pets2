import { jpegByteSize, pickSharpest, compareSharpness } from '../QualityScore';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// Mock dependencies
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('QualityScore', () => {
  const mockUri = 'file://test-image.jpg';
  const mockTempUri = 'file://temp-test.jpg';

  beforeEach(() => {
    jest.clearAllMocks();

    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockTempUri,
    });

    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      size: 123456,
    });

    (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('jpegByteSize', () => {
    it('should return byte size of JPEG at specified dimensions', async () => {
      const size = await jpegByteSize(mockUri, 720, 0.72);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockUri,
        [{ resize: { width: 720 } }],
        { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG },
      );
      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(mockTempUri);
      expect(size).toBe(123456);
    });

    it('should use default parameters', async () => {
      await jpegByteSize(mockUri);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockUri,
        [{ resize: { width: 720 } }],
        { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG },
      );
    });

    it('should return 0 on error', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(
        new Error('Processing failed'),
      );

      const size = await jpegByteSize(mockUri);

      expect(size).toBe(0);
    });

    it('should continue even if cleanup fails', async () => {
      (FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const size = await jpegByteSize(mockUri);

      expect(size).toBe(123456);
    });

    it('should handle missing size info', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        size: null,
      });

      const size = await jpegByteSize(mockUri);

      expect(size).toBe(0);
    });
  });

  describe('pickSharpest', () => {
    const mockUris = ['file://image1.jpg', 'file://image2.jpg', 'file://image3.jpg'];

    beforeEach(() => {
      let callCount = 0;
      (FileSystem.getInfoAsync as jest.Mock).mockImplementation(() => {
        // Simulate different sizes
        const sizes = [50000, 80000, 60000]; // image2 is sharpest
        return Promise.resolve({ size: sizes[callCount++] || 50000 });
      });
    });

    it('should pick URI with largest JPEG size', async () => {
      const sharpest = await pickSharpest(mockUris);

      expect(FileSystem.getInfoAsync).toHaveBeenCalledTimes(3);
      expect(sharpest).toBe('file://image2.jpg');
    });

    it('should return only URI when array has one element', async () => {
      const sharpest = await pickSharpest([mockUris[0]]);

      expect(FileSystem.getInfoAsync).toHaveBeenCalledTimes(1);
      expect(sharpest).toBe(mockUris[0]);
    });

    it('should throw error for empty array', async () => {
      await expect(pickSharpest([])).rejects.toThrow('No URIs provided to pickSharpest');
    });

    it('should handle errors gracefully', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(
        new Error('Processing failed'),
      );

      // Should still return first URI (since all will fail and return 0)
      const sharpest = await pickSharpest(mockUris);
      expect(sharpest).toBe(mockUris[0]);
    });
  });

  describe('compareSharpness', () => {
    beforeEach(() => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ size: 50000 })
        .mockResolvedValueOnce({ size: 80000 });
    });

    it('should return sharper image (larger size)', async () => {
      const sharper = await compareSharpness('uri1', 'uri2');

      expect(sharper).toBe('uri2');
    });

    it('should handle same size gracefully', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ size: 50000 })
        .mockResolvedValueOnce({ size: 50000 });

      const result = await compareSharpness('uri1', 'uri2');

      expect(result).toBe('uri1'); // First one wins on tie
    });
  });
});
