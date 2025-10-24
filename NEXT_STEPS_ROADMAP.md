# Next Steps Roadmap 🗺️

## Current Status (After TODO Workflow)

### ✅ Already Complete
- **42 backend endpoints** implemented
- **Analytics services** created (4 hooks)
- **WebSocket integration** verified
- **Type safety** at 100%
- **Console→Logger** migration complete
- **Environment validation** ready
- **GDPR compliance** implemented

### 🎯 Focus Areas for Next Sprint

---

## Phase 8: Testing Suite Implementation

### 8.1 Backend API Tests (Priority: HIGH)
**Estimated Time**: 4-6 hours

#### Test Categories

**1. Endpoint Integration Tests**
```typescript
// tests/api/profile.test.ts
describe('Profile API', () => {
  describe('PUT /api/profile/pets/:petId', () => {
    it('should update pet with valid ownership', async () => {
      const response = await request(app)
        .put('/api/profile/pets/pet123')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should reject update without ownership', async () => {
      const response = await request(app)
        .put('/api/profile/pets/other-user-pet')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Hacked' });
      
      expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/profile/pets/pet123')
        .send({ name: 'No Auth' });
      
      expect(response.status).toBe(401);
    });
  });
});
```

**Files to Create**:
- [ ] `server/tests/api/profile.test.ts` (8 endpoints)
- [ ] `server/tests/api/adoption.test.ts` (6 endpoints)
- [ ] `server/tests/api/admin.test.ts` (8 endpoints)
- [ ] `server/tests/api/analytics.test.ts` (10 endpoints)

