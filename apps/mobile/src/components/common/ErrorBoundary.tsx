/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 * 
 * Features:
 * - Friendly error messages
 * - Structured error logging (no PII)
 * - Telemetry integration
 * - Retry functionality
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { useTheme } from '@mobile/theme';
import { telemetry } from '../../lib/telemetry';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  screenName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error (structured, no PII)
    logger.error('ErrorBoundary caught error', {
      error: error.message,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack?.substring(0, 500), // Limit length
      screenName: this.props.screenName,
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
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback onRetry={this.handleRetry} errorId={this.state.errorId} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRetry: () => void;
  errorId: string | null;
}

function ErrorFallback({ onRetry, errorId }: ErrorFallbackProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    icon: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    message: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
      lineHeight: theme.typography.body.lineHeight,
    },
    errorId: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xl,
      fontFamily: 'monospace',
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    retryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
  });

  return (
    <View style={styles.container} testID="error-boundary-fallback">
      <Ionicons
        name="alert-circle"
        size={64}
        color={theme.colors.danger}
        style={styles.icon}
        accessibilityLabel="Error icon"
      />
      <Text style={styles.title} accessibilityRole="header">
        Oops! Something went wrong
      </Text>
      <Text style={styles.message}>
        We encountered an unexpected error. Don't worry, your data is safe. Please try again.
      </Text>
      {errorId && (
        <Text style={styles.errorId} accessibilityLabel={`Error ID: ${errorId}`}>
          Error ID: {errorId}
        </Text>
      )}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityLabel="Retry"
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={20} color={theme.colors.onPrimary} />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

