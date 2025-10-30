import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { Text } from './Text';
import { Card } from './Card';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
  testID?: string;
}

export function Toast({
  message,
  variant = 'info',
  duration = 3000,
  onDismiss,
  position = 'top',
  testID,
}: ToastProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    if (reduceMotion) {
      translateY.value = 0;
      opacity.value = 1;
    } else {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: 200 });
    }

    // Auto dismiss
    const timer = setTimeout(() => {
      if (reduceMotion) {
        translateY.value = -100;
        opacity.value = 0;
      } else {
        translateY.value = withSpring(
          position === 'top' ? -100 : 100,
          {
            damping: 20,
            stiffness: 300,
          }
        );
        opacity.value = withTiming(0, { duration: 200 });
      }

      setTimeout(() => onDismiss?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss, position, reduceMotion, translateY, opacity]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          icon: '✓',
          textColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.danger,
          icon: '✕',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          icon: '⚠',
          textColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.primary,
          icon: 'ℹ',
          textColor: theme.colors.onPrimary,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: position === 'top' ? 20 : undefined,
          bottom: position === 'bottom' ? 20 : undefined,
          zIndex: 1700,
        },
        animatedStyle,
      ]}
      testID={testID}
      pointerEvents="box-none"
    >
      <Card
        style={{
          backgroundColor: variantStyles.backgroundColor,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radii.lg,
          ...theme.shadows.md,
        }}
      >
        <View style={styles.content}>
          <Text
            style={{
              color: variantStyles.textColor,
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            {variantStyles.icon}
          </Text>
          <Text
            variant="body"
            tone="text"
            style={{
              color: variantStyles.textColor,
              marginLeft: theme.spacing.sm,
              flex: 1,
            }}
          >
            {message}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = React.useState<
    Array<ToastProps & { id: string }>
  >([]);

  const showToast = (props: Omit<ToastProps, 'onDismiss'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = {
      ...props,
      id,
      onDismiss: () => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const success = (message: string, duration?: number) => {
    showToast({ message, variant: 'success', duration });
  };

  const error = (message: string, duration?: number) => {
    showToast({ message, variant: 'error', duration });
  };

  const warning = (message: string, duration?: number) => {
    showToast({ message, variant: 'warning', duration });
  };

  const info = (message: string, duration?: number) => {
    showToast({ message, variant: 'info', duration });
  };

  return {
    success,
    error,
    warning,
    info,
    toasts,
  };
}

// Toast Container Component
export function ToastContainer({ toasts }: { toasts: Array<ToastProps & { id: string }> }) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>
  );
}
