# Mobile App Refactor Package

This package contains all essential files for a comprehensive mobile app refactor with advanced animations, performance optimizations, and UI/UX enhancements.

## Package Structure

```
package-for-refactor/
├── navigation/          # Navigation config, transitions, types
├── theme/              # Theme system, tokens, design system
├── components/
│   ├── elite/          # EliteComponents primitives
│   ├── chat/           # Chat components (MobileChat, MessageBubble, etc.)
│   ├── swipe/          # Swipe deck components
│   ├── cards/          # Card components
│   ├── gestures/       # Gesture handlers
│   └── animations/     # Motion primitives
├── screens/            # Core screen implementations
├── hooks/              # Custom hooks (useSwipeGestures, etc.)
├── services/           # API services, state management
└── config/             # App configuration files
```

## What to Expect After Refactor

### A) Navigation
- Buttery iOS/Android-native transitions
- Elastic header reveal
- Scroll-aware opacity
- Shared-element-like touches

### B) Theme & Design
- Dark/light auto palettes
- Semantic roles
- Motion tokens
- Consistent blur/shadow scales

### C) Swipe Deck
- Resistance curve tuning
- Spring "throw" physics
- Streak haptics
- Particle confetti (optional) for super-like

### D) Chat
- Reply-swipe + preview + thread jump
- Message send/deliver/read ticks micro-motion
- Link previews
- Better voice message affordances

### E) Performance
- 60fps scroll (getItemLayout, removeClippedSubviews)
- Image caching/priorities
- Interaction gates to avoid layout thrash
- Reanimated on-UI transforms only

### F) Profile & Cards
- Tactile hover/press physics
- Parallax headers
- Image lazy-fade + color-aware overlays
- Glass cards with elevation harmonized

## Files Included

### Navigation
- `navigation/transitions.ts` - Screen transitions
- `navigation/types.ts` - Type definitions

### Theme
- All theme provider files
- Design tokens
- Unified theme system
- Adapters

### Components
- EliteComponents primitives
- Chat components (MobileChat, MessageBubble, ReactionPicker, etc.)
- Swipe components
- Gesture wrappers
- Motion primitives

### Screens
- Profile screens
- Swipe screen
- Matches screen
- Chat screen
- Settings screens

### Hooks
- `useSwipeGestures.ts` - Swipe gesture handler
- `useSwipeToReply.ts` - Reply gesture
- `useThreadJump.ts` - Thread navigation
- `useHighlightPulse.ts` - Pulse animation

### Services
- API client
- Chat service
- Matching service
- Auth service
- And more...

### Config
- `package.json` - Dependencies
- `babel.config.cjs` - Babel/Reanimated config
- `tsconfig.json` - TypeScript config
- `metro.config.cjs` - Metro bundler config
- `app.json` - Expo config

## Next Steps

1. Review the file structure
2. Check package.json for dependencies
3. Ensure all paths in the refactor target the correct file locations
4. Run the refactor process with the advanced animation/performance enhancements
5. Test thoroughly with the comprehensive test suites

## Notes

- All files are production-ready
- TypeScript strict mode enabled
- Reanimated 3.x configured
- React Native Gesture Handler configured
- Expo managed workflow

