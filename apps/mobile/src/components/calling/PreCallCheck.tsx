import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/Provider';
import PreCallDeviceCheckService from '../../services/PreCallDeviceCheck';
import CallTelemetryService from '../../services/CallTelemetry';
import type { DeviceCheckResult } from '../../services/PreCallDeviceCheck';

interface PreCallCheckProps {
  callType: 'voice' | 'video';
  onCheckComplete: (result: DeviceCheckResult) => void;
  onCancel: () => void;
  sessionId: string;
}

export default function PreCallCheck({
  callType,
  onCheckComplete,
  onCancel,
  sessionId,
}: PreCallCheckProps) {
  const theme = useTheme();
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<DeviceCheckResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    performDeviceCheck();
  }, []);

  const performDeviceCheck = async () => {
    setChecking(true);
    const startTime = Date.now();

    try {
      const checkResult = await PreCallDeviceCheckService.performDeviceCheck({
        requireVideo: callType === 'video',
        requireAudio: true,
        testMediaStream: true,
        networkSpeedTest: true,
      });

      const duration = Date.now() - startTime;

      // Track telemetry
      CallTelemetryService.trackDeviceCheck(sessionId, {
        timestamp: Date.now(),
        sessionId,
        checkDuration: duration,
        results: {
          networkReady: checkResult.network.connected,
          cameraReady: checkResult.camera.available && checkResult.camera.permission,
          microphoneReady: checkResult.microphone.available && checkResult.microphone.permission,
          overallReady: checkResult.overall.ready,
          warnings: checkResult.overall.warnings,
          errors: checkResult.overall.errors,
        },
        networkDetails: {
          type: checkResult.network.type,
          quality: checkResult.network.quality,
          ...(checkResult.network.bandwidth !== undefined && { bandwidth: checkResult.network.bandwidth }),
          speedTestCompleted: checkResult.network.bandwidth !== undefined,
        },
      });

      setResult(checkResult);
      setChecking(false);

      // Auto-proceed if everything is ready
      if (checkResult.overall.ready && checkResult.overall.warnings.length === 0) {
        setTimeout(() => onCheckComplete(checkResult), 1000);
      }
    } catch (error) {
      setChecking(false);
      const errorMessage = error instanceof Error ? error.message : 'Device check failed';

      CallTelemetryService.trackCallFailure(sessionId, errorMessage, 'setup');

      Alert.alert(
        'Device Check Failed',
        'Unable to verify your device is ready for calls. Please check your permissions and network connection.',
        [
          { text: 'Cancel', onPress: onCancel },
          { text: 'Retry', onPress: handleRetry },
        ],
      );
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    performDeviceCheck();
  };

  const handleProceedAnyway = () => {
    if (result) {
      onCheckComplete(result);
    }
  };

  const handleFixIssues = () => {
    if (!result) return;

    const issues = [];
    if (!result.microphone.permission) {
      issues.push('• Grant microphone permission in Settings');
    }
    if (!result.camera.permission && callType === 'video') {
      issues.push('• Grant camera permission in Settings');
    }
    if (!result.network.connected) {
      issues.push('• Check your internet connection');
    }

    Alert.alert('Fix These Issues', issues.join('\n'), [
      { text: 'Cancel', onPress: onCancel },
      { text: 'Retry Check', onPress: handleRetry },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: 20,
      justifyContent: 'center' as const,
    },
    header: {
      alignItems: 'center' as const,
      marginBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
      marginBottom: 8,
      textAlign: 'center' as const,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center' as const,
    },
    checkingContainer: {
      alignItems: 'center' as const,
      marginVertical: 40,
    },
    checkingText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      marginTop: 16,
    },
    resultsContainer: {
      marginVertical: 20,
    },
    checkItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    checkIcon: {
      marginRight: 12,
    },
    checkText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    checkSubtext: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginTop: 2,
    },
    warningsContainer: {
      marginTop: 20,
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#fff3cd',
      borderColor: '#ffeaa7',
      borderWidth: 1,
    },
    warningTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: '#856404',
      marginBottom: 8,
    },
    warningText: {
      fontSize: 14,
      color: '#856404',
      marginBottom: 4,
    },
    errorsContainer: {
      marginTop: 20,
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#f8d7da',
      borderColor: '#f5c6cb',
      borderWidth: 1,
    },
    errorTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: '#721c24',
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: '#721c24',
      marginBottom: 4,
    },
    actionsContainer: {
      marginTop: 40,
      gap: 12,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center' as const,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center' as const,
    },
    secondaryButtonText: {
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    dangerButton: {
      backgroundColor: theme.colors.danger,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center' as const,
    },
    dangerButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
  });

  const renderCheckItem = (label: string, status: boolean, error?: string, subtext?: string) => (
    <View style={styles.checkItem}>
      <Ionicons
        name={status ? 'checkmark-circle' : 'close-circle'}
        size={24}
        color={status ? theme.colors.success : theme.colors.danger}
        style={styles.checkIcon}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.checkText}>{label}</Text>
        {error && (
          <Text style={[styles.checkSubtext, { color: theme.colors.danger }]}>{error}</Text>
        )}
        {subtext && <Text style={styles.checkSubtext}>{subtext}</Text>}
      </View>
    </View>
  );

  if (checking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Preparing Your Call</Text>
          <Text style={styles.subtitle}>Checking your device and network connectivity...</Text>
        </View>

        <View style={styles.checkingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={styles.checkingText}>
            {retryCount > 0 ? `Retrying... (${retryCount})` : 'Running checks...'}
          </Text>
        </View>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Check Failed</Text>
          <Text style={styles.subtitle}>Unable to verify device readiness</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRetry}
          >
            <Text style={styles.primaryButtonText}>Retry Check</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onCancel}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {result.overall.ready ? 'Ready to Call!' : 'Issues Detected'}
        </Text>
        <Text style={styles.subtitle}>
          {result.overall.ready
            ? 'Your device is ready for the call'
            : 'Please fix the issues below to continue'}
        </Text>
      </View>

      <View style={styles.resultsContainer}>
        {renderCheckItem(
          'Network Connection',
          result.network.connected,
          result.network.error,
          result.network.connected
            ? `${result.network.type} - ${result.network.quality} quality`
            : undefined,
        )}

        {renderCheckItem(
          'Microphone',
          result.microphone.available && result.microphone.permission,
          result.microphone.error,
          result.microphone.devices
            ? `${result.microphone.devices.length} device(s) found`
            : undefined,
        )}

        {callType === 'video' &&
          renderCheckItem(
            'Camera',
            result.camera.available && result.camera.permission,
            result.camera.error,
            result.camera.devices ? `${result.camera.devices.length} device(s) found` : undefined,
          )}
      </View>

      {result.overall.warnings.length > 0 && (
        <View style={styles.warningsContainer}>
          <Text style={styles.warningTitle}>Warnings</Text>
          {result.overall.warnings.map((warning, index) => (
            <Text
              key={index}
              style={styles.warningText}
            >
              • {warning}
            </Text>
          ))}
        </View>
      )}

      {result.overall.errors.length > 0 && (
        <View style={styles.errorsContainer}>
          <Text style={styles.errorTitle}>Issues Found</Text>
          {result.overall.errors.map((error, index) => (
            <Text
              key={index}
              style={styles.errorText}
            >
              • {error}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.actionsContainer}>
        {result.overall.ready ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleProceedAnyway}
          >
            <Text style={styles.primaryButtonText}>Start Call</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleFixIssues}
            >
              <Text style={styles.dangerButtonText}>Fix Issues</Text>
            </TouchableOpacity>

            {result.overall.errors.length === 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleProceedAnyway}
              >
                <Text style={styles.secondaryButtonText}>Continue Anyway</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onCancel}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
