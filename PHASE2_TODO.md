# Phase 2 Implementation - TODO List

**Last Updated:** 2025-01-XX  
**Status:** Backend & Mobile Services Complete ✅ | Testing & Integration Pending ⚠️

---

## ✅ Completed Tasks

### Phase 2-1: Artifacts Directory Structure ✅
- [x] Created `artifacts/` directory structure
- [x] Created subdirectories (snapshot, contracts, evidence, sbom, reports, progress)

### Phase 2-2: TypeScript Contracts ✅
- [x] Created `packages/core/src/types/phase2-contracts.ts`
- [x] Exported contracts in `packages/core/src/types/index.ts`
- [x] All 6 contract types defined (ScheduledMessage, Translation, OutboxItem, MessageTemplate, SmartSuggestion, SwipePremium)

### Phase 2-3: Database Models ✅
- [x] Created `ScheduledMessage` model
- [x] Created `Translation` model
- [x] Created `MessageTemplate` model
- [x] All models indexed for performance

### Phase 2-4: Backend Services ✅
- [x] `messageSchedulingService.ts` - Timezone/DST handling, cron processing
- [x] `translationService.ts` - Translation proxy with caching
- [x] `messageTemplateService.ts` - Template CRUD with encryption
- [x] `smartSuggestionsService.ts` - AI-powered suggestions
- [x] `swipePremiumService.ts` - Premium features with usage limits
- [x] `outboxSyncService.ts` - Offline message sync

### Phase 2-5: Backend Controllers ✅
- [x] `messageSchedulingController.ts` - 3 endpoints
- [x] `translationController.ts` - 1 endpoint
- [x] `messageTemplateController.ts` - 5 endpoints
- [x] `smartSuggestionsController.ts` - 1 endpoint
- [x] `swipePremiumController.ts` - 4 endpoints
- [x] `outboxSyncController.ts` - 1 endpoint

### Phase 2-6: Routes Integration ✅
- [x] Added Phase 2 routes to `server/src/routes/chat.ts`
- [x] Added premium routes to `server/src/routes/swipe.ts`
- [x] All routes protected with authentication

### Phase 2-7: Mobile Services ✅
- [x] `messageSchedulingService.ts` (mobile)
- [x] `translationService.ts` (mobile)
- [x] `messageTemplateService.ts` (mobile)
- [x] `smartSuggestionsService.ts` (mobile)
- [x] `swipePremiumService.ts` (mobile)
- [x] `outboxSyncService.ts` (mobile) - With AsyncStorage integration

### Phase 2-8: Mobile Hooks ✅
- [x] `useMessageScheduling.ts` - 3 hooks
- [x] `useTranslation.ts` - 1 hook
- [x] `useMessageTemplates.ts` - 5 hooks
- [x] `useSmartSuggestions.ts` - 1 hook
- [x] `useSwipePremium.ts` - 4 hooks
- [x] `useOfflineOutbox.ts` - 4 hooks (including auto-sync)

### Phase 2-9: CI/CD & Configuration ✅
- [x] Created `.github/workflows/aeos-v3.yml`
- [x] Created `budgets.json` with all performance budgets
- [x] Created `ratchets.json` with quality ratchets

### Phase 2-10: Cron Jobs ✅
- [x] Created `server/src/jobs/messageSchedulingJob.ts`
- [x] Scheduled message processor (every minute)
- [x] Translation cache cleanup (daily at 2 AM UTC)

---

## ⚠️ Pending Tasks

### Phase 2-11: Initialize Cron Jobs ⚠️ HIGH PRIORITY
**Status:** Code created but not wired to server startup

- [ ] Find server startup file (`server/src/index.ts` or similar)
- [ ] Import cron job functions:
  ```typescript
  import {
    initializeScheduledMessageJob,
    initializeTranslationCleanupJob
  } from './jobs/messageSchedulingJob';
  ```
