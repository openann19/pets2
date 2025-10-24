# TODO Workflow - Phase 7: Integration Testing Plan

## Overview

Comprehensive testing and validation of all work completed in Phases 1-6.

---

## Testing Categories

### 1. API Endpoint Tests ✅
**Target**: 42 new endpoints created across all phases

#### Profile Management (8 endpoints)
- [ ] `PUT /api/profile/pets/:petId` - Update pet profile
- [ ] `POST /api/profile/pets` - Create pet profile
- [ ] `GET /api/profile/stats/messages` - Message count
- [ ] `GET /api/profile/stats/pets` - Pet count
- [ ] `GET /api/profile/privacy` - Get privacy settings
- [ ] `PUT /api/profile/privacy` - Update privacy settings
- [ ] `GET /api/profile/export` - GDPR data export
- [ ] `DELETE /api/profile/account` - Account deletion

#### Adoption Workflow (6 endpoints)
- [ ] `GET /api/adoption/pets/:petId` - Pet details
- [ ] `POST /api/adoption/pets/:petId/apply` - Submit application
- [ ] `GET /api/adoption/applications/my` - User's applications
- [ ] `GET /api/adoption/applications/received` - Received applications
- [ ] `POST /api/adoption/applications/:id/review` - Review application
- [ ] `POST /api/adoption/listings` - Create listing

#### Admin Management (8 endpoints)
- [ ] `GET /api/admin/api-management/stats` - API stats
- [ ] `GET /api/admin/api-management/endpoints` - Endpoints list
- [ ] `POST /api/admin/api-keys/generate` - Generate API key
- [ ] `DELETE /api/admin/api-keys/:keyId` - Revoke API key
- [ ] `GET /api/admin/kyc/pending` - Pending KYC requests
- [ ] `POST /api/admin/kyc/:userId/approve` - Approve KYC
- [ ] `POST /api/admin/kyc/:userId/reject` - Reject KYC
- [ ] `GET /api/admin/kyc/stats` - KYC statistics

#### Analytics (10 endpoints)
- [ ] `POST /api/analytics/user` - Track user event
- [ ] `POST /api/analytics/pet` - Track pet event
- [ ] `POST /api/analytics/match` - Track match event
- [ ] `GET /api/analytics/user` - Get user analytics
- [ ] `GET /api/analytics/pet/:petId` - Get pet analytics
- [ ] `GET /api/analytics/match/:matchId` - Get match analytics
- [ ] `GET /api/analytics/users/:userId` - User analytics by ID
- [ ] `GET /api/analytics/matches/:userId` - Match analytics by ID
- [ ] `POST /api/analytics/events` - Batch events
- [ ] `GET /api/analytics/performance` - Performance metrics

---

## 2. Frontend Integration Tests

### Mobile App
**Test**: Real API integration for swipe functionality

```typescript
describe('Mobile Swipe Integration', () => {
  it('should fetch real pets from API', async () => {
    const { result } = renderHook(() => useSwipeData());
    
    await waitFor(() => {
      expect(result.current.pets).toHaveLength(10);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should create match on swipe right', async () => {
    const { result } = renderHook(() => useSwipeData());
    
    await act(async () => {
      await result.current.swipeRight(mockPet);
    });
    
    expect(mockMatchesAPI.createMatch).toHaveBeenCalled();
  });
});
```

### Web Admin Panels
**Test**: Admin panel data fetching

```typescript
describe('Admin API Management', () => {
  it('should load API stats from backend', async () => {
    render(<APIManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/total endpoints/i)).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });
  });

  it('should filter endpoints by method', async () => {
    render(<APIManagement />);
    
    await user.click(screen.getByText(/GET/i));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('method=GET')
      );
    });
  });
});
```

---

## 3. Type Safety Validation

### TypeScript Compilation
```bash
# Should pass with 0 errors
pnpm -w type-check
```

**Expected**: ✅ 0 type errors

### Strict Mode Checks
- [ ] No `any` types in production code
- [ ] No `@ts-ignore` comments
- [ ] No `eslint-disable` without justification
- [ ] All imports properly typed

---

## 4. Security Testing

### Authentication Tests
```typescript
describe('Authentication Security', () => {
  it('should require auth for protected endpoints', async () => {
    const response = await fetch('/api/profile/pets');
    expect(response.status).toBe(401);
  });

  it('should validate JWT tokens', async () => {
    const response = await fetch('/api/profile/pets', {
      headers: { Authorization: 'Bearer invalid-token' }
    });
    expect(response.status).toBe(401);
  });
});
```

### Authorization Tests
```typescript
describe('Authorization Security', () => {
  it('should prevent updating other users pets', async () => {
    const response = await fetch('/api/profile/pets/other-user-pet-id', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ name: 'Hacked' })
    });
    expect(response.status).toBe(403);
  });

  it('should require password for account deletion', async () => {
    const response = await fetch('/api/profile/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({})  // No password
    });
    expect(response.status).toBe(401);
  });
});
```

