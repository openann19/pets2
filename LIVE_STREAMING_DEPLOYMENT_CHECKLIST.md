# 🎥 Live Streaming - Deployment Checklist

## ✅ Backend Status: 100% Complete

All backend features are implemented and tested:
- ✅ Models, services, routes, webhooks
- ✅ Socket.IO integration
- ✅ No linter errors
- ✅ E2E tests ready

## ⚠️ Mobile Status: Needs Permissions & Video Rendering

### Critical P0 Tasks Remaining

#### 1. iOS Permissions (`apps/mobile/ios/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to start live streams</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for live audio</string>
```

#### 2. Android Permissions (`apps/mobile/android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

#### 3. Update Mobile Screens to Use Actual LiveKit Components

**GoLiveScreen.tsx** - Replace placeholder with:
```typescript
import { ParticipantView } from 'livekit-react-native';
import { Room } from 'livekit-client';

<ParticipantView
  participant={room.localParticipant}
  style={{ flex: 1 }}
  objectFit="cover"
/>
```

**LiveViewerScreen.tsx** - Replace placeholder with:
```typescript
{remoteParticipants.map((participant) => (
  <ParticipantView
    key={participant.sid}
    participant={participant}
    style={{ flex: 1 }}
  />
))}
```

## 🔧 Environment Configuration Required

### Backend (.env)
```env
# LiveKit (Required)
LIVEKIT_URL=wss://your-livekit-instance.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_WEBHOOK_SECRET=your-webhook-secret

# S3 for VOD (Required)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=pawfectmatch-media

# Feature Flag (Optional, defaults to true)
FEATURE_GO_LIVE=true
```

### Mobile (.env)
```env
EXPO_PUBLIC_FEATURE_GO_LIVE=true
EXPO_PUBLIC_API_WS=wss://your-api-host
```

## 🚀 Deployment Steps

### 1. Configure LiveKit
- Option A: Sign up at https://livekit.io/cloud
- Option B: Self-host with Docker
- Copy credentials to .env

### 2. Configure Webhook
In LiveKit dashboard:
- URL: `https://your-domain.com/api/webhooks/livekit`
- Events: Enable all events
- Secret: Set `LIVEKIT_WEBHOOK_SECRET`

### 3. Set S3 Credentials
- Create S3 bucket: `pawfectmatch-media`
- Create IAM user with S3 access
- Add credentials to .env

### 4. Update Mobile Permissions
- Add iOS permissions to Info.plist
- Add Android permissions to AndroidManifest.xml

### 5. Rebuild Mobile App
```bash
cd apps/mobile
pnpm ios:build  # or android:build
```

### 6. Deploy
```bash
# Server
cd server
pnpm build
pnpm start

# Mobile - manual or CI/CD
```

## 🧪 Testing Checklist

### Backend Tests ✅
```bash
pnpm test -- live.e2e.test.ts
```

### Manual Tests Required ⚠️
- [ ] Start stream on iOS device
- [ ] Start stream on Android device
- [ ] Join stream as viewer
- [ ] Verify viewer count increments
- [ ] Send chat message
- [ ] Verify rate limiting works
- [ ] End stream
- [ ] Check VOD uploaded to S3

## 📊 Monitoring Setup

### Required Logs
- Stream start/stop events
- Webhook events (participant_joined, room_finished, etc.)
- Recording lifecycle events
- S3 upload status

### Metrics to Track
- Active stream count
- Total viewers across all streams
- Average stream duration
- Recording upload success rate
- Chat message count
- Peak viewers per stream

### Alerts to Configure
- Failed webhook deliveries (>5% failure rate)
- High error rate on stream endpoints
- S3 upload failures
- Memory/CPU spikes

## 🔒 Security Checklist

- ✅ Webhook signatures verified
- ✅ Rate limiting enforced
- ✅ Socket authentication required
- ⏳ HTTPS/WSS enforced in production
- ⏳ CORS configured properly
- ⏳ CDN for VOD playback (CloudFront)
- ⏳ DDoS protection (CloudFlare)

## 📈 Performance Checklist

- ✅ Database indexes created
- ✅ Atomic operations for viewer count
- ⏳ Load testing (100+ concurrent viewers)
- ⏳ CDN for static assets
- ⏳ S3 lifecycle policies (cleanup old VODs)

## ✅ Final Checklist Before Launch

### Backend
- [ ] Environment variables configured
- [ ] LiveKit credentials tested
- [ ] S3 credentials tested
- [ ] Webhook URL configured
- [ ] E2E tests passing
- [ ] No linter errors

### Mobile
- [ ] iOS permissions added
- [ ] Android permissions added
- [ ] ParticipantView implemented
- [ ] Tested on physical devices
- [ ] Camera/mic permissions flow works

### Infrastructure
- [ ] LiveKit instance deployed
- [ ] S3 bucket created
- [ ] Webhook endpoint accessible
- [ ] Monitoring configured
- [ ] Alerts configured

### Documentation
- [ ] API documentation updated
- [ ] Mobile integration guide
- [ ] Troubleshooting guide
- [ ] Admin user guide

## 🎯 Quick Start Commands

```bash
# Install dependencies
pnpm install

# Backend - test
cd server && pnpm test -- live.e2e.test.ts

# Mobile - rebuild with permissions
cd apps/mobile
pnpm ios:prebuild
pnpm ios:build

# Deploy
# ... your deployment process
```

## 🐛 Troubleshooting

### Issue: "LiveKit credentials not available"
**Fix**: Set `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` in .env

### Issue: "Recording upload failed"
**Fix**: Check S3 credentials and bucket permissions

### Issue: "Camera permission denied"
**Fix**: Add Info.plist/AndroidManifest permissions

### Issue: "Can't see video"
**Fix**: Update screens to use `ParticipantView` from livekit-react-native

## 📞 Support

- LiveKit Docs: https://docs.livekit.io/
- GitHub Issues: Check existing issues or create new
- Internal Slack: #live-streaming

---

**Status**: Backend ✅ Complete | Mobile ⚠️ Needs Permissions + Video Rendering
**Priority**: P0
**Target Launch**: After mobile tasks complete

