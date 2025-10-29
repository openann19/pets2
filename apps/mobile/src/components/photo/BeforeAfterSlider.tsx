import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Theme } from '../../theme/unified-theme';
import { SmartImage } from '../common/SmartImage';

const { width: SCREEN_W } = Dimensions.get('window');

interface BeforeAfterSliderProps {
  originalUri: string;
  editedUri: string;
  onClose: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUri,
  editedUri,
  onClose,
}) => {
  const trackW = SCREEN_W;
  const x = useSharedValue(trackW * 0.5);

  // haptic ticks @ 0/50/100%
  const lastTick = React.useRef(-1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(trackW, x.value + (e as any).changeX));
      x.value = nx;
      const p = Math.round((nx / trackW) * 4); // 0..4
      if (p !== lastTick.current) {
        lastTick.current = p;
        Haptics.selectionAsync();
      }
    })
    .onEnd(() => {
      // slight snap to edges/center if close
      const p = x.value / trackW;
      if (Math.abs(p - 0.5) < 0.04) x.value = withSpring(trackW * 0.5);
      else if (p < 0.04) x.value = withSpring(0);
      else if (p > 0.96) x.value = withSpring(trackW);
      lastTick.current = -1;
    });

  const editedStyle = useAnimatedStyle(() => ({
    width: x.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    left: x.value - 18,
  }));

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Background tap to close */}
      <View style={StyleSheet.absoluteFill} onTouchEnd={onClose} />

      <View style={styles.stage}>
        {/* ORIGINAL (full) */}
        <SmartImage source={{ uri: originalUri }} style={StyleSheet.absoluteFill} rounded={0} />

        {/* EDITED (clipped to divider) */}
        <Animated.View style={[StyleSheet.absoluteFill, editedStyle, { overflow: 'hidden' }]>
          <SmartImage source={{ uri: editedUri }} style={StyleSheet.absoluteFill} rounded={0} />
        </Animated.View>

        {/* Labels */}
        <View style={[styles.badge, { left: 12 }]>
          <BlurView intensity={30} style={styles.badgeInner}>
            <Text style={styles.badgeText}>Before</Text>
          </BlurView>
        </View>
        <View style={[styles.badge, { right: 12 }]>
          <BlurView intensity={30} style={styles.badgeInner}>
            <Text style={styles.badgeText}>After</Text>
          </BlurView>
        </View>

        {/* Handle */}
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.handle, handleStyle]}>
            <View style={styles.handleBar} />
            <View style={styles.handleKnob}>
              <Ionicons name="swap-horizontal" size={16} color="white" />
            </View>
            <View style={styles.handleBar} />
          </Animated.View>
        </GestureDetector>

        {/* Close pill */}
        <View style={styles.closePill}>
          <BlurView intensity={30} style={styles.closeInner}>
            <Ionicons name="close" size={18} color="white" />
            <Text style={styles.closeText}>Close compare</Text>
          </BlurView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  stage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: { width: 2, height: '20%', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 },
  handleKnob: {
    width: 36, height: 36, borderRadius: 18, marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  badge: { position: 'absolute', top: 12 },
  badgeInner: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)' },
  badgeText: { color: 'white', fontWeight: '700', fontSize: 12 },
  closePill: { position: 'absolute', bottom: 16, alignSelf: 'center' },
  closeInner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  closeText: { color: 'white', fontWeight: '700', fontSize: 12 },
});

