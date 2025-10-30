import { request } from '../api';
import type { UploadAdapter, UploadPhotoInput, UploadVideoInput } from './UploadAdapter.types';

async function fetchBlobFromUri(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  if (!res.ok) {
    throw new Error(`Failed to read blob from URI: ${uri}`);
  }
  return res.blob();
}

export const uploadAdapter: UploadAdapter = {
  async uploadPhoto(input: UploadPhotoInput) {
    const blob = await fetchBlobFromUri(input.uri);
    const contentType = input.contentType ?? blob.type || 'application/octet-stream';

    const data = await request<{ url: string; width?: number; height?: number }>(
      '/upload/photo',
      {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': contentType },
      },
    );
    return data;
  },

  async uploadVideo(input: UploadVideoInput) {
    const blob = await fetchBlobFromUri(input.uri);
    const contentType = input.contentType ?? blob.type || 'application/octet-stream';

    const data = await request<{ url: string; durationMs?: number }>(
      '/upload/video',
      {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': contentType },
      },
    );
    return data;
  },
  async uploadGeneric(input: UploadPhotoInput) {
    const blob = await fetchBlobFromUri(input.uri);
    const contentType = input.contentType ?? blob.type || 'application/octet-stream';

    const data = await request<{ url: string }>(
      '/upload',
      {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': contentType },
      },
    );
    return data;
  },
};

export type { UploadAdapter };


