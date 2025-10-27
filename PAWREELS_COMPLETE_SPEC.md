# 🎬 PawReels - Complete Implementation Spec

**Date**: 2025-01-21  
**Status**: ✅ ALL BACKEND FILES PROVIDED  
**Source**: Complete paste-ready bundle from user

---

## ✅ What's Been Dropped

### 1. Infrastructure
- ✅ `docker-compose.yml` - Full dev stack (Postgres, Redis, MinIO S3, API, Render worker)
- ✅ `services/render/` - Complete FFmpeg render worker with Dockerfile
- ✅ Template system - 3 templates (upbeat, heartfelt, funny)

### 2. SQL Schema (Postgres)
```sql
- User table
- Track table (with waveform_json)
- Template table
- Reel table (with status enum)
- Clip table
- RemixEdge table
- ShareEvent table
- ModerationFlag table
```

### 3. API Server Components
```typescript
✅ routes/templates.ts - List & get templates
✅ routes/tracks.ts - List & get tracks  
✅ routes/uploads.ts - Presign S3 uploads
✅ routes/reels.ts - Create, clips, render, get, remix
✅ s3.ts - S3 presigning (MinIO compatible)
✅ queue.ts - BullMQ render queue
```

### 4. Render Worker (Complete)
- ✅ FFmpeg filter graph builder (`template.ts`)
- ✅ Worker that downloads clips + track, renders MP4
- ✅ Uploads result to S3
- ✅ Callbacks API to mark status as public

### 5. Key Features from Spec

**Deep Linking**:
- Format: `paw.app://reel/:id?ref=:userId`
- Universal links config for React Native
- OG meta tags for web sharing

**QR Codes**:
- Endpoint: `/api/qr?u=https://...`
- Generates PNG QR codes

**Moderation**:
- Frame extraction → NSFW classifier
- Auto-flag if score > 0.75
- Admin queue for review

**Admin Console**:
- Next.js admin panel
- Reels table with preview/remove
- Status filtering

**Analytics**:
- Events: reel_create_start, reel_create_complete, reel_render_start/complete, reel_share_click, deeplink_open, install_attributed, remix_click, remix_create_complete

**Safety**:
- Rate limit: 20 renders/day per user
- EXIF stripping on upload
- Face blur toggle
- Cold storage after 30d

---

## 📦 Implementation Files Ready

### Backend (MongoDB → Convert to Postgres)
- ✅ All models exist (currently MongoDB/Mongoose)
- ✅ All controllers exist
- ✅ All routes registered
- ⚠️ Need to convert to Postgres with pg-promise or similar

### Render Worker
- ✅ Complete Docker setup
- ✅ Template builder implemented
- ✅ FFmpeg filters defined
- ✅ Worker loops ready

### Missing Files to Create
1. `server/src/routes/templates.ts` - Express template routes
2. `server/src/routes/tracks.ts` - Express track routes
3. `server/src/routes/uploads.ts` - Presign routes
4. `server/src/routes/reels.ts` - Complete reel CRUD
5. `server/src/s3.ts` - S3 client
6. `server/src/queue.ts` - BullMQ setup
7. `server/src/db.ts` - Postgres pool
8. `apps/web/app/reel/[id]/page.tsx` - Web watch page
9. `apps/web/app/api/qr/route.ts` - QR generator
10. `apps/admin/app/reels/page.tsx` - Admin console

---

## 🎯 Next Steps

### 1. Convert Database Layer (High Priority)
**Current**: MongoDB with Mongoose  
**Target**: Postgres with pg-promise

**Files to update**:
- Replace all `*.ts` models in `server/src/models/` with Postgres queries
- Update `databaseIndexes.ts` to use Postgres indexes
- Create migration file `migrations/001_init.sql`

### 2. Create Missing Route Files
Create the 4 missing route files using the provided code:
- `server/src/routes/templates.ts`
- `server/src/routes/tracks.ts`
- `server/src/routes/uploads.ts`
- `server/src/routes/reels.ts`

### 3. Add S3 & Queue Support
- `server/src/s3.ts` - S3 presigning
- `server/src/queue.ts` - BullMQ render queue
- `server/src/db.ts` - Postgres pool

### 4. Web Pages
- `apps/web/app/reel/[id]/page.tsx` - Watch page with deep link
- `apps/web/app/api/qr/route.ts` - QR code endpoint

### 5. Admin Console
- `apps/admin/app/reels/page.tsx` - Reels management

### 6. Mobile Integration
- Deep linking config
- Analytics wrapper
- Creator screen (from remix.md)

---

## 📊 Architecture Comparison

| Component | My Implementation | Complete Spec |
|-----------|------------------|--------------|
| Database | MongoDB (Mongoose) | ✅ Postgres (SQL) |
| Models | ✅ 7 models created | ✅ Schema defined |
| Routes | ✅ Controllers exist | ✅ Routes code provided |
| Render | 📋 Not built | ✅ Complete Docker service |
| Queue | 📋 Not implemented | ✅ BullMQ ready |
| S3 | 📋 Hardcoded | ✅ Presigning ready |
| Admin | 📋 Missing | ✅ React code provided |
| Web Watch | 📋 Missing | ✅ Next.js page ready |
| QR | 📋 Missing | ✅ Generator ready |
| Tests | 📋 Missing | ✅ Playwright + Detox ready |

---

## 🚀 Quick Start Commands

```bash
# Start all services
docker-compose up

# Run migrations
psql postgresql://postgres:paw@localhost:5432/paw < migrations/001_init.sql

# Start API
cd server && npm run dev

# Start render worker
cd services/render && npm start

# Seed templates (10 tracks + 3 templates)
npm run seed:reels

# Run tests
npm run test:api
npm run test:web
npm run test:mobile
```

---

## 📝 Environment Variables

```bash
# .env
API_URL=http://localhost:3001
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=paw
S3_SECRET_KEY=pawpawpaw
S3_BUCKET=reels
REDIS_URL=redis://localhost:6379
RENDER_QUEUE=render
DATABASE_URL=postgresql://postgres:paw@localhost:5432/paw
```

---

## ✅ Definition of Done (Per PR Checklist)

- [ ] DB migrated (tracks/templates/reels/clips/remix/share/moderation)
- [ ] All API routes working
- [ ] Render worker container runs
- [ ] Exports 1080×1920@30 MP4 with watermark
- [ ] Deep link works
- [ ] BG/EN localization complete
- [ ] Moderation worker flags NSFW
- [ ] Analytics funnel working
- [ ] CI green
- [ ] Sentry traces + logs
- [ ] p95 export < 15s
- [ ] Rate limits configured
- [ ] Signed URL TTL set
- [ ] S3 lifecycle rules configured

---

**Last Updated**: 2025-01-21  
**Status**: Ready to integrate complete spec

