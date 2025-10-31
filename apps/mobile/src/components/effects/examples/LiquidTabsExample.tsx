/**
 * 🎯 EXAMPLE USAGE - LiquidTabs Integration
 * 
 * Example of how to integrate LiquidTabs as custom tabBar
 */

import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LiquidTabs } from '@/components/effects/LiquidTabs';

const Tab = createBottomTabNavigator();

// Example tabs configuration
const tabs = [
  { key: 'home', title: 'Home', icon: '🏠' },
  { key: 'swipe', title: 'Swipe', icon: '❤️' },
  { key: 'matches', title: 'Matches', icon: '💬', badge: 3 },
  { key: 'map', title: 'Map', icon: '📍', badge: 1 },
  { key: 'profile', title: 'Profile', icon: '👤' },
];

export function ExampleTabNavigator() {
  const [_activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={(props) => (
          <LiquidTabs
            tabs={props.state.routes.map((route, i) => {
              const tabConfig = tabs.find(t => t.key === route.name.toLowerCase());
              return {
                key: route.key,
                title: route.name,
                ...(tabConfig?.icon ? { icon: tabConfig.icon } : {}),
                ...(tabConfig?.badge !== undefined ? { badge: tabConfig.badge } : {}),
                onPress: () => {
                  if (props.state.index !== i) {
                    props.navigation.navigate(route.name);
                  }
                },
              };
            })}
            index={props.state.index}
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        {tabs.map((tab, i) => (
          <Tab.Screen
            key={tab.key}
            name={tab.title}
            component={() => <View />} // Your screen component
            listeners={{
              tabPress: () => setActiveIndex(i),
            }}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});

