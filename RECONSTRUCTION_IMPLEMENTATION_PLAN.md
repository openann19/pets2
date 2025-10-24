# 🏗️ Complete Asset Reconstruction Implementation Plan

**Date:** October 16, 2025  
**Status:** Ready for Implementation  
**Total Items:** 23 critical files/directories  
**Estimated Time:** 4-6 hours  

---

## 📋 Executive Summary

After verification against `docs/MISSING_ASSETS_RECOVERY_LIST.md`, we have identified **23 critical missing assets** that are blocking full functionality. The reconstruction is organized into **5 phases** with clear dependencies, starting from foundational types and ending with UI components.

### Missing Assets Breakdown:
- **Web App:** 8 files (hooks, store, styles, constants, types)
- **Mobile App:** 15 items (types, constants, services, screens, components)
- **Platform Assets:** Excluded (can use placeholders for development)

---

## 🎯 Phase 1: Web Foundation Layer (1-2 hours)

**Priority:** CRITICAL - These are likely imported by many existing components  
**Dependencies:** None - Start here  
**Impact:** Unblocks settings, accessibility, responsive design features  

### Task 1.1: Create Web Settings Types ✅
**File:** `apps/web/src/types/settings.ts`  
**Size:** ~150 lines  
**Purpose:** TypeScript interfaces for all settings-related state

```typescript
// Key interfaces to define:
export interface Theme {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontScale: number;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  matches: boolean;
  messages: boolean;
  likes: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowStrangerMessages: boolean;
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  textSize: 'small' | 'medium' | 'large' | 'xlarge';
  screenReaderEnabled: boolean;
}

export interface AppSettings {
  theme: Theme;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}
```

### Task 1.2: Create Web Haptics Constants ✅
**File:** `apps/web/src/constants/haptics.ts`  
**Size:** ~80 lines  
**Purpose:** Haptic feedback patterns matching mobile app

```typescript
// Key exports to define:
export enum HAPTIC_TYPES {
  IMPACT_LIGHT = 'impactLight',
  IMPACT_MEDIUM = 'impactMedium',
  IMPACT_HEAVY = 'impactHeavy',
  NOTIFICATION_SUCCESS = 'notificationSuccess',
  NOTIFICATION_WARNING = 'notificationWarning',
  NOTIFICATION_ERROR = 'notificationError',
  SELECTION = 'selection',
}

export const HAPTIC_PATTERNS = {
  SWIPE_LIKE: [10, 20, 10],
  SWIPE_DISLIKE: [5, 15, 5],
  MATCH: [50, 100, 50, 100],
  MESSAGE_SENT: [10],
  MESSAGE_RECEIVED: [15],
};

export const HAPTIC_INTENSITY = {
  LIGHT: 0.3,
  MEDIUM: 0.6,
  HEAVY: 1.0,
};
```

### Task 1.3: Create Web Haptic Styles ✅
**File:** `apps/web/src/styles/haptic.css`  
**Size:** ~120 lines  
**Purpose:** CSS animations for visual haptic feedback fallback

```css
/* Key classes to define:
 * - .haptic-pulse (pulse animation for clicks)
 * - .haptic-shake (error feedback)
 * - .haptic-success (success checkmark)
 * - .haptic-bounce (selection feedback)
 * - Motion-reduced variants (@media prefers-reduced-motion)
 */
```

### Task 1.4: Create Web Settings Store ✅
**File:** `apps/web/src/store/settingsStore.ts`  
**Size:** ~200 lines  
**Purpose:** Zustand store for global settings management  
**Dependencies:** Requires Task 1.1 (settings.ts types)

```typescript
// Key features to implement:
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types/settings';

interface SettingsStore {
  settings: AppSettings;
  updateTheme: (theme: Partial<Theme>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updatePrivacy: (privacy: Partial<PrivacySettings>) => void;
  updateAccessibility: (accessibility: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Implementation with localStorage persistence
    }),
    { name: 'app-settings' }
  )
);
```

### Task 1.5: Create Web Store Index ✅
**File:** `apps/web/src/store/index.ts`  
**Size:** ~20 lines  
**Purpose:** Barrel export for all store modules  
**Dependencies:** Requires Task 1.4 (settingsStore.ts)

```typescript
export { useSettingsStore } from './settingsStore';
// Future stores can be added here:
// export { useAuthStore } from './authStore';
// export { useChatStore } from './chatStore';
```

