/**
 * Photo Editor Tabs Component
 * Tab navigation for photo editor modes
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { BouncePressable } from '../../micro';
import type { PhotoEditorTab } from '../hooks/usePhotoEditorState';

interface PhotoEditorTabsProps {
  activeTab: PhotoEditorTab;
  onTabChange: (tab: PhotoEditorTab) => void;
}

export const PhotoEditorTabs: React.FC<PhotoEditorTabsProps> = ({ activeTab, onTabChange }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        tabBar: {
          flexDirection: 'row' as const,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        tab: {
          flex: 1,
          paddingVertical: theme.spacing.md,
          alignItems: 'center' as const,
        },
        activeTab: {
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.primary,
        },
        tabText: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        activeTabText: {
          color: theme.colors.primary,
          fontWeight: '600' as const,
        },
      }),
    [theme],
  );

  const tabs: Array<{ key: PhotoEditorTab; icon: string; label: string }> = [
    { key: 'adjust', icon: 'options', label: 'Adjust' },
    { key: 'filters', icon: 'sparkles', label: 'Filters' },
    { key: 'crop', icon: 'crop', label: 'Crop' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => (
        <Animated.View
          key={tab.key}
          entering={FadeInDown.delay(100 + 50 * index).springify()}
          exiting={FadeOutUp}
        >
          <BouncePressable
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => onTabChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={activeTab === tab.key ? theme.colors.primary : theme.colors.onMuted}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </BouncePressable>
        </Animated.View>
      ))}
    </View>
  );
};

