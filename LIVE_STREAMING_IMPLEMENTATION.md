# 🎥 Live Streaming Implementation

Production-grade live streaming feature using LiveKit with WebRTC for PawfectMatch mobile app.

## 📋 Overview

Complete live streaming infrastructure including:
- **Media SFU**: LiveKit (Cloud or self-hosted)
- **WebRTC Publishing**: Direct from mobile app (no RTMP required)
- **Backend**: Node/Express/MongoDB with JWT token signing
- **Mobile**: React Native with LiveKit SDK
- **Live Chat**: Socket.IO for real-time chat/reactions
- **Admin Controls**: Kill-switch for moderation

## 🏗️ Architecture

### Backend Components

#### Models
- **`LiveStream`** (MongoDB): Tracks stream lifecycle, viewer count, blocked users
- Indexes: `isLive + startedAt`, `ownerId + isLive`, `roomName` (unique)

#### Services
- **`livekitService.ts`**: JWT token generation for publishers and subscribers
  - Publisher tokens: `canPublish: true`, `canSubscribe: true`, `canPublishData: true`
  - Subscriber tokens: `canPublish: false`, `canSubscribe: true`, `canPublishData: true`

#### Routes
- **`/api/live/start`** (POST): Start new stream, returns `{ streamId, roomName, token, url }`
- **`/api/live/stop`** (POST): Stop active stream
- **`/api/live/active`** (GET): List all active streams (public)
- **`/api/live/:id/watch`** (GET): Get subscriber token + metadata
- **`/api/live/:id/end`** (POST, admin): Hard-kill any stream

#### Webhooks
- **`/api/webhooks/livekit`**: Handles LiveKit events
  - `room_finished`: Auto-stop stream
  - `participant_joined`: Increment viewer count
  - `participant_left`: Decrement viewer count

#### Socket.IO
- **Namespace**: `/live:<roomName>`
- **Events**:
  - `chat:message`: Broadcast chat messages
  - `reaction`: Emoji reactions

### Mobile Components

#### Screens
1. **`GoLiveScreen`**: Publisher interface
   - Preview with camera/mic controls
   - Mute/unmute audio/video
   - End stream button
   
2. **`LiveViewerScreen`**: Subscriber interface
   - Live video feed
   - Chat overlay with real-time messages
   - Send messages and reactions
   
3. **`LiveBrowseScreen`**: Stream discovery
   - Grid view of active streams
   - Viewer count, cover images
   - Auto-refresh every 5 seconds

## 🚀 Setup

### Environment Variables

#### Backend
```env
# LiveKit Configuration
LIVEKIT_URL=https://your-livekit-host.com
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Feature Flag
FEATURE_GO_LIVE=true
```

#### Mobile
```env
# Feature Flag
EXPO_PUBLIC_FEATURE_GO_LIVE=true
```

### Installation

Backend packages:
```bash
pnpm add livekit-server-sdk --filter server
```

Mobile packages:
```bash
pnpm add livekit-react-native --filter @pawfectmatch/mobile
```

### Database Schema

```typescript
interface ILiveStream {
  ownerId: ObjectId;        // User who created stream
  roomName: string;         // Unique room identifier (live_userId_timestamp)
  title?: string;           // Stream title (max 120 chars)
  coverUrl?: string;        // Preview image
  isLive: boolean;          // Active status (indexed)
  startedAt?: Date;
  endedAt?: Date;
  viewers: number;          // Current viewer count
  tags: string[];           // Search tags (max 10)
  blockedUserIds: ObjectId[]; // Blocked viewers
  createdAt: Date;
  updatedAt: Date;
}
```

## 📱 Usage

### Starting a Stream

```typescript
// Mobile app
import { api } from './services/api';

const { streamId, roomName, token, url } = await api.request('/live/start', {
  method: 'POST',
  body: { title: 'My Stream', tags: ['pet', 'live'] }
});

// Connect to LiveKit
const room = new Room();
await room.connect(url, token);
await room.localParticipant.publishTrack(videoTrack);
await room.localParticipant.publishTrack(audioTrack);
```

### Stopping a Stream

```typescript
await api.request('/live/stop', {
  method: 'POST',
  body: { streamId }
});

await room.disconnect();
```

### Watching a Stream

```typescript
const { roomName, token, url, title } = await api.request(`/live/${streamId}/watch`, {
  method: 'GET'
});

const room = new Room();
await room.connect(url, token, { autoSubscribe: true });
```

### Live Chat

```typescript
const socket = io(`http://${baseUrl}/live:${roomName}`, {
  transports: ['websocket']
});

// Send message
socket.emit('chat:message', { text: 'Hello!' });

