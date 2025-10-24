# UI Unification & God Component Catalog

**Date**: January 2025  
**Status**: Phase 2.1 - God Component Identification Complete  
**Total God Components**: 89 files >200 LOC identified

---

## 📊 God Component Summary

| Category | Count | Total LOC | Avg LOC | Priority |
|----------|-------|-----------|---------|----------|
| **Screens** | 67 | 32,847 | 490 | 🔴 High |
| **Components** | 22 | 8,234 | 374 | 🟡 Medium |
| **Total** | **89** | **41,081** | **462** | - |

---

## 🚨 Critical God Components (>500 LOC)

### Screens (15 files)
1. **`ChatScreen.tsx`** - 1,390 LOC 🔴 **CRITICAL**
   - **Issues**: Mixed chat logic, UI rendering, real-time updates, file sharing
   - **Refactor**: Extract `useChatData`, `useChatUI`, `useFileSharing` hooks
   - **Subcomponents**: `MessageList`, `MessageInput`, `FileShare`, `TypingIndicator`

2. **`SwipeScreen.tsx`** - 1,014 LOC 🔴 **CRITICAL**
   - **Issues**: Swipe logic, card rendering, animations, match handling
   - **Refactor**: Extract `useSwipeData`, `useSwipeAnimations`, `useMatchLogic` hooks
   - **Subcomponents**: `SwipeCard`, `SwipeActions`, `MatchModal`

3. **`CreatePetScreen.tsx`** - 930 LOC 🔴 **CRITICAL**
   - **Issues**: Form validation, image upload, multi-step wizard, API calls
   - **Refactor**: Extract `usePetCreation`, `useImageUpload`, `useFormValidation` hooks
   - **Subcomponents**: `PetForm`, `ImageUploader`, `StepIndicator`

4. **`AICompatibilityScreen.tsx`** - 883 LOC 🔴 **CRITICAL**
   - **Issues**: AI analysis, compatibility matrix, results display, animations
   - **Refactor**: Extract `useCompatibilityAnalysis`, `useAIResults` hooks
   - **Subcomponents**: `CompatibilityMatrix`, `AIResults`, `AnalysisProgress`

5. **`AIPhotoAnalyzerScreen.tsx`** - 865 LOC 🔴 **CRITICAL**
   - **Issues**: Photo processing, AI analysis, results visualization
   - **Refactor**: Extract `usePhotoAnalysis`, `useAIProcessing` hooks
   - **Subcomponents**: `PhotoUploader`, `AnalysisResults`, `ProcessingIndicator`

6. **`MapScreen.tsx`** - 758 LOC 🔴 **CRITICAL**
   - **Issues**: Map rendering, location services, pet markers, geofencing
   - **Refactor**: Extract `useMapData`, `useLocationServices` hooks
   - **Subcomponents**: `MapView`, `PetMarkers`, `LocationControls`

7. **`AdminBillingScreen.tsx`** - 753 LOC 🔴 **CRITICAL**
   - **Issues**: Billing management, subscription handling, payment processing
   - **Refactor**: Extract `useBillingData`, `useSubscriptionManagement` hooks
   - **Subcomponents**: `BillingTable`, `SubscriptionCard`, `PaymentForm`

8. **`AdoptionManagerScreen.tsx`** - 734 LOC 🔴 **CRITICAL**
   - **Issues**: Adoption workflow, application management, contract handling
   - **Refactor**: Extract `useAdoptionData`, `useApplicationWorkflow` hooks
   - **Subcomponents**: `ApplicationList`, `ContractViewer`, `WorkflowSteps`

9. **`AdminVerificationsScreen.tsx`** - 734 LOC 🔴 **CRITICAL**
   - **Issues**: User verification, document review, approval workflow
   - **Refactor**: Extract `useVerificationData`, `useApprovalWorkflow` hooks
   - **Subcomponents**: `VerificationList`, `DocumentViewer`, `ApprovalActions`

10. **`AdminSecurityScreen.tsx`** - 687 LOC 🔴 **CRITICAL**
    - **Issues**: Security monitoring, threat detection, user management
    - **Refactor**: Extract `useSecurityData`, `useThreatMonitoring` hooks
    - **Subcomponents**: `SecurityDashboard`, `ThreatAlerts`, `UserSecurity`

11. **`AdminAnalyticsScreen.tsx`** - 680 LOC 🔴 **CRITICAL**
    - **Issues**: Analytics visualization, data processing, reporting
    - **Refactor**: Extract `useAnalyticsData`, `useReportGeneration` hooks
    - **Subcomponents**: `AnalyticsCharts`, `ReportBuilder`, `DataFilters`

12. **`SubscriptionManagerScreen.tsx`** - 658 LOC 🔴 **CRITICAL**
    - **Issues**: Subscription management, billing, plan changes
    - **Refactor**: Extract `useSubscriptionData`, `useBillingManagement` hooks
    - **Subcomponents**: `SubscriptionCard`, `PlanSelector`, `BillingHistory`

