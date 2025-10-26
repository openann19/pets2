# Premium Gating, Voice Playback, and Swipe Rewind Features

## Summary

This document describes the implementation of premium gating, voice message playback with seek, and swipe rewind functionality for the PawfectMatch mobile app.

## Features Implemented

### 1. Premium Gating System

#### Files Created/Modified:
- `apps/mobile/src/hooks/usePremium.ts` - Premium status hook with feature checks
- `apps/mobile/src/components/premium/withPremiumGuard.tsx` - HOC for protecting screens
- `apps/mobile/src/components/premium/PremiumGate.tsx` - Component for inline feature gating

#### Features:
- Real-time premium status polling
- Centralized feature map (superLike, rewind, boost, arTrails, advancedFilters, unlimitedLikes)
- Two protection mechanisms:
  - `withPremiumGuard` - Protects entire screens
  - `PremiumGate` - Protects inline features/components

#### Usage Example:
```tsx
// Protect entire screen
const ProtectedScreen = withPremiumGuard(MyScreen, "rewind");

// Protect inline feature
<PremiumGate feature="arTrails">
  <FAB icon="👁️" onPress={() => navigation.navigate("ARScentTrails")} />
</PremiumGate>
```

### 2. Swipe Rewind/Undo

#### Files Created:
- `apps/mobile/src/services/swipeService.ts` - API service methods (like, pass, superLike, rewind)
- `apps/mobile/src/hooks/useSwipeUndo.ts` - Hook for capturing and undoing swipes
- `apps/mobile/e2e/swipe.rewind.e2e.ts` - E2E test

#### Files Modified:
- `apps/mobile/src/screens/SwipeScreen.tsx` - Integrated undo functionality
- `apps/mobile/src/components/feedback/UndoPill.tsx` - Added testID support

#### Features:
- Captures last swipe action (pet ID, direction, index)
- API endpoint for rewind (`/swipe/rewind`)
- UndoPill component with progress bar
- E2E test for swipe rewind flow

### 3. Voice Playback with Seek

#### Files Created:
- `apps/mobile/src/components/chat/VoicePlayer.tsx` - Audio player with Expo AV
- `apps/mobile/tests/imagePipeline.ssim.test.ts` - Golden SSIM tests for image pipeline

#### Files Modified:
- `apps/mobile/src/components/chat/VoiceWaveform.tsx` - Added seek handlers (tap/drag support)

#### Features:
- Expo AV integration for audio playback
- Waveform visualization with progress indicator
- Seek functionality (tap or drag on waveform to scrub)
- Playback status tracking
- Time formatting (M:SS)

### 4. Admin Analytics Realtime Screen

#### File Created:
- `apps/mobile/src/screens/admin/AnalyticsRealtimeScreen.tsx`

#### Features:
- Real-time event analytics (last hour)
- Recent errors display
- Auto-refresh every 15 seconds
- Pull-to-refresh support

### 5. Golden SSIM Tests

#### Files Created:
- `apps/mobile/tests/imagePipeline.ssim.test.ts` - SSIM comparison tests
- Test directory structure: `apps/mobile/tests/golden/{input,expected}/`

#### Features:
- Structural Similarity Index (SSIM) for image quality checks
- Threshold: ≥ 0.98 for golden comparisons
- Protects image pipeline from regressions

## API Endpoints

### Premium
- `GET /premium/status` - Get current subscription status

### Swipe
- `POST /pets/like` - Like a pet
- `POST /pets/pass` - Pass a pet
- `POST /pets/super-like` - Super like a pet
- `POST /swipe/rewind` - Rewind last swipe

### Admin
- `GET /admin/analytics/realtime` - Get realtime analytics

## Testing

### Unit Tests
- Premium status hook tests
- Swipe undo hook tests
- Voice waveform seek functionality tests

### E2E Tests
- `swipe.rewind.e2e.ts` - Tests swipe and undo flow
  - Swipes right on a card
  - Taps undo pill
  - Verifies card reappears

### Golden Tests
- SSIM tests for image pipeline
- Requires golden fixtures in `tests/golden/`
- Skipped if files don't exist

## Integration Notes

### SwipeScreen Integration
- Added `useSwipeUndo` hook
- Captures swipe actions before execution
- Displays UndoPill after each swipe
- testIDs added for E2E testing:
  - `swipe-card-${index}` - Swipeable cards
  - `undo-pill` - Undo pill component

### Voice Waveform Integration
- Waveform supports tap/drag seeking
- Progress indicator shows playback position
- Animated bars during playback

### Premium Integration
- Query premium status on app init
- Feature checks memoized for performance
- Redirects to Premium screen when feature not available

## Dependencies

### New Dependencies Required
- `ssim.js` - For structural similarity comparison
- `sharp` - For image processing in tests

### Existing Dependencies Used
- `expo-av` - Audio playback
- `react-native-reanimated` - Animations
- `@react-navigation/native` - Navigation

## Configuration

### Environment Variables
```env
# Required for API calls
EXPO_PUBLIC_API_URL=<api_url>
```

## Future Enhancements

1. **Premium Features**:
   - Add more premium tiers
   - Implement usage limits for free users
   - Add feature analytics

2. **Swipe Rewind**:
   - Show rewind button only for premium users
   - Add rewind history
   - Limit rewind attempts per day

3. **Voice Messages**:
   - Add voice message transcription
   - Support for voice message reactions
   - Export voice messages

4. **Analytics**:
   - Add more metrics to admin dashboard
   - Real-time user activity tracking
   - Custom date ranges

5. **Golden Tests**:
   - Add more image fixtures
   - Test different image formats
   - Test video processing

## Security Considerations

1. **Premium Status**:
   - Server-side validation required
   - Do not trust client-side status alone
   - Implement server-side feature gates

2. **Swipe Rewind**:
   - Rate limit rewind endpoints
   - Validate user ownership
   - Prevent abuse

3. **Admin Analytics**:
   - Require admin role
   - Sanitize error messages
   - Do not expose sensitive data

## Performance Notes

1. **Premium Status**:
   - Polling interval configurable
   - Memoized feature checks
   - Status cached for 60 seconds

2. **Voice Playback**:
   - Audio buffering handled by Expo AV
   - Waveform rendered efficiently
   - Seek operations smooth

3. **Swipe Rewind**:
   - Optimistic UI updates
   - Background API calls
   - Graceful error handling

## Compliance

All features implemented according to:
- React Native best practices
- TypeScript strict mode
- Accessibility guidelines
- Mobile-first design principles

## Maintenance

### Regular Tasks
1. Update SSIM golden files when image pipeline changes
2. Monitor premium status accuracy
3. Review admin analytics for anomalies
4. Update E2E tests with feature changes

### Troubleshooting
1. If premium status not updating, check API endpoint
2. If swipe rewind fails, verify backend endpoint
3. If voice playback issues, check Expo AV configuration
4. If SSIM tests fail, regenerate golden files

