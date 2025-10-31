# 💰 IAP Integration Guide - Production Setup

**Status**: Implementation Complete - Needs Real Platform Integration

---

## ✅ What's Implemented

1. **Complete IAP Service** (`apps/mobile/src/services/IAPProductsService.ts`)
   - Product catalog (9 products from business.md)
   - Purchase flow
   - Balance tracking
   - Item usage

2. **Backend Endpoints** (`server/src/controllers/iapController.ts`)
   - `/api/iap/process-purchase` - Process IAP purchase
   - `/api/iap/balance` - Get user balance
   - `/api/iap/use-item` - Use consumable items

3. **Receipt Validation** (Basic - needs platform-specific)

---

## 🔧 Integration Steps

### Option 1: RevenueCat (Recommended - Already Partially Integrated)

**Current State**: `apps/mobile/src/providers/PremiumProvider.tsx` uses RevenueCat

**Steps**:
1. Install RevenueCat SDK (if not already):
   ```bash
   pnpm add react-native-purchases
   ```

2. Configure RevenueCat:
   - Set `EXPO_PUBLIC_RC_IOS` and `EXPO_PUBLIC_RC_ANDROID` env vars
   - Already initialized in `apps/mobile/src/config/revenuecat.ts`

3. Update `IAPService.ts` to use RevenueCat instead of simulation:
   ```typescript
   import Purchases from 'react-native-purchases';
   
   // Replace simulatePurchase with:
   async purchaseProduct(productId: string): Promise<Purchase> {
     const { customerInfo } = await Purchases.purchaseProduct(productId);
     // Convert RevenueCat response to our Purchase format
   }
   ```

4. Configure products in RevenueCat dashboard:
   - Super Like Single: `superlike_single`
   - Super Like Pack: `superlike_pack_10`
   - Boost 30min: `boost_30min`
   - etc.

### Option 2: Expo In-App Purchases

**Steps**:
1. Install:
   ```bash
   pnpm add expo-in-app-purchases
   ```

2. Update `IAPService.ts`:
   ```typescript
   import * as InAppPurchases from 'expo-in-app-purchases';
   
   async initialize(): Promise<void> {
     await InAppPurchases.connectAsync();
     const { results } = await InAppPurchases.getProductsAsync(this.PRODUCT_IDS);
     // Process products
   }
   
   async purchaseProduct(productId: string): Promise<Purchase> {
     await InAppPurchases.purchaseItemAsync(productId);
     // Get receipt and verify
   }
   ```

3. Configure products in:
   - iOS: App Store Connect
   - Android: Google Play Console

### Option 3: react-native-iap

**Steps**:
1. Install:
   ```bash
   pnpm add react-native-iap
   ```

2. Update `IAPService.ts` to use `react-native-iap` APIs

---

## 📋 Products to Configure

### iOS (App Store Connect)
- `com.pawfectmatch.iap.superlike.single`
- `com.pawfectmatch.iap.superlike.pack10`
- `com.pawfectmatch.iap.boost.30min`
- `com.pawfectmatch.iap.filters.monthly`
- `com.pawfectmatch.iap.photo.enhanced`
- `com.pawfectmatch.iap.video.profile`
- `com.pawfectmatch.iap.gift.treat`
- `com.pawfectmatch.iap.gift.toy`
- `com.pawfectmatch.iap.gift.premium`

### Android (Google Play Console)
- `iap_superlike_single`
- `iap_superlike_pack10`
- `iap_boost_30min`
- `iap_filters_monthly`
- `iap_photo_enhanced`
- `iap_video_profile`
- `iap_gift_treat`
- `iap_gift_toy`
- `iap_gift_premium`

---

## ✅ Testing Checklist

- [ ] Products configured in platform dashboards
- [ ] Receipt validation working
- [ ] Balance tracking works
- [ ] Purchase flow tested on real device
- [ ] Restore purchases works
- [ ] Error handling tested

---

**Files to Update**:
- `apps/mobile/src/services/IAPService.ts` - Replace simulation methods
- `apps/mobile/src/services/IAPProductsService.ts` - Already complete ✅

