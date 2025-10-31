/**
 * Enhanced Video Call Component
 * Production-grade video calling interface with sleek design matching app theme
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { videoCallService } from '../../services/videoCallService';
import { logger } from '@pawfectmatch/core';
import { useSocket } from '../../hooks/useSocket';

interface VideoCallProps {
  matchId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  onCallEnd?: () => void;
  onCallReject?: () => void;
}

const { width, height } = Dimensions.get('window');

export const VideoCall: React.FC<VideoCallProps> = ({
  matchId,
  receiverId,
  receiverName,
  receiverAvatar,
  onCallEnd,
  onCallReject,
}) => {
  const theme = useTheme();
  const socket = useSocket();

  const [callStatus, setCallStatus] = useState<
    'idle' | 'initiating' | 'ringing' | 'active' | 'ended' | 'rejected'
  >('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<{
    sessionId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // WebSocket listeners for video call events
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: {
      sessionId: string;
      matchId: string;
      callerId: string;
      caller: { id: string; name: string; avatar?: string };
    }) => {
      if (data.matchId === matchId) {
        setIsIncomingCall(true);
        const callData: {
          sessionId: string;
          callerId: string;
          callerName: string;
          callerAvatar?: string;
        } = {
          sessionId: data.sessionId,
          callerId: data.callerId,
          callerName: data.caller.name,
        };
        if (data.caller.avatar) {
          callData.callerAvatar = data.caller.avatar;
        }
        setIncomingCallData(callData);
        setCallStatus('ringing');
        startPulseAnimation();
      }
    };

    const handleCallAccepted = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setCallStatus('active');
        startCallTimer();
        stopPulseAnimation();
      }
    };

    const handleCallRejected = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setCallStatus('rejected');
        handleCallEnd();
      }
    };

    const handleCallEnded = (data: { sessionId: string; duration?: number }) => {
      if (data.sessionId === sessionId) {
        setCallStatus('ended');
        handleCallEnd();
      }
    };

    if (socket) {
      socket.on('video_call_incoming', handleIncomingCall);
      socket.on('video_call_accepted', handleCallAccepted);
      socket.on('video_call_rejected', handleCallRejected);
      socket.on('video_call_ended', handleCallEnded);
    }

    return () => {
      if (socket) {
        socket.off('video_call_incoming', handleIncomingCall);
        socket.off('video_call_accepted', handleCallAccepted);
        socket.off('video_call_rejected', handleCallRejected);
        socket.off('video_call_ended', handleCallEnded);
      }
    };
  }, [socket, matchId, sessionId]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startCallTimer = () => {
    startTimeRef.current = new Date();
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const duration = Math.floor(
          (Date.now() - startTimeRef.current.getTime()) / 1000,
        );
        setCallDuration(duration);
      }
    }, 1000);
  };

  const stopCallTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    startTimeRef.current = null;
  };

  const handleInitiateCall = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCallStatus('initiating');
      const session = await videoCallService.initiateCall({
        matchId,
        receiverId,
        callerId: 'current-user-id', // Get from auth context
      });
      setSessionId(session.sessionId);
      setCallStatus('ringing');
      startPulseAnimation();
    } catch (error) {
      logger.error('Failed to initiate call', { error });
      setError('Failed to initiate video call');
      setCallStatus('idle');
      Alert.alert('Error', 'Failed to initiate video call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCallData) return;

    try {
      setIsLoading(true);
      setError(null);
      await videoCallService.acceptCall(incomingCallData.sessionId);
      setSessionId(incomingCallData.sessionId);
      setCallStatus('active');
      setIsIncomingCall(false);
      stopPulseAnimation();
      startCallTimer();
    } catch (error) {
      logger.error('Failed to accept call', { error });
      setError('Failed to accept video call');
      Alert.alert('Error', 'Failed to accept video call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectCall = async () => {
    if (incomingCallData) {
      try {
        await videoCallService.rejectCall(incomingCallData.sessionId);
      } catch (error) {
        logger.error('Failed to reject call', { error });
      }
    }
    setCallStatus('rejected');
    setIsIncomingCall(false);
    stopPulseAnimation();
    onCallReject?.();
  };

  const handleEndCall = async () => {
    if (!sessionId) return;

    try {
      await videoCallService.endCall(sessionId);
      stopCallTimer();
      setCallStatus('ended');
      handleCallEnd();
    } catch (error) {
      logger.error('Failed to end call', { error });
    }
  };

  const handleCallEnd = () => {
    stopCallTimer();
    stopPulseAnimation();
    setCallDuration(0);
    setSessionId(null);
    setIsIncomingCall(false);
    setIncomingCallData(null);
    setError(null);
    onCallEnd?.();
  };

  const handleToggleMute = async () => {
    if (!sessionId || callStatus !== 'active') return;

    try {
      await videoCallService.toggleMute(sessionId, !isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      logger.error('Failed to toggle mute', { error });
    }
  };

  const handleToggleVideo = async () => {
    if (!sessionId || callStatus !== 'active') return;

    try {
      await videoCallService.toggleVideo(sessionId, !isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      logger.error('Failed to toggle video', { error });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCallControls = () => {
    if (callStatus === 'idle') {
      return (
        <TouchableOpacity
          style={[
            styles.callButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
          onPress={handleInitiateCall}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Ionicons name="videocam" size={28} color={theme.colors.onPrimary} />
          )}
        </TouchableOpacity>
      );
    }

    if (callStatus === 'ringing' && isIncomingCall) {
      return (
        <View style={styles.incomingCallControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.rejectButton]}
            onPress={handleRejectCall}
            testID="reject-call-button"
            accessibilityRole="button"
            accessibilityLabel="Reject video call"
          >
            <Ionicons name="close" size={32} color={theme.colors.onPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.acceptButton]}
            onPress={handleAcceptCall}
            disabled={isLoading}
            testID="accept-call-button"
            accessibilityRole="button"
            accessibilityLabel="Accept video call"
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Ionicons name="videocam" size={32} color={theme.colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (callStatus === 'active') {
      return (
        <View style={styles.activeCallControls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isMuted ? theme.colors.danger : theme.colors.surface,
              },
            ]}
            onPress={handleToggleMute}
            testID="mute-button"
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? theme.colors.onPrimary : theme.colors.onSurface}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isVideoEnabled ? theme.colors.surface : theme.colors.danger,
              },
            ]}
            onPress={handleToggleVideo}
            testID="video-button"
            accessibilityRole="button"
            accessibilityLabel={isVideoEnabled ? 'Disable video' : 'Enable video'}
          >
            <Ionicons
              name={isVideoEnabled ? 'videocam' : 'videocam-off'}
              size={24}
              color={isVideoEnabled ? theme.colors.onSurface : theme.colors.onPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
            testID="end-call-button"
            accessibilityRole="button"
            accessibilityLabel="End video call"
          >
            <Ionicons name="call" size={24} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const isVisible =
    callStatus !== 'idle' &&
    ((callStatus === 'ringing' && isIncomingCall) ||
     callStatus === 'active' ||
     callStatus === 'initiating' ||
     callStatus === 'ended' ||
     callStatus === 'rejected');

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={[
          styles.floatingCallButton,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
        ]}
        onPress={handleInitiateCall}
        disabled={isLoading}
        testID="video-call-button"
        accessibilityRole="button"
        accessibilityLabel="Start video call"
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Ionicons name="videocam" size={24} color={theme.colors.onPrimary} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Modal
        visible={isVisible}
        animationType="fade"
        transparent={false}
        statusBarTranslucent={Platform.OS === 'android'}
        onRequestClose={handleEndCall}
        testID="video-call-modal"
      >
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        {/* Video Views */}
        <View style={styles.videoContainer}>
          {/* Remote Video */}
          <View style={styles.remoteVideoContainer}>
            {callStatus === 'active' ? (
              <View ref={remoteVideoRef} style={styles.videoView} />
            ) : (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary]}
                style={styles.placeholderVideo}
              >
                <BlurView intensity={20} style={styles.blurContainer}>
                  {callStatus === 'ringing' && (
                    <Animated.View
                      style={[
                        styles.avatarContainer,
                        {
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    >
                      {incomingCallData?.callerAvatar || receiverAvatar ? (
                        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.avatarText, { color: theme.colors.onSurface }]}>
                            {(incomingCallData?.callerName || receiverName)
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surface }]}>
                          <Ionicons
                            name="person"
                            size={64}
                            color={theme.colors.onSurface}
                          />
                        </View>
                      )}
                    </Animated.View>
                  )}
                  {callStatus === 'ringing' && !isIncomingCall && (
                    <View style={styles.avatarContainer}>
                      {receiverAvatar ? (
                        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.avatarText, { color: theme.colors.onSurface }]}>
                            {receiverName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surface }]}>
                          <Ionicons name="person" size={64} color={theme.colors.onSurface} />
                        </View>
                      )}
                    </View>
                  )}
                  <Text style={[styles.nameText, { color: theme.colors.onSurface }]}>
                    {incomingCallData?.callerName || receiverName}
                  </Text>
                  {callStatus === 'ringing' && (
                    <Text style={[styles.statusText, { color: theme.colors.onMuted }]}>
                      {isIncomingCall ? 'Incoming call...' : 'Calling...'}
                    </Text>
                  )}
                  {callStatus === 'initiating' && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text style={[styles.statusText, { color: theme.colors.onMuted }]}>
                        Connecting...
                      </Text>
                    </View>
                  )}
                </BlurView>
              </LinearGradient>
            )}
          </View>

          {/* Local Video */}
          {callStatus === 'active' && isVideoEnabled && (
            <View style={styles.localVideoContainer}>
              <BlurView intensity={10} style={styles.localVideoBlur}>
                <View ref={localVideoRef} style={styles.localVideoView} />
              </BlurView>
            </View>
          )}
        </View>

        {/* Call Info */}
        {callStatus === 'active' && (
          <View style={styles.callInfo}>
            <Text style={[styles.durationText, { color: theme.colors.onSurface }]}>
              {formatDuration(callDuration)}
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>{renderCallControls()}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoView: {
    flex: 1,
    backgroundColor: '#000',
  },
  localVideoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: width * 0.3,
    height: height * 0.2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  localVideoView: {
    flex: 1,
    backgroundColor: '#000',
  },
  localVideoBlur: {
    flex: 1,
  },
  placeholderVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  statusText: {
    fontSize: 16,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  callInfo: {
    padding: 20,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 20,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  controlsContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  floatingCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  callButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  incomingCallControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  activeCallControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  endCallButton: {
    backgroundColor: '#ef4444',
  },
});
