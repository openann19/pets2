import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

const prefixes = ['pawfectmatch://', 'https://pawfectmatch.com'];

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes,
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
    },
  },
};