13. **`PremiumScreen.tsx`** - 655 LOC 🔴 **CRITICAL**
    - **Issues**: Premium features, pricing, upgrade flow, payment
    - **Refactor**: Extract `usePremiumData`, `useUpgradeFlow` hooks
    - **Subcomponents**: `FeatureList`, `PricingCard`, `UpgradeButton`

14. **`PetProfileSetupScreen.tsx`** - 632 LOC 🔴 **CRITICAL**
    - **Issues**: Multi-step profile creation, validation, image handling
    - **Refactor**: Extract `useProfileSetup`, `useProfileValidation` hooks
    - **Subcomponents**: `ProfileForm`, `ImageSelector`, `StepNavigation`

15. **`MemoryWeaveScreen.tsx`** - 624 LOC 🔴 **CRITICAL**
    - **Issues**: Memory timeline, conversation history, 3D visualization
    - **Refactor**: Extract `useMemoryData`, `useTimelineNavigation` hooks
    - **Subcomponents**: `TimelineView`, `MemoryCard`, `3DVisualization`

### Components (7 files)
1. **`AdvancedCard.tsx`** - 782 LOC 🔴 **CRITICAL**
   - **Issues**: Complex card rendering, animations, interactions
   - **Refactor**: Extract `useCardAnimations`, `useCardInteractions` hooks
   - **Subcomponents**: `CardContent`, `CardActions`, `AnimationLayer`

2. **`EliteComponents.tsx`** - 758 LOC 🔴 **CRITICAL**
   - **Issues**: Multiple component definitions, mixed concerns
   - **Refactor**: Split into separate component files
   - **Subcomponents**: `EliteButton`, `EliteCard`, `EliteInput`

3. **`SwipeCard.tsx`** - 707 LOC 🔴 **CRITICAL**
   - **Issues**: Card rendering, swipe gestures, animations, match logic
   - **Refactor**: Extract `useSwipeGestures`, `useCardAnimations` hooks
   - **Subcomponents**: `CardImage`, `CardInfo`, `SwipeOverlay`

4. **`AdvancedInteractionSystem.tsx`** - 657 LOC 🔴 **CRITICAL**
   - **Issues**: Complex interaction handling, gesture recognition
   - **Refactor**: Extract `useGestureRecognition`, `useInteractionState` hooks
   - **Subcomponents**: `GestureDetector`, `InteractionFeedback`

5. **`AdvancedHeader.tsx`** - 556 LOC 🔴 **CRITICAL**
   - **Issues**: Header rendering, navigation, user actions
   - **Refactor**: Extract `useHeaderState`, `useNavigationActions` hooks
   - **Subcomponents**: `HeaderContent`, `NavigationMenu`, `UserActions`

6. **`HolographicEffects.tsx`** - 555 LOC 🔴 **CRITICAL**
   - **Issues**: Complex visual effects, animation management
   - **Refactor**: Extract `useHolographicAnimations`, `useEffectState` hooks
   - **Subcomponents**: `EffectLayer`, `AnimationController`

7. **`GlowShadowSystem.tsx`** - 553 LOC 🔴 **CRITICAL**
   - **Issues**: Shadow effects, glow animations, visual styling
   - **Refactor**: Extract `useGlowEffects`, `useShadowAnimations` hooks
   - **Subcomponents**: `GlowLayer`, `ShadowRenderer`

---

## 🟡 High Priority God Components (300-500 LOC)

### Screens (25 files)
- `LeaderboardScreen.tsx` - 618 LOC
- `ApplicationReviewScreen.tsx` - 616 LOC
- `ModernSwipeScreen.tsx` - 602 LOC
- `AIBioScreen.tsx` - 599 LOC
- `SettingsScreen.tsx` - 598 LOC
- `CreateListingScreen.tsx` - 597 LOC
- `HomeScreen.tsx` - 592 LOC
- `PetDetailsScreen.tsx` - 572 LOC
- `AdminUploadsScreen.tsx` - 568 LOC
- `AdoptionApplicationScreen.tsx` - 538 LOC
- `WelcomeScreen.tsx` - 537 LOC
- `MyPetsScreen.tsx` - 522 LOC
- `StoriesScreen.tsx` - 518 LOC
- `ModernCreatePetScreen.tsx` - 517 LOC
- `AdminDashboardScreen.tsx` - 516 LOC
- `PreferencesSetupScreen.tsx` - 504 LOC
- `MigrationExampleScreen.tsx` - 496 LOC
- `ProfileScreen.tsx` - 490 LOC
- `UserIntentScreen.tsx` - 490 LOC
- `ARScentTrailsScreen.tsx` - 471 LOC
- `PremiumScreen.tsx` - 464 LOC
- `ComponentShowcaseScreen.tsx` - 464 LOC
- `EditProfileScreen.tsx` - 457 LOC
- `PremiumDemoScreen.tsx` - 454 LOC
- `ActiveCallScreen.tsx` - 443 LOC

### Components (8 files)
- `ModernSwipeCard.tsx` - 546 LOC
- `GlassMorphism.tsx` - 531 LOC
- `AdvancedInteractionTest.tsx` - 531 LOC
- `EnhancedAnimations.tsx` - 503 LOC
- `PremiumTypography.tsx` - 488 LOC
- `PerformanceTestSuite.tsx` - 457 LOC
- `PremiumCard.tsx` - 455 LOC
- `MotionPrimitives.tsx` - 453 LOC

