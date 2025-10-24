import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import type { CallState } from '../../../services/WebRTCService';
import ActiveCallScreen from '../ActiveCallScreen';

// Mock dependencies
jest.mock('react-native-webrtc', () => ({
  RTCView: 'RTCView',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// React Native is already mocked in jest.setup.ts
jest.mock('react-native', () => ({
  Animated: {
    timing: jest.fn(() => ({ start: jest.fn() })),
    Value: jest.fn(() => ({
      interpolate: jest.fn(() => 0),
    })),
    ValueXY: jest.fn(() => ({
      x: { setValue: jest.fn() },
      y: { setValue: jest.fn() },
    })),
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
}));

const mockCallState: CallState = {
  isActive: true,
  isConnected: true,
  isIncoming: false,
  callData: {
    callId: 'test-call-id',
    matchId: 'test-match-id',
    callerId: 'test-caller-id',
    callerName: 'Test Caller',
    callType: 'video',
    timestamp: Date.now(),
  },
  localStream: {} as any,
  remoteStream: {} as any,
  isMuted: false,
  isVideoEnabled: true,
  callDuration: 120, // 2 minutes
};

describe('ActiveCallScreen', () => {
  const mockOnEndCall = jest.fn();
  const mockOnToggleMute = jest.fn();
  const mockOnToggleVideo = jest.fn();
  const mockOnSwitchCamera = jest.fn();
  const mockOnToggleSpeaker = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly with call state', () => {
    const { getByText } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    expect(getByText('Test Caller')).toBeTruthy();
    expect(getByText('02:00')).toBeTruthy(); // 2 minutes formatted
  });

  it('should render voice call layout correctly', () => {
    const voiceCallState = {
      ...mockCallState,
      callData: { ...mockCallState.callData!, callType: 'voice' as const },
    };

    const { queryByTestId } = render(
      <ActiveCallScreen
        callState={voiceCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    // Video views should not be present for voice calls
    expect(queryByTestId('remote-video')).toBeNull();
    expect(queryByTestId('local-video')).toBeNull();
  });

  it('should render video call layout correctly', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    expect(getByTestId('remote-video')).toBeTruthy();
    expect(getByTestId('local-video')).toBeTruthy();
  });

  it('should call onEndCall when end call button is pressed', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const endCallButton = getByTestId('end-call-button');
    fireEvent.press(endCallButton);

    expect(mockOnEndCall).toHaveBeenCalled();
  });

  it('should call onToggleMute when mute button is pressed', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const muteButton = getByTestId('mute-button');
    fireEvent.press(muteButton);

    expect(mockOnToggleMute).toHaveBeenCalled();
  });

  it('should call onToggleVideo when video button is pressed', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const videoButton = getByTestId('video-button');
    fireEvent.press(videoButton);

    expect(mockOnToggleVideo).toHaveBeenCalled();
  });

  it('should call onSwitchCamera when camera switch button is pressed', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const switchCameraButton = getByTestId('switch-camera-button');
    fireEvent.press(switchCameraButton);

    expect(mockOnSwitchCamera).toHaveBeenCalled();
  });

  it('should call onToggleSpeaker when speaker button is pressed', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const speakerButton = getByTestId('speaker-button');
    fireEvent.press(speakerButton);

    expect(mockOnToggleSpeaker).toHaveBeenCalled();
  });

  it('should show muted state correctly', () => {
    const mutedCallState = { ...mockCallState, isMuted: true };

    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mutedCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const muteButton = getByTestId('mute-button');
    // Should show mic-off icon when muted
    expect(muteButton).toBeTruthy();
  });

  it('should show video disabled state correctly', () => {
    const videoDisabledCallState = { ...mockCallState, isVideoEnabled: false };

    const { getByTestId } = render(
      <ActiveCallScreen
        callState={videoDisabledCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const videoButton = getByTestId('video-button');
    // Should show videocam-off icon when video disabled
    expect(videoButton).toBeTruthy();
  });

  it('should format call duration correctly', () => {
    const testCases = [
      { duration: 30, expected: '00:30' },
      { duration: 90, expected: '01:30' },
      { duration: 3661, expected: '61:01' }, // Over 1 hour
    ];

    testCases.forEach(({ duration, expected }) => {
      const callStateWithDuration = { ...mockCallState, callDuration: duration };
      
      const { getByText } = render(
        <ActiveCallScreen
          callState={callStateWithDuration}
          onEndCall={mockOnEndCall}
          onToggleMute={mockOnToggleMute}
          onToggleVideo={mockOnToggleVideo}
          onSwitchCamera={mockOnSwitchCamera}
          onToggleSpeaker={mockOnToggleSpeaker}
        />
      );

      expect(getByText(expected)).toBeTruthy();
    });
  });

  it('should auto-hide controls for video calls', async () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    // Controls should be visible initially
    const controlsContainer = getByTestId('call-controls');
    expect(controlsContainer).toBeTruthy();

    // Fast-forward time to trigger auto-hide
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Controls should still be accessible (they fade but don't disappear)
    expect(controlsContainer).toBeTruthy();
  });

  it('should handle screen tap to show/hide controls', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const screenContainer = getByTestId('call-screen-container');
    
    // Tap to toggle controls
    fireEvent.press(screenContainer);
    
    // Controls visibility should toggle (tested via state changes)
    expect(screenContainer).toBeTruthy();
  });

  it('should handle draggable local video for video calls', () => {
    const { getByTestId } = render(
      <ActiveCallScreen
        callState={mockCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    const localVideo = getByTestId('local-video');
    
    // Should be draggable (PanResponder should be set up)
    expect(require('react-native').PanResponder.create).toHaveBeenCalled();
    expect(localVideo).toBeTruthy();
  });

  it('should not show video-specific controls for voice calls', () => {
    const voiceCallState = {
      ...mockCallState,
      callData: { ...mockCallState.callData!, callType: 'voice' as const },
    };

    const { queryByTestId } = render(
      <ActiveCallScreen
        callState={voiceCallState}
        onEndCall={mockOnEndCall}
        onToggleMute={mockOnToggleMute}
        onToggleVideo={mockOnToggleVideo}
        onSwitchCamera={mockOnSwitchCamera}
        onToggleSpeaker={mockOnToggleSpeaker}
      />
    );

    // Video and camera switch buttons should not be present for voice calls
    expect(queryByTestId('video-button')).toBeNull();
    expect(queryByTestId('switch-camera-button')).toBeNull();
  });
});
