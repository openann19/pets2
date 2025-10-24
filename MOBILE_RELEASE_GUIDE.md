# PawfectMatch Mobile App Release Guide

This document outlines the step-by-step process for building and submitting the PawfectMatch mobile app to both the Apple App Store and Google Play Store using Expo Application Services (EAS).

## Prerequisites

- Expo account with access to the PawfectMatch project
- Apple Developer account ($99/year)
- Google Play Developer account ($25 one-time fee)
- Keystore file for Android signing (stored securely)
- Apple App Store Connect team configuration

## Environment Setup

1. Install the latest EAS CLI globally:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account:

```bash
eas login
```

3. Verify EAS configuration in `apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.4.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID@email.com",
        "ascAppId": "APP_STORE_CONNECT_ID",
        "appleTeamId": "APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

## Pre-Release Checklist

- [ ] App version and build number updated in `app.json`
- [ ] All environment variables set correctly for production
- [ ] App icons and splash screens optimized and included
- [ ] Privacy policy and terms of service URLs updated
- [ ] All API endpoints pointing to production
- [ ] Stripe production keys configured (if applicable)
- [ ] Analytics and crash reporting configured
- [ ] All automated and manual tests passing

## Building for iOS

1. Configure Apple credentials:

```bash
cd apps/mobile
eas credentials --platform ios
```

2. Create a production build:

```bash
eas build --platform ios --profile production
```

3. Wait for the build to complete in the Expo cloud build service. This can take 15-30 minutes.

4. The resulting .ipa file will be available for download from the Expo dashboard.

## Building for Android

1. Configure Android credentials:

```bash
cd apps/mobile
eas credentials --platform android
```

2. Upload your keystore or let EAS generate one (recommended for first build):

```bash
eas build:configure --platform android
```

3. Create a production build:

```bash
eas build --platform android --profile production
```

4. Wait for the build to complete in the Expo cloud build service. This can take 15-30 minutes.

5. The resulting .aab (Android App Bundle) will be available for download from the Expo dashboard.

## Submitting to App Stores

### Apple App Store

1. Prepare app submission:

```bash
eas submit --platform ios --latest
```

2. Complete App Store Connect information:
   - Screenshots for various device sizes
   - App description, keywords, and promotional text
   - Privacy policy URL
   - App review information (test account credentials)

3. Submit for review through the EAS CLI or App Store Connect dashboard.

4. Monitor review status (typically 24-48 hours).

### Google Play Store

1. Prepare app submission:

```bash
eas submit --platform android --latest
```

2. Complete Google Play Console information:
   - Store listing (screenshots, descriptions)
   - Content rating questionnaire
   - Pricing & distribution settings
   - Privacy policy URL

3. Submit for review through the EAS CLI or Google Play Console dashboard.

4. Monitor review status (typically 24-72 hours).

## CI/CD Integration

For automated builds via GitHub Actions, add this workflow:

```yaml
name: Mobile App Build

on:
  push:
    branches:
      - main
    paths:
      - 'apps/mobile/**'
      - 'packages/core/**'
      - 'packages/ui/**'

jobs:
  eas-build:
    runs-on: ubuntu-latest
    steps:
      - name: 📱 Checkout repository
        uses: actions/checkout@v4

      - name: 🏗️ Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18.x
          cache: 'pnpm'

      - name: 📦 Install dependencies
        run: |
          npm install -g pnpm
          pnpm install --frozen-lockfile

      - name: 🔐 Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: 🧪 Run tests
        run: pnpm test --filter=@pawfectmatch/mobile

      - name: 🏗️ Build app
        run: |
          cd apps/mobile
          eas build --platform all --profile production --non-interactive
```

## Post-Release Monitoring

1. Monitor crash reports and error tracking via Sentry
2. Track user adoption via Firebase Analytics
3. Monitor app reviews and ratings in both stores
4. Prepare for potential hotfix releases if critical issues are found

## Troubleshooting Common Issues

### EAS Build Failures

- Check the EAS build logs for detailed error information
- Ensure all native dependencies are compatible with Expo
- Verify app.json configuration is valid

### App Store Rejections

- Privacy concerns: Ensure proper disclosure of data collection
- Performance issues: Test thoroughly on various devices
- Metadata issues: Follow App Store guidelines for screenshots and descriptions

### Google Play Rejections

- Permission issues: Only request essential permissions
- Policy violations: Follow Google Play policies, especially regarding ads
- Content issues: Ensure all content complies with content rating

## Support Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Expo Community Forums](https://forums.expo.dev/)

---

*Last Updated: 2025-10-11*
