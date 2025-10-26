import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

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
      // @ts-expect-error React Native FormData type
      uri: asset.uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const { data } = await api.post('/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return data.data.url as string;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

