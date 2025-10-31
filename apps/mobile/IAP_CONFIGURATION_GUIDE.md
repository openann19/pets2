# 💰 IAP RevenueCat Configuration Guide

**Status**: ✅ Implementation Complete - Needs Configuration

---

## 📋 Quick Setup Checklist

- [ ] Install `react-native-purchases` package
- [ ] Create RevenueCat account
- [ ] Get API keys from RevenueCat dashboard
- [ ] Configure environment variables
- [ ] Test purchase flow on device

---

## 🚀 Step-by-Step Configuration

### Step 1: Install RevenueCat Package

```bash
cd apps/mobile
pnpm add react-native-purchases
```

**Note**: The code already handles missing package gracefully with fallback mode.

---

### Step 2: Create RevenueCat Account

1. Go to https://app.revenuecat.com
2. Sign up for free account
3. Create new project: "PawfectMatch Premium"
4. Configure platforms:
   - iOS: Connect to App Store Connect
   - Android: Connect to Google Play Console

---

### Step 3: Get API Keys

1. In RevenueCat dashboard, go to **Project Settings** → **API Keys**
2. Copy the following keys:
   - **iOS Public SDK Key** (starts with `appl_`)
   - **Android Public SDK Key** (starts with `goog_`)

---

### Step 4: Configure Environment Variables

#### Option A: Using `.env` file (Recommended for Development)

Create or update `apps/mobile/.env`:

```bash
# RevenueCat API Keys
EXPO_PUBLIC_RC_IOS=appl_your_ios_key_here
EXPO_PUBLIC_RC_ANDROID=goog_your_android_key_here
```

#### Option B: Using `app.config.cjs` (Recommended for Production)

Update `apps/mobile/app.config.cjs` in the `extra` section:

```javascript
extra: {
  // ... existing config ...
  revenueCat: {
    ios: process.env.EXPO_PUBLIC_RC_IOS || '',
    android: process.env.EXPO_PUBLIC_RC_ANDROID || '',
  },
}
```

**Note**: The code currently reads from `process.env['EXPO_PUBLIC_RC_IOS']` directly, which works with both approaches when using Expo's environment variable handling.

---

### Step 5: Configure Products in RevenueCat

In RevenueCat dashboard, add products matching these IDs:

#### iOS Products (App Store Connect):
```
com.pawfectmatch.premium.basic.monthly
com.pawfectmatch.premium.premium.monthly
com.pawfectmatch.premium.ultimate.monthly
com.pawfectmatch.premium.basic.yearly
com.pawfectmatch.premium.premium.yearly
com.pawfectmatch.premium.ultimate.yearly
```

#### Android Products (Google Play Console):
```
premium_basic_monthly
premium_premium_monthly
premium_ultimate_monthly
premium_basic_yearly
premium_premium_yearly
premium_ultimate_yearly
```

---

### Step 6: Validate Configuration

Run the validation script:

```bash
cd apps/mobile
node scripts/validate-platform-config.mjs
```

**Expected Output**:
```
✅ react-native-purchases package found
✅ EXPO_PUBLIC_RC_IOS configured
✅ EXPO_PUBLIC_RC_ANDROID configured
```

---

## 🧪 Testing IAP

### Development Testing

1. **Build for Device**:
   ```bash
   pnpm build:android  # or build:ios
   ```

2. **Install on Real Device** (IAP requires real device/sandbox):
   - iOS: Use TestFlight or development build
   - Android: Use development build or Google Play Internal Testing

3. **Test Purchase Flow**:
   - Open Premium screen
   - Select subscription tier
   - Attempt purchase
   - Verify RevenueCat receives purchase event

### Sandbox Testing

**iOS**:
- Use sandbox test accounts from App Store Connect
- Products must be configured in App Store Connect

**Android**:
- Use Google Play Console test accounts
- Products must be configured in Google Play Console

---

## 🔍 Verification Checklist

- [ ] RevenueCat package installed
- [ ] API keys configured in environment
- [ ] Products configured in RevenueCat dashboard
- [ ] Products match IDs in app code
- [ ] App Store Connect products configured (iOS)
- [ ] Google Play Console products configured (Android)
- [ ] Validation script passes
- [ ] Purchase flow works on device

---

## 🐛 Troubleshooting

### "RevenueCat API keys not configured"

**Solution**: Check environment variables are set correctly
```bash
# Verify env vars are loaded
echo $EXPO_PUBLIC_RC_IOS
echo $EXPO_PUBLIC_RC_ANDROID
```

### "Products not loading"

**Causes**:
- Products not configured in RevenueCat dashboard
- Product IDs don't match
- Network connectivity issues
- API keys incorrect

**Solution**:
1. Verify products in RevenueCat dashboard
2. Check product IDs match exactly
3. Check network connectivity
4. Verify API keys are correct

### "Purchase fails"

**Causes**:
- Sandbox/test account not configured
- Backend receipt validation failing
- Network issues

**Solution**:
1. Verify test accounts in App Store Connect/Play Console
2. Check server logs for validation errors
3. Test network connectivity

---

## 📝 Code Location

**IAP Service**: `apps/mobile/src/services/IAPService.ts`
- Initializes RevenueCat
- Handles purchase flow
- Manages product loading

**RevenueCat Config**: `apps/mobile/src/config/revenuecat.ts`
- Initializes RevenueCat with API keys

**Product Definitions**: `apps/mobile/src/hooks/screens/usePremiumScreen.ts`
- Defines subscription tiers
- Maps to product IDs

---

## 🔐 Security Notes

1. **Never commit API keys to git**
   - Use `.env` file (gitignored)
   - Use environment variables in CI/CD
   - Use Expo Secrets for production

2. **Receipt Validation**
   - Always validate purchases on backend
   - Use RevenueCat webhooks for server-side validation
   - Never trust client-side purchase status alone

3. **API Keys**
   - Public SDK keys are safe to use in client
   - Never use secret keys in mobile app
   - Rotate keys if compromised

---

## 📚 Resources

- [RevenueCat Docs](https://docs.revenuecat.com/)
- [React Native Purchases](https://github.com/RevenueCat/react-native-purchases)
- [App Store Connect IAP Guide](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing](https://developer.android.com/google/play/billing)

---

**Status**: ⚠️ **Configuration Required** - Code ready, needs API keys

