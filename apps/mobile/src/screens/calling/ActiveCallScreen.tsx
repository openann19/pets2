import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from 'react-native-webrtc';

import type { CallState } from '../../services/WebRTCService';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { haptic } from '@/ui/haptics';
import { trackUserAction } from '@/services/analyticsService';

interface ActiveCallScreenProps {
  callState: CallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onSwitchCamera: () => void;
  onToggleSpeaker: () => void;
}

export default function ActiveCallScreen({
  callState,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onSwitchCamera,
  onToggleSpeaker,
}: ActiveCallScreenProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [controlsVisible, setControlsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const localVideoAnim = useRef(new Animated.ValueXY({ x: 20, y: 100 })).current;

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (controlsVisible && callState.callData?.callType === 'video') {
        hideControls();
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [controlsVisible, callState.callData?.callType]);

  // Pan responder for draggable local video
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_evt, gestureState) => {
      localVideoAnim.setValue({
        x: 20 + gestureState.dx,
        y: 100 + gestureState.dy,
      });
    },
    onPanResponderRelease: (_evt, gestureState) => {
      // Snap to edges
      const { dx, dy } = gestureState;
      const newX = dx < screenWidth / 2 ? 20 : screenWidth - 140;
      const newY = Math.max(100, Math.min(screenHeight - 300, dy + 100));

      Animated.spring(localVideoAnim, {
        toValue: { x: newX, y: newY },
        useNativeDriver: false,
      }).start();
    },
  });

  const showControls = () => {
    setControlsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setControlsVisible(false);
    });
  };

  const toggleControls = () => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoCall = () => (
    <View style={styles.videoContainer}>
      {/* Remote Video (Full Screen) */}
      {callState.remoteStream && (
        <RTCView
          style={styles.remoteVideo}
          streamURL={callState.remoteStream.toURL()}
          objectFit="cover"
        />
      )}

      {/* Local Video (Draggable Picture-in-Picture) */}
      {callState.localStream && callState.isVideoEnabled && (
        <Animated.View
          style={StyleSheet.flatten([
            styles.localVideoContainer,
            {
              transform: localVideoAnim.getTranslateTransform(),
            },
          ])}
          {...panResponder.panHandlers}
        >
          <RTCView
            style={styles.localVideo}
            streamURL={callState.localStream.toURL()}
            objectFit="cover"
            mirror={true}
          />
          <TouchableOpacity
            style={styles.switchCameraButton}
            testID="ActiveCallScreen-switch-camera"
            accessibilityRole="button"
            accessibilityLabel="Switch camera"
            accessibilityHint="Switches between front and back camera"
            onPress={() => {
              haptic.selection();
              trackUserAction('call_switch_camera', {
                callId: callState.callData?.callId,
                callType: callState.callData?.callType,
              });
              onSwitchCamera();
            }}
          >
            <Ionicons
              name="camera-reverse"
              size={20}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Tap to show/hide controls */}
      <TouchableOpacity
        style={styles.videoTouchArea}
        testID="ActiveCallScreen-toggle-controls"
        accessibilityRole="button"
        accessibilityLabel="Toggle call controls"
        accessibilityHint="Tap to show or hide call controls"
        onPress={toggleControls}
        activeOpacity={1}
      />
    </View>
  );

  const renderVoiceCall = () => (
    <View style={styles.voiceContainer}>
      <LinearGradient
        colors={theme.palette.gradients.primary}
        style={styles.voiceGradient}
      />

      <View style={styles.voiceContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={60}
                color={theme.colors.onSurface}
              />
            </View>
          </View>
        </View>

        <Text style={styles.callerName}>{callState.callData?.callerName || 'Unknown'}</Text>

        <Text style={styles.callStatus}>
          {callState.isConnected ? 'Connected' : 'Connecting...'}
        </Text>

        {callState.isConnected && (
          <Text style={styles.callDuration}>{formatCallDuration(callState.callDuration)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {callState.callData?.callType === 'video' ? renderVideoCall() : renderVoiceCall()}

      {/* Controls Overlay */}
      <Animated.View
        style={StyleSheet.flatten([
          styles.controlsOverlay,
          {
            opacity: fadeAnim,
            pointerEvents: controlsVisible ? 'auto' : 'none',
          },
        ])}
      >
        <SafeAreaView style={styles.controlsContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.callerNameHeader}>
              {callState.callData?.callerName || 'Unknown'}
            </Text>
            {callState.isConnected && (
              <Text style={styles.callDurationHeader}>
                {formatCallDuration(callState.callDuration)}
              </Text>
            )}
          </View>

          {/* Call Controls */}
          <View style={styles.callControls}>
            {/* Mute Button */}
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.controlButton,
                callState.isMuted && styles.controlButtonActive,
              ])}
              testID="ActiveCallScreen-toggle-mute"
              accessibilityRole="button"
              accessibilityLabel={callState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
              accessibilityState={{ checked: callState.isMuted }}
              onPress={() => {
                haptic.selection();
                trackUserAction('call_toggle_mute', {
                  callId: callState.callData?.callId,
                  callType: callState.callData?.callType,
                  newState: !callState.isMuted,
                });
                onToggleMute();
              }}
            >
              <Ionicons
                name={callState.isMuted ? 'mic-off' : 'mic'}
                size={24}
                color={callState.isMuted ? theme.colors.danger : theme.colors.onSurface}
              />
            </TouchableOpacity>

            {/* Speaker Button */}
            <TouchableOpacity
              style={styles.controlButton}
              testID="ActiveCallScreen-toggle-speaker"
              accessibilityRole="button"
              accessibilityLabel="Toggle speaker"
              onPress={() => {
                haptic.selection();
                trackUserAction('call_toggle_speaker', {
                  callId: callState.callData?.callId,
                  callType: callState.callData?.callType,
                });
                onToggleSpeaker();
              }}
            >
              <Ionicons
                name="volume-high"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>

            {/* Video Toggle (only for video calls) */}
            {callState.callData?.callType === 'video' && (
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.controlButton,
                  !callState.isVideoEnabled && styles.controlButtonActive,
                ])}
                testID="ActiveCallScreen-toggle-video"
                accessibilityRole="button"
                accessibilityLabel={callState.isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                accessibilityState={{ checked: callState.isVideoEnabled }}
                onPress={() => {
                  haptic.selection();
                  trackUserAction('call_toggle_video', {
                    callId: callState.callData?.callId,
                    callType: callState.callData?.callType,
                    newState: !callState.isVideoEnabled,
                  });
                  onToggleVideo();
                }}
              >
                <Ionicons
                  name={callState.isVideoEnabled ? 'videocam' : 'videocam-off'}
                  size={24}
                  color={!callState.isVideoEnabled ? theme.colors.danger : theme.colors.onSurface}
                />
              </TouchableOpacity>
            )}

            {/* End Call Button */}
            <TouchableOpacity
              style={StyleSheet.flatten([styles.controlButton, styles.endCallButton])}
              testID="ActiveCallScreen-end-call"
              accessibilityRole="button"
              accessibilityLabel="End call"
              accessibilityHint="Terminates the current call"
              onPress={() => {
                haptic.error();
                trackUserAction('call_ended', {
                  callId: callState.callData?.callId,
                  callType: callState.callData?.callType,
                  duration: callState.callDuration,
                });
                onEndCall();
              }}
            >
              <LinearGradient
                colors={theme.palette.gradients.danger}
                style={styles.endCallGradient}
              >
                <Ionicons
                  name="call"
                  size={24}
                  color={theme.colors.onPrimary}
                  style={{ transform: [{ rotate: '135deg' }] }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },

    // Video Call Styles
    videoContainer: {
      flex: 1,
    },
    remoteVideo: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    localVideoContainer: {
      position: 'absolute',
      width: 120,
      height: 180,
      borderRadius: theme.radii.md,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: theme.colors.bg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    localVideo: {
      width: '100%',
      height: '100%',
    },
    switchCameraButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: theme.radii.full,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoTouchArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    // Voice Call Styles
    voiceContainer: {
      flex: 1,
    },
    voiceGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    voiceContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    avatarContainer: {
      marginBottom: theme.spacing.xl,
    },
    avatarRing: {
      width: 160,
      height: 160,
      borderRadius: theme.radii.full,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      padding: theme.spacing.xs,
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 72,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    callerName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    callStatus: {
      fontSize: 18,
      color: theme.colors.onSurface,
      opacity: 0.8,
      marginBottom: theme.spacing.xs,
    },
    callDuration: {
      fontSize: 16,
      color: theme.colors.onSurface,
      opacity: 0.6,
    },

    // Controls Overlay
    controlsOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    controlsContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    header: {
      alignItems: 'center',
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    callerNameHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    callDurationHeader: {
      fontSize: 16,
      color: theme.colors.onSurface,
      opacity: 0.8,
    },
    callControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: 50,
    },
    controlButton: {
      width: 56,
      height: 56,
      borderRadius: theme.radii.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    controlButtonActive: {
      backgroundColor: `${theme.colors.danger}33`,
      borderColor: theme.colors.danger,
    },
    endCallButton: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    endCallGradient: {
      width: 56,
      height: 56,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