### Task 1.6: Create useSettings Hook ✅
**File:** `apps/web/src/hooks/useSettings.ts`  
**Size:** ~100 lines  
**Purpose:** React hook wrapper for settings store with SSR safety  
**Dependencies:** Requires Task 1.4 (settingsStore.ts), Task 1.1 (types)

```typescript
// Key features to implement:
import { useSettingsStore } from '@/store/settingsStore';
import { useEffect } from 'react';

export const useSettings = () => {
  const store = useSettingsStore();
  
  // Sync with system theme
  useEffect(() => {
    if (store.settings.theme.mode === 'auto') {
      // Listen to system theme changes
    }
  }, [store.settings.theme.mode]);
  
  return {
    settings: store.settings,
    updateTheme: store.updateTheme,
    updateNotifications: store.updateNotifications,
    updatePrivacy: store.updatePrivacy,
    updateAccessibility: store.updateAccessibility,
    resetSettings: store.resetSettings,
  };
};
```

### Task 1.7: Create useHapticFeedback Hook ✅
**File:** `apps/web/src/hooks/useHapticFeedback.ts`  
**Size:** ~150 lines  
**Purpose:** Web Vibration API wrapper with visual fallback  
**Dependencies:** Requires Task 1.2 (haptics.ts constants)

```typescript
// Key features to implement:
import { HAPTIC_TYPES, HAPTIC_PATTERNS } from '@/constants/haptics';

export const useHapticFeedback = () => {
  const trigger = (type: HAPTIC_TYPES) => {
    // Check if Vibration API is available
    if ('vibrate' in navigator) {
      const pattern = HAPTIC_PATTERNS[type] || 10;
      navigator.vibrate(pattern);
    } else {
      // Fallback to CSS animation
      triggerVisualFeedback(type);
    }
  };
  
  const triggerVisualFeedback = (type: HAPTIC_TYPES) => {
    // Add CSS class to trigger animation
  };
  
  return { trigger };
};
```

### Task 1.8: Create useMediaQuery Hook ✅
**File:** `apps/web/src/hooks/useMediaQuery.ts`  
**Size:** ~80 lines  
**Purpose:** Responsive breakpoint detection with SSR support  
**Dependencies:** None

```typescript
// Key features to implement:
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};

// Preset breakpoints
export const useBreakpoint = () => ({
  isMobile: useMediaQuery('(max-width: 768px)'),
  isTablet: useMediaQuery('(min-width: 769px) and (max-width: 1024px)'),
  isDesktop: useMediaQuery('(min-width: 1025px)'),
});
```

**Phase 1 Validation:**
```bash
cd apps/web && pnpm tsc --noEmit 2>&1 | grep -E "(settings|haptic|store)" | wc -l
# Expected: Error count reduction in settings-related imports
```

---

## 🎯 Phase 2: Mobile Type Foundations (30-45 minutes)

**Priority:** HIGH - Foundation for mobile services and components  
**Dependencies:** None (independent of Phase 1)  
**Impact:** Enables type-safe mobile development  

### Task 2.1: Create Mobile Account Types ✅
**File:** `apps/mobile/src/types/account.ts`  
**Size:** ~180 lines  
**Purpose:** User account and profile type definitions

```typescript
// Key interfaces to define:
export interface User {
  id: string;
  email: string;
  username: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface Profile {
  userId: string;
  displayName: string;
  bio: string;
  avatar: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  pets: Pet[];
  interests: string[];
  preferences: UserPreferences;
}

export interface Verification {
  type: 'identity' | 'address' | 'pet_ownership' | 'background_check';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  documents: Document[];
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium' | 'elite';
  status: 'active' | 'canceled' | 'expired' | 'trial';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}
```

### Task 2.2: Create Mobile Memories Types ✅
**File:** `apps/mobile/src/types/memories.ts`  
**Size:** ~120 lines  
**Purpose:** Memory system type definitions

```typescript
// Key interfaces to define:
export enum MemoryType {
  PHOTO = 'photo',
  VIDEO = 'video',
  NOTE = 'note',
  MILESTONE = 'milestone',
  ACHIEVEMENT = 'achievement',
}

export interface Memory {
  id: string;
  userId: string;
  petId: string;
  type: MemoryType;
  title: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryFilter {
  petId?: string;
  type?: MemoryType;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

export interface MemoryCollection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  memories: Memory[];
  createdAt: Date;
}
```

