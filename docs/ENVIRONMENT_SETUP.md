# Environment Configuration Guide

## Overview

This guide explains how to configure environment variables for PawfectMatch across different environments (development, staging, production).

---

## Quick Start

### 1. Copy the Example File

```bash
cp .env.example .env
```

### 2. Fill in Required Values

Edit `.env` and replace placeholder values with your actual configuration.

### 3. Validate Configuration

```bash
node scripts/validate-env.js
```

---

## Required Variables

### Server Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | `5000` | Server port |
| `NODE_ENV` | string | `development` | Environment (development, production, test) |

### Database

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `MONGODB_URI` | string | ✅ Yes | MongoDB connection string |

**Examples:**
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/pawfectmatch

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawfectmatch
```

### Authentication

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `JWT_SECRET` | string | ✅ Yes | JWT signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | string | No | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRY` | string | No | Refresh token expiry (default: 7d) |

**Security Best Practices:**
- Use a strong, random secret (at least 32 characters)
- Never commit secrets to version control
- Use different secrets for each environment
- Rotate secrets regularly

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Client Configuration

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `CLIENT_URL` | string | ✅ Yes | Frontend application URL |

**Examples:**
```bash
# Development
CLIENT_URL=http://localhost:3000

# Production
CLIENT_URL=https://pawfectmatch.com
```

---

## Recommended Variables

### Email Configuration

| Variable | Description |
|----------|-------------|
| `EMAIL_SERVICE` | Email service provider (nodemailer, sendgrid) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | From email address |

**Gmail Example:**
```bash
EMAIL_SERVICE=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@pawfectmatch.com
```

**SendGrid Example:**
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@pawfectmatch.com
```

### File Upload (Cloudinary)

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**Setup:**
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Add to `.env`

### Payment (Stripe)

| Variable | Description |
|----------|-------------|
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |

**Price IDs for Subscriptions:**
```bash
NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ULTIMATE_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ULTIMATE_YEARLY_PRICE_ID=price_xxxxx
```

**Setup:**
1. Create account at [stripe.com](https://stripe.com)
2. Create products and prices in dashboard
3. Copy price IDs to `.env`
4. Set up webhook endpoint for `/api/webhooks/stripe`

### Monitoring

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Sentry error tracking DSN |
| `GA_TRACKING_ID` | Google Analytics tracking ID |

---

## Production-Only Variables

These are required only in production:

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection URL for sessions/caching |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SENTRY_DSN` | Sentry error tracking |

---

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pawfectmatch
CLIENT_URL=http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production
DEBUG=true
```

### Staging

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://staging-user:pass@staging.mongodb.net/pawfectmatch
CLIENT_URL=https://staging.pawfectmatch.com
JWT_SECRET=staging-secret-key
SENTRY_DSN=https://staging-sentry-dsn@sentry.io/project
```

### Production

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://prod-user:pass@prod.mongodb.net/pawfectmatch
CLIENT_URL=https://pawfectmatch.com
JWT_SECRET=production-secret-key-very-long-and-secure
REDIS_URL=rediss://username:password@redis-host:port
SENTRY_DSN=https://prod-sentry-dsn@sentry.io/project
STRIPE_WEBHOOK_SECRET=whsec_production_webhook_secret
```

---

## Validation

### Automatic Validation

The server automatically validates environment variables on startup using `/server/src/utils/validateEnv.js`.

### Manual Validation

Run the validation script:

```bash
node scripts/validate-env.js
```

**Output:**
```
🔍 Validating environment variables...

📋 Checking required variables...
💡 Checking recommended variables...
🔒 Running security checks...

============================================================
📊 Validation Results
============================================================

✅ All environment variables are valid!
============================================================
```

---

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] JWT_SECRET doesn't contain placeholder text
- [ ] Different secrets for dev/staging/prod
- [ ] No development secrets in production
- [ ] MONGODB_URI doesn't use localhost in production
- [ ] Stripe production keys (not test keys) in production
- [ ] CORS origins don't include localhost in production
- [ ] Secrets are not committed to version control
- [ ] `.env` is in `.gitignore`

---

## Troubleshooting

### "JWT_SECRET is required"

**Solution:** Add `JWT_SECRET` to your `.env` file:
```bash
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### "MONGODB_URI is required"

**Solution:** Add MongoDB connection string:
```bash
# Local
MONGODB_URI=mongodb://localhost:27017/pawfectmatch

# Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pawfectmatch
```

### "Using development secrets in production"

**Solution:** Generate new secrets for production:
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate new session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "Stripe webhook secret not set"

**Solution:** 
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Copy webhook signing secret
4. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Best Practices

### 1. Use Environment-Specific Files

```bash
.env.development
.env.staging
.env.production
```

### 2. Never Commit Secrets

Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

### 3. Use Secret Management

For production, consider:
- AWS Secrets Manager
- HashiCorp Vault
- Google Secret Manager
- Azure Key Vault

### 4. Rotate Secrets Regularly

- JWT secrets: Every 90 days
- API keys: Every 180 days
- Database passwords: Every 90 days

### 5. Monitor Secret Usage

- Enable audit logging
- Track secret access
- Alert on unauthorized access

---

## Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Fill in required values
3. ✅ Run validation: `node scripts/validate-env.js`
4. ✅ Start server: `npm run dev`
5. ✅ Test configuration

---

## Support

For issues or questions:
- Check validation output
- Review this documentation
- Check server logs
- Contact DevOps team
