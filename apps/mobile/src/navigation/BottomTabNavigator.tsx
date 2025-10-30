/**
 * Bottom Tab Navigator for Mobile App
 * Uses UltraTabBar with glass blur, spotlight press ripple, breathing active underline,
 * springy badge physics, and buttery icon micro-motions
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/core';
import type { StackNavigationProp } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import SwipeScreen from '../screens/SwipeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

import UltraTabBar from './UltraTabBar';
import type { TabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Wrapper components with type-safe navigation conversions
const HomeWrapper = (_props: BottomTabScreenProps<TabParamList, 'Home'>) => <HomeScreen />;

const SwipeWrapper = (props: BottomTabScreenProps<TabParamList, 'Swipe'>) => (
  <SwipeScreen
    navigation={props.navigation as unknown as StackNavigationProp<RootStackParamList, 'Swipe'>}
    route={props.route as unknown as RouteProp<RootStackParamList, 'Swipe'>}
  />
);

const MatchesWrapper = (props: BottomTabScreenProps<TabParamList, 'Matches'>) => (
  <MatchesScreen
    navigation={props.navigation as unknown as StackNavigationProp<RootStackParamList, 'Matches'>}
  />
);

const MapWrapper = (props: BottomTabScreenProps<TabParamList, 'Map'>) => (
  <MapScreen
    navigation={props.navigation as unknown as StackNavigationProp<RootStackParamList, 'Map'>}
    route={props.route as unknown as RouteProp<RootStackParamList, 'Map'>}
  />
);

const ProfileWrapper = (props: BottomTabScreenProps<TabParamList, 'Profile'>) => (
  <ProfileScreen
    navigation={props.navigation as unknown as StackNavigationProp<RootStackParamList, 'Profile'>}
    route={props.route as unknown as RouteProp<RootStackParamList, 'Profile'>}
  />
);

export default function BottomTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={(props) => <UltraTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeWrapper}
      />
      <Tab.Screen
        name="Swipe"
        component={SwipeWrapper}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesWrapper}
      />
      <Tab.Screen
        name="Map"
        component={MapWrapper}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileWrapper}
      />
    </Tab.Navigator>
  );
}
