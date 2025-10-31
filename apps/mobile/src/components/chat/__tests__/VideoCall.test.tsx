/**
 * Video Call Component Tests
 * Comprehensive test suite for video calling functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils/unified-render';
import { VideoCall } from '../VideoCall';
import { videoCallService } from '../../services/videoCallService';
import { useWebSocket } from '../../hooks/useWebSocket';

// Mock dependencies
jest.mock('../../services/videoCallService');
jest.mock('../../hooks/useWebSocket');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

const mockVideoCallService = videoCallService as jest.Mocked<typeof videoCallService>;
const mockUseWebSocket = useWebSocket as jest.MockedFunction<typeof useWebSocket>;

const mockTheme = {
  colors: {
    primary: '#ec4899',
    secondary: '#a855f7',
    bg: '#ffffff',
    surface: '#f9fafb',
    surfaceAlt: '#f3f4f6',
    onSurface: '#111827',
    onMuted: '#6b7280',
    onPrimary: '#ffffff',
    danger: '#ef4444',
    success: '#10b981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
};

const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

describe('VideoCall Component', () => {
  const defaultProps = {
    matchId: 'match123',
    receiverId: 'receiver123',
    receiverName: 'John Doe',
    receiverAvatar: 'https://example.com/avatar.jpg',
    onCallEnd: jest.fn(),
    onCallReject: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue(mockTheme as any);
    mockUseWebSocket.mockReturnValue({ socket: mockSocket as any });
  });

  describe('Initial State', () => {
    it('should render floating call button when idle', () => {
      render(<VideoCall {...defaultProps} />);
      const callButton = screen.getByTestId('video-call-button');
      expect(callButton).toBeTruthy();
    });

    it('should not render modal when idle', () => {
      render(<VideoCall {...defaultProps} />);
      const modal = screen.queryByTestId('video-call-modal');
      expect(modal).toBeNull();
    });
  });

  describe('Call Initiation', () => {
    it('should initiate call when button is pressed', async () => {
      const mockSession = {
        sessionId: 'session123',
        matchId: 'match123',
        callerId: 'caller123',
        receiverId: 'receiver123',
        status: 'ringing' as const,
      };

      mockVideoCallService.initiateCall.mockResolvedValue(mockSession);

      render(<VideoCall {...defaultProps} />);

      const callButton = screen.getByTestId('video-call-button');
      await act(async () => {
        fireEvent.press(callButton);
      });

      await waitFor(() => {
        expect(mockVideoCallService.initiateCall).toHaveBeenCalledWith({
          matchId: 'match123',
          receiverId: 'receiver123',
          callerId: 'current-user-id',
        });
      });
    });

    it('should handle call initiation error', async () => {
      mockVideoCallService.initiateCall.mockRejectedValue(new Error('Call failed'));

      render(<VideoCall {...defaultProps} />);

      const callButton = screen.getByTestId('video-call-button');
      await act(async () => {
        fireEvent.press(callButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to initiate/i)).toBeTruthy();
      });
    });
  });

  describe('Incoming Call', () => {
    it('should display incoming call UI when call is received', async () => {
      render(<VideoCall {...defaultProps} />);

      // Simulate incoming call event
      const handleIncomingCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'video_call_incoming',
      )?.[1];

      if (handleIncomingCall) {
        await act(async () => {
          handleIncomingCall({
            sessionId: 'session123',
            matchId: 'match123',
            callerId: 'caller123',
            caller: {
              id: 'caller123',
              name: 'Jane Doe',
              avatar: 'https://example.com/caller.jpg',
            },
          });
        });
      }

      await waitFor(() => {
        expect(screen.getByText(/incoming call/i)).toBeTruthy();
      });
    });

    it('should accept incoming call', async () => {
      mockVideoCallService.acceptCall.mockResolvedValue({
        sessionId: 'session123',
        status: 'active',
        startedAt: new Date().toISOString(),
        token: 'token123',
        roomId: 'room123',
        roomName: 'room123',
        serverUrl: 'wss://example.com',
      });

      render(<VideoCall {...defaultProps} />);

      // Simulate incoming call
      const handleIncomingCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'video_call_incoming',
      )?.[1];

      if (handleIncomingCall) {
        await act(async () => {
          handleIncomingCall({
            sessionId: 'session123',
            matchId: 'match123',
            callerId: 'caller123',
            caller: { id: 'caller123', name: 'Jane Doe' },
          });
        });
      }

      await waitFor(() => {
        const acceptButton = screen.getByTestId('accept-call-button');
        expect(acceptButton).toBeTruthy();
      });

      const acceptButton = screen.getByTestId('accept-call-button');
      await act(async () => {
        fireEvent.press(acceptButton);
      });

      await waitFor(() => {
        expect(mockVideoCallService.acceptCall).toHaveBeenCalledWith('session123');
      });
    });

    it('should reject incoming call', async () => {
      mockVideoCallService.rejectCall.mockResolvedValue(undefined);

      render(<VideoCall {...defaultProps} />);

      // Simulate incoming call
      const handleIncomingCall = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'video_call_incoming',
      )?.[1];

      if (handleIncomingCall) {
        await act(async () => {
          handleIncomingCall({
            sessionId: 'session123',
            matchId: 'match123',
            callerId: 'caller123',
            caller: { id: 'caller123', name: 'Jane Doe' },
          });
        });
      }

      await waitFor(() => {
        const rejectButton = screen.getByTestId('reject-call-button');
        expect(rejectButton).toBeTruthy();
      });

      const rejectButton = screen.getByTestId('reject-call-button');
      await act(async () => {
        fireEvent.press(rejectButton);
      });

      await waitFor(() => {
        expect(mockVideoCallService.rejectCall).toHaveBeenCalledWith('session123');
        expect(defaultProps.onCallReject).toHaveBeenCalled();
      });
    });
  });

  describe('Active Call Controls', () => {
    beforeEach(async () => {
      mockVideoCallService.initiateCall.mockResolvedValue({
        sessionId: 'session123',
        matchId: 'match123',
        callerId: 'caller123',
        receiverId: 'receiver123',
        status: 'ringing',
      });

      mockVideoCallService.acceptCall.mockResolvedValue({
        sessionId: 'session123',
        status: 'active',
        startedAt: new Date().toISOString(),
        token: 'token123',
        roomId: 'room123',
        roomName: 'room123',
        serverUrl: 'wss://example.com',
      });
    });

    it('should toggle mute during active call', async () => {
      render(<VideoCall {...defaultProps} />);

      // Initiate and accept call
      const callButton = screen.getByTestId('video-call-button');
      await act(async () => {
        fireEvent.press(callButton);
      });

      // Simulate call accepted
      const handleCallAccepted = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'video_call_accepted',
      )?.[1];

      if (handleCallAccepted) {
        await act(async () => {
          handleCallAccepted({ sessionId: 'session123' });
        });
      }

      await waitFor(() => {
        const muteButton = screen.getByTestId('mute-button');
        expect(muteButton).toBeTruthy();
      });

      const muteButton = screen.getByTestId('mute-button');
      await act(async () => {
        fireEvent.press(muteButton);
      });

      await waitFor(() => {
        expect(mockVideoCallService.toggleMute).toHaveBeenCalledWith('session123', true);
      });
    });

    it('should toggle video during active call', async () => {
      render(<VideoCall {...defaultProps} />);

      // Initiate and accept call
      const callButton = screen.getByTestId('video-call-button');
      await act(async () => {
        fireEvent.press(callButton);
      });

      // Simulate call accepted
      const handleCallAccepted = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'video_call_accepted',
      )?.[1];

      if (handleCallAccepted) {
        await act(async () => {
          handleCallAccepted({ sessionId: 'session123' });
        });
      }

      await waitFor(() => {
        const videoButton = screen.getByTestId('video-button');
        expect(videoButton).toBeTruthy();
      });

      const videoButton = screen.getByTestId('video-button');
      await act(async () => {
        fireEvent.press(videoButton);
      });

      await waitFor(() => {
        expect(mockVideoCallService.toggleVideo).toHaveBeenCalledWith('session123', false);
      });
    });

    it('should end call when end button is pressed', async () => {
      mockVideoCallService.endCall.mockResolvedValue({
        sessionId: 'session123',
        status: 'ended',
        duration: 60,
        endedAt: new Date().toISOString(),
      });

      render(<VideoCall {...defaultProps} />);

      // Initiate and accept call
      const callButton = screen.getByTestId('video-call-button');
      await act(async () => {
        fireEvent.press(callButton);
      });

      // Simulate call accepted
      const handleCallAccepted = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'video_call_accepted',
      )?.[1];

      if (handleCallAccepted) {
        await act(async () => {
          handleCallAccepted({ sessionId: 'session123' });
        });
      }

      await waitFor(() => {
        const endButton = screen.getByTestId('end-call-button');
        expect(endButton).toBeTruthy();
      });

      const endButton = screen.getByTestId('end-call-button');
      await act(async () => {
        fireEvent.press(endButton);
      });

      await waitFor(() => {
        expect(mockVideoCallService.endCall).toHaveBeenCalledWith('session123');
        expect(defaultProps.onCallEnd).toHaveBeenCalled();
      });
    });
  });

  describe('Call Duration', () => {
    it('should display call duration during active call', async () => {
      jest.useFakeTimers();

      render(<VideoCall {...defaultProps} />);

      // Initiate and accept call
      const callButton = screen.getByTestId('video-call-button');
      await act(async () => {
        fireEvent.press(callButton);
      });

      // Simulate call accepted
      const handleCallAccepted = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'video_call_accepted',
      )?.[1];

      if (handleCallAccepted) {
        await act(async () => {
          handleCallAccepted({ sessionId: 'session123' });
        });
      }

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(65000); // 1 minute 5 seconds
      });

      await waitFor(() => {
        expect(screen.getByText(/01:05/)).toBeTruthy();
      });

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      mockVideoCallService.initiateCall.mockRejectedValue(new Error('Network error'));

      render(<VideoCall {...defaultProps} />);

      const callButton = screen.getByTestId('video-call-button');
      await act(async () => {
        fireEvent.press(callButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to initiate/i)).toBeTruthy();
      });
    });

    it('should recover from error and allow retry', async () => {
      mockVideoCallService.initiateCall
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          sessionId: 'session123',
          matchId: 'match123',
          callerId: 'caller123',
          receiverId: 'receiver123',
          status: 'ringing',
        });

      render(<VideoCall {...defaultProps} />);

      const callButton = screen.getByTestId('video-call-button');
      
      // First attempt fails
      await act(async () => {
        fireEvent.press(callButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to initiate/i)).toBeTruthy();
      });

      // Retry succeeds
      await act(async () => {
        fireEvent.press(callButton);
      });

      await waitFor(() => {
        expect(mockVideoCallService.initiateCall).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Socket Events', () => {
    it('should set up socket listeners on mount', () => {
      render(<VideoCall {...defaultProps} />);

      expect(mockSocket.on).toHaveBeenCalledWith('video_call_incoming', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('video_call_accepted', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('video_call_rejected', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('video_call_ended', expect.any(Function));
    });

    it('should cleanup socket listeners on unmount', () => {
      const { unmount } = render(<VideoCall {...defaultProps} />);
      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('video_call_incoming', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('video_call_accepted', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('video_call_rejected', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('video_call_ended', expect.any(Function));
    });
  });
});

