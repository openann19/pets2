# 🌟 Enhanced Features 2025 - Environment Variables

## Required Environment Variables

Add these to your `.env` file for the enhanced features to work:

```env
# Enhanced 2025 Features

# Biometric Authentication (WebAuthn)
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost
NEXT_PUBLIC_WEBAUTHN_RP_NAME=PawfectMatch
WEBAUTHN_ORIGIN=http://localhost:3000

# Smart Notifications (Push Notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:admin@pawfectmatch.com

# Leaderboard
LEADERBOARD_CACHE_TTL=300
LEADERBOARD_MAX_ENTRIES=1000
```

## Setup Instructions

### 1. Biometric Authentication (WebAuthn)

WebAuthn requires specific configuration for your domain:

```env
# For development
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost
NEXT_PUBLIC_WEBAUTHN_RP_NAME=PawfectMatch
WEBAUTHN_ORIGIN=http://localhost:3000

# For production
NEXT_PUBLIC_WEBAUTHN_RP_ID=yourdomain.com
NEXT_PUBLIC_WEBAUTHN_RP_NAME=PawfectMatch
WEBAUTHN_ORIGIN=https://yourdomain.com
```

### 2. Smart Notifications (VAPID Keys)

Generate VAPID keys for push notifications:

```bash
# Install web-push CLI
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

This will output:

```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa40HI...

Private Key:
...

=======================================
```

### 3. Leaderboard Configuration

Configure leaderboard caching and limits:

```env
# Cache leaderboard results for 5 minutes
LEADERBOARD_CACHE_TTL=300

# Maximum entries per leaderboard
LEADERBOARD_MAX_ENTRIES=1000
```

## Production Deployment

### Environment-Specific Settings

#### Development

```env
NODE_ENV=development
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
```

#### Staging

```env
NODE_ENV=staging
NEXT_PUBLIC_WEBAUTHN_RP_ID=staging.pawfectmatch.com
WEBAUTHN_ORIGIN=https://staging.pawfectmatch.com
```

#### Production

```env
NODE_ENV=production
NEXT_PUBLIC_WEBAUTHN_RP_ID=pawfectmatch.com
WEBAUTHN_ORIGIN=https://pawfectmatch.com
```

## Security Notes

1. **WebAuthn RP ID**: Must match your domain exactly
2. **VAPID Keys**: Keep private key secure, never expose in client code
3. **HTTPS Required**: WebAuthn requires HTTPS in production
4. **Origin Validation**: Always validate WebAuthn origins

## Testing

### Biometric Authentication

- Test on iOS Safari (Face ID)
- Test on Mac Safari (Touch ID)
- Test on Android Chrome (Fingerprint)
- Test fallback to password

### Smart Notifications

- Test permission request
- Test quiet hours functionality
- Test different notification types
- Test across timezones

### Leaderboard

- Test all categories (overall, streak, matches, engagement)
- Test all timeframes (daily, weekly, monthly, allTime)
- Test with large datasets
- Test user ranking accuracy

## Troubleshooting

### Common Issues

1. **WebAuthn not working**: Check RP ID and origin configuration
2. **Push notifications failing**: Verify VAPID keys and HTTPS
3. **Leaderboard slow**: Check database indexes and caching
4. **Biometric fallback**: Ensure password auth is working

### Debug Mode

Enable debug logging:

```env
DEBUG=biometric,notifications,leaderboard
LOG_LEVEL=debug
```

## Stories Limits

To limit per-user daily story creations (applies to POST /api/stories), set:

```env
# Defaults to 10 if unset
STORY_DAILY_CAP=10
```

Notes:
- Enforced via Redis-backed middleware `storyDailyLimiter`. If `REDIS_URL` is not configured, the limiter fails open and logs a warning.
- The counter resets at UTC end-of-day. The response when over the cap is HTTP 429 with code `DAILY_LIMIT_EXCEEDED`.
