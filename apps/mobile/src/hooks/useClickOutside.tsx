/**
 * useClickOutside Hook - React Native Version
 *
 * Universal hook for implementing click-outside-to-close pattern in React Native
 * Works with TouchableWithoutFeedback and PanResponder for comprehensive touch handling
 */
import { useEffect, RefObject } from 'react';
import { TouchableWithoutFeedback, PanResponder, View } from 'react-native';

export function useClickOutside(
  ref: RefObject<View>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !ref.current) return;

    // Create PanResponder for comprehensive touch handling
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (evt) => {
        // Check if touch is outside the ref
        if (ref.current) {
          ref.current.measure((x, y, width, height, pageX, pageY) => {
            const touchX = evt.nativeEvent.pageX;
            const touchY = evt.nativeEvent.pageY;

            // Check if touch is outside the component bounds
            if (
              touchX < pageX ||
              touchX > pageX + width ||
              touchY < pageY ||
              touchY > pageY + height
            ) {
              handler();
            }
          });
        }
      },
    });

    // Store the responder on the ref for cleanup
    (ref as RefObject<View & { _panResponder?: ReturnType<typeof PanResponder.create> }>).current!._panResponder = panResponder;

    return () => {
      if ((ref as RefObject<View & { _panResponder?: ReturnType<typeof PanResponder.create> }>).current?._panResponder) {
        (ref as RefObject<View & { _panResponder?: ReturnType<typeof PanResponder.create> }>).current!._panResponder = null;
      }
    };
  }, [ref, handler, enabled]);

  // Return a wrapper component for easier usage
  return {
    TouchableWrapper: ({ children, style, ...props }: {
      children: React.ReactNode;
      style?: any;
      [key: string]: any;
    }) => (
      <TouchableWithoutFeedback
        onPress={handler}
        disabled={!enabled}
        {...props}
      >
        <View style={style} ref={ref}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    ),
  };
}

// Alternative simpler version for basic use cases
export function useClickOutsideSimple(
  ref: RefObject<View>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleTouch = (event: { nativeEvent?: { pageX: number; pageY: number }; pageX?: number; pageY?: number }) => {
      if (ref.current) {
        ref.current.measure((x, y, width, height, pageX, pageY) => {
          const touchX = event.nativeEvent?.pageX ?? event.pageX;
          const touchY = event.nativeEvent?.pageY ?? event.pageY;

          // Check if touch is outside the component bounds
          if (
            touchX < pageX ||
            touchX > pageX + width ||
            touchY < pageY ||
            touchY > pageY + height
          ) {
            handler();
          }
        });
      }
    };

    // This is a simplified approach - for production, consider using react-native-modal or similar
    return () => {
      // Cleanup if needed
    };
  }, [ref, handler, enabled]);
}