- [ ] Call initialization functions in server startup (after DB connection)
- [ ] Test cron jobs start correctly
- [ ] Verify scheduled messages process every minute
- [ ] Verify translation cleanup runs daily

**Files to modify:**
- `server/src/index.ts` (or main server entry point)

---

### Phase 2-12: Fix Cron Job Syntax ⚠️ HIGH PRIORITY
**Status:** Functions use `await` in non-async context

- [ ] Fix `initializeScheduledMessageJob()` - remove `await` or make async
- [ ] Fix `initializeTranslationCleanupJob()` - remove `await` or make async
- [ ] Test that functions can be called synchronously or update caller

**Files to fix:**
- `server/src/jobs/messageSchedulingJob.ts` (lines 15, 46)

---

### Phase 2-13: Database Migrations ⚠️ MEDIUM PRIORITY
**Status:** Models created but migrations not run

- [ ] Create migration script for `ScheduledMessage` collection
- [ ] Create migration script for `Translation` collection
- [ ] Create migration script for `MessageTemplate` collection
- [ ] Test migrations on development database
- [ ] Document migration process

**Files to create:**
- `server/migrations/XXXX_create_scheduled_messages.ts`
- `server/migrations/XXXX_create_translations.ts`
- `server/migrations/XXXX_create_message_templates.ts`

---

### Phase 2-14: Environment Variables ⚠️ MEDIUM PRIORITY
**Status:** Some services require env vars

- [ ] Document required environment variables:
  - `GOOGLE_TRANSLATE_API_KEY` (optional, for translation service)
  - `OPENAI_API_KEY` or `CLAUDE_API_KEY` (optional, for smart suggestions)
- [ ] Add to `.env.example`
- [ ] Add to deployment documentation
- [ ] Test services with/without API keys (fallback behavior)

---

### Phase 2-15: Unit Tests ⚠️ HIGH PRIORITY
**Status:** No tests written yet

#### Backend Service Tests
- [ ] `messageSchedulingService.test.ts`
  - [ ] Test timezone conversion (including DST)
  - [ ] Test create/get/cancel flows
  - [ ] Test cron processor with mock dates
- [ ] `translationService.test.ts`
  - [ ] Test cache hit/miss scenarios
  - [ ] Test language detection
  - [ ] Test cleanup job
- [ ] `messageTemplateService.test.ts`
  - [ ] Test CRUD operations
  - [ ] Test variable extraction and rendering
  - [ ] Test encryption/decryption
- [ ] `smartSuggestionsService.test.ts`
  - [ ] Test AI integration (mock)
  - [ ] Test fallback suggestions
  - [ ] Test sentiment analysis
- [ ] `swipePremiumService.test.ts`
  - [ ] Test usage limits
  - [ ] Test premium verification
  - [ ] Test daily reset logic
- [ ] `outboxSyncService.test.ts`
  - [ ] Test FIFO ordering
  - [ ] Test error handling
  - [ ] Test batch processing

#### Controller Tests
- [ ] `messageSchedulingController.test.ts`
- [ ] `translationController.test.ts`
- [ ] `messageTemplateController.test.ts`
- [ ] `smartSuggestionsController.test.ts`
- [ ] `swipePremiumController.test.ts`
- [ ] `outboxSyncController.test.ts`

#### Mobile Hook Tests
- [ ] `useMessageScheduling.test.ts`
- [ ] `useTranslation.test.ts`
- [ ] `useMessageTemplates.test.ts`
- [ ] `useSmartSuggestions.test.ts`
- [ ] `useSwipePremium.test.ts`
- [ ] `useOfflineOutbox.test.ts`

---

### Phase 2-16: Integration Tests ⚠️ MEDIUM PRIORITY
**Status:** End-to-end flows not tested

- [ ] Test scheduled message flow:
  - [ ] Create scheduled message
  - [ ] Wait for cron job to process
  - [ ] Verify message sent
- [ ] Test translation flow:
  - [ ] Request translation
  - [ ] Verify cache hit on second request
  - [ ] Test cleanup job
