import * as FileSystem from "expo-file-system";
import { api } from "./api";

export async function uploadPhoto(fileUri: string, contentType: string) {
  const { data } = await api.post("/uploads/photos/presign", { contentType });
  await FileSystem.uploadAsync(data.url, fileUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });
  return data.key;
}

