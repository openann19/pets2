import { StyleSheet, Dimensions, Platform } from "react-native";

import { Typography, Spacing, BorderRadius } from "./GlobalStyles";

const { width: screenWidth } = Dimensions.get("window");

// === ELITE DARK THEME COLORS ===
export const ColorsDark = {
  // Primary Palette
  primary: "#a78bfa",
  primaryLight: "#d8b4fe",
  primaryDark: "#6b21a8",

  // Secondary Palette
  secondary: "#f472b6",
  secondaryLight: "#f9a8d4",
  secondaryDark: "#9d174d",

  // Accent Colors
  accent: "#38bdf8",
  accentLight: "#60a5fa",
  accentDark: "#0284c7",

  // Success & Status
  success: "#22c55e",
  warning: "#fbbf24",
  error: "#f87171",
  info: "#60a5fa",

  // Neutral Palette
  white: "#f3f4f6",
  black: "#111827",
  gray50: "#1f2937",
  gray100: "#111827",
  gray200: "#1e293b",
  gray300: "#273449",
  gray400: "#374151",
  gray500: "#4b5563",
  gray600: "#6b7280",
  gray700: "#9ca3af",
  gray800: "#d1d5db",
  gray900: "#f9fafb",

  // Glassmorphic Colors
  glassWhite: "rgba(255,255,255,0.05)",
  glassWhiteLight: "rgba(255,255,255,0.1)",
  glassWhiteDark: "rgba(255,255,255,0.2)",
  glassDark: "rgba(0,0,0,0.8)",
  glassDarkMedium: "rgba(0,0,0,0.6)",
  glassDarkStrong: "rgba(0,0,0,0.4)",

  // Background Gradients
  gradientPrimary: ["#1f2937", "#111827", "#0f172a"],
  gradientSecondary: ["#111827", "#1e293b", "#273449"],
  gradientAccent: ["#0c4a6e", "#0369a1", "#38bdf8"],
  gradientSuccess: ["#064e3b", "#047857", "#22c55e"],
  gradientWarning: ["#78350f", "#b45309", "#fbbf24"],
  gradientError: ["#7f1d1d", "#b91c1c", "#f87171"],

  // Additional UI Colors
  background: "#111827",
  surface: "#1f2937",
  text: "#f9fafb",
  textSecondary: "#9ca3af",
  border: "#374151",
  borderLight: "#273449",
  card: "#1f2937",
  tertiary: "#374151",
  inverse: "#f9fafb",
};

