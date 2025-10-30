export interface UploadPhotoInput {
  uri: string;
  name?: string;
  contentType?: string;
  extraFields?: Record<string, string>;
}

export interface UploadVideoInput {
  uri: string;
  name?: string;
  contentType?: string;
  extraFields?: Record<string, string>;
}

export interface UploadAdapter {
  uploadPhoto(input: UploadPhotoInput): Promise<{ url: string; width?: number; height?: number }>;
  uploadVideo(input: UploadVideoInput): Promise<{ url: string; durationMs?: number }>;
  uploadGeneric?(input: UploadPhotoInput): Promise<{ url: string }>;
}
