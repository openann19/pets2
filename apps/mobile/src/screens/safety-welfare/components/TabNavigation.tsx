/**
 * Tab Navigation Component
 * Tab bar for switching between Rules, Incidents, and Disclosures
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';

export type SafetyTab = 'rules' | 'incidents' | 'disclosures';

interface TabNavigationProps {
  activeTab: SafetyTab;
  onTabChange: (tab: SafetyTab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        tabBar: {
          flexDirection: 'row' as const,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
        },
        tab: {
          flex: 1,
          alignItems: 'center' as const,
          paddingVertical: theme.spacing.sm,
        },
        tabText: {
          fontSize: 14,
          fontWeight: '500' as const,
        },
      }),
    [theme],
  );

  const tabs: SafetyTab[] = ['rules', 'incidents', 'disclosures'];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => onTabChange(tab)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab ? theme.colors.primary : theme.colors.onMuted,
              },
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

