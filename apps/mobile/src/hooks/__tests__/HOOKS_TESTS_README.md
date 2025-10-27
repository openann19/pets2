# Comprehensive Hooks Test Suite

## Overview

This test suite provides comprehensive coverage for all 48+ custom hooks in the PawfectMatch mobile application. The tests are organized by category and include unit tests, integration tests, and performance tests.

## Test Organization

### 1. Animation Hooks (16 hooks)

**Location**: `/hooks/animations/`

#### Hooks Tested:
- `useEntranceAnimation` - Entrance animations (fadeIn, slideIn, scaleIn)
- `useFloatingEffect` - Floating/bobbing animations
- `useGlowAnimation` - Glow effect animations
- `useGlowEffect` - Glow with shadow effects
- `useHapticFeedback` - Device haptic feedback
- `useLoadingAnimation` - Loading spinner animations
- `useMagneticEffect` - Magnetic attraction effects
- `usePageTransition` - Page transition animations
- `useParallaxEffect` - Parallax scrolling effects
- `usePressAnimation` - Press/tap animations
- `usePulseEffect` - Pulsing animations
- `useRippleEffect` - Material Design ripple effects
- `useShimmerEffect` - Shimmer loading effects
- `useSpringAnimation` - Spring physics animations
- `useStaggeredAnimation` - Staggered multi-item animations
- `useSwipeGesture` - Swipe gesture detection

**Test Coverage**:
- ✅ Animation initialization
- ✅ Configuration options
- ✅ Animation lifecycle
- ✅ Gesture handling
- ✅ Performance optimization
- ✅ Accessibility (reduced motion)

### 2. Chat Hooks (3 hooks)

**Location**: `/hooks/chat/`

#### Hooks Tested:
- `useChatInput` - Chat input management
- `useChatScroll` - Chat scroll position management
- `useMessageActions` - Message reactions, edits, deletes

**Test Coverage**:
- ✅ Input validation
- ✅ Message sending
- ✅ Scroll behavior
- ✅ Auto-scroll on new messages
- ✅ Message actions (react, edit, delete, forward)
- ✅ Error handling

### 3. Domain Hooks - AI (3 hooks)

**Location**: `/hooks/domains/ai/`

#### Hooks Tested:
- `useAIBio` - AI bio generation
- `useAICompatibility` - Compatibility scoring
- `useAIPhotoAnalyzer` - Photo quality analysis

**Test Coverage**:
- ✅ API calls
- ✅ Loading states
- ✅ Error handling
- ✅ Data caching
- ✅ Regeneration
- ✅ Result validation

### 4. Domain Hooks - GDPR (3 hooks)

**Location**: `/hooks/domains/gdpr/`

#### Hooks Tested:
- `useAccountDeletion` - Account deletion workflow
- `useDataExport` - User data export
- `useGDPRStatus` - GDPR status tracking

**Test Coverage**:
- ✅ Deletion initiation
- ✅ Grace period management
- ✅ Cancellation during grace period
- ✅ Data export generation
- ✅ Status tracking
- ✅ Compliance verification

### 5. Domain Hooks - Onboarding (4 hooks)

**Location**: `/hooks/domains/onboarding/`

#### Hooks Tested:
- `usePetProfileSetup` - Pet profile creation
- `usePreferencesSetup` - User preferences
- `useUserIntent` - User intent determination
- `useWelcome` - Welcome flow management

**Test Coverage**:
- ✅ Form validation
- ✅ Photo upload
- ✅ Data persistence
- ✅ Flow progression
- ✅ Error recovery
- ✅ Completion tracking

### 6. Domain Hooks - Premium (3 hooks)

**Location**: `/hooks/domains/premium/`

#### Hooks Tested:
- `useFeatureGating` - Premium feature access
- `usePremiumStatus` - Premium subscription status
- `useSubscriptionState` - Subscription state management

**Test Coverage**:
- ✅ Feature availability
- ✅ Subscription validation
- ✅ Expiration tracking
- ✅ Upgrade prompts
- ✅ Billing cycle management
- ✅ Grace period handling

