'use client'

/**
 * 🔥 SOUND KIT — P2 (Optional)
 * Lightweight sound effects for UI interactions
 * ‑ Lazy loading • Volume control • Mute support
 */

import { useCallback, useRef, useState, useEffect } from 'react';

export interface SoundKitOptions {
  volume?: number; // 0-1
  muted?: boolean;
}

export interface Sound {
  play: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
}

/**
 * Simple sound manager without external dependencies
 * Uses Web Audio API for precise control
 */
export function useSoundKit(options: SoundKitOptions = {}) {
  const [muted, setMuted] = useState(options.muted ?? false);
  const [volume, setVolume] = useState(options.volume ?? 0.5);
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize AudioContext lazily
  const getContext = useCallback(() => {
    if (!audioContext.current && typeof window !== 'undefined') {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  // Create oscillator-based sounds (no external files needed)
  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      if (muted) return;

      const ctx = getContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.value = volume;

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    },
    [muted, volume, getContext]
  );

  // Preset sounds
  const sounds = {
    tap: useCallback(() => playTone(800, 0.05, 'sine'), [playTone]),
    success: useCallback(() => {
      playTone(523.25, 0.1, 'sine'); // C5
      setTimeout(() => playTone(659.25, 0.15, 'sine'), 100); // E5
    }, [playTone]),
    error: useCallback(() => {
      playTone(200, 0.1, 'sawtooth');
      setTimeout(() => playTone(150, 0.15, 'sawtooth'), 100);
    }, [playTone]),
    notification: useCallback(() => {
      playTone(880, 0.08, 'sine'); // A5
      setTimeout(() => playTone(1046.5, 0.12, 'sine'), 80); // C6
    }, [playTone]),
    click: useCallback(() => playTone(1200, 0.03, 'square'), [playTone]),
    hover: useCallback(() => playTone(600, 0.02, 'sine'), [playTone]),
  };

  return {
    sounds,
    muted,
    setMuted,
    volume,
    setVolume,
    playTone,
  };
}

/**
 * Sound toggle button component
 */
export function SoundToggle() {
  const { muted, setMuted } = useSoundKit();

  return (
    <button
      onClick={() => setMuted(!muted)}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

/**
 * Example: Button with sound
 */
export function SoundButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const { sounds } = useSoundKit();

  const handleClick = () => {
    sounds.tap();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={sounds.hover}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Note: For production with actual sound files, use Howler.js:
 * 
 * ```bash
 * npm install howler
 * npm install --save-dev @types/howler
 * ```
 * 
 * ```tsx
 * import { Howl } from 'howler';
 * 
 * const sound = new Howl({
 *   src: ['/sounds/success.mp3'],
 *   volume: 0.5,
 * });
 * 
 * sound.play();
 * ```
 */
