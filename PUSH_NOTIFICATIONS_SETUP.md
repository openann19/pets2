# 📱 Push Notifications Setup Guide

**Status**: Implementation Complete - Needs Configuration & Testing

---

## ✅ What's Implemented

1. **Mobile Notification Service** (`apps/mobile/src/services/notifications.ts`)
   - Expo notifications integration
   - Permission handling
   - Token registration
   - Android channels setup

2. **Backend Push Service** (`server/src/services/pushNotificationService.ts`)
   - FCM integration
   - Multi-token support
   - User-specific delivery

3. **Hooks** (`apps/mobile/src/hooks/useNotifications.ts`)
   - React hooks for notifications

---

## 🔧 Setup Steps

### 1. Firebase Cloud Messaging (FCM)

**Required**:
- FCM Server Key: `FCM_SERVER_KEY` env var
- Firebase project configured

**Steps**:
1. Create Firebase project (if not exists)
2. Enable Cloud Messaging
3. Get Server Key from Firebase Console → Project Settings → Cloud Messaging
4. Set `FCM_SERVER_KEY` in server `.env`

### 2. Expo Push Notifications

**Current Setup**:
- Uses Expo notifications API
- Token registration: `apps/mobile/src/services/notifications.ts`

**Configuration**:
- Expo project must be configured in Expo dashboard
- Push notification certificates (iOS) in Expo dashboard

### 3. Backend Integration

**Files**:
- `server/src/services/pushNotificationService.ts` - FCM service
- `server/src/services/push.ts` - Alternative FCM wrapper

**Endpoints**:
- Token registration handled via user pushTokens array
- Send via `sendPushToUser(userId, payload)`

---

## 📋 Testing Checklist

- [ ] FCM server key configured
- [ ] iOS push certificates configured in Expo
- [ ] Android push key configured in Expo
- [ ] Token registration tested on real device
- [ ] Notification delivery tested
- [ ] Permission flow tested
- [ ] Background notifications tested
- [ ] Notification tap handling tested

---

## 🐛 Troubleshooting

### Token Not Registering
- Check device is real (not simulator)
- Verify permissions granted
- Check Expo configuration

### Notifications Not Delivering
- Verify FCM server key is correct
- Check token is registered in database
- Verify backend service is running
- Check FCM quota limits

---

**Next Steps**: Test on real iOS/Android devices