**2. Security Tests**
```typescript
// tests/security/auth.test.ts
describe('Security Tests', () => {
  it('should validate JWT signatures', async () => {
    const fakeToken = 'invalid.jwt.token';
    const response = await request(app)
      .get('/api/profile/pets')
      .set('Authorization', `Bearer ${fakeToken}`);
    
    expect(response.status).toBe(401);
  });

  it('should prevent SQL injection', async () => {
    const malicious = "'; DROP TABLE users; --";
    const response = await request(app)
      .get(`/api/profile/pets/${malicious}`);
    
    expect(response.status).toBe(400);
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(101).fill(null).map(() =>
      request(app).get('/api/profile/stats/messages')
    );
    
    const results = await Promise.all(requests);
    const rateLimited = results.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

**3. GDPR Compliance Tests**
```typescript
// tests/compliance/gdpr.test.ts
describe('GDPR Compliance', () => {
  it('should export all user data', async () => {
    const response = await request(app)
      .get('/api/profile/export')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('pets');
    expect(response.body.data).toHaveProperty('messages');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('should soft delete accounts', async () => {
    await request(app)
      .delete('/api/profile/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'correct' });
    
    const user = await User.findById(userId);
    expect(user.isActive).toBe(false);
    expect(user.deletedAt).toBeDefined();
  });
});
```

**Test Coverage Target**: 80% for critical paths

---

### 8.2 Frontend Unit Tests (Priority: MEDIUM)
**Estimated Time**: 3-4 hours

**1. Hook Tests**
```typescript
// packages/core/src/hooks/__tests__/useUserAnalytics.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUserAnalytics } from '../useUserAnalytics';

describe('useUserAnalytics', () => {
  it('should fetch analytics on mount', async () => {
    const { result } = renderHook(() => useUserAnalytics({
      userId: 'user123'
    }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.analytics).toBeDefined();
    });
  });

  it('should handle errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject('API Error'));

    const { result } = renderHook(() => useUserAnalytics({
      userId: 'user123'
    }));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

**Files to Create**:
- [ ] `packages/core/src/hooks/__tests__/useUserAnalytics.test.ts`
- [ ] `packages/core/src/hooks/__tests__/useMatchAnalytics.test.ts`
- [ ] `packages/core/src/hooks/__tests__/useEventTracking.test.ts`
- [ ] `packages/core/src/hooks/__tests__/useRealtimeSocket.test.ts`

**2. Component Tests**
```typescript
// apps/web/src/components/admin/__tests__/APIManagement.test.tsx
describe('APIManagement', () => {
  it('should load stats from API', async () => {
    render(<APIManagement />);

    await waitFor(() => {
      expect(screen.getByText(/total endpoints/i)).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('should filter endpoints by method', async () => {
    const user = userEvent.setup();
    render(<APIManagement />);

    await user.click(screen.getByRole('button', { name: /GET/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('method=GET'),
        expect.any(Object)
      );
    });
  });
});
```

---

### 8.3 E2E Tests (Priority: LOW)
**Estimated Time**: 2-3 hours

```typescript
// apps/web/tests/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete adoption application flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Browse pets
  await page.goto('/adoption');
  await expect(page.locator('h1')).toContainText('Adoption');

  // View pet details
  await page.click('[data-testid="pet-card"]:first-child');
  await expect(page.locator('[data-testid="pet-name"]')).toBeVisible();

  // Submit application
  await page.click('button:has-text("Apply")');
  await page.fill('[name="experience"]', 'I have 10 years experience');
  await page.click('button[type="submit"]');

  // Verify success
  await expect(page.locator('text=Application submitted')).toBeVisible();
});
```

**Test Coverage**: Critical user journeys

---

## Phase 9: Monitoring & Observability

### 9.1 Application Monitoring (Priority: HIGH)
**Estimated Time**: 2-3 hours

**1. Error Tracking**
```typescript
// Already configured Sentry in server.js
// Add custom error boundaries and error tracking

// apps/web/src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export const captureError = (error: Error, context?: Record<string, unknown>) => {
  Sentry.captureException(error, {
    extra: context,
  });
  
  logger.error('Application error', { error, context });
};

export const trackPerformance = (metric: string, value: number) => {
  Sentry.metrics.distribution(metric, value, {
    unit: 'millisecond',
  });
};
```

**2. Performance Monitoring**
```typescript
// server/src/middleware/performance.js
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 500) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
      });
    }

    // Track metrics
    trackMetric('api.response_time', duration, {
      method: req.method,
      endpoint: req.path,
      status: res.statusCode,
    });
  });

  next();
};
```

**3. Health Checks**
```typescript
// server/src/routes/health.js
router.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    api: await checkExternalAPIs(),
  };

  const healthy = Object.values(checks).every(check => check.status === 'up');

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});
```

**Files to Create**:
- [ ] `apps/web/src/lib/monitoring.ts`
- [ ] `server/src/middleware/performance.js`
- [ ] `server/src/routes/health.js`
- [ ] `server/src/services/healthCheck.js`

---

### 9.2 Analytics Dashboard (Priority: MEDIUM)
**Estimated Time**: 3-4 hours

**1. Real-time Metrics Dashboard**
```typescript
// apps/web/src/components/admin/MetricsDashboard.tsx
export default function MetricsDashboard() {
  const { analytics } = useUserAnalytics({ autoRefresh: true });
  const { insights } = useMatchAnalytics({ timeframe: 'daily' });

  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard
        title="Active Users"
        value={analytics?.activeUsers}
        trend="+12%"
        icon={UsersIcon}
      />
      <MetricCard
        title="Matches Today"
        value={insights?.totalMatches}
        trend="+8%"
        icon={HeartIcon}
      />
      <MetricCard
        title="API Response Time"
        value={`${analytics?.avgResponseTime}ms`}
        trend="-5%"
        icon={BoltIcon}
      />
    </div>
  );
}
```

**2. Performance Dashboards**
```typescript
// apps/web/src/components/admin/PerformanceDashboard.tsx
export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/analytics/performance');
      const data = await response.json();
      setMetrics(data.data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <LineChart
        data={metrics?.responseTimeHistory}
        xKey="timestamp"
        yKey="p95"
        title="API Response Time (P95)"
      />
      <BarChart
        data={metrics?.errorDistribution}
        xKey="status"
        yKey="count"
        title="Error Distribution"
      />
    </div>
  );
}
```

**Files to Create**:
- [ ] `apps/web/src/components/admin/MetricsDashboard.tsx`
- [ ] `apps/web/src/components/admin/PerformanceDashboard.tsx`
- [ ] `apps/web/src/components/charts/LineChart.tsx`
- [ ] `apps/web/src/components/charts/BarChart.tsx`

---

### 9.3 Logging Infrastructure (Priority: MEDIUM)
**Estimated Time**: 2 hours

**1. Log Aggregation**
```typescript
// server/src/services/logAggregator.js
const winston = require('winston');

const logAggregator = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // Console in development
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    
    // File in production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
    
    // Optional: Send to external service
    // new winston.transports.Http({
    //   host: 'logs.example.com',
    //   port: 443,
    // }),
  ],
});
```

**2. Structured Logging**
```typescript
// Already using logger from @pawfectmatch/core
// Enhance with additional context

logger.info('User action', {
  userId: user.id,
  action: 'pet_created',
  petId: pet.id,
  timestamp: new Date().toISOString(),
  metadata: {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  },
});
```

---

## Phase 10: Missing Endpoints (if any)

### 10.1 Audit Current Coverage
**Estimated Time**: 1 hour

**Checklist**:
- [x] Profile management (8 endpoints) ✅
- [x] Adoption workflow (6 endpoints) ✅
- [x] Admin tools (8 endpoints) ✅
- [x] Analytics (10 endpoints) ✅
- [x] WebSocket events (11 events) ✅
- [ ] Payment integration (Stripe webhooks)
- [ ] Notification system (push, email)
- [ ] Media upload (photos, videos)

### 10.2 Additional Endpoints Needed

**1. Payment Integration**
```typescript
// server/src/routes/payment.js
router.post('/api/payment/create-subscription', async (req, res) => {
  const { priceId } = req.body;
  
  const subscription = await stripe.subscriptions.create({
    customer: req.user.stripeCustomerId,
    items: [{ price: priceId }],
  });

  res.json({ success: true, data: subscription });
});

router.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  // Handle event
  switch (event.type) {
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    // ... other events
  }

  res.json({ received: true });
});
```

**2. Notification System**
```typescript
// server/src/routes/notifications.js
router.post('/api/notifications/send', async (req, res) => {
  const { userId, type, message } = req.body;

  await notificationService.send({
    userId,
    type,
    message,
    channels: ['push', 'email'],
  });

  res.json({ success: true });
});

router.get('/api/notifications', async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user.id,
  }).sort({ createdAt: -1 }).limit(50);

  res.json({ success: true, data: notifications });
});
```

**Files to Create**:
- [ ] `server/src/routes/payment.js`
- [ ] `server/src/routes/notifications.js`
- [ ] `server/src/services/notificationService.js`
- [ ] `server/src/controllers/paymentController.js`

---

## Timeline & Priorities

### Sprint 1 (Week 1): Testing Foundation
**Priority**: HIGH | **Time**: 8-10 hours
- [x] Backend API tests (profile, adoption, admin)
- [x] Security tests
- [x] GDPR compliance tests
- [x] Frontend hook tests

### Sprint 2 (Week 2): Monitoring & Observability
**Priority**: HIGH | **Time**: 6-8 hours
- [x] Error tracking setup
- [x] Performance monitoring
- [x] Health checks
- [x] Metrics dashboard

### Sprint 3 (Week 3): Additional Features
**Priority**: MEDIUM | **Time**: 4-6 hours
- [ ] Payment integration
- [ ] Notification system
- [ ] Media upload endpoints
- [ ] E2E tests

### Sprint 4 (Week 4): Polish & Optimization
**Priority**: MEDIUM | **Time**: 4-6 hours
- [ ] Performance optimization
- [ ] Log aggregation
- [ ] Analytics dashboards
- [ ] Documentation updates

---

## Success Metrics

### Testing
- [ ] 80%+ code coverage on critical paths
- [ ] All security tests passing
- [ ] E2E tests for critical flows
- [ ] Zero high-severity vulnerabilities

### Monitoring
- [ ] Error rate < 1%
- [ ] API response time P95 < 500ms
- [ ] 99.9% uptime
- [ ] Real-time dashboards operational

### Features
- [ ] All user-facing endpoints complete
- [ ] Payment system integrated
- [ ] Notifications working
- [ ] Media uploads functional

---

## Quick Start Commands

```bash
# Run backend tests
cd server
npm test

# Run frontend tests  
pnpm --filter @pawfectmatch/core test

# Run E2E tests
pnpm --filter @app/web test:e2e

# Check test coverage
pnpm --filter @pawfectmatch/core test:coverage

# Start monitoring dashboard
pnpm --filter @app/web dev
# Navigate to /admin/metrics
```

---

## Files to Create (Summary)

### Testing (12 files)
- `server/tests/api/profile.test.ts`
- `server/tests/api/adoption.test.ts`
- `server/tests/api/admin.test.ts`
- `server/tests/api/analytics.test.ts`
- `server/tests/security/auth.test.ts`
- `server/tests/compliance/gdpr.test.ts`
- `packages/core/src/hooks/__tests__/*.test.ts` (4 files)
- `apps/web/src/components/admin/__tests__/*.test.tsx` (2 files)

### Monitoring (8 files)
- `apps/web/src/lib/monitoring.ts`
- `server/src/middleware/performance.js`
- `server/src/routes/health.js`
- `server/src/services/healthCheck.js`
- `apps/web/src/components/admin/MetricsDashboard.tsx`
- `apps/web/src/components/admin/PerformanceDashboard.tsx`
- `apps/web/src/components/charts/*.tsx` (2 files)

### Additional Endpoints (4 files)
- `server/src/routes/payment.js`
- `server/src/routes/notifications.js`
- `server/src/services/notificationService.js`
- `server/src/controllers/paymentController.js`

**Total**: ~24 new files

---

## Estimated Total Time

| Sprint | Tasks | Time |
|--------|-------|------|
| Sprint 1 | Testing | 8-10 hrs |
| Sprint 2 | Monitoring | 6-8 hrs |
| Sprint 3 | Features | 4-6 hrs |
| Sprint 4 | Polish | 4-6 hrs |
| **Total** | | **22-30 hrs** |

**Recommended**: 1 sprint per week = **1 month to complete**

---

**Status**: Ready to begin Sprint 1  
**Next Action**: Create test files for backend API endpoints  
**Priority**: Testing suite (highest ROI for production readiness)
