# Mobile App Fixes Implementation Plan
**Date**: January 2025  
**Scope**: Address 4 Critical Next Steps  
**Status**: In Progress

---

## 🎯 Goals

1. ✅ Address TypeScript safety first (largest impact)
2. ✅ Fix accessibility issues (legal/compliance risk)
3. ✅ Complete GDPR verification and tests
4. ✅ Increase test coverage to 75%+

---

## Phase 1: TypeScript Safety (Priority: CRITICAL)

### Current State
- **1,534 instances** of `any` type usage across 338 files
- TypeScript compilation showing **100+ errors**
- Navigation type issues: `(navigation as any)` in 3+ files
- Event handler types missing: `(event: any) => {}` patterns

### Strategy

#### 1.1 Enable Strict Mode
- [ ] Update `tsconfig.app.json` to enable strict checks
- [ ] Add `strict: true` and related options
- [ ] Fix resulting errors incrementally

#### 1.2 Fix Navigation Types
**Files to fix:**
- `apps/mobile/src/screens/ModerationToolsScreen.tsx` - `(navigation as any).navigate(...)`
- `apps/mobile/src/screens/AdvancedFiltersScreen.tsx` - Navigation type issues
- `apps/mobile/src/screens/adoption/PetDetailsScreen.tsx` - Navigation type issues

**Approach:**
```typescript
// Before:
(navigation as any).navigate('AdminUploads');

// After:
navigation.navigate('AdminUploads');
// With proper type: RootStackScreenProps<'ModerationTools'>
```

#### 1.3 Fix Event Handler Types
**Common patterns:**
- `handleScroll = (event: any) => {}` → `handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {}`
- `onPress = (e: any) => {}` → `onPress = () => {}` or proper event type
- `handleChange = (value: any) => {}` → Proper value types

#### 1.4 Fix Animation Types
**Files with animation issues:**
- `apps/mobile/src/components/MotionPrimitives.tsx` - `entering: ComplexAnimationBuilder | undefined` issue
- `apps/mobile/src/components/common/LoadingSkeleton.tsx` - Animated.View style issues

**Approach:**
```typescript
// Fix optional props handling with exactOptionalPropertyTypes
entering={animationBuilder ?? undefined} // Use nullish coalescing
```

#### 1.5 Fix Message/API Response Types
**Issues:**
- Multiple `Message` type definitions conflicting
- API responses using `Record<string, unknown>`

**Files:**
- `apps/mobile/src/components/chat/MessageSearch.tsx` - Message type mismatch
- `apps/mobile/src/components/chat/ReplyThreadView.tsx` - Message type issues
- `apps/mobile/src/hooks/useChatData.ts` - Message type definition

**Approach:**
- Unify Message types from `@pawfectmatch/core`
- Create proper API response types
- Remove duplicate type definitions

### Progress Tracking
- [x] Audit complete - 1,534 `any` instances identified
- [ ] Navigation types fixed (0/3 files)
- [ ] Event handlers fixed (0/50+ files)
- [ ] Animation types fixed (0/10+ files)
- [ ] Message/API types fixed (0/20+ files)
- [ ] Strict mode enabled and all errors resolved

**Target**: Reduce `any` usage by 50% in Phase 1, resolve all navigation type issues

---

## Phase 2: Accessibility Fixes (Priority: CRITICAL - Legal Risk)

### Current State
- **11 critical A11y violations**
- Missing ARIA labels on buttons
- Touch targets < 44x44pt
- No Reduce Motion support
- Keyboard navigation incomplete

### Strategy

#### 2.1 Add ARIA Labels to All Buttons
**Priority Components:**
1. `apps/mobile/src/components/widgets/SwipeWidget.tsx`
2. `apps/mobile/src/components/widgets/MatchWidget.tsx`
3. `apps/mobile/src/components/cards/SwipeCardMobile.tsx`
4. `apps/mobile/src/screens/ChatScreen.tsx`
5. `apps/mobile/src/screens/ProfileScreen.tsx`
6. `apps/mobile/src/components/chat/MessageInput.tsx`

