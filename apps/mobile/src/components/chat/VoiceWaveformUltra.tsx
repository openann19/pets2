/**
 * Enhanced Voice Waveform Component with Tap-to-Seek
 * Visualizes voice message waveforms with progress tracking and seek capability
 */

import React, { useMemo } from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Theme } from "../../theme/unified-theme";

export interface VoiceWaveformProps {
  waveform: number[];       // 0..1 values
  isPlaying: boolean;
  progress: number;         // 0..1
  duration: number;         // seconds
  color?: string;
  height?: number;
  onSeek?: (p: number) => void;
}

const BAR_W = 3;
const BAR_GAP = 2;
const MIN_BAR_HEIGHT = 4;

export function VoiceWaveform({
  waveform,
  isPlaying,
  progress,
  duration,
  color = Theme.colors.primary[500],
  height = 36,
  onSeek,
}: VoiceWaveformProps): JSX.Element {
  const bars = useMemo(() => {
    return waveform.map((v, i) => {
      const played = i / Math.max(1, waveform.length - 1) <= progress;
      return (
        <View
          key={i}
          style={{
            width: BAR_W,
            marginRight: BAR_GAP,
            height,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              width: BAR_W,
              height: Math.max(MIN_BAR_HEIGHT, Math.round(v * height)),
              borderRadius: BAR_W / 2,
              backgroundColor: color,
              opacity: played ? 1 : 0.4,
            }}
          />
        </View>
      );
    });
  }, [color, height, progress, waveform]);

  const onPress = (evt: GestureResponderEvent) => {
    if (!onSeek) return;
    const { locationX, nativeEvent } = evt;
    const totalW = (BAR_W + BAR_GAP) * waveform.length;
    const p = Math.min(1, Math.max(0, locationX / totalW));
    onSeek(p);
  };

  return (
    <TouchableWithoutFeedback onPress={onSeek ? onPress : undefined}>
      <View style={[styles.row, { height }]}>{bars}</View>
    </TouchableWithoutFeedback>
  );
}

/**
 * Generate waveform data from audio buffer
 * Currently generates deterministic pseudo-waveform data
 * TODO: Implement real audio analysis when proper Audio APIs are available
 */
export function generateWaveformFromAudio(
  _buf: ArrayBuffer,
  samples = 64
): number[] {
  // Deterministic waveform generation for consistent appearance
  const seed = 1337 + samples;
  let x = seed;
  
  const rand = () =>
    (x = (1103515245 * x + 12345) % 0x80000000) / 0x80000000;
  
  const arr: number[] = [];
  for (let i = 0; i < samples; i++) {
    const v = 0.25 + 0.6 * Math.abs(Math.sin(i * 0.27)) + rand() * 0.15;
    arr.push(Math.max(0, Math.min(1, v)));
  }
  return arr;
}

/**
 * Compact waveform for inline display
 */
export function CompactVoiceWaveform({
  waveform,
  isPlaying,
  progress,
  duration,
  color = Theme.colors.primary[500],
}: Omit<VoiceWaveformProps, "height">): JSX.Element {
  return (
    <VoiceWaveform
      waveform={waveform}
      isPlaying={isPlaying}
      progress={progress}
      duration={duration}
      color={color}
      height={24}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

