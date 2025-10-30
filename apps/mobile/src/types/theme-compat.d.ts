// Global Theme compatibility for legacy components relying on `Theme.*`
// Provides a minimal, typed surface mapping to our current theme system

declare namespace ThemeCompatNS {
  type Palette = Record<number, string>;
  interface ThemeCompat {
    colors: {
      primary: Palette;
      neutral: Palette;
      status: { success: string; error: string; warning: string; info: string };
      text: { primary: string; secondary: string };
    };
  }
}

declare var Theme: ThemeCompatNS.ThemeCompat;
