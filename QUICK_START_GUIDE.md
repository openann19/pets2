# 🚀 Quick Start Guide - Production Deployment

## Step 1: Configure Payment APIs (5 minutes)

### Via Admin Panel (Recommended)

1. **Start the server**:
   ```bash
   cd server
   pnpm install
   pnpm dev
   ```

2. **Log into admin panel** (Mobile App):
   - Navigate to: **Admin → Configuration**
   - Select **Stripe Payments**
     - Enter Secret Key: `sk_live_...` (from Stripe Dashboard)
     - Enter Publishable Key: `pk_live_...`
     - Enter Webhook Secret: `whsec_...` (optional)
     - Enable Live Mode: ✅
     - Click **Save**
   
   - Select **RevenueCat (IAP)**
     - Enter iOS API Key: `appl_...` (from RevenueCat Dashboard)
     - Enter Android API Key: `goog_...`
     - Click **Save**

3. **Verify Configuration**:
   ```bash
   node scripts/verify-configuration.js
   ```

### Via Environment Variables (Alternative)

Edit `.env` files:

**server/.env**:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**apps/mobile/.env**:
```bash
EXPO_PUBLIC_RC_IOS=appl_...
EXPO_PUBLIC_RC_ANDROID=goog_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Step 2: Deploy Server (10 minutes)

### Option A: PM2 (Recommended)

```bash
# Build
cd server
pnpm install
pnpm build

# Deploy
chmod +x ../scripts/deploy-server.sh
../scripts/deploy-server.sh
```

### Option B: Docker

```bash
cd server
docker build -t pawfectmatch-api .
docker run -d -p 5001:5001 --env-file .env --name pawfectmatch-api pawfectmatch-api
```

### Option C: Manual

```bash
cd server
pnpm install
pnpm build
NODE_ENV=production node dist/server.js
```

---

## Step 3: Build Mobile Apps (15 minutes)

### iOS

```bash
cd apps/mobile

# Install EAS CLI if needed
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform ios --profile production
```

### Android

```bash
cd apps/mobile
eas build --platform android --profile production
```

### Development Build (Testing)

```bash
# iOS
eas build --platform ios --profile development

# Android  
eas build --platform android --profile development
```

---

## Step 4: Deploy Web App (5 minutes)

### Vercel (Recommended)

```bash
cd apps/web
vercel --prod
```

### Netlify

```bash
cd apps/web
netlify deploy --prod
```

### Manual

```bash
cd apps/web
pnpm build
# Deploy dist/ to your hosting provider
```

---

## Step 5: Testing Checklist

### Payment Flow Tests

```bash
# Test configuration
chmod +x scripts/test-payment-config.sh
ADMIN_TOKEN=your-admin-token ./scripts/test-payment-config.sh
```

**Manual Tests**:
- [ ] **Subscription Purchase**:
  1. Open mobile app
  2. Navigate to Premium screen
  3. Select Premium plan ($9.99/month)
  4. Complete Stripe PaymentSheet checkout
  5. Verify subscription active in admin panel

- [ ] **IAP Purchase**:
  1. Navigate to Shop
  2. Purchase Super Like pack
  3. Verify balance updated
  4. Use Super Like
  5. Verify balance decremented

- [ ] **Webhook Testing**:
  1. Trigger test webhook from Stripe Dashboard
  2. Check server logs for webhook received
  3. Verify user subscription updated

### Admin Panel Tests

- [ ] **Configuration Access**:
  1. Log in as admin
  2. Navigate to Admin → Configuration
  3. Verify all services visible
  4. Test editing configuration
  5. Verify save works

- [ ] **User Management**:
  1. View users list
  2. Suspend a test user
  3. Verify suspension works
  4. Reactivate user

- [ ] **Analytics**:
  1. View analytics dashboard
  2. Check conversion funnel
  3. View cohort retention
  4. Verify A/B test endpoints

### Core Feature Tests

- [ ] **Chat**: Send message, receive real-time
- [ ] **Calls**: Initiate video call
- [ ] **Map**: View real-time pins
- [ ] **AR**: Open AR view from map
- [ ] **Community**: Create post, verify moderation
- [ ] **Swipe**: Test 5 daily limit enforcement

---

## Step 6: Monitoring Setup

### Health Checks

```bash
# Server health
curl http://localhost:5001/api/health

# Database connection
# Check server logs for MongoDB connection status

# Payment APIs
# Monitor Stripe Dashboard → Payments
# Monitor RevenueCat Dashboard → Customers
```

### Logs

```bash
# PM2 logs
pm2 logs pawfectmatch-api

# Docker logs
docker logs pawfectmatch-api

# Server logs
tail -f server/logs/app.log
```

---

## Troubleshooting

### Configuration Not Saving

- Verify admin role has `payment:configure` permission
- Check MongoDB connection
- Review server logs for errors

### Payment Not Working

- Verify API keys are live mode (not test)
- Check Stripe webhook endpoint configured
- Verify Price IDs match Stripe Dashboard
- Check RevenueCat products configured

### Build Failures

- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear build cache: `pnpm build --clean`
- Check environment variables set

---

## Success Criteria

✅ All payment APIs configured  
✅ Server deployed and healthy  
✅ Mobile apps built successfully  
✅ Web app deployed  
✅ Payment flows tested and working  
✅ Admin panel accessible  
✅ No critical errors in logs  

**Status**: 🟢 **READY FOR PRODUCTION**

---

## Next Steps

1. **Monitor** first 24 hours closely
2. **Optimize** based on real usage
3. **Scale** infrastructure as needed
4. **Iterate** based on user feedback

For detailed deployment information, see `DEPLOYMENT_GUIDE.md`

