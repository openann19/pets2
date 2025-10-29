import { useAuthStore } from '@pawfectmatch/core';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import { useCallManager } from '../../components/calling/CallManager';
import MatchesScreen from '../MatchesScreen';

// Mock dependencies
jest.mock('../../components/calling/CallManager');
jest.mock('@pawfectmatch/core');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

const mockUseCallManager = useCallManager as jest.MockedFunction<typeof useCallManager>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockMatches = [
  {
    _id: 'match-1',
    petId: 'pet-1',
    petName: 'Buddy',
    petPhoto: 'https://example.com/buddy.jpg',
    ownerName: 'John Doe',
    lastMessage: {
      content: 'Hello!',
      timestamp: new Date().toISOString(),
      senderId: 'other',
    },
    isOnline: true,
    matchedAt: new Date().toISOString(),
    unreadCount: 1,
  },
  {
    _id: 'match-2',
    petId: 'pet-2',
    petName: 'Luna',
    petPhoto: 'https://example.com/luna.jpg',
    ownerName: 'Jane Smith',
    lastMessage: {
      content: 'How are you?',
      timestamp: new Date().toISOString(),
      senderId: 'me',
    },
    isOnline: false,
    matchedAt: new Date().toISOString(),
    unreadCount: 0,
  },
];

describe('MatchesScreen - Calling Features', () => {
  const mockStartCall = jest.fn();
  const mockIsCallActive = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCallManager.mockReturnValue({
      startCall: mockStartCall,
      endCall: jest.fn(),
      isCallActive: mockIsCallActive,
      getCallState: jest.fn(),
    });

    mockUseAuthStore.mockReturnValue({
      user: {
        id: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
      },
    } as any);

    mockIsCallActive.mockReturnValue(false);
  });

  it('should render call buttons for each match', async () => {
    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      const videoButtons = getAllByTestId('video-call-button');

      expect(voiceButtons).toHaveLength(mockMatches.length);
      expect(videoButtons).toHaveLength(mockMatches.length);
    });
  });

  it('should start voice call when voice button is pressed', async () => {
    mockStartCall.mockResolvedValue(true);

    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      fireEvent.press(voiceButtons[0]);
    });

    // Should show confirmation alert
    expect(Alert.alert).toHaveBeenCalledWith(
      'Voice Call',
      'Start a voice call with Buddy?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Call' }),
      ]),
    );

    // Simulate user confirming the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Call');

    await confirmButton.onPress();

    expect(mockStartCall).toHaveBeenCalledWith('match-1', 'voice');
  });

  it('should start video call when video button is pressed', async () => {
    mockStartCall.mockResolvedValue(true);

    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const videoButtons = getAllByTestId('video-call-button');
      fireEvent.press(videoButtons[0]);
    });

    // Should show confirmation alert
    expect(Alert.alert).toHaveBeenCalledWith(
      'Video Call',
      'Start a video call with Buddy?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Call' }),
      ]),
    );

    // Simulate user confirming the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Call');

    await confirmButton.onPress();

    expect(mockStartCall).toHaveBeenCalledWith('match-1', 'video');
  });

  it('should prevent call button from triggering match navigation', async () => {
    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      fireEvent.press(voiceButtons[0]);
    });

    // Should not navigate to chat screen when call button is pressed
    expect(mockNavigation.navigate).not.toHaveBeenCalledWith('Chat', expect.any(Object));
  });

  it('should show error when call fails to start', async () => {
    mockStartCall.mockResolvedValue(false);

    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      fireEvent.press(voiceButtons[0]);
    });

    // Confirm the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Call');

    await confirmButton.onPress();

    // Should show error alert
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Failed to start call. Please check your permissions and try again.',
    );
  });

  it('should prevent starting call when another call is active', async () => {
    mockIsCallActive.mockReturnValue(true);

    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      fireEvent.press(voiceButtons[0]);
    });

    // Should show call in progress alert
    expect(Alert.alert).toHaveBeenCalledWith(
      'Call in Progress',
      'You already have an active call.',
    );

    // Should not show call confirmation
    expect(mockStartCall).not.toHaveBeenCalled();
  });

  it('should handle different matches correctly', async () => {
    mockStartCall.mockResolvedValue(true);

    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      fireEvent.press(voiceButtons[1]); // Second match (Luna)
    });

    // Should show confirmation for Luna
    expect(Alert.alert).toHaveBeenCalledWith(
      'Voice Call',
      'Start a voice call with Luna?',
      expect.any(Array),
    );

    // Confirm the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Call');

    await confirmButton.onPress();

    expect(mockStartCall).toHaveBeenCalledWith('match-2', 'voice');
  });

  it('should style call buttons correctly', async () => {
    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      const videoButtons = getAllByTestId('video-call-button');

      voiceButtons.forEach((button) => {
        expect(button).toHaveStyle({
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#f8f9fa',
        });
      });

      videoButtons.forEach((button) => {
        expect(button).toHaveStyle({
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#f8f9fa',
        });
      });
    });
  });

  it('should show correct icons for call buttons', async () => {
    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      const videoButtons = getAllByTestId('video-call-button');

      // Voice buttons should contain call icon
      voiceButtons.forEach((button) => {
        expect(button).toBeTruthy();
      });

      // Video buttons should contain videocam icon
      videoButtons.forEach((button) => {
        expect(button).toBeTruthy();
      });
    });
  });

  it('should handle match card press correctly (not call buttons)', async () => {
    const { getByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const matchCard = getByTestId('match-card-0');
      fireEvent.press(matchCard);
    });

    // Should navigate to chat screen when match card is pressed
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Chat', {
      matchId: 'match-1',
      petName: 'Buddy',
    });
  });

  it('should cancel call when user presses cancel', async () => {
    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      fireEvent.press(voiceButtons[0]);
    });

    // Simulate user canceling the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const cancelButton = alertCall[2].find((button: any) => button.text === 'Cancel');

    if (cancelButton.onPress) {
      cancelButton.onPress();
    }

    expect(mockStartCall).not.toHaveBeenCalled();
  });

  it('should handle empty matches list', () => {
    // Mock empty matches
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [[], jest.fn()]) // matches
      .mockImplementationOnce(() => [false, jest.fn()]) // isLoading
      .mockImplementationOnce(() => [false, jest.fn()]) // refreshing
      .mockImplementationOnce(() => ['matches', jest.fn()]); // selectedTab

    const { queryAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    // Should not render any call buttons when no matches
    expect(queryAllByTestId('voice-call-button')).toHaveLength(0);
    expect(queryAllByTestId('video-call-button')).toHaveLength(0);
  });

  it('should handle call manager errors gracefully', async () => {
    mockStartCall.mockRejectedValue(new Error('Call manager error'));

    const { getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      const voiceButtons = getAllByTestId('voice-call-button');
      fireEvent.press(voiceButtons[0]);
    });

    // Confirm the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Call');

    await confirmButton.onPress();

    // Should show error alert for failed call
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Failed to start call. Please check your permissions and try again.',
    );
  });

  it('should maintain match list functionality with call buttons', async () => {
    const { getByTestId, getAllByTestId } = render(<MatchesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      // Should render match information
      expect(getByTestId('match-name-0')).toHaveTextContent('Buddy');
      expect(getByTestId('match-owner-0')).toHaveTextContent('with John Doe');

      // Should render call buttons alongside other match info
      expect(getAllByTestId('voice-call-button')).toHaveLength(2);
      expect(getAllByTestId('video-call-button')).toHaveLength(2);

      // Should still show chevron for navigation
      expect(getByTestId('match-chevron-0')).toBeTruthy();
    });
  });
});
