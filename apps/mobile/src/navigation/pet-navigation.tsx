/**
 * Enhanced Navigation with Pet-First Features
 * NOTE: This file contains template/example navigation structure.
 * Screen components should be implemented separately.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';

export type RootStackParamList = {
  // Existing screens...
  Home: undefined;
  Profile: undefined;
  Settings: undefined;

  // New Pet-First screens
  EnhancedPetProfile: {
    petId?: string;
    isNew?: boolean;
  };
  PlaydateDiscovery: {
    petId: string;
  };
  PackBuilder: {
    hostPetId: string;
  };
  HealthPassport: {
    petId: string;
  };
  LostPetAlert: {
    petId: string;
  };
  PetFriendlyMap: {
    filter?: 'parks' | 'vets' | 'groomers' | 'all';
  };
  MeetupDetails: {
    meetupId: string;
  };
  VenueDetails: {
    venueId: string;
  };

  // Enhanced existing screens
  MyPets: {
    showEnhanced?: boolean; // Toggle between basic and enhanced view
  };
  Matches: {
    filter?: 'playdates' | 'sitters' | 'all';
  };
};

// Screen component imports
import PlaydateDiscoveryScreen from '../screens/PlaydateDiscoveryScreen';
import LostPetAlertScreen from '../screens/LostPetAlertScreen';
// Stub screens (to be implemented)
const EnhancedMyPetsScreen = () => <Text>EnhancedMyPetsScreen - To be implemented</Text>;
const EnhancedPetProfileScreen = () => <Text>EnhancedPetProfileScreen - To be implemented</Text>;
const PackBuilderScreen = () => <Text>PackBuilderScreen - To be implemented</Text>;
const HealthPassportScreen = () => <Text>HealthPassportScreen - To be implemented</Text>;
const PetFriendlyMapScreen = () => <Text>PetFriendlyMapScreen - To be implemented</Text>;
const MeetupDetailsScreen = () => <Text>MeetupDetailsScreen - To be implemented</Text>;
const VenueDetailsScreen = () => <Text>VenueDetailsScreen - To be implemented</Text>;
const HomeNavigator = () => <Text>HomeNavigator - To be implemented</Text>;
const MatchesNavigator = () => <Text>MatchesNavigator - To be implemented</Text>;
const PlacesNavigator = () => <Text>PlacesNavigator - To be implemented</Text>;
const ProfileNavigator = () => <Text>ProfileNavigator - To be implemented</Text>;

const PetStack = createNativeStackNavigator<RootStackParamList>();

export const PetNavigator = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <PetStack.Navigator>
      {/* Enhanced My Pets - Multi-pet management */}
      <PetStack.Screen
        name="MyPets"
        component={EnhancedMyPetsScreen}
        options={{
          title: 'My Pawfiles',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('EnhancedPetProfile', { isNew: true })}>
              <Ionicons name="add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Pet Profile Management */}
      <PetStack.Screen
        name="EnhancedPetProfile"
        component={EnhancedPetProfileScreen}
        options={({ route }) => ({
          title: route.params?.isNew ? 'Create Pawfile' : 'Pet Profile',
        })}
      />

      {/* Playdate Features */}
      <PetStack.Screen
        name="PlaydateDiscovery"
        component={PlaydateDiscoveryScreen}
        options={{ title: 'Find Playmates' }}
      />

      <PetStack.Screen
        name="PackBuilder"
        component={PackBuilderScreen}
        options={{ title: 'Build a Pack' }}
      />

      {/* Health & Safety */}
      <PetStack.Screen
        name="HealthPassport"
        component={HealthPassportScreen}
        options={{ title: 'Health Passport' }}
      />

      <PetStack.Screen
        name="LostPetAlert"
        component={LostPetAlertScreen}
        options={{ title: 'Lost Pet Alert' }}
      />

      {/* Local Features */}
      <PetStack.Screen
        name="PetFriendlyMap"
        component={PetFriendlyMapScreen}
        options={{ title: 'Pet Places' }}
      />

      <PetStack.Screen
        name="MeetupDetails"
        component={MeetupDetailsScreen}
        options={{ title: 'Meetup' }}
      />

      <PetStack.Screen
        name="VenueDetails"
        component={VenueDetailsScreen}
        options={{ title: 'Venue Details' }}
      />
    </PetStack.Navigator>
  );
};

// Enhanced Tab Navigation with Pet-First tabs
// Update your main tab navigator:

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Pawfiles') {
            iconName = focused ? 'paw' : 'paw-outline'; // Pet-first icon
          } else if (route.name === 'Places') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          // Pet-first language
          const labels: Record<string, string> = {
            Home: 'Home',
            Matches: 'Playmates', // Changed from "Matches"
            Pawfiles: 'Pawfiles', // Changed from "Pets"
            Places: 'Places',
            Profile: 'Profile',
          };

          return (
            <Text style={{
              color,
              fontSize: 12,
              fontWeight: focused ? '600' : '400'
            }}>
              {labels[route.name] || route.name}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Matches" component={MatchesNavigator} />
      <Tab.Screen name="Pawfiles" component={PetNavigator} />
      <Tab.Screen name="Places" component={PlacesNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};
