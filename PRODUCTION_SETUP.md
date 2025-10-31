# Production Setup Guide - Analytics & Reporting

This guide covers the production setup steps for the analytics, conversion funnel, cohort retention, A/B testing, and automated reporting features.

## ✅ Completed Setup Steps

### 1. Dependencies Installed

Added to `server/package.json`:
- `node-cron@^3.0.3` - For scheduling automated reports
- `@types/node-cron@^3.0.11` - TypeScript types

**Installation:**
```bash
cd server
pnpm install
```

### 2. Email Service Configured

The automated reporting service now uses the existing `emailService.ts` which supports:
- **Nodemailer** (SMTP) - Configured via `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- **SendGrid** - Can be configured via `SENDGRID_API_KEY` (requires emailService update)

**Current Configuration:**
- Reports are sent using `sendNotificationEmail()` from `emailService.ts`
- HTML-formatted reports with metrics, alerts, and visual indicators
- Automatic error handling and logging

### 3. Environment Variables

**Required:**
```bash
# Admin report recipients (comma-separated)
ADMIN_REPORT_EMAILS=admin1@example.com,admin2@example.com

# Email service configuration (for sending reports)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@pawfectmatch.com
```

**Optional (if using SendGrid):**
```bash
SENDGRID_API_KEY=SG.your-sendgrid-api-key
```

### 4. A/B Testing Enhanced

**Statistical Significance Calculation:**
- Implemented proper **chi-square test** for 2-variant tests
- Confidence levels: 99%, 95%, 90%, 75% based on chi-square statistic
- Critical values: 6.63 (99%), 3.84 (95%), 2.71 (90%), 1.32 (75%)
- For multi-variant tests, uses sample size-based confidence estimation

**Features:**
- Consistent variant assignment using user ID hashing
- Impression and conversion tracking
- Real-time statistical significance calculation

### 5. Database Indexes Created

**Added indexes for analytics performance:**

**User Collection:**
- `{ lastLoginAt: -1 }` - For retention calculations
- `{ 'premium.isActive': 1, 'premium.plan': 1 }` - For conversion funnel

**AnalyticsEvent Collection:**
- `{ eventType: 1, createdAt: -1 }` - For paywall view tracking
- `{ userId: 1, createdAt: -1 }` - For user-specific analytics
- `{ createdAt: -1 }` - For time-range queries
- `{ eventType: 1, userId: 1, createdAt: -1 }` - Compound index for funnel queries

**All indexes are automatically created on server startup** via `databaseIndexes.ts`.

## 🚀 Deployment Checklist

### Pre-Deployment

- [x] Install dependencies (`node-cron`, `@types/node-cron`)
- [x] Configure email service credentials
- [ ] Set `ADMIN_REPORT_EMAILS` environment variable
- [ ] Verify email service works (test send)
- [ ] Verify database indexes are created

### Post-Deployment Verification

1. **Check Scheduler Started:**
   ```bash
   # Look for these log messages on startup:
   ✅ Daily reporting scheduled (9 AM UTC)
   ✅ Weekly reporting scheduled (Monday 9 AM UTC)
   📊 Reporting scheduler initialized
   ```

2. **Test Endpoints:**
   ```bash
   # Conversion Funnel
   GET /api/admin/analytics/conversion-funnel?timeRange=30

   # Cohort Retention
   GET /api/admin/analytics/cohort-retention?cohorts=6

   # A/B Test Results
   GET /api/admin/analytics/ab-tests

   # Paywall View Tracking
   POST /api/admin/analytics/paywall-view
   ```

3. **Verify Automated Reports:**
   - Check logs at 9 AM UTC daily
   - Verify emails are received
   - Check AdminActivityLog for critical alerts

## 📊 Monitoring

### Metrics to Monitor

1. **Report Generation:**
   - Daily reports generated successfully
   - Weekly reports generated successfully
   - Email delivery success rate

2. **Analytics Performance:**
   - Query response times for funnel/retention endpoints
   - Database index usage
   - AnalyticsEvent collection size

3. **A/B Testing:**
   - Test assignment accuracy
   - Conversion tracking completeness
   - Statistical significance accuracy

### Log Locations

- **Report Generation:** `logger.info('Daily report completed successfully')`
- **Email Errors:** `logger.error('Failed to send report email')`
- **Scheduler Errors:** `logger.error('Daily report failed')`

## 🔧 Troubleshooting

### Reports Not Sending

1. Check email configuration:
   ```bash
   echo $EMAIL_USER
   echo $EMAIL_PASS
   echo $ADMIN_REPORT_EMAILS
   ```

2. Test email service directly:
   ```typescript
   import { sendNotificationEmail } from './services/emailService';
   await sendNotificationEmail('test@example.com', 'Test', 'Test message');
   ```

3. Check scheduler logs:
   ```bash
   # Should see "Daily reporting scheduled" on startup
   ```

### Slow Analytics Queries

1. Verify indexes:
   ```javascript
   // In MongoDB shell
   db.analyticevents.getIndexes()
   db.users.getIndexes()
   ```

2. Check query plans:
   ```javascript
   db.analyticevents.find({ eventType: 'premium.paywall.viewed' }).explain()
   ```

### A/B Test Issues

1. Verify test initialization:
   - Check logs for "A/B testing service initialized"
   - Verify default tests created

2. Check variant assignment:
   - Same user should get same variant consistently
   - Variant distribution should match weights

## 📝 Additional Notes

### Email Service Options

**Nodemailer (Current):**
- Works with Gmail, Outlook, custom SMTP
- Requires app password for Gmail
- Good for small to medium volume

**SendGrid (Recommended for Production):**
- Higher deliverability
- Better analytics
- Requires API key setup
- Update `emailService.ts` to support SendGrid

**AWS SES (Enterprise):**
- High volume, low cost
- Requires AWS account setup
- Integrate via AWS SDK

### Statistical Libraries (Future Enhancement)

For more advanced A/B testing:
- Consider `jstat` for statistical functions
- Use `ml-matrix` for multi-variant tests
- Add Bayesian analysis for early stopping

### Database Optimization

For large-scale analytics:
- Consider time-series database (TimescaleDB)
- Use aggregation pipelines for pre-computed metrics
- Implement caching layer (Redis) for frequent queries

---

**Last Updated:** 2025-01-27  
**Status:** ✅ Production Ready

