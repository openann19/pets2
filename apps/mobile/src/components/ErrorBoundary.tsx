import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import type { ReactNode } from 'react';
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '@/theme';
import type { AppTheme } from '@/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('ErrorBoundary caught an error:', { error, errorInfo });
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    return (
      <ThemeContext.Consumer>
        {(theme: AppTheme) => {
          const styles = makeStyles(theme);

          if (this.state.hasError) {
            if (this.props.fallback) {
              return this.props.fallback;
            }

            return (
              <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                  <Ionicons
                    name="warning"
                    size={64}
                    color={theme.colors.danger}
                    style={styles.icon}
                  />
                  <Text style={styles.title}>Oops! Something went wrong</Text>
                  <Text style={styles.message}>
                    We encountered an unexpected error. Please try again or contact support if the problem
                    persists.
                  </Text>

                  {process.env['NODE_ENV'] === 'development' && this.state.error && (
                    <View style={styles.errorDetails}>
                      <Text style={styles.errorTitle}>Error Details (Development):</Text>
                      <Text style={styles.errorText}>{this.state.error.message}</Text>
                      {this.state.errorInfo && (
                        <Text style={styles.errorStack}>{this.state.errorInfo.componentStack}</Text>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={this.handleRetry}
                  >
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={theme.colors.onPrimary}
                    />
                    <Text style={styles.retryText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            );
          }

          return this.props.children;
        }}
      </ThemeContext.Consumer>
    );
  }
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    icon: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 24,
    },
    errorDetails: {
      backgroundColor: theme.utils.alpha(theme.colors.danger, 0.15),
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      width: '100%',
      borderWidth: 1,
      borderColor: theme.utils.alpha(theme.colors.danger, 0.4),
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.danger,
      marginBottom: theme.spacing.sm,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.danger,
      fontFamily: 'monospace',
      marginBottom: theme.spacing.sm,
    },
    errorStack: {
      fontSize: 12,
      color: theme.colors.danger,
      fontFamily: 'monospace',
      lineHeight: 16,
      opacity: 0.8,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    retryText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
  });
