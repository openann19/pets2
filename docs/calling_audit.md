# 📞 Calling & Video Deep Audit & Hardening

**Date:** January 2025  
**Status:** In Progress  
**Target:** Production-ready calling/video with rock-solid reliability

---

## 1. Media Stack & Permissions

### Current State
- ✅ iOS: Permission strings declared in `app.config.cjs` (`NSMicrophoneUsageDescription`, `NSCameraUsageDescription`)
- ✅ Android: Permissions declared (`RECORD_AUDIO`, `CAMERA`)
- ❌ **Missing**: Permission checks before `getUserMedia()` in `WebRTCService`
- ❌ **Missing**: Graceful denial UX (users see generic alerts)
- ❌ **Missing**: Permission rationale UI with retry option
- ❌ **Missing**: Runtime permission requests on Android

### iOS Permission Strings (Current)
```json
{
  "NSMicrophoneUsageDescription": "PawfectMatch uses the microphone for video calls with pet matches",
  "NSCameraUsageDescription": "PawfectMatch uses the camera for pet photo uploads and AR discovery features"
}
```

**Status:** ✅ Human-readable and task-specific

### Android Permissions (Current)
```json
{
  "android.permission.RECORD_AUDIO": "Required for voice and video calls",
  "android.permission.CAMERA": "Required for video calls and photo uploads"
}
```

**Status:** ⚠️ Need runtime permission request with rationale

### Required Fixes
1. **Pre-flight permission checks** before `getUserMedia()`
2. **Graceful denial UX** with clear explanation and settings link
3. **Android runtime permissions** with rationale dialog
4. **Permission retry flow** after user grants in settings

---

## 2. Signaling & Connectivity

### Current State
- ✅ STUN servers configured (Google STUN)
- ⚠️ TURN server: Environment-based (may be missing)
- ❌ **Missing**: Timeout handling for ICE connection
- ❌ **Missing**: Exponential backoff for reconnection
- ❌ **Missing**: Network quality indicator
- ❌ **Missing**: Auto-downgrade logic (720p → 480p → audio-only)

### ICE/TURN Configuration
```typescript
// Current: apps/mobile/src/services/WebRTCService.ts
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // TURN from env (may be missing)
  ],
  iceCandidatePoolSize: 10,
};
```

**Issues:**
- No fallback if TURN server is unavailable
- No timeout for ICE gathering
- No connection quality monitoring

### Required Fixes
1. **TURN fallback logic** with multiple TURN servers
2. **ICE timeout** (30s max for connection setup)
3. **Exponential backoff** for reconnection attempts
4. **Network quality indicator** (poor/ok/good) based on:
   - Bitrate (actual vs expected)
   - Packet loss percentage
   - Jitter (RTT variance)
   - Round-trip time (RTT)
5. **Auto-downgrade**:
   - **720p → 480p**: If bitrate < 1 Mbps or packet loss > 5%
   - **480p → audio-only**: If bitrate < 500 Kbps or packet loss > 10%
   - **Restore**: When quality improves (bitrate > threshold + 20% margin)

---

## 3. Call UX Flows (1:1, Group, GoLive)

### Current State
- ✅ Basic call controls (mute, video toggle, speaker)
- ✅ Camera switch (front/back)
- ❌ **Missing**: Pre-call device check
- ❌ **Missing**: Echo test
- ❌ **Missing**: Input switcher (mic/camera selection)
- ❌ **Missing**: Edge case handling (remote hangup, reconnect, handset→BT, rotate, background)

### Pre-Call Device Check (Missing)
**Required:**
- ✅ Mic available and working
- ✅ Camera available (for video calls)
- ✅ Audio output device selection
- ✅ Echo test (optional but recommended)

### Edge Cases to Handle

#### Remote Hangup
- **Current**: Socket event `call-ended` → `endCall()`
- **Issue**: No cleanup message shown to user
- **Fix**: Show "Call ended by [name]" toast

#### Local Rejection
- **Current**: `rejectCall()` emits socket event
- **Status**: ✅ Working

#### Reconnect After Network Loss
- **Current**: Connection state change → `endCall()` on failure
- **Issue**: No reconnection attempt
- **Fix**: Detect transient network loss, attempt reconnect with exponential backoff

#### Handset → Bluetooth Switch
- **Current**: Not handled
- **Fix**: Listen to `audioRouteChanged` event, update UI

#### Screen Rotation
- **Current**: Not handled
- **Fix**: Recalculate video aspect ratio, update layout

