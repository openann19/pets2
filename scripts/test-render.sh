#!/bin/bash
# Test the render pipeline end-to-end

set -e

API_URL=${API_URL:-http://localhost:3001}

echo "🐾 Testing PawReels render pipeline..."

# 1. Create reel
echo "1. Creating reel..."
REEL_ID=$(curl -s -X POST $API_URL/reels \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "'"$(curl -s $API_URL/templates | jq -r '.[0].id')"'",
    "trackId": "'"$(curl -s $API_URL/tracks | jq -r '.[0].id')"'",
    "locale": "en",
    "watermark": true
  }' | jq -r '.id')

echo "✅ Created reel: $REEL_ID"

# 2. Add clips
echo "2. Adding clips..."
curl -s -X PUT $API_URL/reels/$REEL_ID/clips \
  -H "Content-Type: application/json" \
  -d '{
    "clips": [
      {"order": 0, "srcUrl": "s3://reels/dev/clips/c0.mp4", "startMs": 0, "endMs": 900},
      {"order": 1, "srcUrl": "s3://reels/dev/clips/c1.mp4", "startMs": 0, "endMs": 800},
      {"order": 2, "srcUrl": "s3://reels/dev/clips/c2.mp4", "startMs": 0, "endMs": 900}
    ]
  }' | jq

echo "✅ Clips added"

# 3. Start render
echo "3. Starting render..."
curl -s -X POST $API_URL/reels/$REEL_ID/render | jq

echo "⏳ Rendering... (this may take 30-60 seconds)"
echo "    Watch status: curl $API_URL/reels/$REEL_ID"

# 4. Poll for completion
echo "4. Polling for status..."
for i in {1..60}; do
  STATUS=$(curl -s $API_URL/reels/$REEL_ID | jq -r '.status')
  echo "   Attempt $i: status=$STATUS"
  
  if [ "$STATUS" = "public" ]; then
    echo "✅ Render complete!"
    curl -s $API_URL/reels/$REEL_ID | jq '{ id, mp4_url, poster_url, status }'
    break
  elif [ "$STATUS" = "flagged" ] || [ "$STATUS" = "removed" ]; then
    echo "❌ Render failed with status: $STATUS"
    exit 1
  fi
  
  sleep 2
done

echo "🎬 Test complete! View at: http://localhost:3002/reel/$REEL_ID?ref=dev"

