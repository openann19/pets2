// apps/mobile/src/theme/guards.d.ts
import type { ThemeLike } from './resolve';
declare module './Provider' {
  // This ensures colors.primary is a string, not an indexable scale
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface __ThemeGuard extends Pick<ThemeLike['colors'], 'primary'> {}
}

