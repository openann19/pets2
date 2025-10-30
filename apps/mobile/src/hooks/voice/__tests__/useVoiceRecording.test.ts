/**
 * Tests for useVoiceRecording hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useVoiceRecording } from '../useVoiceRecording';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Alert: { alert: jest.fn() },
}));

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      startAsync: jest.fn().mockResolvedValue(undefined),
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getURI: jest.fn().mockReturnValue('file://recording.m4a'),
      setOnRecordingStatusUpdate: jest.fn(),
    })),
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

jest.mock('../../../utils/audio/web-recorder', () => ({
  startWebRecording: jest.fn().mockResolvedValue({ mediaRecorder: null, chunks: [] }),
  stopWebRecording: jest.fn().mockResolvedValue({ blob: new Blob(), uri: 'blob://recording.webm' }),
  cleanupWebRecording: jest.fn(),
}));

describe('useVoiceRecording', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useVoiceRecording({
        backend: 'native',
        disabled: false,
        maxDurationSec: 120,
      }),
    );

    expect(result.current.isRecording).toBe(false);
    expect(result.current.durationMs).toBe(0);
    expect(result.current.previewUri).toBe(null);
    expect(result.current.processedBlob).toBe(null);
  });

  it('should start recording on native platform', async () => {
    const { result } = renderHook(() =>
      useVoiceRecording({
        backend: 'native',
        disabled: false,
        maxDurationSec: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
  });

  it('should stop recording and set preview URI', async () => {
    const { result } = renderHook(() =>
      useVoiceRecording({
        backend: 'native',
        disabled: false,
        maxDurationSec: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      await result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.previewUri).toBeTruthy();
  });

  it('should cancel recording and reset state', async () => {
    const { result } = renderHook(() =>
      useVoiceRecording({
        backend: 'native',
        disabled: false,
        maxDurationSec: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.cancelRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.previewUri).toBe(null);
    expect(result.current.durationMs).toBe(0);
  });

  it('should not start recording if disabled', async () => {
    const { result } = renderHook(() =>
      useVoiceRecording({
        backend: 'native',
        disabled: true,
        maxDurationSec: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() =>
      useVoiceRecording({
        backend: 'native',
        disabled: false,
        maxDurationSec: 120,
      }),
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.previewUri).toBe(null);
    expect(result.current.processedBlob).toBe(null);
    expect(result.current.durationMs).toBe(0);
  });
});
