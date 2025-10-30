import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '@pawfectmatch/core';
import { notificationPreferencesAPI } from '../../services/api';

interface NotificationPreferencesScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'matches' | 'messages' | 'general' | 'marketing';
}

function NotificationPreferencesScreen({
  navigation,
}: NotificationPreferencesScreenProps): JSX.Element {
  const theme = useTheme();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new_matches',
      title: 'New Matches',
      description: 'Get notified when you have new matches',
      enabled: true,
      category: 'matches',
    },
    {
      id: 'messages',
      title: 'New Messages',
      description: 'Receive notifications for new messages',
      enabled: true,
      category: 'messages',
    },
    {
      id: 'likes',
      title: 'Profile Likes',
      description: 'Notifications when someone likes your profile',
      enabled: false,
      category: 'matches',
    },
    {
      id: 'super_likes',
      title: 'Super Likes',
      description: 'Special notifications for Super Likes',
      enabled: true,
      category: 'matches',
    },
    {
      id: 'premium_features',
      title: 'Premium Features',
      description: 'Updates about premium features and benefits',
      enabled: false,
      category: 'general',
    },
    {
      id: 'safety_alerts',
      title: 'Safety Alerts',
      description: 'Important safety and security notifications',
      enabled: true,
      category: 'general',
    },
    {
      id: 'marketing',
      title: 'Marketing & Updates',
      description: 'News, promotions, and app updates',
      enabled: false,
      category: 'marketing',
    },
    {
      id: 'events',
      title: 'Events & Activities',
      description: 'Notifications about events and group activities',
      enabled: true,
      category: 'general',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const prefs = await notificationPreferencesAPI.getPreferences();
        // Map backend preferences to local settings
        setSettings((prev) =>
          prev.map((setting) => {
            switch (setting.id) {
              case 'new_matches':
                return { ...setting, enabled: prefs.matches ?? setting.enabled };
              case 'messages':
                return { ...setting, enabled: prefs.messages ?? setting.enabled };
              case 'likes':
                return { ...setting, enabled: prefs.likes ?? setting.enabled };
              case 'super_likes':
                return { ...setting, enabled: prefs.matches ?? setting.enabled };
              case 'premium_features':
              case 'marketing':
                return { ...setting, enabled: prefs.enabled ?? setting.enabled };
              case 'safety_alerts':
              case 'events':
                return { ...setting, enabled: prefs.reminders ?? setting.enabled };
              default:
                return setting;
            }
          }),
        );
        
        // Load quiet hours settings
        if (prefs.quietHours) {
          setQuietHoursEnabled(prefs.quietHours.enabled ?? false);
          setQuietHoursStart(prefs.quietHours.start ?? '22:00');
          setQuietHoursEnd(prefs.quietHours.end ?? '08:00');
        }
      } catch (error) {
        logger.error('Failed to load notification preferences', { error });
        // Continue with default settings on error
      } finally {
        setIsLoading(false);
      }
    };

    void loadPreferences();
  }, []);

  const toggleSetting = useCallback((settingId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting,
      ),
    );
  }, []);

  const toggleCategory = useCallback((category: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSettings((prev) =>
      prev.map((setting) =>
        setting.category === category
          ? {
              ...setting,
              enabled: !prev.find((s) => s.category === category)?.enabled,
            }
          : setting,
      ),
    );
  }, []);

  const handleQuietHoursToggle = useCallback(async (enabled: boolean) => {
    setQuietHoursEnabled(enabled);
    Haptics.selectionAsync().catch(() => {});
    
    // Auto-save quiet hours when toggled
    try {
      const matchesEnabled = settings.find((s) => s.id === 'new_matches')?.enabled ?? true;
      const messagesEnabled = settings.find((s) => s.id === 'messages')?.enabled ?? true;
      const likesEnabled = settings.find((s) => s.id === 'likes')?.enabled ?? false;
      const remindersEnabled =
        settings.find((s) => s.id === 'safety_alerts')?.enabled ?? true;
      const enabled = matchesEnabled || messagesEnabled || likesEnabled || remindersEnabled;

      await notificationPreferencesAPI.updatePreferences({
        enabled,
        matches: matchesEnabled,
        messages: messagesEnabled,
        likes: likesEnabled,
        reminders: remindersEnabled,
        frequency: 'instant',
        sound: true,
        vibration: true,
        quietHours: {
          enabled,
          start: quietHoursStart,
          end: quietHoursEnd,
        },
      });
      
      logger.info('Quiet hours updated', { enabled, start: quietHoursStart, end: quietHoursEnd });
    } catch (error) {
      logger.error('Failed to update quiet hours', { error });
      // Revert on error
      setQuietHoursEnabled(!enabled);
      Alert.alert('Error', 'Failed to update quiet hours. Please try again.');
    }
  }, [settings, quietHoursStart, quietHoursEnd]);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      // Map local settings to backend format
      const matchesEnabled = settings.find((s) => s.id === 'new_matches')?.enabled ?? true;
      const messagesEnabled = settings.find((s) => s.id === 'messages')?.enabled ?? true;
      const likesEnabled = settings.find((s) => s.id === 'likes')?.enabled ?? false;
      const remindersEnabled =
        settings.find((s) => s.id === 'safety_alerts')?.enabled ?? true;
      const marketingEnabled = settings.find((s) => s.id === 'marketing')?.enabled ?? false;
      const enabled = matchesEnabled || messagesEnabled || likesEnabled || remindersEnabled;

      await notificationPreferencesAPI.updatePreferences({
        enabled,
        matches: matchesEnabled,
        messages: messagesEnabled,
        likes: likesEnabled,
        reminders: remindersEnabled,
        frequency: 'instant',
        sound: true,
        vibration: true,
        quietHours: {
          enabled: quietHoursEnabled,
          start: quietHoursStart,
          end: quietHoursEnd,
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Success', 'Notification preferences saved successfully!');
    } catch (error) {
      logger.error('Failed to save notification preferences', { error });
      Alert.alert('Error', 'Failed to save notification preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const getCategorySettings = useCallback(
    (category: string) => {
      return settings.filter((setting) => setting.category === category);
    },
    [settings],
  );

  const isCategoryEnabled = useCallback(
    (category: string) => {
      return getCategorySettings(category).some((setting) => setting.enabled);
    },
    [getCategorySettings],
  );

  const renderCategory = useCallback(
    (category: string, title: string) => {
      const categorySettings = getCategorySettings(category);
      const categoryEnabled = isCategoryEnabled(category);

      return (
        <View
          key={category}
          style={styles.categorySection}
        >
          <TouchableOpacity
            style={styles.categoryHeader}
            testID="NotificationPreferencesScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              toggleCategory(category);
            }}
          >
            <Text style={styles.categoryTitle}>{title}</Text>
            <Switch
              value={categoryEnabled}
              onValueChange={() => {
                toggleCategory(category);
              }}
              trackColor={{ false: theme.colors.inactive, true: theme.colors.primary }}
              thumbColor={categoryEnabled ? theme.colors.surface : theme.colors.overlay}
            />
          </TouchableOpacity>

          {categorySettings.map((setting) => (
            <BlurView
              key={setting.id}
              intensity={15}
              style={styles.settingCard}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => {
                    toggleSetting(setting.id);
                  }}
                  trackColor={{ false: theme.colors.inactive, true: theme.colors.primary }}
                  thumbColor={setting.enabled ? theme.colors.surface : theme.colors.overlay}
                />
              </View>
            </BlurView>
          ))}
        </View>
      );
    },
    [getCategorySettings, isCategoryEnabled, toggleCategory, toggleSetting],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.palette.gradients.primarySoft}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            testID="NotificationPreferencesScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              navigation.goBack();
            }}
          >
            <BlurView
              intensity={20}
              style={styles.backButtonBlur}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.onPrimary}
              />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.saveButton}
            testID="NotificationPreferencesScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={saveSettings}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <BlurView
            intensity={10}
            style={styles.infoCard}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.info}
            />
            <Text style={styles.infoText}>
              Choose which notifications you'd like to receive. You can always change these settings
              later.
            </Text>
          </BlurView>

          {renderCategory('matches', 'Matches & Likes')}
          {renderCategory('messages', 'Messages')}
          {renderCategory('general', 'General')}
          {renderCategory('marketing', 'Marketing')}

          {/* Push Notification Settings */}
          <Text style={styles.sectionTitle}>Push Notification Settings</Text>

          <BlurView
            intensity={15}
            style={styles.pushSettingsCard}
          >
            <View style={styles.pushSetting}>
              <View style={styles.pushSettingText}>
                <Text style={styles.pushSettingTitle}>Push Notifications</Text>
                <Text style={styles.pushSettingDescription}>
                  Allow the app to send push notifications
                </Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {
                  Alert.alert(
                    'Push Notifications',
                    'Push notification settings would be managed by device settings.',
                  );
                }}
                trackColor={{ false: theme.colors.inactive, true: theme.colors.success }}
                thumbColor={theme.colors.surface}
              />
            </View>

            <View style={styles.pushSetting}>
              <View style={styles.pushSettingText}>
                <Text style={styles.pushSettingTitle}>Quiet Hours</Text>
                <Text style={styles.pushSettingDescription}>
                  Pause notifications between 10 PM - 8 AM
                </Text>
              </View>
              <Switch
                value={quietHoursEnabled}
                onValueChange={handleQuietHoursToggle}
                trackColor={{ false: theme.colors.inactive, true: theme.colors.primary }}
                thumbColor={quietHoursEnabled ? theme.colors.surface : theme.colors.overlay}
              />
            </View>
          </BlurView>

          {/* Test Notification */}
          <TouchableOpacity
            style={styles.testButton}
            testID="NotificationPreferencesScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              Alert.alert('Test Notification', 'A test notification would be sent to your device.');
            }}
          >
            <BlurView
              intensity={20}
              style={styles.testButtonBlur}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.colors.onPrimary}
              />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary + '33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '80',
  },
  saveButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface + '1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border + '33',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: theme.colors.onPrimary,
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  settingCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.onMuted,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginBottom: 16,
    marginTop: 8,
  },
  pushSettingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  pushSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '1A',
  },
  pushSettingText: {
    flex: 1,
  },
  pushSettingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimary,
    marginBottom: 4,
  },
  pushSettingDescription: {
    fontSize: 14,
    color: theme.colors.onMuted,
    lineHeight: 20,
  },
  testButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  testButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  testButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationPreferencesScreen;
