import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdvancedCard, CardConfigs } from '../Advanced/AdvancedCard';
import { TabChangeIndicator } from '../micro/TabChange';

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
          <TabChangeIndicator
            isActive={selectedTab === 'matches'}
            underlineColor={theme.colors.primary}
          >
            <Text
              style={StyleSheet.flatten([
                styles.tabText,
                selectedTab === 'matches' && styles.activeTabText,
              ])}
            >
              Matches
            </Text>
          </TabChangeIndicator>
        </TouchableOpacity>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.tab, selectedTab === 'likedYou' && styles.activeTab])}
          onPress={() => {
            onTabChange('likedYou');
          }}
          accessibilityLabel="View liked you"
          accessibilityState={{ selected: selectedTab === 'likedYou' }}
        >
          <TabChangeIndicator
            isActive={selectedTab === 'likedYou'}
            underlineColor={theme.colors.primary}
          >
            <Text
              style={StyleSheet.flatten([
                styles.tabText,
                selectedTab === 'likedYou' && styles.activeTabText,
              ])}
            >
              Liked You
            </Text>
          </TabChangeIndicator>
        </TouchableOpacity>
      </View>
    </AdvancedCard>
  );
}
