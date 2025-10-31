/**
 * useChatScreen Video Call Gates Tests
 * Tests premium gating for video and voice calls
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useChatScreen } from '../useChatScreen';
import { usePremiumStatus } from '../../domains/premium/usePremiumStatus';

jest.mock('../../domains/premium/usePremiumStatus');
jest.mock('../../useChatData');
jest.mock('../../../services/WebRTCService');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockUsePremiumStatus = usePremiumStatus as jest.Mock;

describe('useChatScreen - Video Call Gates', () => {
  const mockMatchId = 'match123';
  const mockPetName = 'Fluffy';

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
  });

  describe('handleVideoCall', () => {
    it('should allow video calls for premium users', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
      });

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation as any,
        }),
      );

      await act(async () => {
        await result.current.handleVideoCall();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Video Call',
        expect.stringContaining(mockPetName),
        expect.any(Array),
      );
    });

    it('should block video calls for free users', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation as any,
        }),
      );

      await act(async () => {
        await result.current.handleVideoCall();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Premium Feature',
        expect.stringContaining('Video Calls are available with PawfectMatch Premium'),
        expect.any(Array),
      );
    });

    it('should navigate to Premium screen from upgrade prompt', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });

      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const upgradeButton = buttons[1];
        if (upgradeButton && upgradeButton.onPress) {
          upgradeButton.onPress();
        }
      });

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation as any,
        }),
      );

      await act(async () => {
        await result.current.handleVideoCall();
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Premium');
    });
  });

  describe('handleVoiceCall', () => {
    it('should allow voice calls for premium users', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
      });

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation as any,
        }),
      );

      await act(async () => {
        await result.current.handleVoiceCall();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Voice Call',
        expect.stringContaining(mockPetName),
        expect.any(Array),
      );
    });

    it('should block voice calls for free users', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation as any,
        }),
      );

      await act(async () => {
        await result.current.handleVoiceCall();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Premium Feature',
        expect.stringContaining('Voice Calls are available with PawfectMatch Premium'),
        expect.any(Array),
      );
    });

    it('should allow ultimate users to make calls', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'ultimate',
      });

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation as any,
        }),
      );

      await act(async () => {
        await result.current.handleVideoCall();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Video Call',
        expect.any(String),
        expect.any(Array),
      );
    });
  });
});

