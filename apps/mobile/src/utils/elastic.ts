// Elastic / rubber-band helpers for pan & zoom
// Use these *during* gesture updates for resistance, then spring to hard clamps on end.

export function rubberClamp(
  value: number,
  min: number,
  max: number,
  coeff = 0.55, // 0..1 (lower = stiffer)
) {
  if (value < min) return min - (min - value) * coeff;
  if (value > max) return max + (value - max) * coeff;
  return value;
}

// Elastic mapping for scale (apply during pinch updates)
export function rubberScale(raw: number, min: number, max: number, coeff = 0.55) {
  if (raw < min) return min - (min - raw) * coeff;
  if (raw > max) return max + (raw - max) * coeff;
  return raw;
}

// Hard clamp for end-of-gesture snaps
export function hardClamp(value: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}
