import * as FileSystem from "expo-file-system";
import { request } from "./api";

export interface PhotoAnalysisResult {
  labels: Array<{ name: string | undefined; confidence: number | undefined }>;
  breedCandidates: Array<{ name: string; confidence: number }>;
  quality: {
    dims: { width?: number; height?: number };
    exposure: number;
    contrast: number;
    sharpness: number;
  };
  overall: number;
  isPet: boolean;
  suggestions: string[];
}

export async function analyzePhotoFromUri(localUri: string, contentType = "image/jpeg"): Promise<PhotoAnalysisResult> {
  // Upload photo to S3
  const data = await request<{ key: string; url: string }>("/uploads/photos/presign", { method: 'POST', body: { contentType } });
  
  await FileSystem.uploadAsync(data.url, localUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  // Analyze the uploaded photo
  const analysis = await request<{ data: PhotoAnalysisResult }>("/ai/analyze-photo", { 
    method: 'POST', 
    body: { s3Key: data.key }
  });
  
  return analysis.data;
}

