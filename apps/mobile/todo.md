services/AccessibilityService.ts – Replace hex palettes/contrast inputs with theme-driven tokens or injected adapters; update helper outputs accordingly.
services/tests/AccessibilityService.test.ts – Mirror service changes by seeding tests with theme-derived fixtures instead of hex literals; keep assertions intact.
screens/live/LiveStreamViewerScreen.tsx – Add useTheme, move styles into useMemo, swap all literals.
hooks/animations/tests/useGlowEffect.test.ts – Convert glow color mocks to theme fixtures.
components/tests/EnhancedTabBar.test.tsx – Replace snapshot/reference colors with theme values or factory.
Repo-wide sweep (≈750 remaining hits) – Continue file-by-file migration following the established pattern.
Lint & Type Safety Follow-ups
Resolve outstanding react-hooks/immutability violations (e.g., EliteButton/EliteCard shared values) once color work lands.
Ensure no new 
typescript-eslint
 warnings (unused vars after refactors).
Run pnpm -w eslint apps/mobile and keep zero errors.
Test & Verification Gates
pnpm mobile:tsc – confirm no regressions from theme refactors.
pnpm mobile:test (unit/integration) – especially suites touching updated components/services.
Visual QA / contrast spot-checks after palette changes (light & dark).
Regression pass on premium flow (Premium Demo, AI Bio, Elite components) to ensure gradients & animations still render correctly.
Release Readiness (post-color work)
Detox / E2E golden paths once lint/tests pass.
Performance bump check (animations, gradients) to ensure no regressions.
Prep release notes & changelog entries for theme migration.
Final compliance checklist (accessibility, localization, privacy copy) prior to App Store upload. Full Mobile App Tasks List
🎯 Theme/Color Migration (Critical Path)
Status: 88/892 violations resolved (10% complete) | Priority: HIGH

Phase 1: High-Priority Files (IN PROGRESS)
 services/AccessibilityService.ts - Replace hex palettes with theme tokens (18 violations)
 services/tests/AccessibilityService.test.ts - Update test fixtures (20 violations)
 screens/live/LiveStreamViewerScreen.tsx - Add useTheme, migrate styles (18 violations)
 hooks/animations/tests/useGlowEffect.test.ts - Convert glow color mocks (18 violations)
 components/tests/EnhancedTabBar.test.tsx - Replace test colors (18 violations)
Phase 2: Component Migration (PENDING)
 Premium/Elite Components - Complete remaining premium flow components
 Screen Components - Systematic migration of 180+ screen files
 Service Layer - Theme-aware service implementations
 Test Suite - Update all test files with theme fixtures
Phase 3: Repo-wide Cleanup (PENDING)
 Remaining 750+ violations - File-by-file migration using established pattern
 Validation - Ensure zero no-hardcoded-colors violations
🔧 Lint & Type Safety (Blockers)
Status: Multiple ESLint categories failing | Priority: HIGH

React Hooks Issues
 react-hooks/immutability - Fix shared value mutations in EliteButton/EliteCard
 react-hooks/exhaustive-deps - Fix missing dependencies in useEffect
 react-hooks/rules-of-hooks - Ensure proper hook usage patterns
TypeScript Issues
 **
typescript-eslint/no-explicit-any**
 - Replace remaining any types (~300+)
 **
typescript-eslint/no-unused-vars**
 - Clean up unused imports/variables
 Type safety - Ensure full TypeScript compliance
General Lint Issues
 Import/export consistency - Fix import path issues
 Code style - Ensure consistent formatting and patterns
🧪 Testing & Quality Assurance
Status: Partial coverage, environment issues | Priority: MEDIUM

Unit/Integration Tests
 Fix Jest environment - Resolve React Native testing setup issues
 Hook testing - Complete tests for 30+ custom hooks (5/30 done)
 Component testing - Test all migrated theme components
 Service testing - Test theme-aware service implementations
Visual & Accessibility Testing
 Visual regression - Spot-check theme changes in light/dark modes
 Contrast validation - Ensure WCAG compliance after theme migration
 Accessibility audit - Verify screen reader and navigation support
Performance Testing
 Animation performance - Verify no regressions in theme animations
 Memory usage - Check for memory leaks in theme switching
 Bundle size - Ensure theme system doesn't bloat the app
🚀 Release Readiness Gates
Status: Not ready | Priority: CRITICAL

Code Quality Gates
 Zero ESLint errors - All lint categories must pass
 Zero TypeScript errors - Full type safety compliance
 Test coverage >75% - Comprehensive test suite passing
Functional Verification
 Core user flows - Auth, Swipe, Match, Chat working in both themes
 Premium features - All premium components render correctly
 AI features - Bio generator and photo analysis working
 Live streaming - Real-time features functional
App Store Requirements
 Accessibility compliance - WCAG 2.1 AA standards met
 Privacy compliance - GDPR features fully functional
 Performance standards - 60fps animations, fast startup
 Store metadata - Screenshots, descriptions, privacy policy
📊 Current Status Summary
✅ Completed (Batch 1)
PremiumDemoScreen.tsx (23 violations eliminated)
AIBioScreen.tsx (21 violations eliminated)
ImmersiveCard.tsx (21 violations eliminated)
gradients.ts constants (23 violations eliminated)
🔄 In Progress
Theme migration pattern established
useTheme hook integration working
88/892 violations resolved (10%)
📈 Metrics
Files to migrate: ~200+ files with hardcoded colors
ESLint violations: 804 remaining
TypeScript errors: ~300 remaining
Test coverage: ~17% (5/30 hooks tested)
Release readiness: ~30% completeMost Difficult Files (Ranked by Complexity)
1. services/AccessibilityService.ts (18 violations) - HARDEST
Why hard: Complex contrast calculations, color validation logic, WCAG compliance
Challenge: Need to preserve accessibility math while using theme tokens
Risk: Breaking accessibility features if done wrong
2. hooks/animations/useUnifiedAnimations.ts (10+ violations) - VERY HARD
Why hard: Complex animation systems with dynamic color interpolation
Challenge: Animated values need theme-aware color transitions
Risk: Performance regressions in animations
3. screens/live/LiveStreamViewerScreen.tsx (18 violations) - HARD
Why hard: Real-time video overlays, dynamic UI states, complex styling
Challenge: Theme changes during active streams
Risk: Visual glitches during live streaming
4. Premium/Elite Components (Multiple files) - HARD
Why hard: Complex gradient systems, shadow effects, holographic styles
Challenge: Maintaining premium visual quality with themes
Risk: Degrading premium experience
