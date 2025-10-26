/**
 * 🔔 NOTIFICATION SETTINGS SECTION
 * Extracted from SettingsScreen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  destructive?: boolean;
}

interface NotificationSettingsSectionProps {
  settings: SettingItem[];
  onToggle: (id: string, value: boolean) => void;
}

export function NotificationSettingsSection({
  settings,
  onToggle,
}: NotificationSettingsSectionProps) {
  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, item.destructive && styles.settingItemDestructive]}
      onPress={() => {
        if (item.type === 'toggle') {
          onToggle(item.id, !item.value);
        }
      }}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIcon,
            item.destructive && styles.settingIconDestructive,
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.destructive ? '#EF4444' : '#6B7280'}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              item.destructive && styles.settingTitleDestructive,
            ]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                item.destructive && styles.settingSubtitleDestructive,
              ]}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.settingRight}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={(value) => onToggle(item.id, value)}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor={item.value ? '#FFFFFF' : '#F3F4F6'}
          />
        )}
        {item.type === 'navigation' && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.sectionContent}>
        {settings.map(renderSettingItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
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
    borderBottomColor: '#F3F4F6',
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
    backgroundColor: '#F3F4F6',
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
    color: '#111827',
    marginBottom: 2,
  },
  settingTitleDestructive: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingSubtitleDestructive: {
    color: '#FCA5A5',
  },
  settingRight: {
    marginLeft: 12,
  },
});

