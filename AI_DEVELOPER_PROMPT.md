# 🤖 AI Developer Implementation Prompt

> **Complete Implementation Guide for PawfectMatch Premium Tinder Pixel Perfect Workflow**

## 📋 **Implementation Instructions**

You are tasked with implementing the complete PawfectMatch Premium platform, strictly following the latest monorepo architecture, design specs, and engineering mandates. All features must be delivered with ultra-premium, pixel-perfect fidelity, as defined in `TINDER_PIXEL_PERFECT_WORKFLOW.md`, `rules.md`, and referenced blueprints.

**Key Directives:**
- Use Nx or Turborepo with pnpm workspaces.
- Shared configs (tsconfig, ESLint) must enforce strict type safety and code consistency.
- All code must integrate with live services—no mocks or placeholder content.
- Animation: Framer Motion (Web) and Reanimated (Mobile) with spring physics (`stiffness: 300, damping: 30`).
- Forms: React Hook Form + Zod schemas from `core`.
- State: React Query for server state, Zustand for client/global state.
- Accessibility: WCAG 2.1 AA, full keyboard navigation, screen reader support.
- Testing: Jest (unit), Playwright/Detox (E2E), real dependencies only.

---

## 🎯 **Implementation Phases**

### **Phase 1: Foundation & Setup** 
**Priority: CRITICAL**

#### **Step 1.1: Environment Setup**
```bash
# Verify all services are running
pnpm --filter server dev          # Backend API (port 3001)
pnpm --filter ai-service dev      # AI Service (port 8000)
pnpm --filter pawfectmatch-web dev # Web App (port 3000)
pnpm --filter @pawfectmatch/mobile start # Mobile App (Expo)
```

