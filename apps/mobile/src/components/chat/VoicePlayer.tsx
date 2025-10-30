import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { VoiceWaveform } from './VoiceWaveform';

type Props = {
  uri: string;
  durationSec?: number;
  waveform?: number[];
  onError?: (e: Error) => void;
  testID?: string;
};

export function VoicePlayer({ uri, durationSec, waveform, onError, testID }: Props) {
  const theme = useTheme();
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number>(durationSec ?? 0);

  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const { sound: s } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
      sound.current = s;

      s.setOnPlaybackStatusUpdate((st: any) => {
        if (!st.isLoaded) return;
        const d = st.durationMillis ? st.durationMillis / 1000 : (durationSec ?? 0);
        setDuration(d);
        const p = st.positionMillis && d ? st.positionMillis / 1000 / d : 0;
        setProgress(Math.max(0, Math.min(1, p)));
        setPlaying(st.isPlaying);
      });
    })().catch((e) => onError?.(e));

    return () => {
      sound.current?.unloadAsync().catch(() => {});
    };
  }, [uri]);

  const toggle = useCallback(async () => {
    if (!sound.current) return;
    const st = await sound.current.getStatusAsync();
    if (!('isLoaded' in st) || !st.isLoaded) return;
    if (st.isPlaying) {
      await sound.current.pauseAsync();
    } else {
      await sound.current.playAsync();
    }
  }, []);

  const onSeek = useCallback(
    async (pos01: number) => {
      if (!sound.current || !duration) return;
      const targetMs = pos01 * duration * 1000;
      try {
        await sound.current.setPositionAsync(targetMs);
      } catch {}
    },
    [duration],
  );

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <View
      style={S.root}
      testID={testID ?? 'voice-player'}
    >
      <TouchableOpacity
        onPress={toggle}
        style={S.playBtn}
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={18}
          color="#fff"
        />
      </TouchableOpacity>

      <View style={S.waveWrap}>
        <VoiceWaveform
          waveform={waveform ?? new Array(60).fill(0.6)}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          onSeek={onSeek}
          height={28}
          color={theme.colors.primary}
        />
      </View>

      <Text style={S.time}>{format(progress * (duration || 0))}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveWrap: { flex: 1 },
  time: {
    width: 48,
    textAlign: 'right',
    opacity: 0.7,
    fontVariant: ['tabular-nums'] as any,
  },
});
