import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { logger } from '../../services/logger';

// Mock the API service
jest.mock('../../services/api', () => ({
  matchesAPI: {
    getMyPets: jest.fn(() => Promise.resolve({ data: [] })),
    deletePet: jest.fn(() => Promise.resolve()),
  },
}));

// Mock Alert
jest.spyOn(require('react-native').Alert, 'alert');

const Stack = createNativeStackNavigator();

describe('MyPetsScreen Debug', () => {
  it('should render without crashing', () => {
    const MyPetsScreen = require('../MyPetsScreen').default;

    expect(() => {
      render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="MyPets"
              component={MyPetsScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>,
      );
    }).not.toThrow();
  });

  it('should render with mock data', async () => {
    const { matchesAPI } = require('../../services/api');
    matchesAPI.getMyPets.mockResolvedValue({
      data: [
        {
          _id: '1',
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'male',
          size: 'large',
          photos: [{ url: 'https://via.placeholder.com/200', isPrimary: true }],
          intent: 'playdate',
          analytics: { views: 45, likes: 12, matches: 3, messages: 0 },
          isActive: true,
          isVerified: true,
          status: 'active',
          listedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          owner: 'owner1',
          personalityTags: [],
          availability: { isAvailable: true },
          healthInfo: {
            vaccinated: true,
            spayedNeutered: true,
            microchipped: true,
          },
          location: {
            type: 'Point',
            coordinates: [0, 0],
          },
          featured: {
            isFeatured: false,
            boostCount: 0,
          },
        },
      ],
    });

    const MyPetsScreen = require('../MyPetsScreen').default;

    try {
      const { getByText, debug } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="MyPets"
              component={MyPetsScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>,
      );

      // Wait for the component to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Debug: Log what's actually rendered
      debug();

      // Check if the header text is rendered
      expect(getByText('My Pets')).toBeTruthy();
    } catch (error) {
      logger.error('Error rendering component:', { error });
      throw error;
    }
  });
});