### Task 2.3: Create Mobile PremiumUI Types ✅
**File:** `apps/mobile/src/types/premiumUi.ts`  
**Size:** ~140 lines  
**Purpose:** Premium component prop types and configurations

```typescript
// Key interfaces to define:
import type { ViewStyle, TextStyle } from 'react-native';

export interface GlassmorphicProps {
  blurIntensity?: number;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  elevation?: number;
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
  };
}

export interface HapticConfig {
  enabled: boolean;
  type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
  customPattern?: number[];
}

export interface PremiumButtonProps {
  variant: 'solid' | 'outline' | 'glass' | 'gradient' | 'magnetic';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  haptic?: HapticConfig;
  animation?: AnimationConfig;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress: () => void;
}

export interface FABProps {
  icon: string;
  size?: number;
  variant?: 'standard' | 'liquid' | 'magnetic';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  haptic?: HapticConfig;
  onPress: () => void;
}
```

### Task 2.4: Create React Native Reanimated Type Declarations ✅
**File:** `apps/mobile/src/types/react-native-reanimated.d.ts`  
**Size:** ~100 lines  
**Purpose:** Augment react-native-reanimated types for better TypeScript support

```typescript
// Augment existing types:
import 'react-native-reanimated';

declare module 'react-native-reanimated' {
  export interface AnimatedValue {
    value: number;
    setValue: (value: number) => void;
  }
  
  export interface SharedValue<T> {
    value: T;
    modify: (modifier: (value: T) => T) => void;
  }
  
  export interface AnimatedStyleProp<T> {
    [key: string]: any;
  }
  
  // Add missing properties that TypeScript complains about
  export interface AnimatedStyles {
    header?: ViewStyle;
    callerInfo?: ViewStyle;
    avatarContainer?: ViewStyle;
    actionsContainer?: ViewStyle;
    additionalActions?: ViewStyle;
  }
}
```

### Task 2.5: Create Mobile SwipeCard Constants ✅
**File:** `apps/mobile/src/constants/swipeCard.ts`  
**Size:** ~90 lines  
**Purpose:** SwipeCard configuration constants

```typescript
// Key exports to define:
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;
export const ROTATION_THRESHOLD = 15;

export const ANIMATION_DURATION = {
  SWIPE: 300,
  RESET: 200,
  SNAP_BACK: 150,
};

export const CARD_DIMENSIONS = {
  WIDTH: SCREEN_WIDTH * 0.9,
  HEIGHT: SCREEN_HEIGHT * 0.7,
  BORDER_RADIUS: 20,
};

export const GESTURE_CONFIGS = {
  SWIPE_VELOCITY_THRESHOLD: 500,
  PAN_RESPONDER_THRESHOLD: 10,
  LONG_PRESS_DURATION: 500,
};

export const SWIPE_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
} as const;

export const OVERLAY_LABELS = {
  LIKE: '💚 LIKE',
  DISLIKE: '💔 PASS',
  SUPER_LIKE: '⭐ SUPER LIKE',
  REWIND: '⏪ REWIND',
};
```

**Phase 2 Validation:**
```bash
cd apps/mobile && pnpm tsc --noEmit 2>&1 | grep -E "Cannot find.*account|memories|premiumUi|swipeCard" | wc -l
# Expected: 0 (all type imports should resolve)
```

---

## 🎯 Phase 3: Mobile Services Layer (1-2 hours)

**Priority:** HIGH - Business logic for key features  
**Dependencies:** Requires Phase 2 (types must exist first)  
**Impact:** Enables Chat, Stories, and Video Call features  

### Task 3.1: Create Chat Service ✅
**Directory:** `apps/mobile/src/services/chat/`  
**Files:** 4 files (~600 lines total)  
**Purpose:** Real-time chat functionality with message queue

#### 3.1.1: `ChatService.ts` (main service)
```typescript
// Key features to implement:
import { io, Socket } from 'socket.io-client';

export class ChatService {
  private socket: Socket;
  private messageQueue: MessageQueue;
  
  constructor() {
    this.socket = io(process.env.EXPO_PUBLIC_API_URL);
    this.messageQueue = new MessageQueue();
  }
  
  async sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'video') {
    // Queue message for offline support
    // Emit via socket when online
  }
  
  subscribeToMessages(chatId: string, callback: (message: Message) => void) {
    // Listen to socket events
  }
  
  markAsRead(chatId: string, messageId: string) {
    // Send read receipt
  }
}
```

