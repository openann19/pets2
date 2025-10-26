import * as FileSystem from "expo-file-system";
import { api } from "./api";

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
  const { data } = await api.post<{ key: string; url: string }>("/uploads/photos/presign", { contentType });
  
  await FileSystem.uploadAsync(data.url, localUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  // Analyze the uploaded photo
  const { data: analysis } = await api.post<{ data: PhotoAnalysisResult }>("/ai/analyze-photo", { 
    s3Key: data.key 
  });
  
  return analysis;
}

