const API_URL = process.env['EXPO_PUBLIC_API_URL'] || process.env['API_URL'] || '';

export async function uploadImageAsync(
  localUri: string,
  contentType = 'image/jpeg',
): Promise<string> {
  // Get presigned URL from server
  const presignRes = await fetch(`${API_URL}/api/upload/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType }),
  });

  if (!presignRes.ok) throw new Error('Failed to get presigned URL');
  const presign = await presignRes.json();

  // Read the file as blob
  const blob = await (await fetch(localUri)).blob();

  // Upload to S3 using presigned URL
  const putRes = await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!putRes.ok) throw new Error('upload failed');
  return presign.publicUrl as string;
}
