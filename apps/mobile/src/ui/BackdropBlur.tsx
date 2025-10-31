/**
 * 🎯 UI: BACKDROP BLUR OVERLAY
 * 
 * Global backdrop blur component that activates when overlays are shown
 * Respects accessibility settings, quality tier, and feature flags
 */

import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View, AccessibilityInfo } from 'react-native';
import { BlurView } from 'expo-blur';

import { useFlags } from '@/foundation/flags/useFlags';
import { useQualityTier } from '@/foundation/quality/useQualityTier';
import { useReducedMotion } from '@/foundation/reduceMotion';
import { useOverlayState } from '@/foundation/overlay/overlayState';
import { telemetry } from '@/lib/telemetry';
import { TELEMETRY_EVENTS, type BackdropEventPayload } from '@/constants/events';

/**
 * BackdropBlur Component
 * 
 * Shows a blurred overlay when any modal/sheet/toast/notification is active
 * Automatically handles platform differences, accessibility, and performance scaling
 */
export function BackdropBlur(): React.JSX.Element | null {
  const flags = useFlags();
  const { blurScale } = useQualityTier();
  const reducedMotion = useReducedMotion();
  const isActive = useOverlayState((state) => state.isActive());
  const wasActiveRef = useRef(false);
  const [reduceTransparency, setReduceTransparency] = React.useState(false);

  // Check for Reduce Transparency accessibility setting
  useEffect(() => {
    let mounted = true;
    
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceTransparency(!!enabled);
        }
      })
      .catch(() => {
        // If API not available, assume false
        if (mounted) {
          setReduceTransparency(false);
        }
      });

    // Listen for changes (if supported)
    const sub: any = AccessibilityInfo.addEventListener?.('reduceTransparencyChanged', (enabled: boolean) => {
      if (mounted) {
        setReduceTransparency(!!enabled);
      }
    });

    return () => {
      mounted = false;
      if (sub?.remove) {
        sub.remove();
      }
    };
  }, []);

  // Track telemetry when backdrop state changes
  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      // Backdrop just became active
      telemetry.trackEvent(TELEMETRY_EVENTS.UI_BACKDROP_SHOWN, {
        reason: 'overlay',
      } as BackdropEventPayload);
      wasActiveRef.current = true;
    } else if (!isActive && wasActiveRef.current) {
      // Backdrop just became inactive
      telemetry.trackEvent(TELEMETRY_EVENTS.UI_BACKDROP_HIDDEN, {
        reason: 'overlay',
      } as BackdropEventPayload);
      wasActiveRef.current = false;
    }
  }, [isActive]);

  // Early return if feature disabled or no overlay active
  if (!flags['ui.backdropBlur'] || !isActive) {
    return null;
  }

  // Calculate blur amount with quality tier and reduced motion scaling
  const baseAmount = flags['ui.backdropBlur.amount'] ?? 24;
  const scaledAmount = Math.round(
    baseAmount * blurScale * (reducedMotion ? 0.7 : 1)
  );

  // Clamp to valid range
  const amount = Math.max(0, Math.min(100, scaledAmount));

  // Get tint from flags
  const tint = flags['ui.backdropBlur.tint'] ?? 'dark';

  // Fallback dimmed scrim if blur not supported or transparency reduced
  const fallbackScrim = (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: 'rgba(10, 10, 15, 0.35)',
        },
      ]}
    />
  );

  // Use fallback if transparency is reduced or blur amount is too low
  if (reduceTransparency || amount < 5) {
    return fallbackScrim;
  }

  // iOS: Use expo-blur with native blur effect
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={amount}
        tint={tint}
        reducedTransparencyFallbackColor="rgba(10, 10, 15, 0.35)"
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      />
    );
  }

  // Android: Try to use blur, fallback to dim if not supported
  try {
    return (
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={amount}
        tint={tint === 'dark' ? 'dark' : 'light'}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      />
    );
  } catch (error) {
    // If blur fails on Android, use fallback
    return fallbackScrim;
  }
}

