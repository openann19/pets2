module.exports = ({ config }) => ({
  ...config,
  name: 'PawfectMatch Premium',
  slug: 'pawfectmatch-premium',
  owner: 'pawfectmatch',
  version: '1.0.0',
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
  assetBundlePatterns: ['src/assets/fonts/*', '**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.pawfectmatch.premium',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription:
        'PawfectMatch uses the camera for pet photo uploads and AR discovery features',
      NSLocationWhenInUseUsageDescription:
        'PawfectMatch uses your location to find compatible pets nearby',
      NSMicrophoneUsageDescription:
        'PawfectMatch uses the microphone for video calls with pet matches',
      NSPhotoLibraryUsageDescription:
        'PawfectMatch needs access to your photo library to upload pet pictures',
      NSContactsUsageDescription:
        'PawfectMatch can sync your contacts to help you find friends who use the app',
    },
    associatedDomains: ['applinks:pawfectmatch.com'],
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.pawfectmatch.premium',
    versionCode: 1,
    compileSdkVersion: 34,
    targetSdkVersion: 34,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ec4899',
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.VIBRATE',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'https',
            host: 'pawfectmatch.com',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/your-project-id',
  },
  runtimeVersion: '1.0.0',
  plugins: [
    'expo-camera',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow PawfectMatch to use your location to find pets near you and suggest nearby meetup locations.',
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
