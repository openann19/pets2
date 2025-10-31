# Push Notification Configuration Guide

**Date:** January 30, 2025  
**Status:** Configuration Required  
**Purpose:** Complete setup guide for iOS and Android push notifications

---

## 📱 Overview

This guide covers the complete setup process for push notifications on both iOS and Android platforms using Expo and Firebase Cloud Messaging (FCM).

---

## ✅ Current Implementation Status

### Infrastructure ✅ COMPLETE

- ✅ Mobile notification service: `apps/mobile/src/services/notifications.ts`
- ✅ Backend push service: `server/src/services/pushNotificationService.ts`
- ✅ FCM integration: Configured
- ✅ Token registration: Implemented
- ✅ Android channels: Configured
- ✅ Notification hooks: `apps/mobile/src/hooks/useNotifications.ts`

### Configuration ⚠️ REQUIRED

- ⚠️ FCM Server Key: Needs to be set in production
- ⚠️ iOS Push Certificates: Needs to be configured in Expo
- ⚠️ Android Push Key: Needs to be configured in Expo
- ⚠️ Testing: Requires real device testing

---

## 🔧 Setup Steps

### 1. Firebase Cloud Messaging (FCM) Setup

#### Step 1.1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Cloud Messaging API

#### Step 1.2: Get FCM Server Key

1. Navigate to Firebase Console → Project Settings → Cloud Messaging
2. Copy the **Server Key** (legacy API key)
3. Add to server `.env` file:
   ```bash
   FCM_SERVER_KEY=your-server-key-here
   ```

#### Step 1.3: Configure Android App in Firebase

1. Add Android app to Firebase project
2. Package name: `com.pawfectmatch.premium`
3. Download `google-services.json`
4. Place in `apps/mobile/android/app/google-services.json`

---

### 2. Expo Push Notification Setup

#### Step 2.1: Configure Expo Project

1. Go to [Expo Dashboard](https://expo.dev/)
2. Select your project: `pawfectmatch-premium`
3. Navigate to Credentials

#### Step 2.2: iOS Push Certificates

**For Production:**
1. Generate Apple Push Notification service SSL Certificate
2. Upload to Expo:
   - Go to Expo Dashboard → Credentials → iOS
   - Upload `.p12` certificate
   - Or use Expo's automatic certificate generation

**Required Apple Developer Account:**
- Apple Developer Program membership
- APNs certificate for production
- App ID configured with Push Notifications capability

#### Step 2.3: Android Push Key

1. Generate FCM Server Key (already done in Firebase)
2. Configure in Expo:
   - Go to Expo Dashboard → Credentials → Android
   - Add Firebase Cloud Messaging Server Key
   - Or use Expo's automatic setup

---

### 3. Backend Configuration

#### Step 3.1: Environment Variables

Add to `server/.env`:

```bash
# Firebase Cloud Messaging
FCM_SERVER_KEY=your-firebase-server-key-here

# Environment
NODE_ENV=production
```

#### Step 3.2: Verify Push Service

Test push notification service:

```typescript
// Test file: server/src/services/pushNotificationService.test.ts
import { sendPushToUser } from './pushNotificationService';

// Test sending a notification
await sendPushToUser('user-id', {
  title: 'Test Notification',
  body: 'This is a test notification',
  data: { type: 'test' }
});
```

---

### 4. Mobile App Configuration

#### Step 4.1: Verify Notification Service

The notification service is already configured in:
- `apps/mobile/src/services/notifications.ts`
- Initializes on app start
- Registers token with backend

#### Step 4.2: Request Permissions

Permissions are requested via:
- `NotificationPermissionPrompt` component
- Custom prompt before system prompt
- Handles permission states

#### Step 4.3: Test on Real Device

**iOS:**
```bash
cd apps/mobile
pnpm ios
# Test on physical iOS device (simulator doesn't support push)
```

**Android:**
```bash
cd apps/mobile
pnpm android
# Test on physical Android device or emulator
```

---

## 🧪 Testing Checklist

### Pre-Production Testing

- [ ] FCM server key configured in production environment
- [ ] iOS push certificates uploaded to Expo
- [ ] Android push key configured in Expo
- [ ] Token registration tested on real device
- [ ] Notification delivery tested (iOS)
- [ ] Notification delivery tested (Android)
- [ ] Permission flow tested
- [ ] Background notifications tested
- [ ] Notification tap handling tested
- [ ] Deep linking from notifications tested

### Notification Types to Test

- [ ] Match notifications
- [ ] Message notifications
- [ ] Like notifications
- [ ] System notifications
- [ ] Background notifications
- [ ] Foreground notifications

---

## 🐛 Troubleshooting

### Token Not Registering

**Symptoms:**
- No push token received
- Token registration fails

**Solutions:**
1. Verify device is real (not simulator for iOS)
2. Check permissions are granted
3. Verify Expo configuration
4. Check network connectivity
5. Review logs: `apps/mobile/src/services/notifications.ts`

### Notifications Not Delivering

**Symptoms:**
- Token registered but no notifications received

**Solutions:**
1. Verify FCM server key is correct
2. Check backend logs for errors
3. Verify token is stored in user's `pushTokens` array
4. Test with FCM console directly
5. Check device notification settings

### iOS-Specific Issues

**Certificate Problems:**
- Verify APNs certificate is valid
- Check certificate hasn't expired
- Ensure certificate matches bundle ID

**Permission Issues:**
- Verify notification permissions are granted
- Check iOS notification settings
- Test permission prompts

### Android-Specific Issues

**Channel Configuration:**
- Verify notification channels are created
- Check channel importance settings
- Test different channel types

**FCM Registration:**
- Verify `google-services.json` is in correct location
- Check Firebase project configuration
- Verify package name matches

---

## 📊 Monitoring & Analytics

### Metrics to Track

- Token registration rate
- Notification delivery rate
- Notification open rate
- Permission grant rate
- Error rates

### Logging

All notification events are logged:
- Token registration: `logger.info('Push token registered', { token })`
- Delivery failures: `logger.error('Push notification failed', { error })`
- Success: `logger.info('Push notification sent successfully')`

---

## 🔐 Security Considerations

### Best Practices

1. **Secure Token Storage:**
   - Tokens stored in user's database record
   - No tokens in client-side storage
   - Tokens expire and refresh automatically

2. **API Key Security:**
   - FCM server key stored in environment variables
   - Never commit to version control
   - Use different keys for dev/prod

3. **User Privacy:**
   - Users can opt-out of push notifications
   - Respect notification preferences
   - Clear notification data handling

---

## 📝 Next Steps

### Immediate (Before Store Submission)

1. **Configure FCM Server Key:**
   - [ ] Add to production environment
   - [ ] Test token registration
   - [ ] Verify notification delivery

2. **Configure iOS Certificates:**
   - [ ] Generate APNs certificate
   - [ ] Upload to Expo dashboard
   - [ ] Test on real iOS device

3. **Configure Android Push Key:**
   - [ ] Add FCM server key to Expo
   - [ ] Verify `google-services.json` is in place
   - [ ] Test on Android device

### Short Term (Within 1 Week)

1. **Complete Testing:**
   - [ ] Test all notification types
   - [ ] Test permission flows
   - [ ] Test deep linking from notifications
   - [ ] Test background notifications

2. **Documentation:**
   - [ ] Document notification payload structure
   - [ ] Create notification testing guide
   - [ ] Document error handling

---

## 📚 References

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)

---

**Last Updated:** January 30, 2025  
**Status:** ⚠️ **CONFIGURATION REQUIRED**  
**Next Review:** After configuration completion

