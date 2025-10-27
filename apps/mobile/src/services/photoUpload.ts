import * as FileSystem from "expo-file-system";
import { request } from "./api";

export async function uploadPhoto(fileUri: string, contentType: string) {
  const data = await request<{ url: string; key: string }>("/uploads/photos/presign", { method: 'POST', body: { contentType } });
  await FileSystem.uploadAsync(data.url, fileUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });
  return data.key;
}