- [ ] Test template flow:
  - [ ] Create template
  - [ ] Render with variables
  - [ ] Verify usage tracking
- [ ] Test premium features:
  - [ ] Verify subscription check
  - [ ] Test usage limits
  - [ ] Test daily reset
- [ ] Test offline outbox:
  - [ ] Queue message offline
  - [ ] Restore connectivity
  - [ ] Verify sync

---

### Phase 2-17: UI Components ⚠️ HIGH PRIORITY
**Status:** Hooks ready, but no UI yet

#### Message Scheduling UI
- [ ] Create `ScheduleMessageScreen.tsx` or modal
- [ ] Date/time picker with timezone selection
- [ ] List of scheduled messages
- [ ] Cancel button for scheduled messages
- [ ] Integration with chat screen

#### Translation UI
- [ ] Translation button in chat messages
- [ ] Language selector
- [ ] Translated text display (collapsible)
- [ ] Quality indicator
- [ ] Toggle on/off

#### Message Templates UI
- [ ] Template list screen
- [ ] Create/edit template form
- [ ] Variable input form
- [ ] Template picker in chat input
- [ ] Quick insert button

#### Smart Suggestions UI
- [ ] Suggestion chips below chat input
- [ ] Accept/reject buttons
- [ ] Loading state
- [ ] Empty state

#### Premium Swipe UI
- [ ] Rewind button on swipe screen
- [ ] Super like button (enhanced)
- [ ] Boost button in profile
- [ ] Usage indicators (X/5 super likes remaining)
- [ ] Premium badge

#### Offline Outbox UI
- [ ] Queue indicator (badge)
- [ ] Retry button for failed messages
- [ ] Sync status indicator
- [ ] Empty state

---

### Phase 2-18: Error Handling & Edge Cases ⚠️ MEDIUM PRIORITY
**Status:** Basic error handling done, edge cases need testing

- [ ] Test timezone edge cases:
  - [ ] DST transitions
  - [ ] Invalid timezones
  - [ ] Past dates
- [ ] Test translation edge cases:
  - [ ] Very long messages
  - [ ] Unsupported languages
  - [ ] API rate limits
  - [ ] Cache expiration
- [ ] Test template edge cases:
  - [ ] Very long templates
  - [ ] Missing variables
  - [ ] Circular references
  - [ ] Encryption failures
- [ ] Test premium edge cases:
  - [ ] Subscription expiration mid-use
  - [ ] Concurrent usage requests
  - [ ] Reset time edge cases
- [ ] Test outbox edge cases:
  - [ ] Very large queue (100+ messages)
  - [ ] Network interruptions during sync
  - [ ] Storage quota exceeded
  - [ ] Corrupted queue data

---

### Phase 2-19: Performance Optimization ⚠️ LOW PRIORITY
**Status:** Functional but not optimized

- [ ] Optimize scheduled message query (add compound index if needed)
- [ ] Optimize translation cache lookup
- [ ] Optimize template rendering (pre-compile variables?)
- [ ] Optimize outbox sync (batch size tuning)
- [ ] Add Redis caching for premium usage (if applicable)
- [ ] Load test scheduled message processor with 1000+ messages
- [ ] Load test translation service with concurrent requests

---

### Phase 2-20: Documentation ⚠️ MEDIUM PRIORITY
**Status:** Implementation doc created, API docs needed

- [ ] API documentation for all endpoints
- [ ] Mobile hook usage examples
- [ ] Feature flag configuration guide
- [ ] Timezone handling documentation
- [ ] Translation service setup guide
- [ ] Premium feature user guide
- [ ] Offline outbox troubleshooting guide

---

### Phase 2-21: Monitoring & Observability ⚠️ MEDIUM PRIORITY
**Status:** Logging exists, metrics needed