**Approach:**
```typescript
// Before:
<TouchableOpacity onPress={handleLike}>
  <Icon name="heart" />
</TouchableOpacity>

// After:
<TouchableOpacity
  onPress={handleLike}
  accessibilityRole="button"
  accessibilityLabel="Like this pet"
  accessibilityHint="Double tap to like this pet profile"
>
  <Icon name="heart" />
</TouchableOpacity>
```

#### 2.2 Fix Touch Target Sizes
**Requirements:**
- All buttons minimum 44x44pt (iOS) or 48dp (Android)
- Add padding to ensure targets are large enough

**Approach:**
```typescript
const buttonStyle = {
  minWidth: 44,
  minHeight: 44,
  padding: theme.spacing.md, // Ensure adequate touch area
};
```

#### 2.3 Implement Reduce Motion Support
**Files to update:**
- All animated components
- Screen transitions
- Gesture handlers

**Approach:**
```typescript
import { useReducedMotion } from 'react-native-reanimated';

const shouldReduceMotion = useReducedMotion();
const animationConfig = shouldReduceMotion 
  ? { duration: 0 } 
  : { duration: 300 };
```

#### 2.4 Fix Keyboard Navigation
- Add `accessible={true}` to all interactive elements
- Ensure TabOrder management
- Test with Switch Control

#### 2.5 Fix Color Contrast
- Audit all text/background combinations
- Ensure 4.5:1 contrast ratio minimum
- Add visual indicators beyond color

### Progress Tracking
- [ ] ARIA labels added (0/50+ components)
- [ ] Touch targets fixed (0/30+ components)
- [ ] Reduce Motion implemented (0/20+ components)
- [ ] Keyboard navigation fixed
- [ ] Color contrast verified
- [ ] TalkBack/VoiceOver tested

**Target**: Zero critical A11y issues, WCAG 2.1 Level AA compliance

---

## Phase 3: GDPR Verification & Tests (Priority: HIGH)

### Current State
- ✅ GDPR service implemented (`gdprService.ts`)
- ✅ DeactivateAccountScreen UI exists
- ⚠️ Backend endpoints need verification
- ❌ E2E tests missing

### Strategy

#### 3.1 Verify Backend Endpoints
**Endpoints to verify:**
- `POST /api/account/delete` - Returns grace period
- `GET /api/account/export-data` - Returns downloadable data
- `POST /api/account/confirm-deletion` - Finalizes deletion
- `POST /api/account/cancel-deletion` - Cancels deletion

**Approach:**
1. Test each endpoint manually
2. Verify response types match contracts
3. Test grace period logic
4. Verify email confirmation flow

#### 3.2 Add E2E Tests
**Test file**: `e2e/gdpr-delete.e2e.ts`

**Test scenarios:**
```typescript
describe('GDPR Account Deletion Flow', () => {
  it('should request account deletion with password', async () => {
    // Navigate to Settings
    // Tap "Request Account Deletion"
    // Enter password
    // Verify grace period countdown appears
  });

  it('should allow cancellation during grace period', async () => {
    // Request deletion
    // Cancel deletion
    // Verify cancellation success
  });

  it('should export user data successfully', async () => {
    // Request data export
    // Verify download
    // Verify data completeness
  });

  it('should complete deletion after grace period', async () => {
    // Request deletion
    // Wait for grace period (mocked)
    // Confirm deletion
    // Verify account deleted
  });
});
```

#### 3.3 Integration Tests
**Test file**: `apps/mobile/src/services/__tests__/gdprService.test.ts`

**Test coverage:**
- Service methods
- Error handling
- Response parsing
- Grace period logic

### Progress Tracking
- [ ] Backend endpoints verified
- [ ] E2E tests written (0/4 scenarios)
- [ ] Integration tests written
- [ ] Email confirmation flow tested
- [ ] Data export tested end-to-end

**Target**: Full GDPR flow tested and verified working

---

## Phase 4: Increase Test Coverage to 75%+ (Priority: HIGH)

### Current State
- **~40-50% coverage** (Target: 75%+)
- Missing unit tests for hooks
- Missing E2E tests for critical flows
- Missing integration tests

### Strategy

