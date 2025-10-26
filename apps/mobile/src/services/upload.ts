import * as ImagePicker from 'expo-image-picker';
import { request } from './api';

/**
 * Pick an image from the gallery and upload it to the server
 * @returns URL of the uploaded photo or null if cancelled
 */
export async function pickAndUpload(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    
    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const data = await request<{ url: string }>('/upload/photo', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return data.url;
  } catch (error: unknown) {
    const { logger } = await import('./logger');
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Upload error', { 
      error: err
    });
    throw err;
  }
}

