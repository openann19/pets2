/**
 * Bottom Tab Navigator for Mobile App
 * Uses UltraTabBar with glass blur, spotlight press ripple, breathing active underline,
 * springy badge physics, and buttery icon micro-motions
 */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import SwipeScreen from "../screens/SwipeScreen";
import MatchesScreen from "../screens/MatchesScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";

import UltraTabBar from "./UltraTabBar";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

// Wrapper components to fix type compatibility
const HomeWrapper = (_props: BottomTabScreenProps<TabParamList, "Home">) => <HomeScreen />;
const SwipeWrapper = (props: BottomTabScreenProps<TabParamList, "Swipe">) => <SwipeScreen navigation={props.navigation as any} route={props.route as any} />;
const MatchesWrapper = (props: BottomTabScreenProps<TabParamList, "Matches">) => <MatchesScreen navigation={props.navigation as any} />;
const MapWrapper = (props: BottomTabScreenProps<TabParamList, "Map">) => <MapScreen navigation={props.navigation as any} route={props.route as any} />;
const ProfileWrapper = (props: BottomTabScreenProps<TabParamList, "Profile">) => <ProfileScreen navigation={props.navigation as any} route={props.route as any} />;

export default function BottomTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={(props) => <UltraTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeWrapper} />
      <Tab.Screen name="Swipe" component={SwipeWrapper} />
      <Tab.Screen name="Matches" component={MatchesWrapper} />
      <Tab.Screen name="Map" component={MapWrapper} />
      <Tab.Screen name="Profile" component={ProfileWrapper} />
    </Tab.Navigator>
  );
}

