import * as ImagePicker from 'expo-image-picker';
import { request } from './api';
import { uploadAdapter } from './upload/index';

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

    // Upload using UploadAdapter
    const uploadResult = await uploadAdapter.uploadPhoto({
      uri: asset.uri,
      name: 'photo.jpg',
      contentType: 'image/jpeg',
    });

    // Get upload metadata (key, thumbnails) from backend
    const metadataResponse = await request<{ key: string; thumbnails: { jpg: string; webp: string } }>(
      '/upload/metadata',
      {
        method: 'POST',
        body: { url: uploadResult.url },
      },
    );

    return {
      url: uploadResult.url,
      key: metadataResponse.key,
      thumbnails: metadataResponse.thumbnails,
    };
  } catch (error: unknown) {
    const { logger } = await import('./logger');
    const errorMessage = error instanceof Error ? error : new Error(String(error));
    logger.error('Photo upload error', { error: errorMessage });
    throw errorMessage;
  }
}

export async function pickAndUploadToCloudinary(): Promise<string | null> {
  // Alternative implementation using direct Cloudinary upload
  const photo = await pickAndUpload();
  return photo?.url || null;
}
