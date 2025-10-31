import * as FileSystem from 'expo-file-system';
import { request } from './api';

export async function uploadPhoto(fileUri: string, contentType: string) {
  const data = await request<{ url: string; key: string }>('/uploads/photos/presign', {
    method: 'POST',
    body: { contentType },
  });
  const uploadResult = await FileSystem.uploadAsync(data.url, fileUri, {
    httpMethod: 'PUT',
    headers: { 'Content-Type': contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });
  if (!uploadResult || typeof uploadResult.status !== 'number' || uploadResult.status >= 400) {
    const status = uploadResult?.status;
    throw new Error(
      status !== undefined
        ? `Photo upload failed with status ${status}`
        : 'Photo upload failed: unknown status',
    );
  }
  return data.key;
}