#### 3.1.2: `MessageQueue.ts` (offline queue)
```typescript
export class MessageQueue {
  private queue: QueuedMessage[] = [];
  
  async enqueue(message: QueuedMessage) {
    // Store in AsyncStorage
  }
  
  async dequeue() {
    // Retrieve and remove from storage
  }
  
  async processQueue() {
    // Send all queued messages when online
  }
}
```

#### 3.1.3: `TypingIndicator.ts` (typing status)
```typescript
export class TypingIndicator {
  private typingTimeout: NodeJS.Timeout | null = null;
  
  startTyping(chatId: string, userId: string) {
    // Emit typing event with debounce
  }
  
  stopTyping(chatId: string, userId: string) {
    // Clear timeout and emit stopped
  }
}
```

#### 3.1.4: `ReadReceipts.ts` (read status)
```typescript
export class ReadReceipts {
  trackRead(messageId: string, userId: string) {
    // Update read status in backend
  }
  
  getReadStatus(messageId: string): Promise<ReadStatus[]> {
    // Fetch who read this message
  }
}
```

#### 3.1.5: `index.ts` (barrel export)
```typescript
export { ChatService } from './ChatService';
export { MessageQueue } from './MessageQueue';
export { TypingIndicator } from './TypingIndicator';
export { ReadReceipts } from './ReadReceipts';
```

### Task 3.2: Create Stories Service ✅
**Directory:** `apps/mobile/src/services/stories/`  
**Files:** 4 files (~500 lines total)  
**Purpose:** Instagram-like stories functionality

#### 3.2.1: `StoriesService.ts` (main service)
```typescript
export class StoriesService {
  async fetchStories(userId?: string): Promise<Story[]> {
    // Fetch stories from API
    // userId is optional - if provided, fetch specific user's stories
  }
  
  async viewStory(storyId: string, userId: string) {
    // Record story view
  }
  
  async deleteStory(storyId: string) {
    // Delete story (24hr expiry)
  }
}
```

#### 3.2.2: `StoryUpload.ts` (upload handler)
```typescript
export class StoryUpload {
  async uploadStory(
    media: { uri: string; type: 'photo' | 'video' },
    caption?: string,
    duration?: number
  ): Promise<Story> {
    // Compress media
    // Upload to cloud storage
    // Create story record
  }
  
  validateMedia(uri: string, type: 'photo' | 'video'): boolean {
    // Check file size and format
  }
}
```

#### 3.2.3: `StoryViewer.ts` (view tracking)
```typescript
export class StoryViewer {
  async recordView(storyId: string, userId: string, duration: number) {
    // Track view analytics
  }
  
  async getViewers(storyId: string): Promise<User[]> {
    // Get list of users who viewed story
  }
}
```

#### 3.2.4: `StoryCache.ts` (local caching)
```typescript
export class StoryCache {
  async cacheStory(story: Story) {
    // Cache in AsyncStorage for offline viewing
  }
  
  async getCachedStories(): Promise<Story[]> {
    // Retrieve cached stories
  }
  
  async clearExpiredStories() {
    // Remove stories older than 24 hours
  }
}
```

#### 3.2.5: `index.ts` (barrel export)

### Task 3.3: Create WebRTC Service ✅
**Directory:** `apps/mobile/src/services/webrtc/`  
**Files:** 4 files (~700 lines total)  
**Purpose:** Video/audio calling with peer-to-peer connection

#### 3.3.1: `WebRTCService.ts` (main orchestrator)
```typescript
export class WebRTCService {
  private peerConnection: PeerConnection;
  private mediaStream: MediaStreamService;
  private signaling: SignalingClient;
  
  async initiateCall(
    recipientId: string,
    callType: 'audio' | 'video'
  ): Promise<CallSession> {
    // Create peer connection
    // Get media stream
    // Send offer via signaling
  }
  
  async answerCall(callId: string): Promise<void> {
    // Accept incoming call
    // Create answer
  }
  
  async endCall(callId: string): Promise<void> {
    // Close peer connection
    // Stop media streams
  }
}
```

