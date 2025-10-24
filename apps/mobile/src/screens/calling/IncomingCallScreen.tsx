import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CallData } from '../../services/WebRTCService';

interface IncomingCallScreenProps {
  callData: CallData;
  onAnswer: () => void;
  onReject: () => void;
}

export default function IncomingCallScreen({ 
  callData, 
  onAnswer, 
  onReject 
}: IncomingCallScreenProps) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start pulsing animation for incoming call
    const pulseAnimation = Animated.loop(
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
      ])
    );

    // Slide in animation
    const slideAnimation = Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    pulseAnimation.start();
    slideAnimation.start();

    // Vibration pattern for incoming call
    const vibrationPattern = [0, 1000, 500, 1000, 500];
    Vibration.vibrate(vibrationPattern, true);

    return () => {
      pulseAnimation.stop();
      Vibration.cancel();
    };
  }, []);

  const handleAnswer = () => {
    Vibration.cancel();
    onAnswer();
  };

  const handleReject = () => {
    Vibration.cancel();
    onReject();
  };

  const formatCallType = (type: string) => {
    return type === 'video' ? 'Video Call' : 'Voice Call';
  };

  return (
    <View style={styles.container} testID="incoming-call-container">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.backgroundGradient}
      />

      {/* Blur Overlay */}
      <BlurView intensity={20} style={styles.blurOverlay} />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.incomingCallText}>Incoming Call</Text>
          <Text style={styles.callTypeText}>{formatCallType(callData.callType)}</Text>
        </Animated.View>

        {/* Caller Info */}
        <Animated.View 
          style={[
            styles.callerInfo,
            {
              transform: [{
                scale: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }
          ]}
        >
          {/* Avatar with pulsing effect */}
          <Animated.View 
            style={[
              styles.avatarContainer,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <View style={styles.avatarRing}>
              <Image
                source={
                  callData.callerAvatar != null && callData.callerAvatar !== ''
                    ? { uri: callData.callerAvatar }
                    : require('../../assets/default-avatar.png')
                }
                style={styles.avatar}
                testID="caller-avatar"
              />
            </View>
          </Animated.View>

          <Text style={styles.callerName}>{callData.callerName}</Text>
          <Text style={styles.callerSubtext}>PawfectMatch</Text>
        </Animated.View>

        {/* Call Actions */}
        <Animated.View 
          style={[
            styles.actionsContainer,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })
              }]
            }
          ]}
        >
          {/* Reject Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            activeOpacity={0.8}
            testID="reject-button"
          >
            <LinearGradient
              colors={['#ff4757', '#ff3838']}
              style={styles.buttonGradient}
            >
              <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Answer Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.answerButton]}
            onPress={handleAnswer}
            activeOpacity={0.8}
            testID="answer-button"
          >
            <LinearGradient
              colors={['#2ed573', '#1dd1a1']}
              style={styles.buttonGradient}
            >
              <Ionicons name="call" size={32} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Additional Actions */}
        <Animated.View 
          style={[
            styles.additionalActions,
            {
              opacity: slideAnim,
            }
          ]}
        >
          <TouchableOpacity style={styles.additionalButton}>
            <Ionicons name="chatbubble" size={24} color="#fff" />
            <Text style={styles.additionalButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.additionalButton}>
            <Ionicons name="person" size={24} color="#fff" />
            <Text style={styles.additionalButtonText}>Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  blurOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  incomingCallText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 5,
  },
  callTypeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.6,
  },
  callerInfo: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatarRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 92,
    backgroundColor: '#ddd',
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  callerSubtext: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 50,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rejectButton: {},
  answerButton: {},
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  additionalButton: {
    alignItems: 'center',
    padding: 15,
  },
  additionalButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.8,
  },
});
