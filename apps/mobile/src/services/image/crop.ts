// apps/mobile/src/services/image/crop.ts
const EPS = 1e-3;
export const needsCrop = (sw: number, sh: number, tw: number, th: number) =>
  Math.abs(sw / sh - tw / th) > EPS;
