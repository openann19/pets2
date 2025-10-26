# Next Steps: Type Safety & Error Handling

## Priority Order

### 1. Type Safety Improvements (Critical)

**Target**: Fix 1,088+ instances of type safety issues across 215 files

**Main Issues**:
- `@ts-ignore` directives
- `@ts-expect-error` directives  
- `as any` type assertions
- `: any` type annotations

**Action Plan**:
1. Audit all type safety issues with `pnpm mobile:tsc --noEmit`
2. Create proper TypeScript types for all API responses
3. Replace `any` with proper types from `packages/core/src/types`
4. Remove unsafe `@ts-ignore` comments by fixing actual issues
5. Add type guards and validation where needed

### 2. Error Handling Standardization (High)

**Target**: Standardize error handling patterns across all services

**Current State**:
- Multiple error handling patterns exist
- Some services use custom error handling
- Inconsistent user notifications

**Action Plan**:
1. Review all service files in `apps/mobile/src/services`
2. Update services to use centralized error handler
3. Add proper error context and metadata
4. Ensure all user-facing errors show notifications
5. Add error recovery strategies where appropriate

### 3. API Types Definition (High)

**Target**: Create comprehensive API types for all endpoints

**Action Plan**:
1. Define API request/response types in `packages/core/src/types/api.ts`
2. Create types for all endpoints:
   - Authentication (login, register, logout)
   - Pet management (create, update, delete)
   - Matching (swipe, like, pass)
   - Chat (send message, reactions, attachments)
   - Upload (photos, audio, media)
   - GDPR (export, delete account)
   - Premium (subscriptions, payments)
3. Add validation using Zod schemas
4. Export types for use across mobile/web/server

### 4. Testing (Medium)

**Action Plan**:
1. Add unit tests for error handlers
2. Add integration tests for API error scenarios
3. Add type safety tests to prevent regressions
4. Add E2E tests for critical user flows

### 5. CI/CD Updates (Medium)

**Action Plan**:
1. Add lint rules to prevent console statements
2. Add type safety checks to CI pipeline
3. Add error handling coverage metrics
4. Block PRs with type safety issues

## Estimated Effort

- Type Safety: 6-8 hours
- Error Handling: 4-5 hours
- API Types: 2-3 hours
- Testing: 2-3 hours
- CI/CD: 1 hour

**Total**: 15-19 hours

## Commands to Run

```bash
# Check type safety issues
pnpm mobile:tsc --noEmit

# Count remaining type issues
grep -r "@ts-ignore\|@ts-expect-error\|as any\|: any" apps/mobile/src --include="*.ts" --include="*.tsx" | wc -l

# Check error handling patterns
find apps/mobile/src/services -name "*.ts" -exec grep -l "catch" {} \;

# Run all tests
pnpm mobile:test

# Check linting
pnpm mobile:lint
```

