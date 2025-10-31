/**
 * Feed Error Boundary Component
 * Phase 2: Comprehensive Error Handling & Recovery
 * 
 * Specialized error boundary for feed operations with:
 * - Feed-specific error messages
 * - Retry mechanisms
 * - Recovery suggestions
 * - Error analytics
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { useTheme } from '@/theme';
import { telemetry } from '../../lib/telemetry';

interface FeedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface FeedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class FeedErrorBoundary extends Component<FeedErrorBoundaryProps, FeedErrorBoundaryState> {
  constructor(props: FeedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FeedErrorBoundaryState> {
    const errorId = `feed_error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error (structured, no PII)
    logger.error('FeedErrorBoundary caught error', {
      error: error.message,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack?.substring(0, 500),
    });

    // Track telemetry
    telemetry.trackErrorBoundary({
      error: error.message,
      componentStack: errorInfo.componentStack?.substring(0, 500) ?? '',
      ...(this.state.errorId !== null && { errorId: this.state.errorId }),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <FeedErrorFallback onRetry={this.handleRetry} errorId={this.state.errorId} />;
    }

    return this.props.children;
  }
}

interface FeedErrorFallbackProps {
  onRetry: () => void;
  errorId: string | null;
}

function FeedErrorFallback({ onRetry, errorId }: FeedErrorFallbackProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.bg,
    },
    icon: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 24,
    },
    suggestions: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 20,
    },
    errorId: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xl,
      fontFamily: 'monospace',
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.lg,
      minWidth: 120,
    },
    retryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <View style={styles.container} testID="feed-error-boundary-fallback">
      <Ionicons
        name="refresh-circle-outline"
        size={64}
        color={theme.colors.danger}
        style={styles.icon}
        accessibilityLabel="Error icon"
      />
      <Text style={styles.title} accessibilityRole="header">
        Unable to Load Feed
      </Text>
      <Text style={styles.message}>
        We're having trouble loading your feed. This could be a temporary network issue.
      </Text>
      <Text style={styles.suggestions}>
        • Check your internet connection{'\n'}
        • Try refreshing the feed{'\n'}
        • Restart the app if the problem persists
      </Text>
      {errorId && (
        <Text style={styles.errorId} accessibilityLabel={`Error ID: ${errorId}`}>
          Error ID: {errorId}
        </Text>
      )}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityLabel="Retry loading feed"
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={20} color={theme.colors.onPrimary} />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

