import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import { matchesAPI } from '../../services/api';
import type { Pet } from '../../types/api';
import MyPetsScreen from '../MyPetsScreen';

// Mock createStackNavigator
const createStackNavigator = jest.fn(() => ({
  Navigator: ({ children }: { children: React.ReactNode }) => children,
  Screen: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the API service
jest.mock('../../services/api', () => ({
  matchesAPI: {
    getMyPets: jest.fn(),
    deletePet: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const Stack = createStackNavigator();

const TestNavigator = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen 
        name="MyPets" 
        component={() => <>{children}</>}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreatePet" 
        component={() => <></>}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PetDetail" 
        component={() => <></>}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditPet" 
        component={() => <></>}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Mock navigation props
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(),
  reset: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
};

const mockRoute = {
  key: 'test-key',
  name: 'MyPets',
  params: undefined,
};

describe('MyPetsScreen', () => {
  const mockPets: Pet[] = [
    {
      _id: '1',
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'male',
      size: 'large',
      intent: 'playdate',
      photos: [{ url: 'https://example.com/buddy.jpg', isPrimary: true }],
      personalityTags: ['friendly', 'energetic'],
      healthInfo: {
        vaccinated: true,
        spayedNeutered: true,
        microchipped: true,
        specialNeeds: false,
      },
      location: {
        type: 'Point',
        coordinates: [0, 0],
        address: {
          city: 'New York',
          state: 'NY',
          country: 'US',
        },
      },
      analytics: {
        views: 45,
        likes: 12,
        matches: 3,
        messages: 1,
      },
      isActive: true,
      status: 'active',
      owner: {
        _id: 'owner1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      listedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      _id: '2',
      name: 'Luna',
      species: 'cat',
      breed: 'Siamese',
      age: 2,
      gender: 'female',
      size: 'small',
      intent: 'adoption',
      photos: [{ url: 'https://example.com/luna.jpg', isPrimary: true }],
      personalityTags: ['calm', 'gentle'],
      healthInfo: {
        vaccinated: true,
        spayedNeutered: true,
        microchipped: false,
        specialNeeds: false,
      },
      location: {
        type: 'Point',
        coordinates: [0, 0],
        address: {
          city: 'New York',
          state: 'NY',
          country: 'US',
        },
      },
      analytics: {
        views: 23,
        likes: 8,
        matches: 1,
        messages: 0,
      },
      isActive: true,
      status: 'active',
      owner: {
        _id: 'owner1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      listedAt: '2024-01-15T00:00:00.000Z',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (matchesAPI.getMyPets as jest.Mock).mockResolvedValue(mockPets);
    (matchesAPI.deletePet as jest.Mock).mockResolvedValue(true);
  });

  it('renders correctly with pets', async () => {
    const { getByText, getByTestId, debug } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    // Debug: Log what's actually rendered
    debug();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('My Pets')).toBeTruthy();
    });

    // Check if pets are rendered
    await waitFor(() => {
      expect(getByText('Buddy')).toBeTruthy();
      expect(getByText('Luna')).toBeTruthy();
    });
  });

  it('displays loading state initially', () => {
    const { getByText } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    expect(getByText('Loading pets...')).toBeTruthy();
  });

  it('shows empty state when no pets', async () => {
    (matchesAPI.getMyPets as jest.Mock).mockResolvedValue([]);

    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(getByText('No Pets Yet')).toBeTruthy();
      expect(getByText('Start building your pet\'s profile to find amazing matches and new friends!')).toBeTruthy();
    });
  });

  it('navigates to CreatePet when add button is pressed', async () => {
    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const addButton = getByTestId('add-button');
      fireEvent.press(addButton);
      expect(mockNavigate).toHaveBeenCalledWith('CreatePet');
    });
  });

  it('navigates to CreatePet when empty state button is pressed', async () => {
    (matchesAPI.getMyPets as jest.Mock).mockResolvedValue([]);

    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const createButton = getByText('Create Your First Pet Profile');
      fireEvent.press(createButton);
      expect(mockNavigate).toHaveBeenCalledWith('CreatePet');
    });
  });

  it('navigates to PetDetail when pet card is pressed', async () => {
    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const petCard = getByText('Buddy');
      fireEvent.press(petCard);
      expect(mockNavigate).toHaveBeenCalledWith('PetDetail', { petId: '1' });
    });
  });

  it('navigates to EditPet when edit button is pressed', async () => {
    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const editButton = getByTestId('edit-button-1');
      fireEvent.press(editButton);
      expect(mockNavigate).toHaveBeenCalledWith('EditPet', { petId: '1' });
    });
  });

  it('shows delete confirmation dialog when delete button is pressed', async () => {
    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const deleteButton = getByTestId('delete-button-1');
      fireEvent.press(deleteButton);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Pet Profile',
      'Are you sure you want to delete this pet profile? This action cannot be undone.',
      expect.any(Array)
    );
  });

  it('deletes pet when confirmation is accepted', async () => {
    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const deleteButton = getByTestId('delete-button-1');
      fireEvent.press(deleteButton);
    });

    // Simulate user confirming deletion
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmAction = alertCall[2][1]; // Get the confirm button action
    await act(async () => {
      confirmAction.onPress();
    });

    expect(matchesAPI.deletePet).toHaveBeenCalledWith('1');
  });

  it('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (matchesAPI.getMyPets as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Connection Error',
        'Network error',
        expect.any(Array)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('refreshes data when pull-to-refresh is triggered', async () => {
    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(matchesAPI.getMyPets).toHaveBeenCalledTimes(1);
    });

    // Trigger pull-to-refresh
    const flatList = getByTestId('pets-flatlist');
    fireEvent(flatList, 'onRefresh');

    await waitFor(() => {
      expect(matchesAPI.getMyPets).toHaveBeenCalledTimes(2);
    });
  });

  it('displays correct pet information', async () => {
    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      // Check pet names
      expect(getByText('Buddy')).toBeTruthy();
      expect(getByText('Luna')).toBeTruthy();

      // Check breeds
      expect(getByText('Golden Retriever')).toBeTruthy();
      expect(getByText('Siamese')).toBeTruthy();

      // Check ages and details
      expect(getByText('3 years • male • large')).toBeTruthy();
      expect(getByText('2 years • female • small')).toBeTruthy();
    });
  });

  it('displays correct species emojis', async () => {
    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      // Check for dog emoji (Buddy)
      expect(getByText('🐕')).toBeTruthy();
      // Check for cat emoji (Luna)
      expect(getByText('🐱')).toBeTruthy();
    });
  });

  it('displays intent badges correctly', async () => {
    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(getByText('Playdates')).toBeTruthy(); // Buddy's intent
      expect(getByText('For Adoption')).toBeTruthy(); // Luna's intent
    });
  });

  it('shows photo count badge when pet has multiple photos', async () => {
    const petWithMultiplePhotos = {
      ...mockPets[0],
      photos: [
        { url: 'https://example.com/buddy1.jpg', isPrimary: true },
        { url: 'https://example.com/buddy2.jpg', isPrimary: false },
        { url: 'https://example.com/buddy3.jpg', isPrimary: false },
      ],
    };

    (matchesAPI.getMyPets as jest.Mock).mockResolvedValue([petWithMultiplePhotos]);

    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(getByText('3')).toBeTruthy(); // Photo count
    });
  });

  it('displays placeholder when pet has no photos', async () => {
    const petWithoutPhotos = {
      ...mockPets[0],
      photos: [],
    };

    (matchesAPI.getMyPets as jest.Mock).mockResolvedValue([petWithoutPhotos]);

    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(getByText('🐕')).toBeTruthy(); // Species emoji as placeholder
    });
  });

  it('handles back button press', async () => {
    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('displays correct pet count in header', async () => {
    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(getByText('2 pets profiles')).toBeTruthy();
    });
  });

  it('displays singular form for single pet', async () => {
    (matchesAPI.getMyPets as jest.Mock).mockResolvedValue([mockPets[0]]);

    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      expect(getByText('1 pet profile')).toBeTruthy();
    });
  });

  it('handles delete error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (matchesAPI.deletePet as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const deleteButton = getByTestId('delete-button-1');
      fireEvent.press(deleteButton);
    });

    // Simulate user confirming deletion
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmAction = alertCall[2][1];
    await act(async () => {
      confirmAction.onPress();
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to delete pet profile. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('cancels delete when user cancels confirmation', async () => {
    const { getByTestId } = render(
      <TestNavigator>
        <MyPetsScreen navigation={mockNavigation as any} route={mockRoute as any} />
      </TestNavigator>
    );

    await waitFor(() => {
      const deleteButton = getByTestId('delete-button-1');
      fireEvent.press(deleteButton);
    });

    // Simulate user canceling deletion
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const cancelAction = alertCall[2][0]; // Get the cancel button action
    cancelAction.onPress();

    expect(matchesAPI.deletePet).not.toHaveBeenCalled();
  });
});
