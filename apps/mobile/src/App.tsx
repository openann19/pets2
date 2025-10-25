import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { queryClient } from "./config/queryClient";
import { ThemeProvider } from "./theme/ThemeProvider";
import AdoptionManagerScreen from "./screens/adoption/AdoptionManagerScreen";
import CreatePetScreen from "./screens/CreatePetScreen";
import HomeScreen from "./screens/HomeScreen";
import MatchesScreen from "./screens/MatchesScreen";
import MyPetsScreen from "./screens/MyPetsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SwipeScreen from "./screens/SwipeScreen";
import type { RootStackParamList } from "./navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabsScreen = (): React.ReactElement => <HomeScreen />;

const AppNavigator = (): React.ReactElement => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Swipe" component={SwipeScreen} />
    <Stack.Screen name="Matches" component={MatchesScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="MyPets" component={MyPetsScreen} />
    <Stack.Screen name="CreatePet" component={CreatePetScreen} />
    <Stack.Screen
      name="AdoptionManager"
      component={AdoptionManagerScreen}
    />
    <Stack.Screen name="MainTabs" component={MainTabsScreen} />
  </Stack.Navigator>
);

export default function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