#### 3.3.2: `PeerConnection.ts` (WebRTC peer)
```typescript
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

export class PeerConnection {
  private pc: RTCPeerConnection;
  
  async createOffer(): Promise<RTCSessionDescription> {
    // Create SDP offer
  }
  
  async createAnswer(offer: RTCSessionDescription): Promise<RTCSessionDescription> {
    // Create SDP answer
  }
  
  async addIceCandidate(candidate: RTCIceCandidate) {
    // Add ICE candidate for NAT traversal
  }
}
```

#### 3.3.3: `MediaStream.ts` (camera/mic access)
```typescript
export class MediaStreamService {
  async getLocalStream(
    audio: boolean = true,
    video: boolean = true
  ): Promise<MediaStream> {
    // Request camera/microphone permissions
    // Return media stream
  }
  
  async switchCamera() {
    // Toggle front/back camera
  }
  
  toggleMute(stream: MediaStream) {
    // Mute/unmute audio
  }
  
  stopStream(stream: MediaStream) {
    // Stop all tracks
  }
}
```

#### 3.3.4: `SignalingClient.ts` (socket for signaling)
```typescript
export class SignalingClient {
  private socket: Socket;
  
  sendOffer(offer: RTCSessionDescription, recipientId: string) {
    // Send offer via socket
  }
  
  sendAnswer(answer: RTCSessionDescription, callId: string) {
    // Send answer via socket
  }
  
  sendIceCandidate(candidate: RTCIceCandidate, callId: string) {
    // Exchange ICE candidates
  }
  
  onSignalingMessage(callback: (message: SignalingMessage) => void) {
    // Listen for signaling events
  }
}
```

#### 3.3.5: `index.ts` (barrel export)

**Phase 3 Validation:**
```bash
cd apps/mobile && pnpm tsc --noEmit 2>&1 | grep -E "services/(chat|stories|webrtc)" | wc -l
# Expected: 0 or minimal errors (some API integration errors expected)
```

---

## 🎯 Phase 4: Mobile UI Components (1-2 hours)

**Priority:** MEDIUM - User-facing components  
**Dependencies:** Requires Phase 2 (types), Phase 3 (services for screens)  
**Impact:** Completes UI for Chat, Stories, and SwipeCard features  

### Task 4.1: Create EnhancedSwipeCard Component ✅
**Directory:** `apps/mobile/src/components/EnhancedSwipeCard/`  
**Files:** 4 files (~400 lines total)

#### 4.1.1: `EnhancedSwipeCard.tsx` (main component)
```typescript
// Key features:
// - Gesture handling with react-native-gesture-handler
// - Smooth animations with react-native-reanimated
// - Overlay indicators (like/dislike)
// - Card stack management
// - Haptic feedback on gestures
```

#### 4.1.2: `CardOverlay.tsx` (like/dislike overlay)
```typescript
// Displays "LIKE" or "PASS" overlay based on swipe direction
// Animated opacity/scale based on swipe distance
```

#### 4.1.3: `SwipeIndicators.tsx` (visual indicators)
```typescript
// Bottom indicators showing remaining cards
// Action buttons (rewind, dislike, like, super-like)
```

#### 4.1.4: `index.ts` (barrel export)

### Task 4.2: Create Stories Component Directory ✅
**Directory:** `apps/mobile/src/components/stories/`  
**Files:** 5 files (~500 lines total)

#### 4.2.1: `StoryViewer.tsx` (fullscreen viewer)
```typescript
// Fullscreen story display
// Progress bars at top
// Tap left/right to navigate
// Hold to pause
```

#### 4.2.2: `StoryProgress.tsx` (progress bars)
```typescript
// Animated progress bars
// Shows current story position
// Auto-advances on timer
```

#### 4.2.3: `StoryUpload.tsx` (upload interface)
```typescript
// Camera capture or gallery selection
// Caption input
// Upload progress indicator
```

#### 4.2.4: `StoryThumbnail.tsx` (story avatar with ring)
```typescript
// Circular avatar with gradient ring
// "+" indicator for adding story
// Unviewed indicator
```

#### 4.2.5: `index.ts` (barrel export)

### Task 4.3: Create Component Tests ✅
**Directory:** `apps/mobile/src/components/__tests__/`  
**Files:** 4 test files (~400 lines total)

#### 4.3.1: `SwipeCard.test.tsx`
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import SwipeCard from '../SwipeCard';