// Receive messages
socket.on('chat:message', (msg) => {
  console.log('Chat:', msg.text);
});

// Send reaction
socket.emit('reaction', '❤️');
```

## 🔐 Security

### Access Control
- **Publisher**: Only stream owner can start/stop streams
- **Subscriber**: Any authenticated user (except blocked)
- **Admin**: Can end any stream via `POST /api/live/:id/end`
- **Blocklist**: `blockedUserIds` prevents specific users from watching

### Rate Limiting
- Implement per-user limits on `/live/start`
- Prevent stream spam with cooldown periods

### Moderation
- Admin kill-switch (hard-stop any stream)
- Block users from specific streams
- Report abuse to trigger review

## 🧪 Testing

### E2E Tests
```bash
pnpm test -- server/tests/integration/live.e2e.test.ts
```

Tests cover:
- Start/stop streams
- Active stream listing
- Subscriber token generation
- Blocked user rejection
- Admin kill-switch
- Authentication requirements

### Manual Testing
1. Start server: `cd server && pnpm dev`
2. Start mobile: `cd apps/mobile && pnpm dev`
3. Enable flag: `EXPO_PUBLIC_FEATURE_GO_LIVE=true`
4. Navigate to "Go Live" screen
5. Start streaming
6. Open another device → "Live Browse"
7. Watch stream + test chat

## 🎨 UI/UX

### Go Live Screen
- Full-screen camera preview
- Live indicator badge (🔴 LIVE)
- Mute/unmute buttons (audio/video)
- End stream button (danger)
- Loading states

### Live Browse
- Grid layout (2 columns)
- Live badge + viewer count
- Pull-to-refresh
- Empty state message

### Live Viewer
- Video takes 2/3 screen
- Chat overlay at bottom
- Input bar with send button
- Reactions support (future)

## 📊 Monitoring

### LiveKit Dashboard
- Configure webhook URL: `https://your-domain.com/api/webhooks/livekit`
- Monitor active rooms, participants
- Track bandwidth, CPU usage

### MongoDB Indexes
```javascript
// Compound indexes for efficiency
{ isLive: 1, startedAt: -1 }  // Active streams sorted by start time
{ ownerId: 1, isLive: 1 }      // User's active streams
{ roomName: 1 } (unique)       // Fast lookup by room
```

### Logging
- Stream start/stop events
- Webhook events (participant join/leave)
- Authentication failures
- Admin actions

## 🔄 Webhook Events

LiveKit sends POST requests to `/api/webhooks/livekit`:

| Event | Action |
|-------|--------|
| `room_started` | No-op (handled by API) |
| `room_finished` | Set `isLive: false`, set `endedAt` |
| `participant_joined` | Increment `viewers` |
| `participant_left` | Decrement `viewers` (min 0) |

## 🚀 Deployment

### Prerequisites
1. LiveKit server running (Cloud or self-hosted)
2. MongoDB with indexes created
3. Environment variables configured
4. Feature flag enabled

### Steps
1. Set `FEATURE_GO_LIVE=true` in production
2. Configure LiveKit webhook URL in dashboard
3. Test start/stop/chat flows
4. Monitor logs for errors
5. Set up alerts for failed streams

### Scaling
- LiveKit SFU handles 1000+ concurrent viewers per stream
- MongoDB indexes support fast queries
- Socket.IO handles chat messages efficiently
- Consider CDN for cover images

## 🐛 Troubleshooting

### Stream Won't Start
- Check `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- Verify feature flag is enabled
- Check MongoDB connection
- Review server logs

### Chat Not Working
- Verify Socket.IO connection
- Check namespace format: `/live:<roomName>`
- Ensure client connects to correct room

### Viewer Count Wrong
- Check webhook configuration in LiveKit dashboard
- Verify webhook URL is reachable
- Check server logs for webhook errors

## 📈 Future Enhancements

- [ ] Recording/Replay (S3 upload)
- [ ] Pinned messages
- [ ] Virtual gifts/tipping
- [ ] Stream analytics dashboard
- [ ] Multi-guest streams
- [ ] RTMP Ingress (external encoders)
- [ ] Stream quality auto-adjust
- [ ] Bandwidth throttling
- [ ] Stream scheduling
- [ ] Viewer metrics (peak, avg, retention)

## 📝 References

- [LiveKit Docs](https://docs.livekit.io/)
- [LiveKit React Native](https://github.com/livekit/client-sdk-react-native)
- [LiveKit Server SDK](https://docs.livekit.io/realtime/server-api/)
- [WebRTC Spec](https://webrtc.org/)

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-01-26

