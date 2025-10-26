import * as ImagePicker from "expo-image-picker";
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { multipartUpload } from "../services/multipartUpload";
import { logger } from "@pawfectmatch/core";

export interface UploadProgress {
  uploaded: number;
  total: number;
  percentage: number;
}

export interface PhotoData {
  uri: string;
  type: string;
  fileName: string;
  isPrimary: boolean;
  // Upload tracking
  isUploading?: boolean;
  uploadProgress?: UploadProgress;
  uploadedUrl?: string;
  thumbnailUrl?: string;
  s3Key?: string;
  error?: string;
}

export interface UsePhotoManagerReturn {
  photos: PhotoData[];
  pickImage: () => Promise<void>;
  removePhoto: (index: number) => void;
  setPrimaryPhoto: (index: number) => void;
  uploadPendingPhotos: () => Promise<void>;
}

export const usePhotoManager = (): UsePhotoManagerReturn => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10 - photos.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newPhotos: PhotoData[] = result.assets.map((asset, index) => ({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          fileName: `pet-photo-${Date.now()}-${index}.jpg`,
          isPrimary: photos.length === 0 && index === 0,
          isUploading: false,
        }));

        setPhotos((prev) => [...prev, ...newPhotos]);

        // Automatically upload the new photos
        await uploadPhotos(newPhotos);
      }
    } catch (error) {
      logger.error("Error picking images:", { error });
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const uploadPhotos = useCallback(async (photosToUpload: PhotoData[]) => {
    for (const photo of photosToUpload) {
      try {
        // Mark photo as uploading using functional update to avoid stale state
        setPhotos((prev) => {
          const photoIndex = prev.findIndex((p) => p.uri === photo.uri);
          if (photoIndex === -1) return prev;

          return prev.map((p, i) =>
            i === photoIndex
              ? { ...p, isUploading: true, error: undefined }
              : p,
          );
        });

        // Start multipart upload with progress tracking
        const uploadResult = await multipartUpload({
          fileUri: photo.uri,
          contentType: photo.type,
          onProgress: (uploaded, total) => {
            const percentage = Math.round((uploaded / total) * 100);
            setPhotos((prev) => {
              const photoIndex = prev.findIndex((p) => p.uri === photo.uri);
              if (photoIndex === -1) return prev;

              return prev.map((p, i) =>
                i === photoIndex
                  ? {
                      ...p,
                      uploadProgress: { uploaded, total, percentage },
                    }
                  : p,
              );
            });
          },
        });

        // Mark photo as successfully uploaded
        setPhotos((prev) => {
          const photoIndex = prev.findIndex((p) => p.uri === photo.uri);
          if (photoIndex === -1) return prev;

          return prev.map((p, i) =>
            i === photoIndex
              ? {
                  ...p,
                  isUploading: false,
                  uploadedUrl: uploadResult.url,
                  thumbnailUrl: uploadResult.thumbnails.webp,
                  s3Key: uploadResult.key,
                  uploadProgress: undefined, // Clear progress on success
                }
              : p,
          );
        });

        logger.info("Photo uploaded successfully:", { photo, url: uploadResult.url });
      } catch (error) {
        logger.error("Error uploading photo:", { error, photo: photo.uri });
        
        // Mark photo with error
        setPhotos((prev) => {
          const photoIndex = prev.findIndex((p) => p.uri === photo.uri);
          if (photoIndex === -1) return prev;

          return prev.map((p, i) =>
            i === photoIndex
              ? { ...p, isUploading: false, error: "Upload failed" }
              : p,
          );
        });

        Alert.alert(
          "Upload Failed",
          `Failed to upload ${photo.fileName}. Please try again.`,
        );
      }
    }
  }, []);

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const newPhotos = prev.filter((_, i) => i !== index);
      // If we removed the primary photo, make the first remaining photo primary
      if (prev[index].isPrimary && newPhotos.length > 0) {
        newPhotos[0].isPrimary = true;
      }
      return newPhotos;
    });
  };

  const setPrimaryPhoto = (index: number) => {
    setPhotos((prev) =>
      prev.map((photo, i) => ({
        ...photo,
        isPrimary: i === index,
      })),
    );
  };

  const uploadPendingPhotos = useCallback(async () => {
    setPhotos((prev) => {
      const pendingPhotos = prev.filter(
        (p) => !p.uploadedUrl && !p.isUploading && !p.error,
      );

      if (pendingPhotos.length > 0) {
        // Upload in background without blocking
        uploadPhotos(pendingPhotos).catch((error) => {
          logger.error("Error uploading pending photos:", { error });
        });
      }

      return prev;
    });
  }, [uploadPhotos]);

  return {
    photos,
    pickImage,
    removePhoto,
    setPrimaryPhoto,
    uploadPendingPhotos,
  };
};