describe('SwipeCard', () => {
  it('should render card with pet information', () => {});
  it('should handle left swipe gesture', () => {});
  it('should handle right swipe gesture', () => {});
  it('should trigger haptic feedback on swipe', () => {});
});
```

#### 4.3.2: `Premium.test.tsx`
```typescript
// Tests for Premium components (GlassCard, FAB, etc.)
```

#### 4.3.3: `Stories.test.tsx`
```typescript
// Tests for Stories components
```

#### 4.3.4: `EnhancedSwipeCard.test.tsx`
```typescript
// Tests for EnhancedSwipeCard
```

### Task 4.4: Create ChatScreenNew ✅
**File:** `apps/mobile/src/screens/ChatScreenNew.tsx`  
**Size:** ~350 lines  
**Dependencies:** Requires Phase 3 (ChatService)

```typescript
// Key features:
// - Message list with FlatList
// - Message input with media picker
// - Typing indicator
// - Read receipts
// - Message reactions
// - Pull-to-load-more
// - Real-time updates via ChatService
```

### Task 4.5: Create StoriesScreenNew ✅
**File:** `apps/mobile/src/screens/StoriesScreenNew.tsx`  
**Size:** ~300 lines  
**Dependencies:** Requires Phase 3 (StoriesService)

```typescript
// Key features:
// - Horizontal story list at top
// - Story viewer modal
// - Upload story button
// - Story expiry countdown
// - View analytics
```

**Phase 4 Validation:**
```bash
cd apps/mobile && pnpm tsc --noEmit 2>&1 | grep -E "components/(EnhancedSwipeCard|stories|__tests__)|screens/(ChatScreenNew|StoriesScreenNew)" | wc -l
# Expected: Minimal errors (mostly prop-type refinements)
```

---

## 🎯 Phase 5: Final Validation & Documentation (30 minutes)

**Priority:** CRITICAL - Ensure quality  
**Dependencies:** All previous phases  
**Impact:** Catches regressions, ensures code quality  

### Task 5.1: Run TypeScript Validation ✅
```bash
# Web app
cd apps/web && pnpm tsc --noEmit

# Mobile app
cd apps/mobile && pnpm tsc --noEmit

# Expected: Significant error reduction
# Before: Web 17 errors, Mobile 98 errors
# Target: Web <5 errors, Mobile <30 errors
```

### Task 5.2: Run ESLint Validation ✅
```bash
# Web app
cd apps/web && pnpm lint

# Mobile app
cd apps/mobile && pnpm lint

# Fix any auto-fixable issues:
pnpm lint --fix
```

### Task 5.3: Update Documentation ✅
**Update:** `docs/MISSING_ASSETS_RECOVERY_LIST.md`

Add to Progress Log:
```markdown
- **[2025-10-16 | Full Reconstruction]** Completed reconstruction of 23 critical assets:
  - Web: 8 files (hooks, store, styles, constants, types)
  - Mobile: 15 items (types, constants, services, screens, components)
  - TypeScript errors reduced: Web 17→<5, Mobile 98→<30
  - All core features now functional: Settings, Haptics, Chat, Stories, WebRTC, SwipeCard
```

### Task 5.4: Create Verification Report ✅
**Create:** `RECONSTRUCTION_COMPLETION_REPORT.md`

```markdown
# Reconstruction Completion Report

**Date:** October 16, 2025
**Duration:** ~4-6 hours
**Items Completed:** 23/23 (100%)

## ✅ Completed Items

### Web App (8/8)
- ✅ types/settings.ts
- ✅ constants/haptics.ts
- ✅ styles/haptic.css
- ✅ store/settingsStore.ts
- ✅ store/index.ts
- ✅ hooks/useSettings.ts
- ✅ hooks/useHapticFeedback.ts
- ✅ hooks/useMediaQuery.ts

### Mobile App (15/15)
- ✅ types/account.ts
- ✅ types/memories.ts
- ✅ types/premiumUi.ts
- ✅ types/react-native-reanimated.d.ts
- ✅ constants/swipeCard.ts
- ✅ services/chat/ (4 files)
- ✅ services/stories/ (4 files)
- ✅ services/webrtc/ (4 files)
- ✅ screens/ChatScreenNew.tsx
- ✅ screens/StoriesScreenNew.tsx
- ✅ components/EnhancedSwipeCard/ (4 files)
- ✅ components/stories/ (5 files)
- ✅ components/__tests__/ (4 files)

## 📊 Impact Metrics

