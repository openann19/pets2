import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RTCView } from "react-native-webrtc";

import type { CallState } from "../../services/WebRTCService";
import { Theme } from '../../theme/unified-theme';

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
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [localVideoPosition, setLocalVideoPosition] = useState({
    x: 20,
    y: 100,
  });
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const localVideoAnim = useRef(
    new Animated.ValueXY({ x: 20, y: 100 }),
  ).current;

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (controlsVisible && callState.callData?.callType === "video") {
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
    onPanResponderMove: Animated.event(
      [null, { dx: localVideoAnim.x, dy: localVideoAnim.y }],
      { useNativeDriver: false },
    ),
    onPanResponderRelease: (evt, gestureState) => {
      // Snap to edges
      const { dx, dy } = gestureState;
      const newX = dx < screenWidth / 2 ? 20 : screenWidth - 140;
      const newY = Math.max(100, Math.min(screenHeight - 300, dy + 100));

      Animated.spring(localVideoAnim, {
        toValue: { x: newX, y: newY },
        useNativeDriver: false,
      }).start();

      setLocalVideoPosition({ x: newX, y: newY });
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
            onPress={onSwitchCamera}
          >
            <Ionicons name="camera-reverse" size={20} color="Theme.colors.neutral[0]" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Tap to show/hide controls */}
      <TouchableOpacity
        style={styles.videoTouchArea}
        onPress={toggleControls}
        activeOpacity={1}
      />
    </View>
  );

  const renderVoiceCall = () => (
    <View style={styles.voiceContainer}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.voiceGradient}
      />

      <View style={styles.voiceContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={60} color="Theme.colors.neutral[0]" />
            </View>
          </View>
        </View>

        <Text style={styles.callerName}>
          {callState.callData?.callerName || "Unknown"}
        </Text>

        <Text style={styles.callStatus}>
          {callState.isConnected ? "Connected" : "Connecting..."}
        </Text>

        {callState.isConnected && (
          <Text style={styles.callDuration}>
            {formatCallDuration(callState.callDuration)}
          </Text>
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

      {callState.callData?.callType === "video"
        ? renderVideoCall()
        : renderVoiceCall()}

      {/* Controls Overlay */}
      <Animated.View
        style={StyleSheet.flatten([
          styles.controlsOverlay,
          {
            opacity: fadeAnim,
            pointerEvents: controlsVisible ? "auto" : "none",
          },
        ])}
      >
        <SafeAreaView style={styles.controlsContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.callerNameHeader}>
              {callState.callData?.callerName || "Unknown"}
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
              onPress={onToggleMute}
            >
              <Ionicons
                name={callState.isMuted ? "mic-off" : "mic"}
                size={24}
                color={callState.isMuted ? "#ff4757" : "Theme.colors.neutral[0]"}
              />
            </TouchableOpacity>

            {/* Speaker Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onToggleSpeaker}
            >
              <Ionicons name="volume-high" size={24} color="Theme.colors.neutral[0]" />
            </TouchableOpacity>

            {/* Video Toggle (only for video calls) */}
            {callState.callData?.callType === "video" && (
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.controlButton,
                  !callState.isVideoEnabled && styles.controlButtonActive,
                ])}
                onPress={onToggleVideo}
              >
                <Ionicons
                  name={callState.isVideoEnabled ? "videocam" : "videocam-off"}
                  size={24}
                  color={!callState.isVideoEnabled ? "#ff4757" : "Theme.colors.neutral[0]"}
                />
              </TouchableOpacity>
            )}

            {/* End Call Button */}
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.controlButton,
                styles.endCallButton,
              ])}
              onPress={onEndCall}
            >
              <LinearGradient
                colors={["#ff4757", "#ff3838"]}
                style={styles.endCallGradient}
              >
                <Ionicons
                  name="call"
                  size={24}
                  color="Theme.colors.neutral[0]"
                  style={{ transform: [{ rotate: "135deg" }] }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "Theme.colors.neutral[950]",
  },

  // Video Call Styles
  videoContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "Theme.colors.neutral[950]",
  },
  localVideoContainer: {
    position: "absolute",
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  localVideo: {
    width: "100%",
    height: "100%",
  },
  switchCameraButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTouchArea: {
    position: "absolute",
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
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  voiceContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 40,
  },
  avatarRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    padding: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 72,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "Theme.colors.neutral[0]",
    marginBottom: 12,
    textAlign: "center",
  },
  callStatus: {
    fontSize: 18,
    color: "Theme.colors.neutral[0]",
    opacity: 0.8,
    marginBottom: 8,
  },
  callDuration: {
    fontSize: 16,
    color: "Theme.colors.neutral[0]",
    opacity: 0.6,
  },

  // Controls Overlay
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  controlsContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  callerNameHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[0]",
    marginBottom: 4,
  },
  callDurationHeader: {
    fontSize: 16,
    color: "Theme.colors.neutral[0]",
    opacity: 0.8,
  },
  callControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  controlButtonActive: {
    backgroundColor: "rgba(255, 71, 87, 0.3)",
    borderColor: "#ff4757",
  },
  endCallButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  endCallGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
