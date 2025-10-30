import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@mobile/src/theme';
import { AdvancedCard, CardConfigs } from '../Advanced/AdvancedCard';

interface MatchesTabsProps {
  selectedTab: 'matches' | 'likedYou';
  onTabChange: (tab: 'matches' | 'likedYou') => void;
}

export function MatchesTabs({ selectedTab, onTabChange }: MatchesTabsProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <AdvancedCard
      {...CardConfigs.minimal({
        interactions: ['hover', 'press'],
        haptic: 'light',
      })}
      style={styles.tabContainer}
    >
      <View style={styles.tabContent}>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.tab, selectedTab === 'matches' && styles.activeTab])}
          onPress={() => {
            onTabChange('matches');
          }}
          accessibilityLabel="View matches"
          accessibilityState={{ selected: selectedTab === 'matches' }}
        >
          <Text
            style={StyleSheet.flatten([
              styles.tabText,
              selectedTab === 'matches' && styles.activeTabText,
            ])}
          >
            Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.tab, selectedTab === 'likedYou' && styles.activeTab])}
          onPress={() => {
            onTabChange('likedYou');
          }}
          accessibilityLabel="View liked you"
          accessibilityState={{ selected: selectedTab === 'likedYou' }}
        >
          <Text
            style={StyleSheet.flatten([
              styles.tabText,
              selectedTab === 'likedYou' && styles.activeTabText,
            ])}
          >
            Liked You
          </Text>
        </TouchableOpacity>
      </View>
    </AdvancedCard>
  );
}
