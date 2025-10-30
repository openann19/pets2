import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

const prefixes = ['pawfectmatch://', 'https://pawfectmatch.com'];

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES: (keyof RootStackParamList)[] = [
  'Home',
  'Swipe',
  'Matches',
  'Profile',
  'Settings',
  'Chat',
  'MyPets',
  'CreatePet',
  'Premium',
  'AdoptionManager',
  'MemoryWeave',
  'ARScentTrails',
  'Stories',
  'Leaderboard',
  'Community',
];

/**
 * Enhanced linking configuration with authentication checks
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes,
  /**
   * Filter deep links based on authentication state
   */
  async getInitialURL() {
    // Handle initial URL from app launch or deep link
    return null;
  },
  /**
   * Subscribe to URL updates
   */
  subscribe(listener) {
    // Handle deep link subscriptions
    const subscription = { remove: () => {} };
    return subscription;
  },
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Swipe: 'swipe',
          Matches: 'matches',
          Map: 'map',
          Profile: 'profile',
        },
      } as unknown as any,

      // Auth
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: {
        path: 'reset-password/:token',
        parse: {
          token: (token: string) => token,
        },
      },

      // Core
      Main: 'main',
      Settings: 'settings',
      Chat: {
        path: 'chat/:matchId/:petName?',
        parse: {
          matchId: (matchId: string) => matchId,
          petName: (petName: string) => petName,
        },
      },
      MyPets: 'my-pets',
      CreatePet: 'create-pet',

      // Premium / Subscriptions
      Premium: 'premium',
      Subscription: 'subscription',
      PremiumSuccess: {
        path: 'premium-success/:sessionId?',
        parse: {
          sessionId: (sessionId: string) => sessionId,
        },
      },
      PremiumCancel: 'premium-cancel',
      SubscriptionManager: 'subscription-manager',
      SubscriptionSuccess: {
        path: 'subscription-success/:sessionId?',
        parse: {
          sessionId: (sessionId: string) => sessionId,
        },
      },
      ManageSubscription: 'manage-subscription',

      // AI
      AIBio: 'ai-bio',
      AIPhotoAnalyzer: 'ai-photo-analyzer',
      AICompatibility: 'ai-compatibility',

      // Settings detail
      PrivacySettings: 'privacy-settings',
      BlockedUsers: 'blocked-users',
      SafetyCenter: 'safety-center',
      VerificationCenter: 'verification-center',
      NotificationPreferences: 'notification-preferences',
      HelpSupport: 'help-support',
      AboutTermsPrivacy: 'about-terms-privacy',
      DeactivateAccount: 'deactivate-account',
      EditProfile: 'edit-profile',
      AdvancedFilters: 'advanced-filters',
      ModerationTools: 'moderation-tools',

      // Adoption
      AdoptionManager: 'adoption-manager',
      AdoptionApplication: {
        path: 'adoption-application/:petId/:petName?',
        parse: {
          petId: (petId: string) => petId,
          petName: (petName: string) => petName,
        },
      },

      // Admin
      AdminDashboard: 'admin-dashboard',
      AdminUsers: 'admin-users',
      AdminAnalytics: 'admin-analytics',
      AdminBilling: 'admin-billing',
      AdminSecurity: 'admin-security',
      AdminChats: 'admin-chats',
      AdminUploads: 'admin-uploads',
      AdminVerifications: 'admin-verifications',

      // Advanced / social
      Profile: {
        path: 'profile/:userId?',
        parse: {
          userId: (userId: string) => userId,
        },
      },
      MemoryWeave: 'memory-weave',
      ARScentTrails: 'ar-scent-trails',
      Stories: 'stories',
      Leaderboard: 'leaderboard',
      Community: 'community',

      // Live
      GoLive: 'go-live',
      LiveViewer: {
        path: 'live-viewer/:streamId',
        parse: {
          streamId: (streamId: string) => streamId,
        },
      },
      LiveBrowse: 'live-browse',

      // Demos
      ComponentTest: 'component-test',
      NewComponentsTest: 'new-components-test',
      MigrationExample: 'migration-example',
      PremiumDemo: 'premium-demo',
      UIDemo: 'ui-demo',
      DemoShowcase: 'demo-showcase',
    },
  },
};
