# Critical Gaps Fix Plan

## Status: In Progress

### ✅ Fixed
1. **TypeScript Errors** - Fixed (0 errors now)
   - Fixed `PremiumGate.tsx` import path
   - Stubbed out i18n dependencies
   - Fixed MSW exports

### 🔴 Critical: GDPR Backend Endpoints

**Issue**: Users can request deletion/export from Settings, but backend endpoints missing.

**Required**:
1. `DELETE /users/delete-account` - Account deletion with grace period
2. `GET /users/export-data` - GDPR export
3. `POST /users/confirm-deletion` - Final deletion confirmation

**Status**: Contract tests exist in `tests/contract/gdpr-api.contract.test.ts`

### 🟡 High: Chat Features Orphaned

**Issue**: UI exists but no backend service methods
1. **Reactions**: `MessageBubble` shows buttons but no `sendReaction()` service
2. **Attachments**: `MessageInput` has attach button but no upload logic
3. **Voice Notes**: UI ready but no recording service

**Status**: Contract tests needed, services need implementation

### 🟡 High: AI Compatibility Endpoint

**Issue**: No backend endpoint for enhanced AI compatibility analysis

**Required**: `POST /ai/enhanced-compatibility` with detailed analysis

**Status**: Contract test exists in `tests/contract/`

### 🔴 Critical: Security Issues

**Issues**:
1. Hardcoded secrets found
2. Missing SSL pinning
3. PII in logs (needs redaction)

**Status**: Security scan exists, needs addressing

---

## Implementation Priority

### Phase 1: Critical (Week 1)
- [ ] Implement GDPR backend endpoints
- [ ] Fix hardcoded secrets
- [ ] Add SSL pinning
- [ ] PII redaction

### Phase 2: High (Week 2)  
- [ ] Chat reactions service
- [ ] Chat attachments
- [ ] Voice notes service
- [ ] AI compatibility endpoint

---

## Next Steps

1. Run security scan to identify all secrets: `pnpm test:security`
2. Review `reports/gap_log.yaml` for detailed requirements
3. Implement GDPR endpoints in backend
4. Create chat service methods
5. Add AI compatibility endpoint

## Progress Tracking

Update this document as gaps are resolved.

