/**
 * LiquidTabsDemo – demo for liquid tab indicator
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { LiquidTabs } from '@/patterns/tabs/LiquidTabs';

export default function LiquidTabsDemo() {
  const [index, setIndex] = useState(0);
  const tabs = [
    { key: 'home', title: 'Home', onPress: () => setIndex(0) },
    { key: 'swipe', title: 'Swipe', onPress: () => setIndex(1) },
    { key: 'matches', title: 'Matches', onPress: () => setIndex(2) },
    { key: 'map', title: 'Map', onPress: () => setIndex(3) },
    { key: 'profile', title: 'Profile', onPress: () => setIndex(4) },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <LiquidTabs tabs={tabs} index={index} />
    </View>
  );
}

