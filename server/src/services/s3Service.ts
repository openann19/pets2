import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import mime from "mime";

const s3 = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
const BUCKET = process.env.S3_BUCKET || "pawfectmatch-media";

export function generateKey(userId: string, ext: string): string {
  const id = crypto.randomBytes(16).toString("hex");
  return `uploads/${userId}/${id}${ext.startsWith(".") ? ext : `.${ext}`}`;
}

export async function createMultipart(key: string, contentType: string): Promise<{ uploadId: string }> {
  const cmd = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });
  const res = await s3.send(cmd);
  return { uploadId: res.UploadId! };
}

export async function getPartUrl(key: string, uploadId: string, partNumber: number): Promise<string> {
  const cmd = new UploadPartCommand({ 
    Bucket: BUCKET, 
    Key: key, 
    UploadId: uploadId, 
    PartNumber: partNumber, 
    Body: undefined 
  });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

export async function completeMultipart(
  key: string, 
  uploadId: string, 
  parts: { ETag: string; PartNumber: number; }[]
): Promise<string> {
  const cmd = new CompleteMultipartUploadCommand({
    Bucket: BUCKET, 
    Key: key, 
    UploadId: uploadId, 
    MultipartUpload: { Parts: parts }
  });
  const out = await s3.send(cmd);
  return out.Location ?? `https://${BUCKET}.s3.amazonaws.com/${key}`;
}

export async function putSimple(key: string, contentType: string, body: Buffer): Promise<string> {
  await s3.send(new PutObjectCommand({ 
    Bucket: BUCKET, 
    Key: key, 
    Body: body, 
    ContentType: contentType, 
    ACL: "public-read" 
  }));
  return `https://${BUCKET}.s3.amazonaws.com/${key}`;
}

export async function head(key: string) {
  return s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function getObjectBuffer(Key: string): Promise<Buffer> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key }));
  const chunks: Buffer[] = [];
  
  if (res.Body && typeof res.Body === 'object' && 'on' in res.Body) {
    // Stream handling
    await new Promise<void>((resolve, reject) => {
      (res.Body as any).on("data", (c: Buffer) => chunks.push(Buffer.from(c)));
      (res.Body as any).on("end", () => resolve());
      (res.Body as any).on("error", reject);
    });
  } else if (res.Body) {
    // Direct buffer
    chunks.push(Buffer.from(await (res.Body as any).transformToByteArray()));
  }
  
  return Buffer.concat(chunks);
}

export function extFromMime(ct: string): string {
  const e = mime.getExtension(ct) || "jpg";
  return `.${e}`;
}

