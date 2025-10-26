import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
const BUCKET = process.env.S3_BUCKET || "";

export async function getSignedPutUrl(key: string, contentType: string, expires = 60) {
  const cmd = new PutObjectCommand({ 
    Bucket: BUCKET, 
    Key: key, 
    ContentType: contentType, 
    ACL: "private" 
  });
  return getSignedUrl(s3, cmd, { expiresIn: expires });
}

export async function getSignedGetUrl(key: string, expires = 3600) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expires });
}

