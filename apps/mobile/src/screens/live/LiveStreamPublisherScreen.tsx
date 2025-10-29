import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { VideoView } from 'livekit-react-native';
import { useLiveStream } from '../../hooks/useLiveStream';
import { useNavigation, useRoute } from '@react-navigation/native';

export function LiveStreamPublisherScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { streamId } = route.params as { streamId: string };

  const {
    room,
    isConnected,
    isPublishing,
    localParticipant,
    viewerCount,
    error,
    startStream,
    endStream,
    toggleCamera,
    toggleMicrophone,
    switchCamera,
  } = useLiveStream();

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

  useEffect(() => {
    if (streamId) {
      startStream(streamId);
    }

    return () => {
      endStream();
    };
  }, [streamId]);

  const handleEndStream = () => {
    Alert.alert('End Live Stream', 'Are you sure you want to end the stream?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: () => {
          endStream();
          navigation.goBack();
        },
      },
    ]);
  };

  const handleToggleCamera = async () => {
    await toggleCamera();
    setCameraEnabled(!cameraEnabled);
  };

  const handleToggleMicrophone = async () => {
    await toggleMicrophone();
    setMicrophoneEnabled(!microphoneEnabled);
  };

  const handleSwitchCamera = async () => {
    await switchCamera();
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            testID="LiveStreamPublisherScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Live indicator */}
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
        <Text style={styles.viewerCount}>{viewerCount} viewers</Text>
      </View>

      {/* Camera preview */}
      {localParticipant && isPublishing && (
        <View style={styles.cameraPreview}>
          {/* VideoView will be rendered by LiveKit once track is ready */}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, !cameraEnabled && styles.controlButtonDisabled]}
          testID="LiveStreamPublisherScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={handleToggleCamera}
        >
          <Text style={styles.controlButtonText}>{cameraEnabled ? '📷' : '🚫'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !microphoneEnabled && styles.controlButtonDisabled]}
          testID="LiveStreamPublisherScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={handleToggleMicrophone}
        >
          <Text style={styles.controlButtonText}>{microphoneEnabled ? '🎤' : '🔇'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          testID="LiveStreamPublisherScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={handleSwitchCamera}
        >
          <Text style={styles.controlButtonText}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endButton]}
          testID="LiveStreamPublisherScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={handleEndStream}
        >
          <Text style={styles.controlButtonText}>End</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  liveIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  liveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 12,
  },
  viewerCount: {
    color: '#fff',
    fontSize: 12,
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#000',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255,0,0,0.5)',
  },
  controlButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  endButton: {
    backgroundColor: '#ff0000',
    width: 80,
  },
});