// Dark Theme Shadows
export const ShadowsDark = {
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 14,
  },
  "2xl": {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 18,
  },

  // Colored Shadows for Dark Theme
  primaryShadow: {
    shadowColor: ColorsDark.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  secondaryShadow: {
    shadowColor: ColorsDark.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const GlobalStylesDark = StyleSheet.create({
  // === CONTAINERS ===
  container: {
    flex: 1,
    backgroundColor: ColorsDark.gray100,
    position: "relative",
  },
  safeArea: {
    flex: 1,
    backgroundColor: ColorsDark.gray100,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    minHeight: "100%",
  },

  // === GLASSMORPHIC BACKGROUNDS ===
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassContainer: {
    backgroundColor: ColorsDark.glassDark,
    borderWidth: 1,
    borderColor: ColorsDark.glassDarkMedium,
    overflow: "hidden",
  },
  glassBlur: {
    backgroundColor: ColorsDark.glassDarkMedium,
    borderWidth: 1,
    borderColor: ColorsDark.glassDarkStrong,
    overflow: "hidden",
  },

  // === HEADERS ===
  header: {
    alignItems: "center",
    marginBottom: Spacing["6xl"],
  },
  headerBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === "ios" ? 0 : 24,
    borderBottomWidth: 0.5,
    borderBottomColor: ColorsDark.glassWhite,
    backgroundColor: ColorsDark.glassDark,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 60,
  },
  logoContainer: {
    borderRadius: BorderRadius["2xl"],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
    backgroundColor: ColorsDark.glassWhiteDark,
  },

  // === TYPOGRAPHY ===
  logo: {
    fontSize: Typography.sizes["3xl"],
    fontWeight: Typography.weights.extrabold,
    color: ColorsDark.primary,
    textAlign: "center",
  },
  title: {
    fontSize: Typography.sizes["4xl"],
    fontWeight: Typography.weights.extrabold,
    color: ColorsDark.white,
    textAlign: "center",
    marginBottom: Spacing.lg,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: ColorsDark.gray400,
    textAlign: "center",
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
    paddingHorizontal: Spacing["2xl"],
    fontWeight: Typography.weights.medium,
  },
  heading1: {
    fontSize: Typography.sizes["3xl"],
    fontWeight: Typography.weights.bold,
    color: ColorsDark.white,
    letterSpacing: Typography.letterSpacing.tight,
  },
  heading2: {
    fontSize: Typography.sizes["2xl"],
    fontWeight: Typography.weights.bold,
    color: ColorsDark.white,
  },
  heading3: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: ColorsDark.gray700,
  },
  bodyLarge: {
    fontSize: Typography.sizes.lg,
    color: ColorsDark.gray600,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.normal,
    fontWeight: Typography.weights.medium,
  },
  body: {
    fontSize: Typography.sizes.base,
    color: ColorsDark.gray600,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  bodySmall: {
    fontSize: Typography.sizes.sm,
    color: ColorsDark.gray500,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  caption: {
    fontSize: Typography.sizes.xs,
    color: ColorsDark.gray400,
    fontWeight: Typography.weights.medium,
  },

  // === CARDS ===
  card: {
    backgroundColor: ColorsDark.gray200,
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    ...ShadowsDark.lg,
  },
  cardGlass: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    ...ShadowsDark.primaryShadow,
  },
  cardContent: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: ColorsDark.glassWhiteLight,
  },

  // === BUTTONS ===
  buttonPrimary: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    backgroundColor: ColorsDark.primary,
    ...ShadowsDark.md,
  },
  buttonSecondary: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    backgroundColor: ColorsDark.gray300,
    borderWidth: 2,
    borderColor: ColorsDark.primary,
    ...ShadowsDark.sm,
  },
  buttonGhost: {
    borderRadius: BorderRadius["2xl"],
    backgroundColor: "transparent",
  },
  buttonContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    textAlign: "center",
  },
  buttonTextPrimary: {
    color: ColorsDark.white,
  },
  buttonTextSecondary: {
    color: ColorsDark.primary,
  },

  // === INPUTS ===
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: ColorsDark.gray700,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: ColorsDark.gray200,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
    color: ColorsDark.white,
    borderWidth: 1,
    borderColor: ColorsDark.gray400,
    ...ShadowsDark.sm,
  },
  inputFocused: {
    borderColor: ColorsDark.primary,
    backgroundColor: ColorsDark.gray300,
    ...ShadowsDark.md,
  },
  inputError: {
    borderColor: ColorsDark.error,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },

  // === LISTS ===
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  listItem: {
    backgroundColor: ColorsDark.gray200,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...ShadowsDark.sm,
  },
  listItemPressed: {
    backgroundColor: ColorsDark.gray300,
    ...ShadowsDark.md,
  },

  // === MODALS & OVERLAYS ===
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  modalContent: {
    backgroundColor: ColorsDark.gray200,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["3xl"],
    width: "100%",
    maxWidth: screenWidth - Spacing["4xl"],
    ...ShadowsDark["2xl"],
  },

  // === AVATARS & IMAGES ===
  avatar: {
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: ColorsDark.primary,
    ...ShadowsDark.md,
  },
  avatarSmall: {
    width: 32,
    height: 32,
  },
  avatarMedium: {
    width: 48,
    height: 48,
  },
  avatarLarge: {
    width: 64,
    height: 64,
  },

  // === STATUS INDICATORS ===
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  badgeSuccess: {
    backgroundColor: ColorsDark.success,
  },
  badgeWarning: {
    backgroundColor: ColorsDark.warning,
  },
  badgeError: {
    backgroundColor: ColorsDark.error,
  },
  badgeInfo: {
    backgroundColor: ColorsDark.info,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: ColorsDark.white,
  },

  // === LOADING STATES ===
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["4xl"],
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: ColorsDark.gray400,
    marginTop: Spacing.lg,
    textAlign: "center",
  },

  // === EMPTY STATES ===
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["4xl"],
  },
  emptyTitle: {
    fontSize: Typography.sizes["2xl"],
    fontWeight: Typography.weights.bold,
    color: ColorsDark.white,
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: Typography.sizes.base,
    color: ColorsDark.gray400,
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing["3xl"],
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },

  // === UTILITY CLASSES ===
  flexRow: {
    flexDirection: "row",
  },
  flexColumn: {
    flexDirection: "column",
  },
  alignCenter: {
    alignItems: "center",
  },
  alignStart: {
    alignItems: "flex-start",
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  justifyAround: {
    justifyContent: "space-around",
  },
  textCenter: {
    textAlign: "center",
  },
  textLeft: {
    textAlign: "left",
  },
  textRight: {
    textAlign: "right",
  },

  // === SPACING UTILITIES ===
  mt0: { marginTop: 0 },
  mt1: { marginTop: Spacing.xs },
  mt2: { marginTop: Spacing.sm },
  mt3: { marginTop: Spacing.md },
  mt4: { marginTop: Spacing.lg },
  mt5: { marginTop: Spacing.xl },
  mt6: { marginTop: Spacing["2xl"] },
  mt8: { marginTop: Spacing["4xl"] },

  mb0: { marginBottom: 0 },
  mb1: { marginBottom: Spacing.xs },
  mb2: { marginBottom: Spacing.sm },
  mb3: { marginBottom: Spacing.md },
  mb4: { marginBottom: Spacing.lg },
  mb5: { marginBottom: Spacing.xl },
  mb6: { marginBottom: Spacing["2xl"] },
  mb8: { marginBottom: Spacing["4xl"] },

  mx0: { marginHorizontal: 0 },
  mx1: { marginHorizontal: Spacing.xs },
  mx2: { marginHorizontal: Spacing.sm },
  mx3: { marginHorizontal: Spacing.md },
  mx4: { marginHorizontal: Spacing.lg },
  mx5: { marginHorizontal: Spacing.xl },
  mx6: { marginHorizontal: Spacing["2xl"] },

  p0: { padding: 0 },
  p1: { padding: Spacing.xs },
  p2: { padding: Spacing.sm },
  p3: { padding: Spacing.md },
  p4: { padding: Spacing.lg },
  p5: { padding: Spacing.xl },
  p6: { padding: Spacing["2xl"] },
  p8: { padding: Spacing["4xl"] },

  px0: { paddingHorizontal: 0 },
  px1: { paddingHorizontal: Spacing.xs },
  px2: { paddingHorizontal: Spacing.sm },
  px3: { paddingHorizontal: Spacing.md },
  px4: { paddingHorizontal: Spacing.lg },
  px5: { paddingHorizontal: Spacing.xl },
  px6: { paddingHorizontal: Spacing["2xl"] },

  py0: { paddingVertical: 0 },
  py1: { paddingVertical: Spacing.xs },
  py2: { paddingVertical: Spacing.sm },
  py3: { paddingVertical: Spacing.md },
  py4: { paddingVertical: Spacing.lg },
  py5: { paddingVertical: Spacing.xl },
  py6: { paddingVertical: Spacing["2xl"] },
});

export default GlobalStylesDark;
