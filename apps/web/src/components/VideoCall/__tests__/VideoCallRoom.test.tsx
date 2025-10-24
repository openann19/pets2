import React from 'react';
import {} from '@testing-library/react';
import '@testing-library/jest-dom';
import {} from '../VideoCallRoom';

// Mock WebRTC APIs
const mockGetUserMedia = jest.fn();
const mockRTCPeerConnection = jest.fn();

global.navigator.mediaDevices = {
  getUserMedia: mockGetUserMedia,
} as unknown;

global.RTCPeerConnection = mockRTCPeerConnection as unknown;

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => '/video-call/123',
}));

// Mock socket connection
jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: () => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  }),
}));

describe('VideoCallRoom Component', () => {
  const mockCallId = 'test-call-123';
  const mockUser = {
    id: 'user-123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders video call room with controls', () => {
      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      expect(screen.getByText('Video Call')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle camera')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle microphone')).toBeInTheDocument();
      expect(screen.getByLabelText('End call')).toBeInTheDocument();
    });

    it('displays user information', () => {
      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('renders video elements', () => {
      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const videoElements = screen.getAllByTestId('video-element');
      expect(videoElements).toHaveLength(2); // Local and remote video
    });
  });

  describe('Media Controls', () => {
    it('toggles camera when camera button is clicked', async () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const cameraButton = screen.getByLabelText('Toggle camera');
      fireEvent.click(cameraButton);

      // Should toggle camera state
      await waitFor(() => {
        expect(cameraButton).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('toggles microphone when mic button is clicked', async () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const micButton = screen.getByLabelText('Toggle microphone');
      fireEvent.click(micButton);

      // Should toggle mic state
      await waitFor(() => {
        expect(micButton).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('ends call when end call button is clicked', async () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const endCallButton = screen.getByLabelText('End call');
      fireEvent.click(endCallButton);

      // Should redirect to matches page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/matches');
      });
    });
  });

  describe('Fullscreen Mode', () => {
    it('toggles fullscreen when fullscreen button is clicked', () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const fullscreenButton = screen.getByLabelText('Toggle fullscreen');
      fireEvent.click(fullscreenButton);

      // Should toggle fullscreen state
      expect(fullscreenButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Screen Sharing', () => {
    it('toggles screen sharing when button is clicked', async () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const screenShareButton = screen.getByLabelText('Share screen');
      fireEvent.click(screenShareButton);

      // Should toggle screen sharing state
      await waitFor(() => {
        expect(screenShareButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Connection Status', () => {
    it('displays connecting status initially', () => {
      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('displays connected status when connection is established', async () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      // Wait for connection to be established
      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });
  });

  describe('Permissions Handling', () => {
    it('handles camera permission denied gracefully', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      // Should show permission error
      await waitFor(() => {
        expect(screen.getByText('Camera permission denied')).toBeInTheDocument();
      });
    });

    it('handles microphone permission denied gracefully', async () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [], // No audio tracks
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      // Should show mic warning
      await waitFor(() => {
        expect(screen.getByText('Microphone not available')).toBeInTheDocument();
      });
    });
  });

  describe('Recording Feature', () => {
    it('toggles recording when record button is clicked', async () => {
      mockGetUserMedia.mockResolvedValue({
        getVideoTracks: () => [{ enabled: true, stop: jest.fn() }],
        getAudioTracks: () => [{ enabled: true, stop: jest.fn() }],
      });

      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const recordButton = screen.getByLabelText('Toggle recording');
      fireEvent.click(recordButton);

      // Should toggle recording state
      await waitFor(() => {
        expect(recordButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all controls', () => {
      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('provides keyboard navigation for controls', () => {
      render(
        <VideoCallRoom
          callId={mockCallId}
          user={mockUser}
        />,
      );

      const cameraButton = screen.getByLabelText('Toggle camera');
      fireEvent.keyDown(cameraButton, { key: 'Enter' });

      // Should be focusable
      expect(cameraButton).toHaveFocus();
    });
  });
});
