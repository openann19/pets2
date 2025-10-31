# Analytics Configuration via Admin Panel

All analytics and reporting configurations can now be managed directly from the admin panel, eliminating the need for environment variable changes or code deployments.

## ✅ Implemented Features

### 1. Backend API Endpoints

**Created:** `server/src/controllers/analyticsConfigController.ts`

**Endpoints:**
- `GET /api/admin/analytics/config` - Get current analytics configuration
- `POST /api/admin/analytics/config` - Update analytics configuration
- `POST /api/admin/analytics/config/test-email` - Test email configuration

**Features:**
- Database-first configuration (stored in MongoDB `Configuration` collection)
- Environment variable fallback for backwards compatibility
- Encrypted password storage (AES-256-GCM)
- Email validation
- Input validation (ports, providers, thresholds)

### 2. Configuration Service

**Created:** `server/src/services/configService.ts`

- Centralized configuration access
- Reads from database with environment variable fallback
- Provides typed configuration interface
- Used by `automatedReportingService` for dynamic config

### 3. Admin Panel UI

**Created:** `apps/mobile/src/screens/admin/analytics/AnalyticsConfigScreen.tsx`

**Configuration Sections:**

#### Report Recipients
- Add/remove email addresses
- Visual email tags with remove functionality
- Email validation

#### Email Service
- Provider selection (nodemailer, sendgrid)
- SMTP configuration (host, port, username, password, from address)
- Password masking (shows "***configured***" if already set)
- Test email button

#### Report Schedule
- Daily reports toggle + time configuration
- Weekly reports toggle + day + time configuration
- Timezone setting

#### Alert Thresholds
- Churn Rate (warning/critical)
- Conversion Rate (warning/critical)
- Week 1 Retention (warning/critical)
- Month 1 Retention (warning/critical)

### 4. Navigation Integration

- Added `AnalyticsConfig` route to `AdminStackParamList`
- Added settings button (gear icon) to `AdminAnalyticsScreen`
- Integrated into `AdminNavigator`

### 5. Updated Services

**Updated:** `server/src/services/automatedReportingService.ts`
- Now reads configuration from database via `configService`
- Alert thresholds loaded dynamically
- Report emails loaded from config
- Fallback to environment variables if config not set

**Updated:** `apps/mobile/src/services/adminAPI.ts`
- Added `getAnalyticsConfig()` method
- Added `updateAnalyticsConfig()` method
- Added `testEmailConfig()` method

## 📱 User Interface

### Access Path
1. Navigate to **Admin Dashboard**
2. Go to **Analytics Dashboard**
3. Click **Settings icon** (⚙️) in header
4. Access **Analytics Configuration** screen

### Configuration Flow
1. View current configuration (loaded from database or defaults)
2. Edit settings in organized sections
3. Test email configuration (optional)
4. Save configuration
5. Settings immediately applied to reporting service

## 🔐 Security Features

- **Encrypted Storage**: Sensitive fields (passwords) encrypted using AES-256-GCM
- **Permission Checks**: All endpoints require `analytics:read` or `analytics:write` permissions
- **Input Validation**: Email addresses, ports, thresholds validated
- **Audit Logging**: All configuration changes logged to `AdminActivityLog`

## 📊 Configuration Schema

```typescript
{
  reportEmails: string[];           // Admin email recipients
  emailService: {
    provider: 'nodemailer' | 'sendgrid';
    host: string;
    port: number;
    user: string;
    password: string;                // Encrypted
    from: string;
  };
  reportSchedule: {
    dailyEnabled: boolean;
    dailyTime: string;              // "09:00"
    weeklyEnabled: boolean;
    weeklyDay: string;               // "monday"
    weeklyTime: string;              // "09:00"
    timezone: string;                // "UTC"
  };
  alertThresholds: {
    churnRate: { warning: number; critical: number };
    conversionRate: { warning: number; critical: number };
    retentionWeek1: { warning: number; critical: number };
    retentionMonth1: { warning: number; critical: number };
  };
}
```

## 🔄 Migration Path

### From Environment Variables to Database

1. **Existing Setup**: Configuration in `.env` file
   - `ADMIN_REPORT_EMAILS=admin1@example.com,admin2@example.com`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

2. **New Setup**: Configure via Admin Panel
   - Navigate to Analytics Configuration screen
   - Enter same values in UI
   - Save configuration

3. **Fallback Behavior**:
   - If no database config exists, system uses environment variables
   - Once saved via admin panel, database config takes precedence
   - Environment variables remain as backup

## 🚀 Next Steps (Optional Enhancements)

1. **A/B Test Management UI**: Create/edit A/B tests via admin panel
2. **Schedule Preview**: Show next report generation time
3. **Report History**: View past reports and alerts
4. **Email Templates**: Customize report email templates
5. **Multi-Timezone Support**: Timezone-aware scheduling
6. **Webhook Integration**: Send reports to webhooks in addition to email

## 📝 Usage Example

```typescript
// Get current configuration
const config = await adminAPI.getAnalyticsConfig();

// Update configuration
await adminAPI.updateAnalyticsConfig({
  reportEmails: ['admin1@example.com', 'admin2@example.com'],
  emailService: {
    provider: 'nodemailer',
    host: 'smtp.gmail.com',
    port: 587,
    user: 'reports@pawfectmatch.com',
    password: 'your-app-password',
    from: 'noreply@pawfectmatch.com'
  },
  alertThresholds: {
    churnRate: { warning: 5, critical: 10 },
    conversionRate: { warning: 10, critical: 5 }
  }
});

// Test email configuration
await adminAPI.testEmailConfig('admin@example.com');
```

---

**Status**: ✅ Complete and Production Ready  
**Last Updated**: 2025-01-27

