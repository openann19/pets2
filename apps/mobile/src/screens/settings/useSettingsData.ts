/**
 * useSettingsData Hook
 * Provides all settings data arrays
 */
import { useMemo } from 'react';
import { __DEV__ } from '../../config/environment';

export interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon:
    | 'text'
    | 'card'
    | 'toggle'
    | 'notifications'
    | 'mail'
    | 'push'
    | 'heart'
    | 'chatbubble'
    | 'settings'
    | 'person'
    | 'shield-checkmark'
    | 'star'
    | 'layers'
    | 'help'
    | 'help-circle'
    | 'chatbox-ellipses'
    | 'information-circle'
    | 'lock-closed'
    | 'document-text'
    | 'download'
    | 'log-out'
    | 'close-circle'
    | 'trash';
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  destructive?: boolean;
}

interface UseSettingsDataProps {
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
  };
  deletionStatus: {
    isPending: boolean;
    daysRemaining: number | null;
  };
}

export function useSettingsData({
  notifications,
  deletionStatus,
}: UseSettingsDataProps) {
  const notificationSettings: SettingItem[] = useMemo(
    () => [
      {
        id: 'email',
        title: 'Email Notifications',
        subtitle: 'Receive notifications via email',
        icon: 'mail',
        type: 'toggle',
        value: notifications.email,
      },
      {
        id: 'push',
        title: 'Push Notifications',
        subtitle: 'Receive push notifications',
        icon: 'notifications',
        type: 'toggle',
        value: notifications.push,
      },
      {
        id: 'matches',
        title: 'New Matches',
        subtitle: 'Get notified when you have a new match',
        icon: 'heart',
        type: 'toggle',
        value: notifications.matches,
      },
      {
        id: 'messages',
        title: 'Messages',
        subtitle: 'Receive notifications for new messages',
        icon: 'chatbubble',
        type: 'toggle',
        value: notifications.messages,
      },
    ],
    [notifications],
  );

  const preferenceSettings: SettingItem[] = useMemo(
    () => [
      {
        id: 'placeholder',
        title: 'Preferences',
        subtitle: 'Coming soon',
        icon: 'settings',
        type: 'navigation',
      },
    ],
    [],
  );

  const accountSettings: SettingItem[] = useMemo(
    () => [
      {
        id: 'profile',
        title: 'Edit Profile',
        subtitle: 'Update your personal information',
        icon: 'person',
        type: 'navigation',
      },
      {
        id: 'privacy',
        title: 'Privacy Settings',
        subtitle: 'Control your privacy and visibility',
        icon: 'shield-checkmark',
        type: 'navigation',
      },
      {
        id: 'subscription',
        title: 'Subscription',
        subtitle: 'Manage your premium subscription',
        icon: 'star',
        type: 'navigation',
      },
      {
        id: 'referral',
        title: 'Referral Program',
        subtitle: 'Share and earn Premium rewards',
        icon: 'heart',
        type: 'navigation',
      },
      {
        id: 'iap-shop',
        title: 'Shop',
        subtitle: 'Purchase Super Likes, Boosts & more',
        icon: 'card',
        type: 'navigation',
      },
    ],
    [],
  );

  const supportSettings: SettingItem[] = useMemo(
    () => [
      {
        id: 'demo-showcase',
        title: 'Demo Showcase',
        subtitle: 'See demo data and features',
        icon: 'layers',
        type: 'navigation',
      },
      {
        id: 'ui-demo',
        title: 'UI Showcase',
        subtitle: 'View all UI components and variants',
        icon: 'layers',
        type: 'navigation',
      },
      ...(__DEV__
        ? [
            {
              id: 'motion-lab',
              title: 'Motion Lab',
              subtitle: 'Test animations and performance',
              icon: 'layers',
              type: 'navigation',
            } as SettingItem,
          ]
        : []),
      {
        id: 'help',
        title: 'Help & Support',
        subtitle: 'Get help and contact support',
        icon: 'help-circle',
        type: 'navigation',
      },
      {
        id: 'feedback',
        title: 'Send Feedback',
        subtitle: 'Share your thoughts and suggestions',
        icon: 'chatbox-ellipses',
        type: 'navigation',
      },
      {
        id: 'about',
        title: 'About PawfectMatch',
        subtitle: 'App version and information',
        icon: 'information-circle',
        type: 'navigation',
      },
    ],
    [],
  );

  const legalSettings: SettingItem[] = useMemo(
    () => [
      {
        id: 'privacy-policy',
        title: 'Privacy Policy',
        subtitle: 'How we collect and use your data',
        icon: 'lock-closed',
        type: 'action',
      },
      {
        id: 'terms-of-service',
        title: 'Terms of Service',
        subtitle: 'Rules and guidelines for using PawfectMatch',
        icon: 'document-text',
        type: 'action',
      },
    ],
    [],
  );

  const dangerSettings: SettingItem[] = useMemo(
    () => [
      {
        id: 'export-data',
        title: 'Export My Data',
        subtitle: 'Download a copy of your data (GDPR)',
        icon: 'download',
        type: 'action',
      },
      {
        id: 'logout',
        title: 'Log Out',
        subtitle: 'Sign out of your account',
        icon: 'log-out',
        type: 'action',
      },
      {
        id: 'delete',
        title: deletionStatus.isPending
          ? `Cancel Account Deletion (${deletionStatus.daysRemaining} days left)`
          : 'Request Account Deletion',
        subtitle: deletionStatus.isPending
          ? 'Cancel your pending deletion request'
          : 'Permanently delete your account (30-day grace period)',
        icon: deletionStatus.isPending ? 'close-circle' : 'trash',
        type: 'action',
        destructive: !deletionStatus.isPending,
      },
    ],
    [deletionStatus],
  );

  return {
    notificationSettings,
    preferenceSettings,
    accountSettings,
    supportSettings,
    legalSettings,
    dangerSettings,
  };
}

