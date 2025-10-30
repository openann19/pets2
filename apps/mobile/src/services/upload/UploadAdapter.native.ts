import { request } from '../api';
import type { UploadAdapter, UploadPhotoInput, UploadVideoInput } from './UploadAdapter.types';

const appendExtraFields = (form: FormData, extra?: Record<string, string>) => {
  if (extra === undefined) return;
  for (const [key, value] of Object.entries(extra)) {
    form.append(key, value);
  }
};

export const uploadAdapter: UploadAdapter = {
  async uploadPhoto(input: UploadPhotoInput) {
    const form = new FormData();
    form.append('file', {
      // React Native FormData file tuple
      uri: input.uri,
      name: input.name ?? 'photo.jpg',
      type: input.contentType ?? 'image/jpeg',
    } as unknown as Blob);
    appendExtraFields(form, input.extraFields);

    const data = await request<{ url: string; width?: number; height?: number }>('/upload/photo', {
      method: 'POST',
      body: form,
    });
    return data;
  },

  async uploadVideo(input: UploadVideoInput) {
    const form = new FormData();
    form.append('file', {
      uri: input.uri,
      name: input.name ?? 'video.mp4',
      type: input.contentType ?? 'video/mp4',
    } as unknown as Blob);
    appendExtraFields(form, input.extraFields);

    const data = await request<{ url: string; durationMs?: number }>('/upload/video', {
      method: 'POST',
      body: form,
    });
    return data;
  },
  async uploadGeneric(input: UploadPhotoInput) {
    const form = new FormData();
    form.append('file', {
      uri: input.uri,
      name: input.name ?? 'file.bin',
      type: input.contentType ?? 'application/octet-stream',
    } as unknown as Blob);
    appendExtraFields(form, input.extraFields);

    const data = await request<{ url: string }>('/upload', {
      method: 'POST',
      body: form,
    });
    return data;
  },
};

export type { UploadAdapter };
