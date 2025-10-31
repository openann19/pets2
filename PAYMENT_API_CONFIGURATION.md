# Payment API Configuration Guide

## Admin Configuration

All payment APIs (Stripe and RevenueCat) can be configured through the **Admin Panel**:

1. Navigate to **Admin → Configuration** in the mobile app
2. Select **Stripe Payments** or **RevenueCat (IAP)** 
3. Enter your API keys
4. Save configuration

Configuration is stored encrypted in the database and takes precedence over environment variables.

---

## Environment Variables (Fallback)

If not configured via admin panel, the app will fall back to environment variables.

### Server (.env)

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (for subscription plans)
EXPO_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...
EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...
EXPO_PUBLIC_STRIPE_ULTIMATE_PRICE_ID=price_...
```

### Mobile (.env)

```bash
# RevenueCat API Keys
EXPO_PUBLIC_RC_IOS=appl_...
EXPO_PUBLIC_RC_ANDROID=goog_...

# Stripe Publishable Key (for mobile)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## How to Get API Keys

### Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy **Secret key** (starts with `sk_`) and **Publishable key** (starts with `pk_`)
4. For webhooks: **Developers → Webhooks → Add endpoint** → Copy webhook secret

### RevenueCat

1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Select your project
3. Navigate to **API Keys** in settings
4. Copy **iOS API Key** (starts with `appl_`) and **Android API Key** (starts with `goog_`)

---

## Testing

### Stripe Test Mode

- Use test API keys (start with `sk_test_` and `pk_test_`)
- Use test card numbers: `4242 4242 4242 4242`
- Test expiration: Any future date
- Test CVC: Any 3 digits

### RevenueCat Test Mode

- Create test products in RevenueCat dashboard
- Configure products in App Store Connect (iOS) and Google Play Console (Android)
- Use sandbox testing accounts

---

## Production Deployment

1. **Switch to Live Mode**:
   - Stripe: Use live API keys (`sk_live_` and `pk_live_`)
   - RevenueCat: Use production API keys
   - Update admin panel configuration

2. **Verify Configuration**:
   - Test purchase flow end-to-end
   - Verify webhook endpoints
   - Check subscription status updates

3. **Monitor**:
   - Stripe Dashboard → Payments
   - RevenueCat Dashboard → Customers
   - App logs for errors

---

## Security Notes

- ✅ API keys are encrypted in database
- ✅ Admin panel requires admin role
- ✅ Configuration changes are audited
- ✅ Keys are masked in UI
- ⚠️ Never commit API keys to git
- ⚠️ Rotate keys regularly
- ⚠️ Use environment variables in CI/CD

