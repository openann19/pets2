import React, { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import type { AppStateStatus } from 'react-native';
import { Modal, Alert, AppState } from 'react-native';

import { useSocket } from '../../hooks/useSocket';
import ActiveCallScreen from '../../screens/calling/ActiveCallScreen';
import IncomingCallScreen from '../../screens/calling/IncomingCallScreen';
import type { CallState} from '../../services/WebRTCService';
import WebRTCService, { CallData } from '../../services/WebRTCService';

interface CallManagerProps {
  children: React.ReactNode;
}

export default function CallManager({ children }: CallManagerProps) {
  const [callState, setCallState] = useState<CallState>(WebRTCService.getCallState());
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showActiveCall, setShowActiveCall] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    // Initialize WebRTC service with socket
    if (socket) {
      WebRTCService.initialize(socket);
    }

    // Listen for call state changes
    const handleCallStateChange = (newState: CallState) => {
      setCallState(newState);
      
      if (newState.isActive && newState.isIncoming && !newState.isConnected) {
        // Show incoming call screen
        setShowIncomingCall(true);
        setShowActiveCall(false);
      } else if (newState.isActive && !newState.isIncoming) {
        // Show active call screen
        setShowIncomingCall(false);
        setShowActiveCall(true);
      } else if (!newState.isActive) {
        // Hide all call screens
        setShowIncomingCall(false);
        setShowActiveCall(false);
      }
    };

    const handleCallError = (error: unknown) => {
      Alert.alert(
        'Call Error',
        'There was an issue with the call. Please try again.',
        [{ text: 'OK' }]
      );
      logger.error('Call error:', { error });
    };

    // Add event listeners
    WebRTCService.on('callStateChanged', handleCallStateChange);
    WebRTCService.on('callError', handleCallError);

    // Handle app state changes (for background/foreground)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && callState.isActive) {
        // Handle call in background - could implement picture-in-picture
        logger.info('Call moved to background');
      } else if (nextAppState === 'active' && callState.isActive) {
        // Call returned to foreground
        logger.info('Call returned to foreground');
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      WebRTCService.off('callStateChanged', handleCallStateChange);
      WebRTCService.off('callError', handleCallError);
      appStateSubscription?.remove();
    };
  }, [socket]);

  // Call action handlers
  const handleAnswerCall = async () => {
    try {
      const success = await WebRTCService.answerCall();
      if (success) {
        setShowIncomingCall(false);
        setShowActiveCall(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to answer call');
    }
  };

  const handleRejectCall = () => {
    WebRTCService.rejectCall();
    setShowIncomingCall(false);
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Call', 
          style: 'destructive',
          onPress: () => {
            WebRTCService.endCall();
            setShowActiveCall(false);
          }
        }
      ]
    );
  };

  const handleToggleMute = () => {
    WebRTCService.toggleMute();
  };

  const handleToggleVideo = () => {
    WebRTCService.toggleVideo();
  };

  const handleSwitchCamera = () => {
    WebRTCService.switchCamera();
  };

  const handleToggleSpeaker = () => {
    WebRTCService.toggleSpeaker();
  };

  return (
    <>
      {children}
      
      {/* Incoming Call Modal */}
      <Modal
        visible={showIncomingCall}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleRejectCall}
      >
        {callState.callData && (
          <IncomingCallScreen
            callData={callState.callData}
            onAnswer={handleAnswerCall}
            onReject={handleRejectCall}
          />
        )}
      </Modal>

      {/* Active Call Modal */}
      <Modal
        visible={showActiveCall}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleEndCall}
      >
        <ActiveCallScreen
          callState={callState}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onSwitchCamera={handleSwitchCamera}
          onToggleSpeaker={handleToggleSpeaker}
        />
      </Modal>
    </>
  );
}

// Export hook for easy access to call functionality
export const useCallManager = () => {
  const startCall = async (matchId: string, callType: 'voice' | 'video') => {
    try {
      const success = await WebRTCService.startCall(matchId, callType);
      if (!success) {
        Alert.alert('Error', 'Failed to start call. Please check your permissions and try again.');
      }
      return success;
    } catch (error) {
      Alert.alert('Error', 'Failed to start call');
      return false;
    }
  };

  const endCall = () => {
    WebRTCService.endCall();
  };

  const isCallActive = () => {
    return WebRTCService.isCallActive();
  };

  const getCallState = () => {
    return WebRTCService.getCallState();
  };

  return {
    startCall,
    endCall,
    isCallActive,
    getCallState,
  };
};
