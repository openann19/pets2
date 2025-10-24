declare module 'canvas-confetti' {
  export type ConfettiOptions = {
    particleCount?: number;
    spread?: number;
    origin?: { x: number; y: number };
    colors?: string[];
    ticks?: number;
    gravity?: number;
    decay?: number;
    startVelocity?: number;
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    [key: string]: unknown;
  };

  interface ConfettiFn {
    (options?: ConfettiOptions): void;
  }

  const confetti: ConfettiFn;
  export default confetti;
}
