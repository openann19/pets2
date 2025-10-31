# ✅ Implementation Checklist - Production Deployment

## Phase 1: Configuration (5-10 minutes)

### 1.1 Payment APIs via Admin Panel

- [ ] **Start Server**
  ```bash
  cd server
  pnpm install
  pnpm dev
  ```

- [ ] **Access Admin Panel** (Mobile App)
  - Login as admin user
  - Navigate to: **Admin → Configuration**

- [ ] **Configure Stripe**
  - Click **Stripe Payments** card
  - Enter Secret Key: `sk_live_...` (from [Stripe Dashboard](https://dashboard.stripe.com))
  - Enter Publishable Key: `pk_live_...`
  - Enter Webhook Secret: `whsec_...` (optional, for webhooks)
  - Toggle **Live Mode**: ✅ Enabled
  - Click **Save**
  - Verify: "Configuration saved successfully"

- [ ] **Configure RevenueCat**
  - Click **RevenueCat (IAP)** card
  - Enter iOS API Key: `appl_...` (from [RevenueCat Dashboard](https://app.revenuecat.com))
  - Enter Android API Key: `goog_...`
  - Click **Save**
  - Verify: "Configuration saved successfully"

- [ ] **Verify Configuration**
  ```bash
  node scripts/verify-configuration.js
  ```
  Expected: All services show ✅ Configured

---

## Phase 2: Database Setup (5 minutes)

### 2.1 MongoDB Configuration

- [ ] **Create Production Database**
  - MongoDB Atlas: Create cluster
  - Or self-hosted: Set up MongoDB server
  - Get connection URI: `mongodb://...` or `mongodb+srv://...`

- [ ] **Update Server .env**
  ```bash
  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pawfectmatch
  ```

- [ ] **Create Indexes** (optional, for performance)
  ```bash
  mongosh "$MONGODB_URI" --eval "
    db.users.createIndex({ email: 1 }, { unique: true });
    db.matches.createIndex({ user1: 1, user2: 1 });
    db.matches.createIndex({ 'messages.sentAt': -1 });
  "
  ```

- [ ] **Verify Connection**
  - Server logs should show: "✅ MongoDB connected"

---

## Phase 3: Server Deployment (10-15 minutes)

### 3.1 Build Server

```bash
cd server
pnpm install
pnpm build
```

### 3.2 Deploy (Choose one method)

#### Option A: PM2 (Recommended)

```bash
# Install PM2 if needed
npm install -g pm2

# Deploy
chmod +x ../scripts/deploy-server.sh
../scripts/deploy-server.sh
```

#### Option B: Docker

```bash
cd server
docker build -t pawfectmatch-api .
docker run -d \
  -p 5001:5001 \
  --env-file .env \
  --name pawfectmatch-api \
  pawfectmatch-api
```

#### Option C: Manual

```bash
cd server
NODE_ENV=production node dist/server.js
```

### 3.3 Verify Server Health

```bash
curl http://localhost:5001/api/health
# Expected: {"status":"healthy","uptime":...}
```

---

## Phase 4: Mobile App Build (15-20 minutes)

### 4.1 Prerequisites

```bash
cd apps/mobile

# Install EAS CLI if needed
npm install -g eas-cli

# Login to Expo
eas login
```

### 4.2 Configure Environment

- [ ] **Update apps/mobile/.env**
  ```bash
  EXPO_PUBLIC_RC_IOS=appl_...
  EXPO_PUBLIC_RC_ANDROID=goog_...
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  EXPO_PUBLIC_API_URL=https://your-api-domain.com
  EXPO_PUBLIC_SOCKET_URL=https://your-api-domain.com
  ```

### 4.3 Build iOS

```bash
# Configure build
eas build:configure

# Production build
eas build --platform ios --profile production

# Or development build for testing
eas build --platform ios --profile development
```

### 4.4 Build Android

```bash
eas build --platform android --profile production
```

### 4.5 Submit to Stores (After Testing)

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

---

## Phase 5: Web App Deployment (5 minutes)

### 5.1 Build

```bash
cd apps/web
pnpm install
pnpm build
```

### 5.2 Deploy (Choose one)

#### Vercel

```bash
vercel --prod
```

#### Netlify

```bash
netlify deploy --prod
```

#### Manual

Upload `apps/web/.next` to your hosting provider

---

## Phase 6: Testing & Verification (20-30 minutes)

### 6.1 Payment Configuration Test

```bash
# Get admin token from login
ADMIN_TOKEN=your-admin-jwt-token

# Run test script
chmod +x scripts/test-payment-config.sh
./scripts/test-payment-config.sh
```

**Expected Output**:
```
✅ Stripe configured
✅ RevenueCat configured
✅ Analytics endpoint accessible
```

### 6.2 Payment Flow Tests

#### Test 1: Subscription Purchase

1. [ ] Open mobile app
2. [ ] Navigate to **Premium** screen
3. [ ] Select **Premium Plan** ($9.99/month)
4. [ ] Complete Stripe PaymentSheet checkout
5. [ ] Verify subscription active:
   - Check admin panel → Billing → Subscriptions
   - User premium status should be "Premium"

#### Test 2: IAP Purchase

1. [ ] Navigate to **Shop**
2. [ ] Purchase **Super Like Pack (10)**
3. [ ] Verify balance updated:
   - Check user profile → Premium balance
   - Should show Super Likes: 10
4. [ ] Use a Super Like
5. [ ] Verify balance decremented:
   - Should show Super Likes: 9

#### Test 3: Webhook Verification

1. [ ] Trigger test webhook from Stripe Dashboard:
   - **Developers → Webhooks → Test webhook**
   - Event: `customer.subscription.created`
2. [ ] Check server logs for webhook received
3. [ ] Verify user subscription updated in database

### 6.3 Admin Panel Tests

#### Configuration Management

1. [ ] Log in as admin
2. [ ] Navigate to **Admin → Configuration**
3. [ ] Verify all services visible:
   - ✅ Stripe Payments
   - ✅ RevenueCat (IAP)
   - ✅ AI Service
   - ✅ External Services
4. [ ] Test editing configuration:
   - Click **Stripe Payments**
   - Change Live Mode toggle
   - Click **Save**
   - Verify success message
5. [ ] Verify configuration persisted:
   - Refresh page
   - Configuration should still be saved

#### User Management

1. [ ] Navigate to **Admin → Users**
2. [ ] Search for a test user
3. [ ] Suspend user:
   - Click user → **Suspend**
   - Enter reason
   - Verify user status changed
4. [ ] Reactivate user:
   - Click user → **Activate**
   - Verify user status restored

#### Analytics Dashboard

1. [ ] Navigate to **Admin → Analytics**
2. [ ] Verify metrics displayed:
   - User statistics
   - Revenue metrics
   - Conversion funnel
   - Cohort retention
3. [ ] Test date range filters
4. [ ] Export analytics (if available)

### 6.4 Core Feature Tests

#### Chat System

1. [ ] Match with a test user
2. [ ] Send a message
3. [ ] Verify message appears in real-time
4. [ ] Verify message status (sent → delivered → read)
5. [ ] Test image sharing
6. [ ] Test offline message queue (turn off network, send message, turn on network)

#### Video Calling

1. [ ] Match with test user
2. [ ] Initiate video call
3. [ ] Verify call connects
4. [ ] Test call controls (mute, video toggle)
5. [ ] End call
6. [ ] Verify call duration recorded

#### Map & AR

1. [ ] Navigate to Map screen
2. [ ] Verify real-time pins appear
3. [ ] Create activity pin
4. [ ] Verify pin appears on map
5. [ ] Click AR button
6. [ ] Verify AR view opens with pins

#### Community

1. [ ] Navigate to Community screen
2. [ ] Create a post
3. [ ] Verify moderation check (may be pending if flagged)
4. [ ] Test post interactions:
   - Like post
   - Comment on post
   - Share post
5. [ ] Report a post
6. [ ] Verify report received in admin panel

#### Swipe System

1. [ ] Navigate to Swipe screen
2. [ ] Swipe 5 times (free user limit)
3. [ ] Verify swipe limit modal appears
4. [ ] Verify upgrade prompt shown
5. [ ] Upgrade to Premium
6. [ ] Verify unlimited swipes enabled

---

## Phase 7: Monitoring Setup (10 minutes)

### 7.1 Log Monitoring

```bash
# PM2 logs
pm2 logs pawfectmatch-api

# Docker logs
docker logs -f pawfectmatch-api

# Manual logs
tail -f server/logs/app.log
```

### 7.2 Health Checks

```bash
# Server health
curl https://your-api-domain.com/api/health

# Database connection
# Check server logs for MongoDB status

# Payment APIs
# Monitor Stripe Dashboard → Payments
# Monitor RevenueCat Dashboard → Customers
```

### 7.3 Alerting Setup

- [ ] Stripe webhook failures
- [ ] RevenueCat API errors
- [ ] Server error rate > 5%
- [ ] Database connection pool exhaustion
- [ ] Memory usage > 80%

---

## Phase 8: Go Live Checklist

### Pre-Launch

- [ ] All payment APIs configured and tested
- [ ] Server deployed and healthy
- [ ] Mobile apps built and tested
- [ ] Web app deployed
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] Monitoring alerts configured
- [ ] Documentation reviewed

### Launch Day

- [ ] Enable production mode
- [ ] Monitor error logs closely
- [ ] Verify payment processing
- [ ] Check real-time features
- [ ] Monitor server resources

### Post-Launch (First 24 Hours)

- [ ] Review analytics daily
- [ ] Monitor payment success rate
- [ ] Check user feedback
- [ ] Optimize based on metrics
- [ ] Fix any critical issues

---

## Troubleshooting

### Configuration Not Saving

**Symptoms**: Admin panel shows "Configuration saved" but values don't persist

**Solutions**:
- Verify admin user has `payment:configure` permission
- Check MongoDB connection
- Review server logs for errors
- Verify encryption keys configured

### Payment Not Working

**Symptoms**: Purchases fail, subscriptions don't activate

**Solutions**:
- Verify API keys are live mode (not test)
- Check Stripe webhook endpoint configured
- Verify Price IDs match Stripe Dashboard
- Check RevenueCat products configured
- Review server logs for errors

### Build Failures

**Symptoms**: Mobile app build fails

**Solutions**:
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear build cache: `eas build:clear`
- Check environment variables set correctly
- Verify Expo account configured

---

## Success Criteria

✅ All payment APIs configured via admin panel  
✅ Server deployed and responding to health checks  
✅ Mobile apps built successfully  
✅ Web app deployed  
✅ Payment flows tested and working end-to-end  
✅ Admin panel accessible and functional  
✅ All core features tested  
✅ Zero critical errors in logs  
✅ Monitoring and alerts configured  

**Status**: 🟢 **READY FOR PRODUCTION**

---

## Quick Reference

### Configuration Files
- **Payment Setup**: `PAYMENT_API_CONFIGURATION.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Quick Start**: `QUICK_START_GUIDE.md`
- **Environment Template**: `.env.example`

### Scripts
- **Verify Config**: `node scripts/verify-configuration.js`
- **Deploy Server**: `./scripts/deploy-server.sh`
- **Test Payments**: `./scripts/test-payment-config.sh`

### Admin Panel Routes
- **Configuration**: Admin → Configuration
- **Users**: Admin → Users
- **Analytics**: Admin → Analytics
- **Billing**: Admin → Billing

---

**Last Updated**: January 2025  
**Version**: 1.0.0

