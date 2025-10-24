/**
 * Biometric Setup Component
 * Component for setting up and managing biometric authentication
 */

import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBiometric } from '../../hooks/useBiometric';

interface BiometricSetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export default function BiometricSetup({
  onComplete,
  onSkip,
  showSkip = true,
}: BiometricSetupProps) {
  const {
    isAvailable,
    isEnabled,
    isInitialized,
    biometryType,
    isLoading,
    error,
    enableBiometric,
    disableBiometric,
    authenticate,
    refreshState,
  } = useBiometric();

  const [isToggling, setIsToggling] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      refreshState();
    }
  }, [isInitialized, refreshState]);

  const handleToggleBiometric = async () => {
    setIsToggling(true);

    try {
      if (isEnabled) {
        const success = await disableBiometric();
        if (success) {
          setShowDemo(false);
        }
      } else {
        const success = await enableBiometric();
        if (success) {
          setShowDemo(true);
        }
      }
    } catch (error) {
      logger.error('Error toggling biometric:', { error });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDemoAuth = async () => {
    try {
      const result = await authenticate('Demo authentication');
      if (result.success) {
        Alert.alert(
          'Success!',
          'Biometric authentication is working correctly.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleComplete = () => {
    onComplete?.();
  };

  const handleSkip = () => {
    onSkip?.();
  };

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Setting up biometric authentication...</Text>
        </View>
      </View>
    );
  }

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <Ionicons name="finger-print" size={80} color="#ccc" />
          <Text style={styles.title}>Biometric Not Available</Text>
          <Text style={styles.subtitle}>
            Biometric authentication is not available on this device.
            You can still use the app with your password.
          </Text>
          <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={biometryType === 'Face ID' ? 'face-id' : 'finger-print'}
                size={60}
                color="#fff"
              />
            </View>
            <Text style={styles.title}>Enable {biometryType}</Text>
            <Text style={styles.subtitle}>
              Use {biometryType} for faster and more secure authentication
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
              <Text style={styles.featureText}>Enhanced Security</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="flash" size={24} color="#fff" />
              <Text style={styles.featureText}>Quick Access</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="lock-closed" size={24} color="#fff" />
              <Text style={styles.featureText}>Secure Storage</Text>
            </View>
          </View>

          {/* Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Enable {biometryType}</Text>
            <Switch
              value={isEnabled}
              onValueChange={handleToggleBiometric}
              disabled={isToggling}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Error Message */}
          {error ? <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#ff4757" />
            <Text style={styles.errorText}>{error}</Text>
          </View> : null}

          {/* Demo Section */}
          {isEnabled && showDemo ? <BlurView intensity={20} style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Try it out!</Text>
            <Text style={styles.demoDescription}>
              Test your {biometryType} authentication
            </Text>
            <TouchableOpacity style={styles.demoButton} onPress={handleDemoAuth}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.demoButtonGradient}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.demoButtonText}>Demo Authentication</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView> : null}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {showSkip ? <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity> : null}

            <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isEnabled ? 'Continue' : 'Set Up Later'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4757',
    marginLeft: 8,
    flex: 1,
  },
  demoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  demoButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  demoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  demoButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtons: {
    marginTop: 'auto',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