#### 4.1 Unit Tests for Hooks
**Priority hooks:**
1. `apps/mobile/src/hooks/screens/useChatScreen.ts`
2. `apps/mobile/src/hooks/screens/useSwipeScreen.ts`
3. `apps/mobile/src/hooks/screens/useSettingsScreen.ts`
4. `apps/mobile/src/hooks/screens/useHomeScreen.ts`
5. `apps/mobile/src/hooks/useChatData.ts`
6. `apps/mobile/src/hooks/useSwipeData.ts`

**Approach:**
```typescript
describe('useChatScreen', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChatScreen({ ... }));
    expect(result.current.data.messages).toEqual([]);
  });

  it('should handle sending messages', async () => {
    // Test message sending logic
  });
});
```

#### 4.2 E2E Tests for Critical Flows
**Priority flows:**
1. **Premium Checkout** (`e2e/premium-checkout.e2e.ts`)
   - Subscribe to premium
   - Verify subscription active
   - Manage subscription

2. **Chat Reactions/Attachments** (`e2e/chat-reactions.e2e.ts`)
   - Send reaction to message
   - Send attachment
   - Send voice note

3. **Swipe Flow** (`e2e/swipe.e2e.ts`)
   - Swipe right (like)
   - Swipe left (pass)
   - Super like
   - Match creation

4. **Onboarding** (`e2e/onboarding.e2e.ts`)
   - Complete onboarding steps
   - Create pet profile
   - Set preferences

5. **Deep Links** (`e2e/deeplinks.e2e.ts`)
   - Chat deep link
   - Match deep link
   - Notification deep link

#### 4.3 Integration Tests
**Priority areas:**
1. **Stripe Integration** (`apps/mobile/src/services/__tests__/stripe.integration.test.ts`)
2. **WebRTC** (`apps/mobile/src/services/__tests__/webrtc.integration.test.ts`)
3. **Push Notifications** (`apps/mobile/src/services/__tests__/notifications.integration.test.ts`)

#### 4.4 Snapshot Tests
**Remaining screens** (11 screens):
- ChatScreen
- ProfileScreen
- MatchesScreen
- PremiumScreen
- DeactivateAccountScreen
- SafetyCenterScreen
- AICompatibilityScreen
- PetProfileScreen
- EditPetScreen
- NotificationPreferencesScreen
- HelpSupportScreen

### Progress Tracking
- [ ] Hook unit tests (0/10+ hooks)
- [ ] E2E tests (0/5 flows)
- [ ] Integration tests (0/3 areas)
- [ ] Snapshot tests (0/11 screens)
- [ ] Coverage report shows 75%+

**Target**: 75% global coverage, 90% changed lines coverage

---

## 📊 Implementation Timeline

### Week 1: TypeScript Safety Foundation
- Days 1-2: Fix navigation types (3 files)
- Days 3-4: Fix event handlers (10 critical files)
- Day 5: Enable strict mode, fix resulting errors

### Week 2: TypeScript Safety Continued
- Days 1-3: Fix animation types
- Days 4-5: Fix Message/API types

### Week 3: Accessibility
- Days 1-2: Add ARIA labels (50+ components)
- Days 3-4: Fix touch targets & Reduce Motion
- Day 5: Keyboard navigation & contrast

### Week 4: GDPR & Tests
- Days 1-2: GDPR backend verification & E2E tests
- Days 3-5: Unit tests for hooks

### Week 5: Test Coverage
- Days 1-3: E2E tests for critical flows
- Days 4-5: Integration tests & snapshot tests

---

## 🎯 Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript `any` types | 1,534 | < 100 | 🟡 |
| TypeScript errors | 100+ | 0 | 🔴 |
| A11y critical issues | 11 | 0 | 🔴 |
| Test coverage | ~40-50% | ≥75% | 🔴 |
| GDPR E2E tests | 0 | 4+ | 🔴 |
| Navigation type fixes | 0 | 3 | 🟡 |

---

## 📝 Notes

- Work incrementally - fix errors as they appear
- Test after each phase
- Document breaking changes
- Update work items as tasks complete
- Generate reports after each phase

---

**Last Updated**: 2025-01-XX  
**Next Review**: After Phase 1 completion

