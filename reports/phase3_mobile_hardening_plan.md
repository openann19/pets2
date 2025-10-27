# Phase 3: Mobile Hardening - Services Layer Enhancement

**Goal:** Harden core PawfectMatch mobile services with strict types, security, and comprehensive testing

## Current Status Analysis

### ✅ Services Already Hardened
- **chatService.ts**: ✅ Has `sendReaction()`, `sendAttachment()`, `sendVoiceNote()` methods
- **gdprService.ts**: ✅ Has `deleteAccount()`, `exportUserData()`, `cancelDeletion()` methods

### ❌ Services Needing Enhancement
- **AuthService.ts**: Uses SecureStore, needs Keychain/Keystore upgrade for production security
- **Testing Coverage**: Only 3/40+ services tested, need ≥80% for core services

## Phase 3 Implementation Plan

### 3.1 AuthService Security Upgrade
**Current:** Uses `expo-secure-store` 
**Required:** Use `react-native-keychain` for iOS Keychain / Android Keystore

**Implementation:**
1. Install `react-native-keychain` 
2. Replace SecureStore with Keychain in AuthService
3. Add biometric authentication support
4. Maintain backward compatibility during migration

### 3.2 Core Services Testing Expansion
**Target:** ≥80% coverage for core services
**Current:** 3 test files (7.5% coverage)

**Services to Test:**
- ✅ `chatService` - reactions, attachments, voice notes
- ✅ `gdprService` - account deletion, data export
- ❌ `authService` - login, token management, security
- ❌ `api` - HTTP client, error handling
- ❌ `uploadService` - file uploads
- ❌ `matchingService` - swipe logic, preferences

**Testing Strategy:**
- Unit tests for service methods
- Integration tests for API calls
- Mock external dependencies (AsyncStorage, Keychain, API)
- Error handling and edge cases
- Type safety validation

### 3.3 Service Architecture Improvements
**Standards to Implement:**
- ✅ Remove all `any` types
- ✅ Strict null/undefined checks
- ✅ Async discipline (no floating promises)
- ✅ Structured logging (PII redaction)
- ✅ HTTPS enforcement, timeouts, backoff
- ✅ Security: token validation, input sanitization

## Implementation Tasks

### AuthService Upgrade (High Priority)
- [ ] Install react-native-keychain dependency
- [ ] Replace SecureStore with Keychain in token storage
- [ ] Add biometric authentication support
- [ ] Update error handling for Keychain failures
- [ ] Test migration from SecureStore to Keychain

### Testing Infrastructure (High Priority)
- [ ] Create test utilities for service mocking
- [ ] Set up Jest configuration for service testing
- [ ] Create authService test suite (login, logout, token refresh)
- [ ] Create api service test suite (requests, error handling)
- [ ] Create gdprService integration tests
- [ ] Create chatService integration tests

### Code Quality (Medium Priority)
- [ ] Audit all services for `any` types
- [ ] Add comprehensive error types
- [ ] Implement structured logging
- [ ] Add service health checks
- [ ] Document service contracts

## Success Criteria

### Security & Type Safety ✅
- [x] chatService has typed reaction/attachment methods
- [x] gdprService has account deletion/data export
- [ ] AuthService uses Keychain/Keystore (not SecureStore)
- [ ] All services have zero `any` types
- [ ] Strict TypeScript compilation passes

### Testing & Quality ✅  
- [ ] Core services have ≥80% test coverage
- [ ] Integration tests for critical user journeys
- [ ] Error handling tested for all edge cases
- [ ] Type safety validated in tests

### Performance & Reliability ✅
- [ ] No floating promises in services
- [ ] Proper timeout and retry logic
- [ ] Memory leak prevention
- [ ] Offline resilience where applicable

## Timeline & Milestones

### Week 1: AuthService Security
- Upgrade to Keychain/Keystore
- Add biometric support
- Test migration path

### Week 2-3: Testing Infrastructure  
- Create comprehensive test suites
- Achieve ≥80% coverage for core services
- Integration testing setup

### Week 4: Code Quality Audit
- Remove remaining `any` types
- Add comprehensive error handling
- Performance optimizations

**Target Completion:** 4 weeks
**Risk Level:** Medium (testing infrastructure is significant undertaking)
**Dependencies:** react-native-keychain, Jest configuration
