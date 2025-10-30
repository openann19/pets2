#!/bin/bash
# Upload test clips to MinIO for PawReels development

set -e

S3_ENDPOINT=${S3_ENDPOINT:-http://localhost:9000}
S3_ACCESS_KEY=${S3_ACCESS_KEY:-paw}
S3_SECRET_KEY=${S3_SECRET_KEY:-pawpawpaw}
BUCKET=${S3_BUCKET:-reels}

echo "Uploading test clips to MinIO..."

# Create bucket if it doesn't exist
docker exec $(docker ps -q -f name=s3) mc mb s3/$BUCKET --ignore-existing || true

# For each clip file in tests/clips/, upload to s3://reels/dev/clips/
for file in tests/clips/*.mp4; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "Uploading $filename..."
    docker exec $(docker ps -q -f name=s3) mc cp "$file" s3/$BUCKET/dev/clips/$filename
  fi
done

echo "✅ Test clips uploaded to s3://$BUCKET/dev/clips/"