**Verification Requirements:**
- [ ] All services pass health checks (`/api/health`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Web and mobile apps load with zero console errors

**Show Result:** Screenshots of all services running, health check responses, and clean browser/mobile consoles.

---

#### **Step 1.2: Landing Page Enhancement**
**File:** `apps/web/app/page.tsx`

**Requirements:**
- Hero section with value proposition
- Premium branding (gradient backgrounds, micro-interactions)
- Animated feature highlights (Framer Motion, spring physics)
- CTA buttons (Login/Register) with tactile feedback
- Responsive, accessible layout

**Implementation:**
```typescript
// Use shared UI components from @pawfectmatch/ui
// AnimatePresence for transitions
// Premium button styling from design-tokens
// Responsive with Tailwind CSS
```

**Verification:**
- [ ] Pixel-perfect layout matches design spec
- [ ] Animations are smooth (spring physics)
- [ ] Buttons have tactile feedback
- [ ] Mobile responsive
- [ ] Accessibility checks pass

**Show Result:** Screenshots of enhanced landing page (desktop + mobile).

---

### **Phase 2: Authentication & Onboarding**
**Priority: HIGH**

#### **Step 2.1: Registration Form Enhancement**
**File:** `apps/web/app/(auth)/register/page.tsx`

**Requirements:**
- All form fields per Zod schema (`core/schemas`)
- Real-time validation (React Hook Form + zodResolver)
- Premium styling, animated transitions
- Email verification flow
- 18+ age validation

**Implementation:**
```typescript
// Use shared form components from @pawfectmatch/ui
// Integrate zodResolver for validation
// Animate loading/error states
// Accessibility: labels, error messages, keyboard navigation
```

**Verification:**
- [ ] All fields validate in real-time
- [ ] Form submits successfully
- [ ] Loading/error states animate smoothly
- [ ] Accessibility checks pass

**Show Result:** Screenshots of registration form, validation, and submission states.

---

#### **Step 2.2: Mobile Onboarding Flow**
**Files:** 
- `apps/mobile/src/screens/onboarding/UserIntentScreen.tsx`
- `apps/mobile/src/screens/onboarding/PetProfileSetupScreen.tsx`
- `apps/mobile/src/screens/onboarding/PreferencesSetupScreen.tsx`
- `apps/mobile/src/screens/onboarding/WelcomeScreen.tsx`

**Requirements:**
- 4-step onboarding (navigation types fixed, see MOBILE_TYPESCRIPT_COMPREHENSIVE_ANALYSIS.md)
- Animated selection cards (Reanimated, spring physics)
- Multi-step pet profile form (Zod validation)
- Progress indicators, haptic feedback
- Celebration animation (Lottie/Reanimated)

**Implementation:**
```typescript
// Use shared hooks and types from core
// Animate transitions with Reanimated
// Haptic feedback for all primary interactions
// Accessibility: screen reader support
```

**Verification:**
- [ ] All screens function and animate smoothly
- [ ] Form validation works
- [ ] Progress indicators update
- [ ] Haptic feedback triggers
- [ ] Navigation is seamless

**Show Result:** Screenshots of onboarding flow, progress, and celebration animation.

---

### **Phase 3: Pet Profile System**
**Priority: HIGH**

#### **Step 3.1: Pet Profile Creation**
**Files:**
- `apps/web/src/components/Pet/PetProfileForm.tsx`
- `apps/mobile/src/screens/PetProfileScreen.tsx`

**Requirements:**
- All fields per Zod schema
- Photo upload (Cloudinary integration, drag-and-drop)
- Personality tags (animated selection)
- Health info toggles
- AI-powered bio generation (API integration)

**Implementation:**
```typescript
// Use shared form logic from core
// Animate photo upload preview
// Integrate AI service for bio generation
// Accessibility: alt text, keyboard navigation
```

**Verification:**
- [ ] All fields and uploads work
- [ ] AI features integrate and respond
- [ ] Form saves successfully

**Show Result:** Screenshots of pet profile form, photo upload, and AI features.

---

### **Phase 4: Swipe Interface**
**Priority: CRITICAL**

#### **Step 4.1: Tinder-Style Swipe Cards**
**Files:**
- `apps/web/src/components/Pet/SwipeCard.tsx`
- `apps/web/src/components/Pet/SwipeStack.tsx`
- `apps/mobile/src/screens/SwipeScreen.tsx`

**Requirements:**
- 3D perspective cards (Framer Motion/Reanimated)
- Smooth swipe gestures (spring physics)
- Haptic feedback (mobile)
- Visual overlays (Like/Pass/Superlike)
- Card stack management

**Implementation:**
```typescript
// Use AnimatePresence for card transitions
// Hardware-accelerated transforms
// Haptic feedback for swipe actions
// Accessibility: ARIA roles, keyboard support
```

**Verification:**
- [ ] Swipe gestures and overlays work
- [ ] Animations are fluid
- [ ] Card stack updates correctly

**Show Result:** Screenshots of swipe interface and gesture overlays.

---

#### **Step 4.2: Match Detection & Modal**
**Files:**
- `apps/web/src/components/Match/MatchModal.tsx`
- `apps/mobile/src/components/MatchModal.tsx`

**Requirements:**
- Real-time match detection (Socket.io)
- Celebration animation (confetti)
- Modal with match info and actions

**Implementation:**
```typescript
// Integrate with backend match events
// Animate modal with spring physics
// Accessibility: focus management, ARIA labels
```

**Verification:**
- [ ] Match detection triggers modal
- [ ] Celebration animation plays
- [ ] Modal actions work

**Show Result:** Screenshots of match modal and celebration.

---

### **Phase 5: Chat System**
**Priority: HIGH**

#### **Step 5.1: Real-time Chat Interface**
**Files:**
- `apps/web/app/(protected)/chat/[matchId]/page.tsx`
- `apps/mobile/src/screens/ChatScreen.tsx`

**Requirements:**
- WebSocket messaging (Socket.io)
- Typing indicators, read receipts
- Photo sharing
- AI conversation starters

**Implementation:**
```typescript
// Use Zustand for chat state
// Animate message transitions
// Accessibility: live region, keyboard navigation
```

**Verification:**
- [ ] Real-time messaging works
- [ ] Typing/read indicators update
- [ ] Photo sharing functions

**Show Result:** Screenshots of chat interface and features.

---

### **Phase 6: Premium Features**
**Priority: MEDIUM**

#### **Step 6.1: Subscription System**
**Files:**
- `apps/web/app/(protected)/premium/page.tsx`
- `apps/web/src/components/Premium/SubscriptionManager.tsx`

**Requirements:**
- 4-tier subscription (Stripe integration)
- Feature gating
- Usage tracking

**Implementation:**
```typescript
// Use Stripe API for checkout
// Gate features by tier (Zod schemas)
```

**Verification:**
- [ ] Tiers display and gate features
- [ ] Stripe checkout works

**Show Result:** Screenshots of premium page and subscription tiers.

---

### **Phase 7: AI Features**
**Priority: MEDIUM**

#### **Step 7.1: AI-Powered Features**
**Files:**
- `apps/web/app/(protected)/ai/bio/page.tsx`
- `apps/web/app/(protected)/ai/photo/page.tsx`
- `apps/web/app/(protected)/ai/compatibility/page.tsx`

**Requirements:**
- Bio generator, photo analyzer, compatibility analyzer (FastAPI service)
- Real-time processing

**Implementation:**
```typescript
// Use React Query for async AI calls
// Display results with premium UI
```

**Verification:**
- [ ] AI features process and display results

**Show Result:** Screenshots of AI features and results.

---

### **Phase 8: Advanced Features**
**Priority: LOW**

#### **Step 8.1: Video Calling**
**Files:**
- `apps/web/app/(protected)/video-call/[roomId]/page.tsx`
- `apps/mobile/src/components/calling/CallManager.tsx`

**Requirements:**
- WebRTC HD video calls, screen sharing, call management

**Implementation:**
```typescript
// Integrate WebRTC APIs
// Animate call transitions
```

**Verification:**
- [ ] Video calls connect and manage

**Show Result:** Screenshots of video call interface.

---

## 🔧 **Implementation Guidelines**

- **TypeScript**: Strict mode, no suppressions
- **Error Handling**: Precise, user-friendly messages
- **Animations**: Spring physics only, AnimatePresence
- **Accessibility**: WCAG 2.1 AA, tested on all major browsers/devices
- **Testing**: Jest, Playwright/Detox, no mocks except unavoidable external services
- **Documentation**: Update guides for every new capability

---

## 📊 **Progress Tracking**

### **Completion Checklist**
- [ ] All phases implemented per spec
- [ ] Zero TypeScript/ESLint errors
- [ ] All features verified with screenshots
- [ ] Accessibility and performance gates passed

---

## 🎯 **Success Criteria**

- **Performance**: <3s FMP (web), <16ms frame (mobile)
- **Animations**: 60fps, spring physics
- **Responsiveness**: All screen sizes
- **Accessibility**: WCAG 2.1 AA
- **Business**: Seamless subscription, analytics, retention

---

## 🚀 **Next Steps**

1. **Start with Phase 1** and complete each step
2. **Show actual results** after each implementation
3. **Verify functionality** before moving to next phase
4. **Document any issues or deviations**
5. **Request feedback after each phase completion**

---

**Relentlessly follow all architectural and design mandates. Every detail matters. Deliver a flawless, premium PawfectMatch experience—immediately deployable.**

**🐾 Let's build something amazing! ✨**