- [ ] Add telemetry events for all Phase 2 features:
  - [ ] `chat.schedule.created`
  - [ ] `chat.schedule.sent`
  - [ ] `chat.translation.requested`
  - [ ] `chat.template.used`
  - [ ] `chat.suggestions.generated`
  - [ ] `swipe.premium.rewind.used`
  - [ ] `offline.outbox.synced`
- [ ] Add performance metrics:
  - [ ] Scheduled message processing time
  - [ ] Translation latency (p50, p95)
  - [ ] Template render time
  - [ ] Outbox sync duration
- [ ] Add error tracking:
  - [ ] Failed scheduled sends
  - [ ] Translation failures
  - [ ] Outbox sync failures
- [ ] Create dashboards (if using monitoring service)

---

### Phase 2-22: Security Review ⚠️ HIGH PRIORITY
**Status:** Basic auth done, security review needed

- [ ] Review template encryption implementation
- [ ] Review rate limiting on translation endpoint
- [ ] Review premium subscription verification
- [ ] Review offline outbox storage security
- [ ] Test for injection vulnerabilities (template variables)
- [ ] Test for timezone-based attacks
- [ ] Review PII in translation logs

---

### Phase 2-23: Accessibility ⚠️ MEDIUM PRIORITY
**Status:** Not implemented yet (will be needed for UI)

- [ ] Screen reader support for scheduled messages
- [ ] Screen reader support for translations
- [ ] Keyboard navigation for templates
- [ ] Focus management for suggestions
- [ ] High contrast mode support
- [ ] Reduce motion support

---

## Priority Summary

### 🔴 CRITICAL (Do First)
1. **Phase 2-11:** Initialize cron jobs in server startup
2. **Phase 2-12:** Fix cron job syntax errors
3. **Phase 2-15:** Write unit tests (at least for critical paths)
4. **Phase 2-22:** Security review

### 🟡 HIGH PRIORITY (Do Soon)
1. **Phase 2-13:** Database migrations
2. **Phase 2-14:** Environment variables documentation
3. **Phase 2-17:** UI Components (at least core flows)
4. **Phase 2-21:** Monitoring & observability

### 🟢 MEDIUM PRIORITY (Nice to Have)
1. **Phase 2-16:** Integration tests
2. **Phase 2-18:** Error handling & edge cases
3. **Phase 2-20:** Documentation
4. **Phase 2-23:** Accessibility

### 🔵 LOW PRIORITY (Optimize Later)
1. **Phase 2-19:** Performance optimization

---

## Quick Start Commands

### Initialize Cron Jobs
```bash
# Edit server/src/index.ts (or main entry point)
# Add after DB connection:
import {
  initializeScheduledMessageJob,
  initializeTranslationCleanupJob
} from './jobs/messageSchedulingJob';

// After DB connection
initializeScheduledMessageJob();
initializeTranslationCleanupJob();
```

### Run Tests (when written)
```bash
# Backend tests
pnpm --filter server test

# Mobile tests
pnpm --filter @pawfectmatch/mobile test
```

### Check Feature Flags
```typescript
import { featureFlags } from '@pawfectmatch/core';

// All Phase 2 flags default to false
featureFlags.isEnabled('chatSchedule');
featureFlags.isEnabled('chatTranslation');
featureFlags.isEnabled('chatTemplates');
featureFlags.isEnabled('chatSmartSuggestions');
featureFlags.isEnabled('swipePremium');
featureFlags.isEnabled('offlineOutbox');
```

---

## Next Immediate Steps

1. **Fix cron job syntax** (15 minutes)
   - Make functions async or remove `await` keyword

2. **Wire cron jobs to startup** (15 minutes)
   - Add imports and initialization calls

3. **Write basic tests** (2-3 hours)
   - Start with message scheduling service (critical path)
   - Test timezone conversion thoroughly

4. **Create basic UI** (4-6 hours)
   - Start with scheduled message UI (highest value)
   - Add to existing chat screen

---

**Total Estimated Remaining Work:** ~20-30 hours for complete production readiness

