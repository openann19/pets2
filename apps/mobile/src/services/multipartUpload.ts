import { request } from "./api";

export type PartResult = { ETag: string; PartNumber: number; };

export async function multipartUpload({
  fileUri,
  contentType,
  partSize = 5 * 1024 * 1024, // 5MB
  onProgress,
}: {
  fileUri: string;
  contentType: string;
  partSize?: number;
  onProgress?: (sentBytes: number, totalBytes: number) => void;
}) {
  const RNFS = require("react-native-fs").default;
  const stat = await RNFS.stat(fileUri);
  const totalBytes = Number(stat.size);
  const { key, uploadId } = await request<{ key: string; uploadId: string }>("/upload/multipart/create", { method: 'POST', body: { contentType } });

  // slice file into parts (RNFS read with offset)
  const parts: PartResult[] = [];
  let uploaded = 0;

  let partNumber = 1;
  for (let start = 0; start < totalBytes; start += partSize, partNumber++) {
    const end = Math.min(start + partSize, totalBytes);
    const length = end - start;
    const { url } = await request<{ url: string }>("/upload/multipart/part-url", { 
      method: 'GET',
      params: { key, uploadId, partNumber } 
    });
    const base64 = await RNFS.read(fileUri, length, start, "base64");
    const blob = Buffer.from(base64, "base64");

    const resp = await fetch(url, { method: "PUT", body: blob });
    if (!resp.ok) throw new Error(`Part ${partNumber} upload failed`);
    const eTag = resp.headers.get("ETag")?.replaceAll('"', "") ?? "";
    parts.push({ ETag: eTag, PartNumber: partNumber });

    uploaded += length;
    onProgress?.(uploaded, totalBytes);
  }

  const data = await request<{ url: string; key: string; thumbnails: { jpg: string; webp: string; } }>("/upload/multipart/complete", { method: 'POST', body: { key, uploadId, parts } });
  return data;
}

