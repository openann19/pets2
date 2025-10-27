import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { matchesAPI } from "../../../services/api";
import { logger } from "@pawfectmatch/core";

export interface PhotoData {
  uri: string;
  type: string;
  fileName: string;
  isPrimary?: boolean;
}

export interface UsePhotoManagementOptions {
  onPhotoSelected?: (photos: PhotoData[]) => void;
  maxPhotos?: number;
}

export interface UsePhotoManagementReturn {
  photos: PhotoData[];
  isLoading: boolean;
  pickImage: () => Promise<void>;
  removePhoto: (index: number) => void;
  setPrimaryPhoto: (index: number) => void;
  uploadPhotos: (petId: string) => Promise<boolean>;
  clearPhotos: () => void;
}

/**
 * Hook for managing photo selection, upload, and management
 */
export function usePhotoManagement({
  onPhotoSelected,
  maxPhotos = 10,
}: UsePhotoManagementOptions = {}): UsePhotoManagementReturn {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photos",
      );
      return;
    }

    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Maximum photos reached",
        `You can only add up to ${maxPhotos} photos`,
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxPhotos - photos.length,
    });

    if (!result.canceled) {
      const newPhotos: PhotoData[] = result.assets.map((asset: any, index: number) => ({
        uri: asset.uri,
        type: "image/jpeg",
        fileName: `photo-${Date.now()}-${index}.jpg`,
        isPrimary: photos.length === 0 && index === 0,
      }));

      setPhotos((prev) => {
        const updated = [...prev, ...newPhotos];
        onPhotoSelected?.(updated);
        return updated;
      });
    }
  }, [photos.length, maxPhotos, onPhotoSelected]);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const photoToRemove = prev[index];
      const newPhotos = prev.filter((_, i) => i !== index);
      // If we removed the primary photo, make the first remaining photo primary
      if (photoToRemove?.isPrimary && newPhotos.length > 0 && newPhotos[0]) {
        newPhotos[0].isPrimary = true;
      }
      return newPhotos;
    });
  }, []);

  const setPrimaryPhoto = useCallback((index: number) => {
    setPhotos((prev) =>
      prev.map((photo, i) => ({
        ...photo,
        isPrimary: i === index,
      })),
    );
  }, []);

  const uploadPhotos = useCallback(
    async (petId: string): Promise<boolean> => {
      if (photos.length === 0) {
        Alert.alert("No photos", "Please add at least one photo");
        return false;
      }

      setIsLoading(true);

      try {
        const formData = new FormData();
        photos.forEach((photo, index) => {
          formData.append("photos", {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName || `photo_${index}.jpg`,
          } as unknown as Blob);

          if (photo.isPrimary) {
            formData.append("primaryIndex", String(index));
          }
        });

        await matchesAPI.uploadPetPhotos(petId, formData);
        logger.info("Photos uploaded successfully", {
          petId,
          photoCount: photos.length,
        });
        return true;
      } catch (err) {
        logger.error("Failed to upload photos", { error: err, petId });
        Alert.alert("Error", "Failed to upload photos. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [photos],
  );

  const clearPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  return {
    photos,
    isLoading,
    pickImage,
    removePhoto,
    setPrimaryPhoto,
    uploadPhotos,
    clearPhotos,
  };
}
