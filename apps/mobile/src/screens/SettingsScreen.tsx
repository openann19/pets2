import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { haptic } from '../ui/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { SwitchFlick } from '../components/micro/SwitchFlick';

import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { matchesAPI } from '../services/api';
import { useSettingsScreen } from '../hooks/screens/useSettingsScreen';
import type { RootStackScreenProps } from '../navigation/types';
import {
  ProfileSummarySection,
  NotificationSettingsSection,
  LanguageSection,
  AccountSettingsSection,
  DangerZoneSection,
} from './settings';
import { SettingSection } from '../components/settings/SettingSection';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';

type SettingsScreenProps = RootStackScreenProps<'Settings'>;

interface SettingItem {
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

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const reducedMotion = useReduceMotion();
  const theme = useTheme();
  const { t } = useTranslation('common');

  const {
    notifications,
    preferences,
    deletionStatus,
    setNotifications,
    setPreferences,
    handleLogout,
    handleDeleteAccount,
    handleExportData,
  } = useSettingsScreen();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scrollView: {
          flex: 1,
        },
        scrollContent: {
          paddingBottom: 40,
        },
        section: {
          marginTop: 24,
          paddingHorizontal: 20,
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: theme.colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 12,
        },
        sectionContent: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          shadowColor: theme.colors.border,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        settingItem: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        settingItemDestructive: {
          borderBottomColor: theme.colors.danger + '20',
        },
        settingLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        settingIcon: {
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: theme.colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        settingIconDestructive: {
          backgroundColor: theme.colors.danger + '20',
        },
        settingText: {
          flex: 1,
        },
        settingTitle: {
          fontSize: 16,
          fontWeight: '500',
          color: theme.colors.onSurface,
          marginBottom: 2,
        },
        settingTitleDestructive: {
          color: theme.colors.danger,
        },
        settingSubtitle: {
          fontSize: 13,
          color: theme.colors.textMuted,
        },
        settingSubtitleDestructive: {
          color: theme.colors.danger,
        },
        settingRight: {
          marginLeft: 12,
        },
        versionSection: {
          alignItems: 'center',
          paddingVertical: 40,
          paddingHorizontal: 20,
        },
        versionText: {
          fontSize: 14,
          color: theme.colors.textMuted,
          fontWeight: '500',
        },
        versionSubtitle: {
          fontSize: 12,
          color: theme.colors.textMuted,
          marginTop: 4,
        },
      }),
    [theme],
  );

  const notificationSettings: SettingItem[] = [
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
  ];

  // Note: These are examples only - the actual preferences structure is for match filtering
  const preferenceSettings: SettingItem[] = [
    // Add UI preferences here as needed - but won't be in User["preferences"]
    {
      id: 'placeholder',
      title: 'Preferences',
      subtitle: 'Coming soon',
      icon: 'settings',
      type: 'navigation',
    },
  ];

  const accountSettings: SettingItem[] = [
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
  ];

  const supportSettings: SettingItem[] = [
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
  ];

  const legalSettings: SettingItem[] = [
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
  ];

  const dangerSettings: SettingItem[] = [
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
  ];

  const handleToggle = async (
    category: 'notifications' | 'preferences',
    id: string,
    value: boolean,
  ) => {
    try {
      if (category === 'notifications') {
        const updatedNotifications = { ...notifications, [id]: value };
        setNotifications(updatedNotifications);
        // Update API - send full User["preferences"] structure
        await matchesAPI.updateUserSettings({
          maxDistance: preferences.maxDistance,
          ageRange: preferences.ageRange,
          species: preferences.species,
          intents: preferences.intents,
          notifications: updatedNotifications,
        });
      } else {
        // Preferences are already in the right structure
        const updatedPreferences = { ...preferences, [id]: value };
        setPreferences(updatedPreferences);
      }
    } catch (error) {
      logger.error('Failed to update settings:', { error });
      Alert.alert(t('settings.error'), t('settings.failed_update'));
    }
  };

  const handleNavigation = (id: string) => {
    haptic.tap();
    switch (id) {
      case 'demo-showcase':
        navigation.navigate('DemoShowcase');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'ui-demo':
        navigation.navigate('UIDemo');
        break;
      case 'motion-lab':
        navigation.navigate('MotionLab');
        break;
      case 'privacy':
        navigation.navigate('PrivacySettings');
        break;
      case 'subscription':
        navigation.navigate('ManageSubscription');
        break;
      case 'help':
        navigation.navigate('HelpSupport');
        break;
      case 'feedback':
        // Feedback can be handled via HelpSupport or email
        navigation.navigate('HelpSupport');
        break;
      case 'about':
        navigation.navigate('AboutTermsPrivacy');
        break;
      default:
        Alert.alert('Navigation', `Navigate to ${id}`);
    }
  };

  const handleAction = async (id: string) => {
    if (id === 'delete') {
      haptic.error();
    } else {
      haptic.confirm();
    }

    switch (id) {
      case 'export-data':
        await handleExportData();
        break;
      case 'logout':
        handleLogout();
        break;
      case 'delete':
        handleDeleteAccount();
        break;
      case 'privacy-policy':
        await Linking.openURL('https://pawfectmatch.com/privacy');
        break;
      case 'terms-of-service':
        await Linking.openURL('https://pawfectmatch.com/terms');
        break;
      default:
        logger.info(`Unknown action: ${id}`);
    }
  };

  const renderSettingItem = (item: SettingItem, category?: 'notifications' | 'preferences') => (
    <TouchableOpacity
      key={item.id}
      style={StyleSheet.flatten([
        styles.settingItem,
        item.destructive && styles.settingItemDestructive,
      ])}
      testID={`setting-item-${item.id}`}
      accessibilityLabel={`${item.title}${item.subtitle ? `: ${item.subtitle}` : ''}`}
      accessibilityRole={item.type === 'toggle' ? 'text' : 'button'}
      disabled={item.type === 'toggle'}
      onPress={() => {
        if (item.type === 'navigation') {
          handleNavigation(item.id);
        } else if (item.type === 'action') {
          handleAction(item.id);
        }
      }}
    >
      <View style={styles.settingLeft}>
        <View
          style={StyleSheet.flatten([
            styles.settingIcon,
            item.destructive && styles.settingIconDestructive,
          ])}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.destructive ? theme.colors.danger : theme.colors.onMuted}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={StyleSheet.flatten([
              styles.settingTitle,
              item.destructive && styles.settingTitleDestructive,
            ])}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={StyleSheet.flatten([
                styles.settingSubtitle,
                item.destructive && styles.settingSubtitleDestructive,
              ])}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.settingRight}>
        {item.type === 'toggle' && (
          <SwitchFlick
            value={item.value || false}
            onValueChange={(value) => category && handleToggle(category, item.id, value)}
            testID={`setting-switch-${item.id}`}
          />
        )}
        {item.type === 'navigation' && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.onMuted}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (
    title: string,
    items: SettingItem[],
    category?: 'notifications' | 'preferences',
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item) => renderSettingItem(item, category))}
      </View>
    </View>
  );

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('settings.title'),
            rightButtons: [
              {
                type: 'search',
                onPress: async () => {
                  haptic.tap();
                  logger.info('Search settings');
                },
                variant: 'minimal',
                haptic: 'light',
              },
            ],
            apiActions: {
              search: async () => {
                logger.info('Search settings API action');
              },
            },
          })}
        />
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="settings-scroll-view"
        accessibilityLabel="Settings options"
        accessibilityRole="scrollbar"
      >
        {/* Profile Summary */}
        {reducedMotion ? (
          <ProfileSummarySection
            onEditProfile={() => {
              handleNavigation('profile');
            }}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(220)}>
            <ProfileSummarySection
              onEditProfile={() => {
                handleNavigation('profile');
              }}
            />
          </Animated.View>
        )}

        {/* Settings Sections */}
        {reducedMotion ? (
          <NotificationSettingsSection
            settings={notificationSettings}
            onToggle={(id, value) => handleToggle('notifications', id, value)}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(240).delay(50)}>
            <NotificationSettingsSection
              settings={notificationSettings}
              onToggle={(id, value) => handleToggle('notifications', id, value)}
            />
          </Animated.View>
        )}

        {reducedMotion ? (
          <SettingSection
            title="Preferences"
            items={preferenceSettings}
            category="preferences"
            onToggle={(id, value) => handleToggle('preferences', id, value)}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(260).delay(100)}>
            <SettingSection
              title="Preferences"
              items={preferenceSettings}
              category="preferences"
              onToggle={(id, value) => handleToggle('preferences', id, value)}
            />
          </Animated.View>
        )}

        {reducedMotion ? (
          <LanguageSection />
        ) : (
          <Animated.View entering={FadeInDown.duration(280).delay(150)}>
            <LanguageSection />
          </Animated.View>
        )}

        {reducedMotion ? (
          <AccountSettingsSection
            settings={accountSettings}
            onNavigate={handleNavigation}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(290).delay(175)}>
            <AccountSettingsSection
              settings={accountSettings}
              onNavigate={handleNavigation}
            />
          </Animated.View>
        )}

        {reducedMotion ? (
          <SettingSection
            title="Support"
            items={supportSettings}
            onItemPress={handleNavigation}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(310).delay(225)}>
            <SettingSection
              title="Support"
              items={supportSettings}
              onItemPress={handleNavigation}
            />
          </Animated.View>
        )}

        {reducedMotion ? (
          <SettingSection
            title="Legal"
            items={legalSettings}
            onItemPress={handleAction}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(330).delay(250)}>
            <SettingSection
              title="Legal"
              items={legalSettings}
              onItemPress={handleAction}
            />
          </Animated.View>
        )}

        {reducedMotion ? (
          <DangerZoneSection
            settings={dangerSettings}
            onAction={handleAction}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(320).delay(275)}>
            <DangerZoneSection
              settings={dangerSettings}
              onAction={handleAction}
            />
          </Animated.View>
        )}

        {/* App Version */}
        {reducedMotion ? (
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>PawfectMatch v1.0.0</Text>
            <Text style={styles.versionSubtitle}>Built with ❤️ for pet lovers</Text>
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(340).delay(300)}>
            <View style={styles.versionSection}>
              <Text style={styles.versionText}>PawfectMatch v1.0.0</Text>
              <Text style={styles.versionSubtitle}>Built with ❤️ for pet lovers</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}