### 7. Domain Hooks - Profile (3 hooks)

**Location**: `/hooks/domains/profile/`

#### Hooks Tested:
- `usePhotoManagement` - Profile photo management
- `useProfileData` - Profile data fetching
- `useProfileUpdate` - Profile updates

**Test Coverage**:
- ✅ Photo upload/delete
- ✅ Photo reordering
- ✅ Data caching
- ✅ Refresh functionality
- ✅ Validation
- ✅ Error handling

### 8. Domain Hooks - Safety (3 hooks)

**Location**: `/hooks/domains/safety/`

#### Hooks Tested:
- `useBlockedUsers` - Blocked users management
- `useModerationTools` - Moderation tools
- `useSafetyCenter` - Safety information

**Test Coverage**:
- ✅ Block/unblock users
- ✅ Report content
- ✅ Safety settings
- ✅ Blocked list management
- ✅ Report tracking
- ✅ Safety tips

### 9. Domain Hooks - Settings (2 hooks)

**Location**: `/hooks/domains/settings/`

#### Hooks Tested:
- `useSettingsPersistence` - Local settings persistence
- `useSettingsSync` - Server settings sync

**Test Coverage**:
- ✅ Local storage
- ✅ Server sync
- ✅ Conflict resolution
- ✅ Offline mode
- ✅ Data validation
- ✅ Sync status tracking

### 10. Domain Hooks - Social (3 hooks)

**Location**: `/hooks/domains/social/`

#### Hooks Tested:
- `useLeaderboard` - Leaderboard data
- `useMemoryWeave` - Memory entries
- `useStories` - Stories management

**Test Coverage**:
- ✅ Data fetching
- ✅ Pagination
- ✅ Filtering
- ✅ Sorting
- ✅ User interactions
- ✅ Sharing functionality

### 11. Navigation Hooks (3 hooks)

**Location**: `/hooks/navigation/`

#### Hooks Tested:
- `useScrollOffsetTracker` - Scroll position tracking
- `useTabDoublePress` - Tab double-press detection
- `useTabReselectRefresh` - Tab reselection refresh

**Test Coverage**:
- ✅ Scroll persistence
- ✅ Double-tap detection
- ✅ Timing validation
- ✅ Auto-refresh
- ✅ Loading states
- ✅ Error recovery

### 12. Performance Hooks (1 hook)

**Location**: `/hooks/performance/`

#### Hooks Tested:
- `useOptimizedListConfig` - List optimization

**Test Coverage**:
- ✅ Batch size optimization
- ✅ Device capability detection
- ✅ Performance metrics
- ✅ Memory efficiency
- ✅ Rendering optimization

### 13. Utility Hooks (8 hooks)

**Location**: `/hooks/` (root level)

#### Hooks Tested:
- `useInteractionMetrics` - Interaction tracking
- `useNotifications` - Notification management
- `usePhotoEditor` - Photo editing
- `useReducedMotion` - Accessibility (reduced motion)
- `useShake` - Device shake detection
- `useSocket` - WebSocket management
- `useThemeToggle` - Theme switching
- `useUploadQueue` - Upload queue management

**Test Coverage**:
- ✅ State management
- ✅ Event handling
- ✅ Error recovery
- ✅ Resource cleanup
- ✅ Performance optimization
- ✅ Accessibility compliance

## Test Patterns

### Unit Tests
Each hook has unit tests covering:
- Initialization
- State updates
- Event handling
- Error scenarios
- Edge cases

### Integration Tests
Tests for:
- Multiple hooks working together
- State synchronization
- Data flow between hooks
- Complex user scenarios

### Performance Tests
Tests for:
- Unnecessary re-renders
- Memory leaks
- Dependency optimization
- Large data handling

### Accessibility Tests
Tests for:
- Reduced motion support
- Screen reader compatibility
- Keyboard navigation
- Color contrast

## Running Tests

### Run All Hook Tests
```bash
pnpm test -- hooks
```

