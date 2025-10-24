import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

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

function NotificationPreferencesScreen({ navigation }: NotificationPreferencesScreenProps): JSX.Element {
  const { colors: _colors } = useTheme();
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

  const toggleSetting = useCallback((settingId: string) => {
    Haptics.selectionAsync().catch(() => { });
    setSettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  }, []);

  const toggleCategory = useCallback((category: string) => {
    Haptics.selectionAsync().catch(() => { });
    setSettings(prev =>
      prev.map(setting =>
        setting.category === category
          ? { ...setting, enabled: !prev.find(s => s.category === category)?.enabled }
          : setting
      )
    );
  }, []);

  const saveSettings = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    // In a real app, this would save to backend
    Alert.alert('Success', 'Notification preferences saved successfully!');
  }, []);

  const getCategorySettings = useCallback((category: string) => {
    return settings.filter(setting => setting.category === category);
  }, [settings]);

  const isCategoryEnabled = useCallback((category: string) => {
    return getCategorySettings(category).some(setting => setting.enabled);
  }, [getCategorySettings]);

  const renderCategory = useCallback((category: string, title: string) => {
    const categorySettings = getCategorySettings(category);
    const categoryEnabled = isCategoryEnabled(category);

    return (
      <View key={category} style={styles.categorySection}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => { toggleCategory(category); }}
        >
          <Text style={styles.categoryTitle}>{title}</Text>
          <Switch
            value={categoryEnabled}
            onValueChange={() => { toggleCategory(category); }}
            trackColor={{ false: '#767577', true: '#3B82F6' }}
            thumbColor={categoryEnabled ? '#FFFFFF' : '#f4f3f4'}
          />
        </TouchableOpacity>

        {categorySettings.map((setting) => (
          <BlurView key={setting.id} intensity={15} style={styles.settingCard}>
            <View style={styles.settingContent}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => { toggleSetting(setting.id); }}
                trackColor={{ false: '#767577', true: '#3B82F6' }}
                thumbColor={setting.enabled ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
          </BlurView>
        ))}
      </View>
    );
  }, [getCategorySettings, isCategoryEnabled, toggleCategory, toggleSetting]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#667eea']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveSettings}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <BlurView intensity={10} style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
            <Text style={styles.infoText}>
              Choose which notifications you'd like to receive. You can always change these settings later.
            </Text>
          </BlurView>

          {renderCategory('matches', 'Matches & Likes')}
          {renderCategory('messages', 'Messages')}
          {renderCategory('general', 'General')}
          {renderCategory('marketing', 'Marketing')}

          {/* Push Notification Settings */}
          <Text style={styles.sectionTitle}>Push Notification Settings</Text>

          <BlurView intensity={15} style={styles.pushSettingsCard}>
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
                  Alert.alert('Push Notifications', 'Push notification settings would be managed by device settings.');
                }}
                trackColor={{ false: '#767577', true: '#10B981' }}
                thumbColor={'#FFFFFF'}
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
                value={false}
                onValueChange={() => {
                  Alert.alert('Quiet Hours', 'Quiet hours feature coming soon!');
                }}
                trackColor={{ false: '#767577', true: '#8B5CF6' }}
                thumbColor={'#f4f3f4'}
              />
            </View>
          </BlurView>

          {/* Test Notification */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              Haptics.selectionAsync().catch(() => { });
              Alert.alert('Test Notification', 'A test notification would be sent to your device.');
            }}
          >
            <BlurView intensity={20} style={styles.testButtonBlur}>
              <Ionicons name="notifications-outline" size={20} color="white" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

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
    color: 'white',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  saveButtonText: {
    color: 'white',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: 'white',
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
    color: 'white',
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
    color: 'white',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pushSettingText: {
    flex: 1,
  },
  pushSettingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  pushSettingDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationPreferencesScreen;