#### Background/Foreground
- **Current**: InCallManager handles some audio
- **Issue**: Video may freeze
- **Fix**: Pause video on background, resume on foreground

#### Lock Screen
- **Current**: InCallManager configured
- **Status**: ⚠️ Needs testing

### Failure UX (Missing)
- **Current**: Generic error events
- **Required**: Inline diagnostics with:
  - Why failed (permission denied, network error, ICE failure, etc.)
  - Retry button
  - Troubleshooting tips

---

## 4. System Integration

### iOS: CallKit Integration
- **Current**: Not implemented
- **Status**: Using InCallManager (basic audio routing)
- **Options:**
  1. **Full CallKit**: Native UI + lock screen controls (requires significant refactor)
  2. **Compliant Notifications**: Push notification with accept/decline (simpler, compliant)

**Recommendation**: Start with compliant notifications, add CallKit later if needed.

### Android: ConnectionService
- **Current**: Not implemented
- **Status**: Using InCallManager
- **Options:**
  1. **Full ConnectionService**: Native call UI (requires significant refactor)
  2. **Compliant Notifications**: Push notification with accept/decline (simpler, compliant)

**Recommendation**: Start with compliant notifications, add ConnectionService later if needed.

### Push: Incoming Call Alerts
- **Current**: Socket-based incoming call
- **Issue**: No push notification for backgrounded app
- **Fix**: Send push notification with:
  - Call category
  - Accept/Decline actions
  - Cancel on timeout (30s) or answered elsewhere

---

## 5. Telemetry & Safeguards

### Current Telemetry (Missing)
No call statistics are tracked. Required metrics:

#### Per-Call Stats
- `callSetupTime`: Time from start to connected (ms)
- `callSuccess`: boolean
- `callFailureReason`: string (permission denied, network error, ICE failure, etc.)
- `averageBitrate`: kbps (both audio and video)
- `peakBitrate`: kbps
- `packetLoss`: percentage
- `jitter`: ms
- `iceCompletionTime`: ms (time to ICE connection)
- `reconnections`: number of reconnection attempts

### Audio Safeguards (Missing)
- **Auto-mute on audio focus lost**: Not implemented
- **AEC/AGC/NS**: Depends on WebRTC stack capabilities
  - **React Native WebRTC**: Supports AEC/AGC/NS via constraints
  - **Fix**: Enable in `getUserMedia()` constraints

### Recording/Streaming Consent
- **Current**: GoLive screen has basic UI
- **Issue**: No explicit consent banner before streaming
- **Fix**: Show consent modal before starting stream:
  - "You are about to stream live. All viewers can see and hear you."
  - Checkbox: "I understand and consent"
  - Continue/Cancel buttons

---

## Implementation Priority

### Phase 1: Critical (Must Have for Launch)
1. ✅ Permission checks before `getUserMedia()`
2. ✅ Graceful denial UX with settings link
3. ✅ Android runtime permissions with rationale
4. ✅ ICE timeout handling
5. ✅ Network quality indicator
6. ✅ Auto-downgrade logic
7. ✅ Reconnection after network loss
8. ✅ Failure UX with diagnostics

### Phase 2: Important (Should Have)
1. Pre-call device check
2. Echo test (optional)
3. Push notifications for incoming calls
4. Telemetry tracking
5. Auto-mute on audio focus lost

### Phase 3: Nice to Have (Future)
1. CallKit integration (iOS)
2. ConnectionService integration (Android)
3. Full AEC/AGC/NS configuration
4. Recording consent banners

---

## Test Coverage Required

### E2E Tests (Detox)
1. ✅ Call happy path (1:1 voice)
2. ✅ Call happy path (1:1 video)
3. ❌ Deny permissions → graceful UX
4. ❌ Network drop → reconnect
5. ❌ Background → resume call
6. ❌ Auto-downgrade (simulate low bandwidth)

### Unit Tests
1. ✅ Permission checking logic
2. ✅ Network quality calculation
3. ✅ Auto-downgrade decision logic
4. ✅ Reconnection backoff calculation

---

## Related Files

- `apps/mobile/src/services/WebRTCService.ts` - Core WebRTC logic
- `apps/mobile/app.config.cjs` - Permission declarations
- `apps/mobile/src/screens/GoLiveScreen.tsx` - Live streaming UI
- `server/src/sockets/webrtc.ts` - Signaling server

---

## Next Steps

1. Implement permission checks in `WebRTCService`
2. Add graceful denial UX component
3. Add network quality monitor
4. Add auto-downgrade logic
5. Add telemetry tracking
6. Create E2E tests for call flows

