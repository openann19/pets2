import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { useReduceMotion } from '../../../hooks/useReducedMotion';
import { Card } from './Card';
import { Text } from './Text';

const AnimatedView = Animated.createAnimatedComponent(View);

export type SheetPosition = 'bottom' | 'top' | 'center';
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  position?: SheetPosition;
  size?: SheetSize;
  title?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  dismissible?: boolean;
}

const sizeMap: Record<SheetSize, number> = {
  sm: 0.3,
  md: 0.5,
  lg: 0.7,
  xl: 0.85,
  full: 0.95,
};

export function Sheet({
  visible,
  onClose,
  position = 'bottom',
  size = 'md',
  title,
  children,
  showCloseButton = true,
  dismissible = true,
}: SheetProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);
  const overlayOpacity = useSharedValue(0);

  const sizeRatio = sizeMap[size];

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      overlayOpacity.value = withTiming(1, { duration: reduceMotion ? 0 : 200 });
    } else {
      translateY.value = screenHeight;
      overlayOpacity.value = withTiming(0, { duration: reduceMotion ? 0 : 200 });
    }
  }, [visible, screenHeight, reduceMotion, translateY, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const getSheetAnimation = () => {
    if (reduceMotion) {
      return {};
    }

    if (position === 'bottom') {
      return {
        transform: [{ translateY: translateY.value }],
      };
    }

    return {};
  };

  const animatedStyle = useAnimatedStyle(getSheetAnimation);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissible ? onClose : undefined}
        />

        <AnimatedView
          style={[
            styles.sheet,
            {
              position: position === 'bottom' ? 'absolute' : undefined,
              bottom: position === 'bottom' ? 0 : undefined,
              height: position === 'bottom' ? screenHeight * sizeRatio : undefined,
              maxHeight: screenHeight * 0.95,
            },
            animatedStyle,
          ]}
        >
          <Card
            style={{
              flex: 1,
              borderTopLeftRadius: theme.radius['2xl'],
              borderTopRightRadius: theme.radius['2xl'],
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            {title && (
              <View style={styles.header}>
                <Text variant="h4">{title}</Text>
                {showCloseButton && (
                  <Pressable onPress={onClose} hitSlop={8}>
                    <Text style={{ fontSize: 24 }}>✕</Text>
                  </Pressable>
                )}
              </View>
            )}
            {children}
          </Card>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
