import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../../../theme/Provider";
import HapticSwitch from "../../../components/micro/HapticSwitch";

interface SettingsSectionProps {
  title: string;
  settings: Record<string, boolean>;
  onSettingToggle: (key: string) => () => void;
}

const SettingsSection = React.memo<SettingsSectionProps>(({
  title,
  settings,
  onSettingToggle
}) => {
  const theme = useTheme();
  
  const styles = useMemo(() => StyleSheet.create({
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 12,
      paddingLeft: 4,
    },
    settingsCard: {
      borderRadius: 12,
      overflow: "hidden",
      padding: 16,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
  }), [theme]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <BlurView intensity={20} style={styles.settingsCard}>
        {Object.entries(settings).map(([key, value]) => (
          <View key={key} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                {key.charAt(0).toUpperCase() + key.slice(1)} {title.toLowerCase()}
              </Text>
              <Text style={styles.settingDescription}>
                {title === 'Notifications'
                  ? `Receive ${key} notifications`
                  : (value ? "Visible to others" : "Hidden from others")
                }
              </Text>
            </View>
            <HapticSwitch
              value={value}
              onValueChange={onSettingToggle(key)}
            />
          </View>
        ))}
      </BlurView>
    </View>
  );
});

interface ProfileSettingsSectionProps {
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
  onNotificationToggle: (key: string) => () => void;
  onPrivacyToggle: (key: string) => () => void;
}

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = React.memo(({
  notifications,
  privacy,
  onNotificationToggle,
  onPrivacyToggle
}) => {
  const theme = useTheme();
  
  const formatPrivacyKey = useCallback((key: string) => {
    return key.replace(/([A-Z])/g, " $1").toLowerCase();
  }, []);

  const getPrivacyDescription = useCallback((key: string, value: boolean) => {
    return value ? "Visible to others" : "Hidden from others";
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 12,
      paddingLeft: 4,
    },
    settingsCard: {
      borderRadius: 12,
      overflow: "hidden",
      padding: 16,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
  }), [theme]);

  return (
    <View>
      {/* Notifications */}
      <SettingsSection
        title="Notifications"
        settings={notifications}
        onSettingToggle={onNotificationToggle}
      />

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <BlurView intensity={20} style={styles.settingsCard}>
          {Object.entries(privacy).map(([key, value]) => (
            <View key={key} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Show {formatPrivacyKey(key)}
                </Text>
                <Text style={styles.settingDescription}>
                  {getPrivacyDescription(key, value)}
                </Text>
              </View>
              <HapticSwitch
                value={value}
                onValueChange={onPrivacyToggle(key)}
              />
            </View>
          ))}
        </BlurView>
      </View>
    </View>
  );
});

SettingsSection.displayName = 'SettingsSection';
ProfileSettingsSection.displayName = 'ProfileSettingsSection';
