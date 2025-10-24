# Master Enhancement Back-Log – 120 Actionable UI / UX / DX Tasks

Grouped by theme so your designers & devs can cherry-pick.

## 📊 Implementation Status Summary

**Current Progress: 4/15 Design System Tasks Complete (27%)**

### ✅ Completed Tasks

- Semantic color roles (success/error/warning) with dark & light variants
- Heroicons React components integration
- ESLint + Prettier auto-formatting configuration
- Docker Compose development environment

### 🔄 In Progress

- None currently active

### ❌ Pending High-Priority Tasks

- 8-pt spacing scale & Figma documentation
- CSS variables for color system
- Typography scale + Tailwind plugin
- Elevation tokens (shadow system)
- Jest watch mode optimization
- Storybook setup and interaction tests
- Cypress component testing
- Renovate dependency management
- GitHub CodeQL security scanning
- Environment schema validation
- CONTRIBUTING.md documentation

### 🎯 Next Steps Priority

1. **CSS Variables System** - Replace hardcoded hex colors
2. **Typography Scale** - Create consistent text sizing system
3. **Elevation Tokens** - Implement shadow design system
4. **Storybook Setup** - Component documentation and testing
5. **Environment Schema** - Add zod validation for env vars

## A. Design-System (01-20)

- [ ] Define 8-pt spacing scale & document in Figma
- [ ] Replace raw hex colors with CSS variables (--pm-primary)
- [x] Add semantic color roles (success/error/warning) dark & light
- [ ] Create typography scale (xs–6xl) + Tailwind plugin
- [ ] Introduce elevation tokens (shadow-xs … shadow-3xl)
- [x] Export icon set as React components (Heroicons subset)
- [x] Auto-format on save via ESLint + Prettier
- [ ] Enable Jest watch peer deps for faster runs
- [ ] Write Storybook interaction tests (play functions)
- [ ] Add Cypress component testing for hooks
- [ ] Configure Renovate for dependency updates
- [ ] Add GitHub CodeQL security scan
- [x] Ship docker-compose.dev.yml for one-command spin-up
- [ ] Introduce .env.schema checked by env-var or zod
- [ ] Document full local onboarding in CONTRIBUTING.md How to use:

Paste each line into your tracker (tag = enhancement). Prioritise by business
value & dev capacity. Bundle related items into epics (Design-System, Mobile UX,
Premium). Aim for 2-day sprints tackling 8-10 items at a time.

## Extra-Delight Feature Back-Log (30 fresh items)

Add on top of the previous 120. Focus: social “stories / posts”, polished layout
(header / footer), micro-animations.

Stories & Posts (S-01 → S-10)

- [ ] S-01 Pet "Stories" carousel (15-sec photo/video clips) – swipe up to reply
- [ ] S-02 Story composer with image crop, stickers, captions
- [ ] S-03 Story ring around pet avatar when unseen
- [ ] S-04 Expiring posts (48 h) with automatic cleanup job
- [ ] S-05 Highlight reel – pin favourite stories on profile
- [ ] S-06 Emoji reactions overlay while viewing story (tap to react)
- [ ] S-08 "Add to Story" CTA on camera/album picker
- [ ] S-09 Story analytics for owner (views, reactions)
- [ ] S-10 Report / mute story options (long-press menu) 📰 Feed & Timeline
      (F-01 → F-06)
- [ ] F-01 Home feed of matched pets' posts (infinite scroll)
- [ ] F-02 Pull-to-refresh animation (paw scratch gif)
- [ ] F-03 Virtualised list for 60 fps scroll
- [ ] F-04 Auto-play videos in feed when 75 % visible, pause otherwise
- [ ] F-05 Lazy-load comments on demand (accordion)
- [ ] F-06 Sentiment badge on post (happy / training / adventure) 🏛 Header &
      Footer Polish (H-01 → H-08)
- [ ] H-01 Sticky glass-morphism header with subtle blur
- [ ] H-02 Animated logo morph on hover (SVG path tween)
- [ ] H-03 Scroll-up hide header; show on reverse scroll
- [ ] H-04 Notification bell with SVG bounce when new item arrives
- [ ] H-05 Footer "Made with ❤️ & 🐾 in " + social icons
- [ ] H-06 Back-to-top button appears after 400 px scroll
- [ ] H-07 Footer sitemap auto-generated from routes file
- [ ] H-08 Locale switcher dropdown in header (flag icons) ✨ Micro-Animations &
      Delight (A-01 → A-10)
- [ ] A-01 Confetti burst on first match (canvas or ts-particles)
- [ ] A-02 Like button morphs into heart splash (spring scale)
- [ ] A-03 Pass card flips 3-D and fades on swipe left
- [ ] A-04 Typing indicator dots scale rhythmically (keyframes)
- [ ] A-05 Premium badge glows with CSS animate-pulse every 10 s
- [ ] A-06 Button press plays 60 ms haptic & subtle click audio
- [ ] A-07 Skeleton shimmer uses gradient moving diagonal shimmer
- [ ] A-08 Swipe-to-refresh lever icon rotates with drag distance
- [ ] A-09 Header nav underline slides between active routes
- [ ] A-10 Responsive parallax hero (mouse / tilt on mobile gyro) 🛠 Dev Handoff
      Create tickets S-01…A-10 in tracker, tag enhancement. Prioritise by
      “visual wow” vs effort (many are pure CSS/Framer). Use Storybook to
      prototype micro-animations before merging. Run Lighthouse again after
      adding effects; respect prefers-reduced-motion.
