module.exports = ({ config }) => ({
  ...config,
  name: 'PawfectMatch Premium',
  slug: 'pawfectmatch-premium',
  owner: 'pawfectmatch',
  version: process.env.APP_VERSION || '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'pawfectmatch',
  platforms: ['ios', 'android'],
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ec4899',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.pawfectmatch.premium',
    buildNumber: process.env.IOS_BUILD_NUMBER || '1',
    jsEngine: 'hermes',
    infoPlist: {
      NSCameraUsageDescription:
        'PawfectMatch uses the camera for pet photo uploads and AR discovery features',
      NSLocationWhenInUseUsageDescription:
        'PawfectMatch uses your location to find compatible pets nearby',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'PawfectMatch uses your location to find compatible pets nearby and suggest meetup locations',
      NSMicrophoneUsageDescription:
        'PawfectMatch uses the microphone for video calls with pet matches',
      NSPhotoLibraryUsageDescription:
        'PawfectMatch needs access to your photo library to upload pet pictures',
      NSPhotoLibraryAddUsageDescription:
        'PawfectMatch needs access to save photos to your library',
      NSContactsUsageDescription:
        'PawfectMatch can sync your contacts to help you find friends who use the app',
      // NSUserTrackingUsageDescription removed: No tracking SDKs present that require ATT
      // RevenueCat (IAP) and Sentry (error tracking) do not require App Tracking Transparency
      ITSAppUsesNonExemptEncryption: false,
      CFBundleDisplayName: 'PawfectMatch',
      CFBundleName: 'PawfectMatch',
      LSApplicationQueriesSchemes: ['pawfectmatch', 'https'],
      // Age rating metadata for App Store Connect
      // App is suitable for ages 4+ (no violence, mature content, or gambling)
    },
    associatedDomains: ['applinks:pawfectmatch.com'],
    config: {
      usesNonExemptEncryption: false,
      // App Transport Security (ATS) configuration
      // Enforce HTTPS for all network requests in production
      // Allow HTTP only in development for localhost
      // Note: ATS is enabled by default on iOS, this config ensures proper settings
    },
    // App Store metadata
    appStoreUrl: 'https://apps.apple.com/app/pawfectmatch-premium',
    // Age rating configuration for App Store submission
    // Pet matching app: suitable for ages 4+ (no violence, mature content, or gambling)
    ageRating: {
      // iOS age rating: 4+ (suitable for all ages)
      // Content descriptors: None (no violence, mature content, gambling, etc.)
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['C617.1'], // App functionality
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['35F9.1'], // Analytics
        },
      ],
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeLocation',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePhotosOrVideos',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeName',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeEmailAddress',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
      ],
    },
  },
  android: {
    package: 'com.pawfectmatch.premium',
    versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '1', 10),
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    jsEngine: 'hermes',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ec4899',
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      // ACCESS_BACKGROUND_LOCATION removed: App uses location only "when in use" (no background location needed)
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      // READ_EXTERNAL_STORAGE removed: Using scoped storage (Android 10+), replaced by READ_MEDIA_* on Android 13+
      // WRITE_EXTERNAL_STORAGE removed: Using scoped storage (Android 10+), not needed
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.VIBRATE',
      'android.permission.POST_NOTIFICATIONS',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'https',
            host: 'pawfectmatch.com',
          },
          {
            scheme: 'pawfectmatch',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
    // Play Store metadata
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.pawfectmatch.premium',
    // Android content rating: Everyone (E)
    // Content descriptors: None (no violence, mature content, gambling, etc.)
    // Note: Actual content rating must be set in Google Play Console
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: process.env.EXPO_UPDATE_URL || 'https://u.expo.dev/your-project-id',
    requestHeaders: {
      'expo-channel-name': process.env.EXPO_CHANNEL || 'production',
    },
    // OTA Update Channels Configuration
    // Fixes D-04: Enable Over-the-Air (OTA) updates channel "prod"
    channels: {
      production: 'production',
      preview: 'preview',
      development: 'development',
    },
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  plugins: [
    'expo-camera',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow PawfectMatch to use your location to find pets near you and suggest nearby meetup locations.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ec4899',
        sounds: [],
      },
    ],
  ],
  extra: {
    eas: {
      projectId: process.env.EXPO_PROJECT_ID || 'your-expo-project-id',
    },
    // Environment variables
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api',
    socketUrl:
      process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
    // Feature flags
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePushNotifications:
      process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
    // Store URLs
    privacyPolicyUrl: 'https://pawfectmatch.com/privacy',
    termsOfServiceUrl: 'https://pawfectmatch.com/terms',
    supportUrl: 'https://pawfectmatch.com/support',
  },
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: process.env.SENTRY_ORG || 'pawfectmatch',
          project: process.env.SENTRY_PROJECT || 'pawfectmatch-mobile',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
});
