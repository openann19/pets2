import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

export interface PhotoUploadResult {
  url: string;
  key: string;
  thumbnails: {
    jpg: string;
    webp: string;
  };
}

export async function pickAndUpload(): Promise<PhotoUploadResult | null> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera roll permissions not granted');
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset.uri) {
      throw new Error('No image selected');
    }

    // Create multipart upload
    const multipartResponse = await api.post('/upload/multipart/create', {
      contentType: 'image/jpeg',
    });

    const { key, uploadId } = multipartResponse.data;

    // Upload parts (simplified - in production, implement chunking)
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    const uploadResponse = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return uploadResponse.data;
  } catch (error) {
    console.error('Photo upload error:', error);
    throw error;
  }
}

export async function pickAndUploadToCloudinary(): Promise<string | null> {
  // Alternative implementation using direct Cloudinary upload
  const photo = await pickAndUpload();
  return photo?.url || null;
}

