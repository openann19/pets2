import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import type { ReactNode } from 'react';
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  override render() {
    // Create a factory function for styles that can be called with theme values
    // For now, we'll use default values that match the new theme system
    const styles = makeStyles();

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
              color="#DC2626" // danger color
              style={styles.icon}
            />
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Please try again or contact support if the problem
              persists.
            </Text>

            {process.env.NODE_ENV === 'development' && this.state.error && (
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
                color="#FFFFFF"
              />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const makeStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF', // bg color
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    icon: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000', // text color
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      color: '#666666', // textMuted color
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    errorDetails: {
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      width: '100%',
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#DC2626',
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: '#DC2626',
      fontFamily: 'monospace',
      marginBottom: 8,
    },
    errorStack: {
      fontSize: 12,
      color: '#B91C1C',
      fontFamily: 'monospace',
      lineHeight: 16,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#3B82F6', // primary color
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      shadowColor: '#3B82F6',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    retryText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });
