# 🛡️ Admin Panel Parity & Ops Console — Implementation Brief

## ✅ Status: Infrastructure Complete

This document outlines the production-grade admin panel implementation for PawfectMatch.

---

## 📋 Features Implemented

### ✅ Core Infrastructure
- Event ingestion system (`EventLog` model)
- Audit logging system (`AuditLog` model)
- RBAC middleware with permission checks
- Type-safe shared packages (`packages/api`)

### ✅ Server-Side Components
- `/api/v1/events` - Event ingestion endpoint
- `/api/admin/users` - User management
- `/api/admin/audit` - Audit log viewing
- `/api/admin/health` - System health monitoring

### 🔄 Pending Implementation
- Next.js 14 admin frontend (`apps/admin`)
- Additional admin routes (chats, billing, feature flags, settings)
- 2FA implementation
- Impersonation system
- i18n (English + Bulgarian)
- Playwright E2E tests

---

## 🏗️ Architecture

### Data Flow
```
Mobile/Web Apps → /api/v1/events → EventLog (MongoDB)
                                       ↓
Admin Panel → /api/admin/events → Query & Display
                                       ↓
Admin Actions → /api/admin/* → AuditLog (MongoDB)
```

### Security Model
```
Request → authenticateToken → checkPermission → withAudit → Handler
```

---

## 📁 Files Created

### Shared Types
- `packages/api/src/types/events.ts` - Event envelope schema
- `packages/api/src/types/admin.ts` - Admin roles & permissions

### Database Models
- `server/src/models/EventLog.ts` - Event storage
- `server/src/models/AuditLog.ts` - Audit trail

### Middleware
- `server/src/middleware/audit.ts` - Audit logging
- `server/src/routes/adminConsole.ts` - Admin API routes
- `server/src/routes/events.ts` - Event ingestion

---

## 🚀 Next Steps

### 1. Create Next.js 14 Admin Frontend

```bash
mkdir -p apps/admin
cd apps/admin

# Initialize Next.js 14 with TypeScript
pnpm create next-app@latest . --typescript --app --tailwind

# Install dependencies
pnpm add @tanstack/react-query @tanstack/react-table zod react-hook-form @hookform/resolvers
pnpm add react-i18next i18next
pnpm add @headlessui/react @heroicons/react
```

### 2. Add Routes to Main Server

Update `server/server.ts`:

```typescript
// Add after existing route imports
const eventsRoutes = await import('./src/routes/events');
const adminConsoleRoutes = await import('./src/routes/adminConsole');

// Add to middleware
app.use('/api', eventsRoutes.default);
app.use('/api/admin', adminConsoleRoutes.default);
```

### 3. Database Migration

Create migration to add indexes:

```typescript
// server/src/migrations/add-eventlog-indexes.ts
await EventLog.collection.createIndex({ type: 1, ts: -1 });
await EventLog.collection.createIndex({ userId: 1, ts: -1 });
await AuditLog.collection.createIndex({ adminId: 1, at: -1 });
```

### 4. Seed Superadmin

```bash
node server/src/scripts/seed-admin.js
```

---

## 🔐 Security Features

### RBAC Permissions
- `users:read`, `users:write`, `users:delete`
- `chats:read`, `chats:moderate`, `chats:export`
- `billing:read`, `billing:write`, `billing:refund`
- `analytics:read`, `analytics:export`
- `flags:read`, `flags:write`
- `health:read`
- `settings:read`, `settings:write`
- `audit:read`
- `impersonate`

### Roles
- **superadmin**: Full access to all permissions
- **support**: Read-only access to users, chats, billing, analytics, audit
- **moderator**: Users (R/W), chats (moderate), flags (read), audit
- **finance**: Billing (full), analytics (read), users (read), audit
- **analyst**: Analytics (read), health, audit, users/chats (read)

---

## 📊 Event Types

Events emitted from mobile/web are stored in `EventLog`:

```typescript
{
  app: 'mobile' | 'web',
  userId: string | undefined,
  sessionId: string,
  ts: ISO datetime string,
  type: string, // e.g., 'chat.message.sent', 'user.profile.updated'
  payload: Record<string, any>,
  meta: {
    locale?: string,
    version?: string,
    device?: string,
  }
}
```

---

## ✅ Definition of Done

- [x] Event ingestion system
- [x] Audit logging infrastructure
- [x] RBAC middleware
- [x] User management API
- [ ] Next.js 14 frontend
- [ ] Chat moderation
- [ ] Billing management
- [ ] Feature flags UI
- [ ] 2FA setup
- [ ] Impersonation
- [ ] i18n (en + bg)
- [ ] Playwright E2E tests
- [ ] Seed script

---

## 🔗 Related Files

- `server/src/routes/admin.ts` - Existing admin routes (to be enhanced)
- `apps/web/app/(admin)/` - Web admin UI (to be migrated)
- `apps/mobile/src/screens/admin/` - Mobile admin screens

---

## 📝 Notes

This implementation follows the engineering brief specification for a production-grade admin panel with:
- 100% feature parity with mobile/web data
- RBAC/ABAC enforcement
- Audit logging for all actions
- PII redaction support
- i18n support (English + Bulgarian)
- CI gates with tests

**Next Session**: Implement the Next.js 14 frontend with all modules.