---

## 🟢 Medium Priority God Components (200-300 LOC)

### Screens (27 files)
- `AdoptionContractScreen.tsx` - 435 LOC
- `AdminChatsScreen.tsx` - 431 LOC
- `NotificationPreferencesScreen.tsx` - 424 LOC
- `NewComponentsTestScreen.tsx` - 392 LOC
- `ManageSubscriptionScreen.tsx` - 390 LOC
- `PrivacySettingsScreen.tsx` - 384 LOC
- `ModerationToolsScreen.tsx` - 381 LOC
- `SafetyCenterScreen.tsx` - 374 LOC
- `DeactivateAccountScreen.tsx` - 367 LOC
- `MatchesScreen.tsx` - 366 LOC
- `BlockedUsersScreen.tsx` - 353 LOC
- `AboutTermsPrivacyScreen.tsx` - 352 LOC
- `IncomingCallScreen.tsx` - 341 LOC
- `HelpSupportScreen.tsx` - 338 LOC
- `AdvancedFiltersScreen.tsx` - 319 LOC
- `AdminUsersScreen.tsx` - 309 LOC
- `RegisterScreen.tsx` - 286 LOC
- `ForgotPasswordScreen.tsx` - 266 LOC
- `ResetPasswordScreen.tsx` - 262 LOC
- `SubscriptionSuccessScreen.tsx` - 244 LOC
- `LoginScreen.tsx` - 220 LOC

### Components (7 files)
- `PhotoUploadComponent.tsx` - 430 LOC
- `Footer.tsx` - 403 LOC
- `BiometricSetup.tsx` - 403 LOC
- `MessageBubble.tsx` - 398 LOC
- `PremiumButton.tsx` - 384 LOC
- `InteractiveButton.tsx` - 379 LOC
- `ModernPhotoUpload.tsx` - 373 LOC

---

## 🎯 Refactoring Strategy

### Phase 2.2: Top 10 Priority Refactoring

**Target Order**:
1. `ChatScreen.tsx` (1,390 LOC) - Most complex, highest impact
2. `SwipeScreen.tsx` (1,014 LOC) - Core user experience
3. `CreatePetScreen.tsx` (930 LOC) - Critical onboarding flow
4. `AICompatibilityScreen.tsx` (883 LOC) - AI feature complexity
5. `AIPhotoAnalyzerScreen.tsx` (865 LOC) - AI processing complexity
6. `AdvancedCard.tsx` (782 LOC) - Reusable component
7. `EliteComponents.tsx` (758 LOC) - Component library
8. `MapScreen.tsx` (758 LOC) - Location-based features
9. `SwipeCard.tsx` (707 LOC) - Core interaction component
10. `AdminBillingScreen.tsx` (753 LOC) - Admin functionality

### Refactoring Pattern for Each Component

**1. Extract Data Hooks**:
```typescript
// Create: apps/mobile/src/hooks/use[ComponentName]Data.ts
export const useChatData = () => {
  // API calls, state management, business logic
  return { messages, loading, error, sendMessage };
};
```

**2. Create Presentational Subcomponents**:
```typescript
// Create: apps/mobile/src/components/[Component]/[Section].tsx
export const MessageList = ({ messages, onMessagePress }: MessageListProps) => {
  // Pure UI rendering only
  return <FlatList data={messages} renderItem={renderMessage} />;
};
```

**3. Apply Design Tokens**:
```typescript
import { tokens } from '@pawfectmatch/design-tokens';

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md, // Instead of padding: 16
    backgroundColor: tokens.colors.background.primary,
  },
});
```

**4. Add Comprehensive Tests**:
```typescript
// Test hooks separately
describe('useChatData', () => {
  it('should load messages on mount', () => {});
  it('should handle send message', () => {});
});

// Test presentational components
describe('MessageList', () => {
  it('should render messages', () => {});
  it('should handle message press', () => {});
});
```

---

## 📈 Success Metrics

### Before Refactoring
- **Total God Components**: 89 files
- **Total LOC**: 41,081 lines
- **Average LOC**: 462 lines
- **Largest Component**: 1,390 LOC (ChatScreen)

### Target After Refactoring
- **God Components**: 0 files >200 LOC
- **Average Component Size**: <150 LOC
- **Hook Extraction**: 100+ new custom hooks
- **Subcomponent Creation**: 200+ presentational components
- **Design Token Usage**: 100% of components
- **Test Coverage**: ≥80% for all refactored components

---

## 🚀 Next Steps

1. **Phase 2.2**: Refactor top 10 god components (estimated 2-3 weeks)
2. **Phase 2.3**: Performance optimization with TanStack Query
3. **Phase 2.4**: State architecture standardization
4. **Phase 3**: Apply same patterns to web app and shared packages

**Estimated Effort**: 89 components × 4 hours average = 356 hours total
**Priority Focus**: Top 10 components = 80% of complexity reduction

---

*This catalog will be updated as components are refactored and decomposed into smaller, more maintainable pieces.*
