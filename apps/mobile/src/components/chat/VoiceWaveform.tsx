/**
 * Voice Waveform Component
 * Visualizes voice message waveforms with animations and seek support
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';

export interface VoiceWaveformProps {
  waveform: number[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  color?: string;
  height?: number;
  onSeek?: (pos01: number) => void;
}

const BAR_WIDTH = 3;
const BAR_GAP = 2;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 40;

import { useTheme } from "@mobile/src/theme";

export function VoiceWaveform({
  waveform,
  isPlaying,
  progress,
  duration,
  color,
  height = 40,
  onSeek,
}: VoiceWaveformProps): JSX.Element {
  const theme = useTheme();
  const effectiveColor = color ?? theme.colors.primary;
  const [containerWidth, setContainerWidth] = useState(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const animatedValues = useRef(
    waveform.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [isPlaying]);

  const startAnimation = () => {
    if (animationRef.current) {
      return;
    }

    const animations = animatedValues.current.map((animatedValue, index) => {
      const targetValue = waveform[index] || 0;
      return Animated.timing(animatedValue, {
        toValue: targetValue,
        duration: 150 + Math.random() * 100,
        useNativeDriver: true,
      });
    });

    const animation = Animated.loop(
      Animated.stagger(50, animations)
    );

    animationRef.current = animation;
    animation.start();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  };

  const calculateBarHeight = (value: number): number => {
    return MIN_HEIGHT + (value * (MAX_HEIGHT - MIN_HEIGHT));
  };

  const renderBar = (index: number, value: number) => {
    const animatedValue = animatedValues.current[index];
    if (!animatedValue) return null;
    
    const barHeight = calculateBarHeight(value);

    const animatedStyle = {
      height: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [MIN_HEIGHT, barHeight],
      }),
      opacity: animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.6, 1],
      }),
    };

    // Progress indicator - mark played portion
    const isPlayed = index / waveform.length <= progress;

    return (
      <Animated.View
        key={index}
        style={[
          styles.bar,
          {
            width: BAR_WIDTH,
            marginRight: BAR_GAP,
            maxHeight: height,
            backgroundColor: effectiveColor,
            opacity: isPlayed ? 1 : 0.5,
          },
          animatedStyle,
        ]}
      />
    );
  };

  const renderWaveform = () => {
    if (!containerWidth) {
      return null;
    }

    const barsPerView = Math.floor(containerWidth / (BAR_WIDTH + BAR_GAP));
    const visibleWaveform = waveform.slice(0, barsPerView);

    return visibleWaveform.map((value, index) => renderBar(index, value));
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.waveform, { height }]}
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
        onStartShouldSetResponder={() => !!onSeek}
        onResponderGrant={(e) => {
          if (!onSeek) return;
          const x = e.nativeEvent.locationX;
          const pct = Math.max(0, Math.min(1, x / containerWidth));
          onSeek(pct);
        }}
        onResponderMove={(e) => {
          if (!onSeek) return;
          const x = e.nativeEvent.locationX;
          const pct = Math.max(0, Math.min(1, x / containerWidth));
          onSeek(pct);
        }}
      >
        {renderWaveform()}
      </View>
    </View>
  );
}

/**
 * Compact waveform for inline display
 */
export function CompactVoiceWaveform({
  waveform,
  isPlaying,
  progress,
  duration,
  color,
  onSeek,
}: VoiceWaveformProps): JSX.Element {
  return (
    <VoiceWaveform
      waveform={waveform}
      isPlaying={isPlaying}
      progress={progress}
      duration={duration}
      color={color}
      height={24}
      onSeek={onSeek}
    />
  );
}

/**
 * Generate waveform data from audio buffer
 */
export function generateWaveformFromAudio(
  audioBuffer: ArrayBuffer,
  samples = 50
): number[] {
  // This would normally analyze audio samples
  // For now, generate mock data
  const waveform: number[] = [];
  
  for (let i = 0; i < samples; i++) {
    // Generate realistic-looking waveform data
    const value = Math.random() * 0.5 + 0.3 + Math.sin(i * 0.5) * 0.2;
    waveform.push(Math.max(0, Math.min(1, value)));
  }
  
  return waveform;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    borderRadius: BAR_WIDTH / 2,
  },
});
