import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AdvancedCard, CardConfigs } from '../Advanced/AdvancedCard';

interface MatchesTabsProps {
  selectedTab: 'matches' | 'likedYou';
  onTabChange: (tab: 'matches' | 'likedYou') => void;
}

export function MatchesTabs({ selectedTab, onTabChange }: MatchesTabsProps): React.JSX.Element {
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
          style={[
            styles.tab,
            selectedTab === 'matches' && styles.activeTab
          ]}
          onPress={() => { onTabChange('matches'); }}
          accessibilityLabel="View matches"
          accessibilityState={{ selected: selectedTab === 'matches' }}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'matches' && styles.activeTabText
          ]}>
            Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'likedYou' && styles.activeTab
          ]}
          onPress={() => { onTabChange('likedYou'); }}
          accessibilityLabel="View liked you"
          accessibilityState={{ selected: selectedTab === 'likedYou' }}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'likedYou' && styles.activeTabText
          ]}>
            Liked You
          </Text>
        </TouchableOpacity>
      </View>
    </AdvancedCard>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabContent: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#ec4899',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ec4899',
    fontWeight: 'bold',
  },
});
