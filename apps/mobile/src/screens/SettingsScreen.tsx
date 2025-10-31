import { logger } from '@pawfectmatch/core';
import { ScrollView, StyleSheet, Linking } from 'react-native';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { haptic } from '../ui/haptics';
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
import { useSettingsData } from './settings/useSettingsData';
import { SettingSection } from '../components/settings/SettingSection';
import { SettingsList } from '../components/settings/SettingsList';
import { VersionFooter } from '../components/settings/VersionFooter';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

type SettingsScreenProps = RootStackScreenProps<'Settings'>;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
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

  const {
    notificationSettings,
    preferenceSettings,
    accountSettings,
    supportSettings,
    legalSettings,
    dangerSettings,
  } = useSettingsData({ notifications, deletionStatus });

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
  });

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
      case 'referral':
        navigation.navigate('Referral');
        break;
      case 'iap-shop':
        navigation.navigate('IAPShop');
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
        <SettingsList delay={0} duration={220}>
          <ProfileSummarySection
            onEditProfile={() => handleNavigation('profile')}
          />
        </SettingsList>

        {/* Settings Sections */}
        <SettingsList delay={50} duration={240}>
          <NotificationSettingsSection
            settings={notificationSettings}
            onToggle={(id, value) => handleToggle('notifications', id, value)}
          />
        </SettingsList>

        <SettingsList delay={100} duration={260}>
          <SettingSection
            title="Preferences"
            items={preferenceSettings}
            category="preferences"
            onToggle={(id, value) => handleToggle('preferences', id, value)}
          />
        </SettingsList>

        <SettingsList delay={150} duration={280}>
          <LanguageSection />
        </SettingsList>

        <SettingsList delay={175} duration={290}>
          <AccountSettingsSection
            settings={accountSettings}
            onNavigate={handleNavigation}
          />
        </SettingsList>

        <SettingsList delay={225} duration={310}>
          <SettingSection
            title="Support"
            items={supportSettings}
            onItemPress={handleNavigation}
          />
        </SettingsList>

        <SettingsList delay={250} duration={330}>
          <SettingSection
            title="Legal"
            items={legalSettings}
            onItemPress={handleAction}
          />
        </SettingsList>

        <SettingsList delay={275} duration={320}>
          <DangerZoneSection settings={dangerSettings} onAction={handleAction} />
        </SettingsList>

        {/* App Version */}
        <SettingsList delay={300} duration={340}>
          <VersionFooter />
        </SettingsList>
      </ScrollView>
    </ScreenShell>
  );
}
