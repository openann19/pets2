import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface PhotoData {
  uri: string;
  type: string;
  fileName: string;
  isPrimary: boolean;
}

export interface UsePhotoManagerReturn {
  photos: PhotoData[];
  pickImage: () => Promise<void>;
  removePhoto: (index: number) => void;
  setPrimaryPhoto: (index: number) => void;
}

export const usePhotoManager = (): UsePhotoManagerReturn => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
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

    if (!result.canceled) {
      const newPhotos: PhotoData[] = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        fileName: `pet-photo-${Date.now()}-${index}.jpg`,
        isPrimary: photos.length === 0 && index === 0, // First photo is primary
      }));

      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      // If we removed the primary photo, make the first remaining photo primary
      if (prev[index].isPrimary && newPhotos.length > 0) {
        newPhotos[0].isPrimary = true;
      }
      return newPhotos;
    });
  };

  const setPrimaryPhoto = (index: number) => {
    setPhotos(prev => prev.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    })));
  };

  return {
    photos,
    pickImage,
    removePhoto,
    setPrimaryPhoto,
  };
};