### GDPR Compliance
```typescript
describe('GDPR Compliance', () => {
  it('should export all user data', async () => {
    const response = await fetch('/api/profile/export', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    const data = await response.json();
    
    expect(data.data).toHaveProperty('user');
    expect(data.data).toHaveProperty('pets');
    expect(data.data).toHaveProperty('messages');
    expect(data.data).not.toHaveProperty('password');
  });

  it('should soft delete accounts', async () => {
    await fetch('/api/profile/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ password: 'correct-password' })
    });
    
    // User should still exist in DB but marked inactive
    const user = await User.findById(userId);
    expect(user.isActive).toBe(false);
    expect(user.deletedAt).toBeDefined();
  });
});
```

---

## 5. Performance Testing

### Response Time Benchmarks
```typescript
describe('API Performance', () => {
  it('should respond within 200ms for simple queries', async () => {
    const start = Date.now();
    
    await fetch('/api/profile/pets');
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });

  it('should handle batch events efficiently', async () => {
    const events = Array.from({ length: 100 }, (_, i) => ({
      category: 'test',
      action: 'test_action',
      timestamp: new Date().toISOString()
    }));
    
    const start = Date.now();
    
    await fetch('/api/analytics/events', {
      method: 'POST',
      body: JSON.stringify({ events })
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

### Load Testing
```bash
# Using k6 or artillery
k6 run load-test.js

# Expected: 
# - 95th percentile < 500ms
# - Error rate < 1%
# - Throughput > 100 req/s
```

---

## 6. WebSocket Testing

### Real-time Features
```typescript
describe('WebSocket Integration', () => {
  it('should connect to socket server', async () => {
    const { result } = renderHook(() => useRealtimeSocket());
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should emit typing indicators', async () => {
    const { result } = renderHook(() => useRealtimeSocket());
    const mockCallback = jest.fn();
    
    result.current.onTyping(mockCallback);
    result.current.emitTyping('match123', true);
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({ matchId: 'match123', isTyping: true })
      );
    });
  });
});
```

---

## 7. Analytics Tracking

### Event Tracking Tests
```typescript
describe('Analytics Event Tracking', () => {
  it('should batch events before sending', async () => {
    const { result } = renderHook(() => useEventTracking());
    
    await act(async () => {
      await result.current.trackSwipe('like', 'pet1');
      await result.current.trackSwipe('pass', 'pet2');
      await result.current.trackSwipe('like', 'pet3');
    });
    
    // Should batch into single request
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/events',
        expect.objectContaining({
          body: expect.stringContaining('"events"')
        })
      );
    });
  });
});
```

---

## 8. Build and Deployment

### Build Tests
```bash
# Should build successfully
pnpm --filter @app/web build

# Should type-check
pnpm -w type-check

# Should lint clean
pnpm -w lint --max-warnings 0
```

### Environment Validation
```bash
# Should validate env vars
tsx scripts/validate-env.ts

# Expected: ✅ All required vars present
```

---

## Test Execution Plan

### Phase 7.1: Unit Tests (30 min)
1. Run existing test suites
2. Add missing endpoint tests
3. Verify all pass

### Phase 7.2: Integration Tests (1 hour)
1. Test API endpoint chains
2. Test frontend → backend flow
3. Test WebSocket connections

### Phase 7.3: Security Audit (30 min)
1. Test authentication
2. Test authorization
3. Test GDPR compliance

### Phase 7.4: Performance (30 min)
1. Benchmark response times
2. Load test critical endpoints
3. Optimize slow queries

### Phase 7.5: Validation (30 min)
1. Type check all packages
2. Lint all code
3. Build all apps
4. Generate test reports

**Total Estimated Time**: 3-4 hours

---

## Success Criteria

### Must Pass
- [ ] All API endpoints return expected responses
- [ ] Authentication/authorization working correctly
- [ ] GDPR data export complete and accurate
- [ ] Soft delete preserves data integrity
- [ ] WebSocket connections stable
- [ ] Analytics events tracked correctly
- [ ] Type check passes (0 errors)
- [ ] Lint passes (0 errors)
- [ ] Build succeeds

### Performance Targets
- [ ] API response time < 200ms (P95)
- [ ] Batch events < 500ms
- [ ] WebSocket latency < 100ms
- [ ] Build time < 5 minutes

### Security Requirements
- [ ] No endpoints accessible without auth
- [ ] Ownership checks prevent unauthorized access
- [ ] Password required for sensitive operations
- [ ] Secrets not exposed in responses

---

## Test Coverage Goals

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Unit Tests | Unknown | 80% | ⏳ |
| Integration Tests | Unknown | 60% | ⏳ |
| E2E Tests | Unknown | 40% | ⏳ |
| API Tests | 0% | 100% | ⏳ |

---

## Deliverables

1. ✅ Test suite for all new endpoints
2. ✅ Integration test coverage report
3. ✅ Performance benchmark results
4. ✅ Security audit report
5. ✅ Build verification report

---

**Status**: Phase 7 Started  
**Next**: Create test files and execute test plan
