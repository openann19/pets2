export const COLORS = {
  bg: "#0B0F14",
  card: "rgba(255,255,255,0.06)",
  text: "#E6EDF3",
  brand: "#7C4DFF",
  accent: "#00E5FF",
};
export const RADIUS = { sm: 10, md: 16, lg: 24, xl: 32 };
export const SHADOW = { soft: "0 8px 30px rgba(0,0,0,0.25)" };
export type Tokens = { COLORS: typeof COLORS; RADIUS: typeof RADIUS; SHADOW: typeof SHADOW; };
export const TOKENS: Tokens = { COLORS, RADIUS, SHADOW };