### Run Specific Category
```bash
pnpm test -- hooks/animations
pnpm test -- hooks/chat
pnpm test -- hooks/domains/ai
pnpm test -- hooks/domains/gdpr
pnpm test -- hooks/domains/onboarding
pnpm test -- hooks/domains/premium
pnpm test -- hooks/domains/profile
pnpm test -- hooks/domains/safety
pnpm test -- hooks/domains/settings
pnpm test -- hooks/domains/social
pnpm test -- hooks/navigation
pnpm test -- hooks/performance
```

### Run Specific Hook
```bash
pnpm test -- useEntranceAnimation.test.ts
pnpm test -- useChatInput.test.ts
```

### Run with Coverage
```bash
pnpm test -- --coverage hooks
```

### Watch Mode
```bash
pnpm test -- --watch hooks
```

## Test Coverage Goals

- **Animation Hooks**: 100% coverage
- **Chat Hooks**: 100% coverage
- **Domain Hooks**: 100% coverage
- **Navigation Hooks**: 100% coverage
- **Performance Hooks**: 100% coverage
- **Utility Hooks**: 100% coverage

**Overall Target**: 95%+ code coverage

## Mocking Strategy

### External Dependencies
- React Native APIs (Animated, PanResponder, etc.)
- AsyncStorage
- WebSocket
- Device sensors (accelerometer)
- Navigation

### API Mocks
- AI service endpoints
- GDPR endpoints
- Chat service
- Profile service
- Settings service

### State Mocks
- Redux store
- Context providers
- Local state

## Best Practices

### 1. Hook Testing
- ✅ Test hooks in isolation
- ✅ Mock external dependencies
- ✅ Test state transitions
- ✅ Test error scenarios
- ✅ Test cleanup/unmount

### 2. Async Testing
- ✅ Use `waitFor()` for async operations
- ✅ Handle promises correctly
- ✅ Test loading states
- ✅ Test error states
- ✅ Test success states

### 3. Performance Testing
- ✅ Measure render counts
- ✅ Check dependency arrays
- ✅ Test memory usage
- ✅ Verify cleanup

### 4. Accessibility Testing
- ✅ Test reduced motion
- ✅ Verify keyboard support
- ✅ Check screen reader compatibility
- ✅ Validate color contrast

## Common Test Scenarios

### Loading States
```typescript
it('should handle loading state', () => {
  // Test initial loading
  // Test loading completion
  // Test loading error
});
```

### Error Handling
```typescript
it('should handle errors gracefully', () => {
  // Test error state
  // Test error recovery
  // Test error messages
});
```

### State Updates
```typescript
it('should update state correctly', () => {
  // Test state change
  // Test state validation
  // Test state persistence
});
```

### Cleanup
```typescript
it('should cleanup on unmount', () => {
  // Test resource cleanup
  // Test event listener removal
  // Test subscription cancellation
});
```

## Debugging Tests

### Enable Debug Output
```bash
DEBUG=* pnpm test -- hooks
```

### Run Single Test
```bash
pnpm test -- --testNamePattern="specific test name"
```

### Run with Verbose Output
```bash
pnpm test -- --verbose hooks
```

## Continuous Integration

All hook tests run on:
- ✅ Every commit (pre-commit hook)
- ✅ Every PR (CI pipeline)
- ✅ Before release (pre-release check)

## Performance Benchmarks

Target metrics:
- **Hook initialization**: < 1ms
- **State update**: < 5ms
- **Re-render**: < 16ms (60fps)
- **Memory usage**: < 1MB per hook instance

## Future Enhancements

1. **Visual Regression Tests** - Test animation outputs
2. **E2E Tests** - Test hooks in real app scenarios
3. **Performance Profiling** - Detailed performance metrics
4. **Snapshot Tests** - Validate hook output consistency
5. **Mutation Testing** - Ensure test quality

## Contributing

When adding new hooks:
1. Create corresponding test file
2. Write unit tests
3. Add integration tests if needed
4. Update this README
5. Ensure 95%+ coverage
6. Run full test suite before PR

## Resources

- [React Hooks Testing Library](https://react-hooks-testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contact

For questions about hook testing, contact the mobile development team.