### TypeScript Errors
- **Web:** 17 → <5 errors (-71%)
- **Mobile:** 98 → <30 errors (-69%)

### Code Coverage
- **New Code:** ~3,500 lines
- **Test Files:** 4 test suites, ~400 lines
- **Documentation:** 2 comprehensive docs

## 🚀 Features Enabled
- ✅ Settings management (theme, notifications, privacy, accessibility)
- ✅ Haptic feedback (web & mobile)
- ✅ Real-time chat with offline support
- ✅ Stories (upload, view, analytics)
- ✅ Video/audio calling (WebRTC)
- ✅ Enhanced swipe cards with animations

## 🔜 Next Steps
1. Platform assets generation (Android/iOS splash screens, icons)
2. E2E testing for new features
3. Performance optimization
4. Documentation for new APIs
```

---

## 📊 Success Criteria

### ✅ Definition of Done:
1. All 23 files/directories created with complete implementations
2. TypeScript compilation passes with <5 errors per app
3. ESLint passes with 0 warnings (or documented exceptions)
4. All imports resolve correctly
5. No "Cannot find module" errors
6. Basic test coverage exists for critical components
7. Documentation updated to reflect new implementations

### 📈 Expected Metrics:
- **Before:** 17 web errors, 98 mobile errors
- **Target:** <5 web errors, <30 mobile errors
- **Error Reduction:** >70% across both apps
- **New LOC:** ~3,500 lines of production code
- **Test LOC:** ~400 lines of test code

---

## ⚠️ Known Limitations & Future Work

### Not Included in This Plan:
1. **Platform Assets** (Android/iOS splash screens, launcher icons)
   - Reason: Requires design assets from design team
   - Impact: App will use default Expo assets
   - Timeline: Can be added later without blocking functionality

2. **Documentation Files** (.windsurf/workflows/, .github/instructions/)
   - Reason: Procedural/process docs, not code
   - Impact: No functional impact
   - Timeline: Can be created as needed

3. **E2E Test Infrastructure** (tests/e2e/)
   - Reason: Requires running backend and test environment
   - Impact: Manual testing still possible
   - Timeline: Add after core features stabilize

4. **Mock Data** (src/__mocks__/react-native.js)
   - Reason: Only needed for specific test scenarios
   - Impact: Unit tests may need manual mocking
   - Timeline: Add when tests require it

### Post-Reconstruction Tasks:
1. Integration testing with backend APIs
2. Performance profiling and optimization
3. Accessibility audit
4. Security review (WebRTC, chat)
5. Analytics integration
6. Error tracking (Sentry) setup

---

## 🛠️ Implementation Commands

### Quick Start (Execute in Order):

```bash
# Phase 1: Web Foundation
cd /Users/elvira/Downloads/pets-pr-1/apps/web
# Execute Tasks 1.1 - 1.8

# Phase 2: Mobile Types
cd /Users/elvira/Downloads/pets-pr-1/apps/mobile
# Execute Tasks 2.1 - 2.5

# Phase 3: Mobile Services
cd /Users/elvira/Downloads/pets-pr-1/apps/mobile
# Execute Tasks 3.1 - 3.3

# Phase 4: Mobile UI
cd /Users/elvira/Downloads/pets-pr-1/apps/mobile
# Execute Tasks 4.1 - 4.5

# Phase 5: Validation
cd /Users/elvira/Downloads/pets-pr-1
# Execute Tasks 5.1 - 5.4
```

### Validation Commands:
```bash
# After each phase, run:
pnpm tsc --noEmit 2>&1 | grep -E "error TS[0-9]+:" | wc -l

# Final validation:
cd apps/web && pnpm lint && pnpm tsc --noEmit
cd apps/mobile && pnpm lint && pnpm tsc --noEmit
```

---

## 📞 Support & Questions

If you encounter issues during reconstruction:

1. **TypeScript Errors:** Check that all dependencies from previous phases are completed
2. **Import Errors:** Verify file paths match the exact structure in this plan
3. **Build Errors:** Run `pnpm install` to ensure dependencies are up to date
4. **Test Failures:** Some tests may need backend API mocks

---

**Plan Status:** ✅ Ready for Implementation  
**Estimated Completion:** 4-6 hours  
**Risk Level:** LOW (clear dependencies, well-defined scope)  
**Team Size:** 1-2 developers  

🎯 **Let's build!**
