/**
 * ⚠️ DANGER ZONE SECTION
 * Handles destructive account actions
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { SettingItem } from './useSettingsData';

interface DangerZoneSectionProps {
  settings: SettingItem[];
  onAction: (id: string) => void;
}

export function DangerZoneSection({ settings, onAction }: DangerZoneSectionProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      shadowColor: theme.colors.bg,
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
      borderBottomColor: '#FEF2F2',
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
      backgroundColor: '#FEF2F2',
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
      color: theme.colors.onMuted,
    },
    settingSubtitleDestructive: {
      color: '#FCA5A5',
    },
    settingRight: {
      marginLeft: 12,
    },
  });

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={StyleSheet.flatten([styles.settingItem, styles.settingItemDestructive])}
      testID="DangerZoneSection-button-2"
      accessibilityLabel="Interactive element"
      accessibilityRole="button"
      onPress={() => {
        if (item.type === 'action') {
          onAction(item.id);
        }
      }}
    >
      <View style={styles.settingLeft}>
        <View style={StyleSheet.flatten([styles.settingIcon, styles.settingIconDestructive])}>
          <Ionicons
            name={item.icon}
            size={20}
            color={theme.colors.danger}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={StyleSheet.flatten([styles.settingTitle, styles.settingTitleDestructive])}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={StyleSheet.flatten([
                styles.settingSubtitle,
                styles.settingSubtitleDestructive,
              ])}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
      <View style={styles.sectionContent}>{settings.map(renderSettingItem)}</View>
    </View>
  );
}
