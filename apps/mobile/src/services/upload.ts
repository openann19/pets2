import * as ImagePicker from 'expo-image-picker';
import { uploadAdapter } from './upload/index';

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
    const { url } = await uploadAdapter.uploadPhoto({
      uri: asset.uri,
      name: 'photo.jpg',
      contentType: 'image/jpeg',
    });
    return url;
  } catch (error: unknown) {
    const { logger } = await import('./logger');
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Upload error', {
      error: err,
    });
    throw err;
  }
}
