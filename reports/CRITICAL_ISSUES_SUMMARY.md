# Critical Issues Summary - Quick Reference

## 🚨 BLOCKING LAUNCH ISSUES

### 1. Map Feature - No Activity Creation ❌
**Impact:** Feature is completely broken
**Location:** `apps/mobile/src/screens/MapScreen.tsx`
**Details:** 
- Users cannot create pet activities
- Map only shows demo data
- Socket events don't match
- Actions don't work

**Fix Time:** 2-4 hours

---

### 2. Subscription/Payment Not Implemented ❌
**Impact:** Zero revenue generation
**Location:** `apps/mobile/src/screens/PremiumScreen.tsx`, `SubscriptionManagerScreen.tsx`
**Details:**
- No payment processing
- No receipt validation
- Premium features not gated
- Subscription management broken

**Fix Time:** 12-16 hours

---

### 3. AI Features Are Stubs ❌
**Impact:** Core selling point doesn't work
**Location:** `AIBioScreen.tsx`, `AIPhotoAnalyzerScreen.tsx`, `AICompatibilityScreen.tsx`
**Details:**
- No actual AI processing
- Mock data only
- No OpenAI/Claude integration
- No computer vision

**Fix Time:** 16-24 hours

---

### 4. Home Screen Shows Fake Data ❌
**Impact:** Misleading user experience
**Location:** `apps/mobile/src/screens/HomeScreen.tsx`
**Details:**
- Hardcoded statistics
- Fake activity feed
- No real-time updates
- Badge numbers are fake

**Fix Time:** 4-6 hours

---

### 5. Matches Screen - Filter/Search Broken ❌
**Impact:** Poor UX
**Location:** `apps/mobile/src/screens/MatchesScreen.tsx`
**Details:**
- Filter button does nothing
- Search button does nothing
- API actions are stubs

**Fix Time:** 4-6 hours

---

## ⚠️ HIGH IMPACT ISSUES

### 6. Photo Upload Not Implemented ⚠️
**Impact:** Users can't add pet photos
**Location:** `CreatePetScreen.tsx`, photo upload components
**Fix Time:** 8-10 hours

### 7. Settings Not Persisted ⚠️
**Impact:** User preferences lost
**Location:** Various settings screens
**Fix Time:** 4-6 hours

### 8. No Calling Features ⚠️
**Impact:** Premium feature missing
**Location:** `calling/*` screens commented out
**Fix Time:** 20+ hours (WebRTC)

### 9. No Premium Gating ⚠️
**Impact:** Free users see premium features
**Location:** Throughout app
**Fix Time:** 4-6 hours

### 10. Profile Self-Like Shows Alert ⚠️
**Impact:** Non-functional feature
**Location:** `ProfileScreen.tsx`
**Fix Time:** 1 hour

---

## QUICK FIXES (< 2 hours each)

1. ✅ PinDetailsModal missing `activityTypes` prop - **5 min**
2. ✅ Socket event name mismatch (`pulse_update` vs `pin:update`) - **5 min**
3. ✅ Profile self-like - **30 min**
4. ✅ Settings persistence - **1 hour**
5. ✅ Hardcoded About/Help alerts - **30 min**
6. ✅ Fake badge numbers removal - **1 hour**

---

## ESTIMATED FIX TIMELINE

| Priority | Issues | Hours |
|----------|--------|-------|
| Critical | 5 | 40-50h |
| High | 5 | 36-48h |
| Medium | 15 | 60-80h |
| Low | 20 | 40-60h |
| **TOTAL** | **45** | **176-238h** |

**At 8h/day: 22-30 days of development**

---

## IMMEDIATE ACTIONS REQUIRED

1. **Fix socket event names** (15 min)
2. **Add activityTypes prop to PinDetailsModal** (5 min)  
3. **Implement real stats API** (4 hours)
4. **Add payment gateway** (12 hours)
5. **Implement photo upload** (8 hours)

**Minimum viable fix: 25-30 hours**

