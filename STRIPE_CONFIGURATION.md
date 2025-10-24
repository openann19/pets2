# Stripe Configuration Guide

## Required Environment Variables

To enable premium subscription features, you must configure the following environment variables in your `.env` file:

### Stripe Price IDs
```bash
# Basic Plan - $4.99/month
EXPO_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1P1234567890abcdefghijklmn

# Premium Plan - $9.99/month (Most Popular)
EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_1P2345678901bcdefghijklmnop

# Ultimate Plan - $19.99/month
EXPO_PUBLIC_STRIPE_ULTIMATE_PRICE_ID=price_1P3456789012cdefghijklmnopqr
```

### Stripe Publishable Key
```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_1234567890abcdefghijklmnopqrstuvwxyz
```

## How to Get Your Stripe Price IDs

1. **Log into Stripe Dashboard**: Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Navigate to Products**: Click on "Products" in the left sidebar
3. **Create Products**: Create three products for Basic, Premium, and Ultimate plans
4. **Add Pricing**: For each product, add monthly pricing:
   - Basic: $4.99/month
   - Premium: $9.99/month  
   - Ultimate: $19.99/month
5. **Copy Price IDs**: Each pricing will have a Price ID that starts with `price_`
6. **Update Environment**: Replace the placeholder values in your `.env` file

## Fallback Configuration

The app includes fallback price IDs that follow Stripe's format. These are used when environment variables are not set, but **will not work for actual payments**. You must configure real Stripe price IDs for production.

## Testing

- Use Stripe's test mode for development
- Test price IDs start with `price_` and are safe to use in development
- Never use real payment methods in test mode

## Production Deployment

Before deploying to production:
1. Switch to live mode in Stripe Dashboard
2. Create live products and pricing
3. Update environment variables with live price IDs
4. Update publishable key to live key (starts with `pk_live_`)

## Security Notes

- Never commit real Stripe keys to version control
- Use environment variables for all sensitive configuration
- Rotate keys regularly for security
- Monitor Stripe Dashboard for unusual activity
