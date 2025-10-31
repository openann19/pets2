/**
 * Ultra Crop Overlay
 * Professional crop overlay with multiple guides, aspect ratios, safe text zones, and inertial re-center
 *
 * Features:
 * - Multiple aspect ratios (1:1, 4:5, 9:16, 3:2)
 * - Composition guides: thirds, golden ratio, diagonals, eye-line
 * - Safe text zone (bottom 15% for story/reel captions)
 * - Interactive drag with inertia and bounce
 * - Minimal visual clutter
 */

import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, Text } from 'react-native';

export type Ratio = '1:1' | '4:5' | '9:16' | '3:2';

interface CropOverlayUltraProps {
  ratio?: Ratio;
  showGuides?: boolean;
  showSafeText?: boolean;
  onDragEnd?: (offset: { x: number; y: number }) => void;
}

export function CropOverlayUltra({
  ratio = '4:5',
  showGuides = true,
  showSafeText = true,
  onDragEnd,
}: CropOverlayUltraProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const velRef = useRef({ vx: 0, vy: 0 });

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          setOffset({ x: g.dx, y: g.dy });
          velRef.current = { vx: g.vx, vy: g.vy };
        },
        onPanResponderRelease: () => {
          // Inertial decay + bounce
          const start = Date.now();
          const dur = 450;
          const { vx, vy } = velRef.current;
          const ox = offset.x;
          const oy = offset.y;

          const tick = () => {
            const t = Math.min(1, (Date.now() - start) / dur);
            const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setOffset({
              x: ox + vx * 120 * (1 - e),
              y: oy + vy * 120 * (1 - e),
            });

            if (t < 1) {
              requestAnimationFrame(tick);
            } else {
              onDragEnd?.({ x: offset.x, y: offset.y });
            }
          };

          requestAnimationFrame(tick);
        },
      }),
    [offset, onDragEnd],
  );

  const guideLines = showGuides ? (
    <>
      {/* Rule of thirds */}
      <View style={[styles.line, { left: '33.33%' }]} />
      <View style={[styles.line, { left: '66.66%' }]} />
      <View style={[styles.hline, { top: '33.33%' }]} />
      <View style={[styles.hline, { top: '66.66%' }]} />

      {/* Golden ratio (approx 38.2/61.8) */}
      <View style={[styles.line, { left: '38.2%', opacity: 0.35 }]} />
      <View style={[styles.line, { left: '61.8%', opacity: 0.35 }]} />
      <View style={[styles.hline, { top: '38.2%', opacity: 0.35 }]} />
      <View style={[styles.hline, { top: '61.8%', opacity: 0.35 }]} />

      {/* Diagonals */}
      <View style={styles.diagA} />
      <View style={styles.diagB} />

      {/* Eye-line (top third) */}
      <View style={[styles.hline, { top: '28%', opacity: 0.25 }]} />
    </>
  ) : null;

  const safeText = showSafeText ? (
    <View
      pointerEvents="none"
      style={styles.safeZone}
    />
  ) : null;

  const box = ratioToBox(ratio);

  return (
    <View
      style={styles.wrap}
      {...pan.panHandlers}
    >
      <View
        style={[
          styles.frame,
          box,
          {
            transform: [{ translateX: offset.x }, { translateY: offset.y }],
          },
        ]}
      >
        {guideLines}
        {safeText}
      </View>
    </View>
  );
}

/**
 * Badge overlay for auto-straighten angle and HDR clipping warning
 */
export function CropBadges({ angleDeg, hdrWarning }: { angleDeg?: number; hdrWarning?: boolean }) {
  return (
    <View
      style={styles.badgeWrap}
      pointerEvents="none"
    >
      {typeof angleDeg === 'number' && Math.abs(angleDeg) > 0.3 && (
        <View style={[styles.badge, { backgroundColor: 'rgba(14,165,233,0.85)' }]}>
          <Text style={styles.badgeTxt}>
            {angleDeg > 0 ? '↶' : '↷'} {Math.abs(angleDeg).toFixed(1)}°
          </Text>
        </View>
      )}
      {hdrWarning && (
        <View style={[styles.badge, { backgroundColor: 'rgba(239,68,68,0.9)' }]}>
          <Text style={styles.badgeTxt}>HDR CLIP</Text>
        </View>
      )}
    </View>
  );
}

const ratioToBox = (ratio: string) => {
  switch (ratio) {
    case '1:1':
      return { aspectRatio: 1 / 1 };
    case '4:5':
      return { aspectRatio: 4 / 5 };
    case '9:16':
      return { aspectRatio: 9 / 16 };
    case '3:2':
      return { aspectRatio: 3 / 2 };
    default:
      return { aspectRatio: 1 };
  }
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    position: 'relative',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  hline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  diagA: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '45deg' }],
  },
  diagB: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '45deg' }],
  },
  safeZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '15%',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  badgeWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTxt: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
