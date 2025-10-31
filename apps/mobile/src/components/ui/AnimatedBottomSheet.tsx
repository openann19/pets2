/**
 * 🎯 ANIMATED BOTTOM SHEET COMPONENT
 * 
 * Reusable animated bottom sheet using foundation springs and magnetic gestures
 * Supports snap points, momentum-based animations, and haptic feedback
 * 
 * Phase 2: Advanced Gestures - Part of animation enhancement plan
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, runOnUI } from 'react-native-reanimated';
import { useMagneticGesture } from '@/hooks/gestures/useMagneticGesture';
import type { MagneticGestureResult } from '@/hooks/gestures/useMagneticGesture';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { withSpring } from 'react-native-reanimated';
import { springs } from '@/foundation/motion';
import type { SharedValue } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface AnimatedBottomSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Callback when sheet is dismissed */
  onDismiss: () => void;
  /** Children to render inside the sheet */
  children: React.ReactNode;
  /** Snap points as fractions of screen height (0-1) */
  snapPoints?: number[];
  /** Initial snap point index */
  initialSnapIndex?: number;
  /** Enable backdrop */
  enableBackdrop?: boolean;
  /** Backdrop opacity */
  backdropOpacity?: number;
  /** Enable haptic feedback */
  hapticOnSnap?: boolean;
  /** Sheet background color */
  backgroundColor?: string;
  /** Sheet border radius */
  borderRadius?: number;
  /** Show handle indicator */
  showHandle?: boolean;
  /** Custom style */
  style?: View['props']['style'];
}

/**
 * Animated bottom sheet component with magnetic snap points
 * 
 * @example
 * ```tsx
 * const [visible, setVisible] = useState(false);
 * 
 * <AnimatedBottomSheet
 *   visible={visible}
 *   onDismiss={() => setVisible(false)}
 *   snapPoints={[0.5, 0.9]}
 *   initialSnapIndex={0}
 * >
 *   <View>
 *     <Text>Sheet Content</Text>
 *   </View>
 * </AnimatedBottomSheet>
 * ```
 */
export function AnimatedBottomSheet({
  visible,
  onDismiss,
  children,
  snapPoints = [0.5, 0.9],
  initialSnapIndex = 0,
  enableBackdrop = true,
  backdropOpacity = 0.5,
  hapticOnSnap = true,
  backgroundColor,
  borderRadius,
  showHandle = true,
  style,
}: AnimatedBottomSheetProps): React.JSX.Element | null {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  
  // Convert snap points from fractions to pixels
  const snapPointsPx = useMemo(
    () => snapPoints.map(point => SCREEN_HEIGHT * (1 - point)),
    [snapPoints]
  );
  
  // Magnetic gesture hook
  const magneticGesture: MagneticGestureResult = useMagneticGesture({
    snapPoints: snapPointsPx,
    snapThreshold: 50,
    velocityThreshold: 500,
    hapticOnSnap,
    springConfig: undefined, // Use default from hook
    axis: 'y',
  });
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { gesture, animatedStyle, position } = magneticGesture;
  const positionRef = useRef<SharedValue<number>>(position);
  
  // Update ref when position changes (but not during render)
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  
  // Initialize position to initial snap point
  useEffect(() => {
    if (visible && snapPointsPx[initialSnapIndex] !== undefined) {
      const targetPosition = snapPointsPx[initialSnapIndex];
      if (targetPosition !== undefined) {
        // Use runOnUI to modify SharedValue safely
        runOnUI(() => {
          'worklet';
          positionRef.current.value = withSpring(targetPosition, springs.gentle);
        })();
      }
    }
  }, [visible, initialSnapIndex, snapPointsPx]);
  
  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    if (reduceMotion) {
      onDismiss();
      return;
    }
    
    // Animate to bottom and dismiss
    runOnUI(() => {
      'worklet';
      positionRef.current.value = withSpring(SCREEN_HEIGHT, springs.snappy);
    })();
    
    // Dismiss after animation
    setTimeout(() => {
      onDismiss();
    }, 300);
  }, [onDismiss, reduceMotion]);
  
  // Backdrop animated style
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = visible ? backdropOpacity : 0;
    return {
      opacity: reduceMotion ? (visible ? backdropOpacity : 0) : opacity,
    };
  });
  
  // Sheet styles
  const styles = useMemo(() => makeStyles(theme, backgroundColor, borderRadius), [
    theme,
    backgroundColor,
    borderRadius,
  ]);
  
  if (!visible) {
    return null;
  }
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        {enableBackdrop && (
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          </TouchableWithoutFeedback>
        )}
        
        {/* Sheet */}
        <GestureDetector gesture={gesture}>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Animated.View style={[styles.sheet, animatedStyle, style]}>
            {/* Handle indicator */}
            {showHandle && <View style={styles.handle} />}
            
            {/* Content */}
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

function makeStyles(
  theme: AppTheme,
  backgroundColor?: string,
  borderRadius?: number
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'black',
    },
    sheet: {
      backgroundColor: backgroundColor || theme.colors.surface,
      borderTopLeftRadius: borderRadius || theme.radii['2xl'],
      borderTopRightRadius: borderRadius || theme.radii['2xl'],
      maxHeight: SCREEN_HEIGHT * 0.95,
      paddingBottom: Platform.OS === 'ios' ? 0 : theme.spacing.md,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(theme.shadows?.lg || {}),
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
  });
}

export default AnimatedBottomSheet;
