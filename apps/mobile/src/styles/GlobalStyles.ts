import { StyleSheet, Dimensions, Platform } from "react-native";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
} from "@pawfectmatch/design-tokens";

// Lazy load dimensions to avoid issues in test environment
const getScreenDimensions = () => {
  try {
    return Dimensions.get("window");
  } catch (_error) {
    // Fallback for test environment
    return { width: 375, height: 812 };
  }
};

const { width: screenWidth, height: screenHeight } = getScreenDimensions();

// Legacy color mappings for backward compatibility
const Colors = {
  // Primary Palette
  primary: COLORS.primary[500],
  primaryLight: COLORS.primary[400],
  primaryDark: COLORS.primary[700],

  // Secondary Palette
  secondary: COLORS.secondary[500],
  secondaryLight: COLORS.secondary[400],
  secondaryDark: COLORS.secondary[700],

  // Accent Colors
  accent: COLORS.info[500],
  accentLight: COLORS.info[400],
  accentDark: COLORS.info[700],

  // Success & Status
  success: COLORS.success[500],
  warning: COLORS.warning[500],
  error: COLORS.error[500],
  info: COLORS.info[500],

  // Neutral Palette
  white: COLORS.neutral[0],
  black: COLORS.neutral[900],
  gray50: COLORS.neutral[50],
  gray100: COLORS.neutral[100],
  gray200: COLORS.neutral[200],
  gray300: COLORS.neutral[300],
  gray400: COLORS.neutral[400],
  gray500: COLORS.neutral[500],
  gray600: COLORS.neutral[600],
  gray700: COLORS.neutral[700],
  gray800: COLORS.neutral[800],
  gray900: COLORS.neutral[900],

  // Glassmorphic Colors (using gradients)
  glassWhite: "rgba(255,255,255,0.9)",
  glassWhiteLight: "rgba(255,255,255,0.7)",
  glassWhiteDark: "rgba(255,255,255,0.3)",
  glassDark: "rgba(0,0,0,0.1)",
  glassDarkMedium: "rgba(0,0,0,0.2)",
  glassDarkStrong: "rgba(0,0,0,0.3)",

  // Background Gradients (using design tokens)
  gradientPrimary: [
    COLORS.primary[50],
    COLORS.primary[100],
    COLORS.primary[200],
  ],
  gradientSecondary: [
    COLORS.secondary[50],
    COLORS.secondary[100],
    COLORS.secondary[200],
  ],
  gradientAccent: [COLORS.info[50], COLORS.info[100], COLORS.info[200]],
  gradientSuccess: [
    COLORS.success[50],
    COLORS.success[100],
    COLORS.success[200],
  ],
  gradientWarning: [
    COLORS.warning[50],
    COLORS.warning[100],
    COLORS.warning[200],
  ],
  gradientError: [COLORS.error[50], COLORS.error[100], COLORS.error[200]],

  // Additional UI Colors
  background: COLORS.neutral[0],
  surface: COLORS.neutral[50],
  text: COLORS.neutral[900],
  textSecondary: COLORS.neutral[600],
  border: COLORS.neutral[200],
  borderLight: COLORS.neutral[100],
};

// Legacy typography mappings
const Typography = {
  weights: TYPOGRAPHY.fontWeights,
  sizes: {
    xs: parseFloat(TYPOGRAPHY.fontSizes.xs),
    sm: parseFloat(TYPOGRAPHY.fontSizes.sm),
    base: parseFloat(TYPOGRAPHY.fontSizes.base),
    lg: parseFloat(TYPOGRAPHY.fontSizes.lg),
    xl: parseFloat(TYPOGRAPHY.fontSizes.xl),
    "2xl": parseFloat(TYPOGRAPHY.fontSizes["2xl"]),
    "3xl": parseFloat(TYPOGRAPHY.fontSizes["3xl"]),
    "4xl": parseFloat(TYPOGRAPHY.fontSizes["4xl"]),
    "5xl": parseFloat(TYPOGRAPHY.fontSizes["5xl"]),
    "6xl": parseFloat(TYPOGRAPHY.fontSizes["6xl"]),
  },
  lineHeights: {
    tight: parseFloat(TYPOGRAPHY.lineHeights.tight),
    normal: parseFloat(TYPOGRAPHY.lineHeights.normal),
    relaxed: parseFloat(TYPOGRAPHY.lineHeights.relaxed),
  },
  letterSpacing: {
    tight: parseFloat(TYPOGRAPHY.letterSpacing.tight),
    normal: parseFloat(TYPOGRAPHY.letterSpacing.normal),
    wide: parseFloat(TYPOGRAPHY.letterSpacing.wide),
  },
};

// Legacy spacing mappings
const Spacing = {
  xs: parseFloat(SPACING[1]),
  sm: parseFloat(SPACING[2]),
  md: parseFloat(SPACING[3]),
  lg: parseFloat(SPACING[4]),
  xl: parseFloat(SPACING[5]),
  "2xl": parseFloat(SPACING[6]),
  "3xl": parseFloat(SPACING[8]),
  "4xl": parseFloat(SPACING[12]),
  "5xl": parseFloat(SPACING[16]),
  "6xl": parseFloat(SPACING[20]),
  "7xl": parseFloat(SPACING[24]),
  "8xl": parseFloat(SPACING[32]),
};

// Legacy border radius mappings
const BorderRadius = {
  none: parseFloat(RADIUS.none),
  sm: parseFloat(RADIUS.sm),
  md: parseFloat(RADIUS.md),
  lg: parseFloat(RADIUS.lg),
  xl: parseFloat(RADIUS.xl),
  "2xl": parseFloat(RADIUS["2xl"]),
  "3xl": parseFloat(RADIUS["3xl"]),
  full: parseFloat(RADIUS.full),
};

// Legacy shadows mappings (converted from CSS to React Native format)
const Shadows = {
  sm: {
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  "2xl": {
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },

  // Colored Shadows
  primaryShadow: {
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  secondaryShadow: {
    shadowColor: COLORS.secondary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

// === ELITE GLOBAL STYLES ===
export const GlobalStyles = StyleSheet.create({
  // === CONTAINERS ===
  container: {
    flex: 1,
    position: "relative",
  },
  safeArea: {
    flex: 1,
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
    backgroundColor: Colors.glassWhite,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
    overflow: "hidden",
  },
  glassBlur: {
    backgroundColor: Colors.glassWhiteLight,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
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
    borderBottomColor: Colors.glassDark,
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
    backgroundColor: Colors.glassWhiteDark,
  },

  // === TYPOGRAPHY ===
  logo: {
    fontSize: Typography.sizes["3xl"],
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
    textAlign: "center",
  },
  title: {
    fontSize: Typography.sizes["4xl"],
    fontWeight: Typography.weights.extrabold,
    color: Colors.gray800,
    textAlign: "center",
    marginBottom: Spacing.lg,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
    paddingHorizontal: Spacing["2xl"],
    fontWeight: Typography.weights.medium,
  },
  heading1: {
    fontSize: Typography.sizes["3xl"],
    fontWeight: Typography.weights.bold,
    color: Colors.gray800,
    letterSpacing: Typography.letterSpacing.tight,
  },
  heading2: {
    fontSize: Typography.sizes["2xl"],
    fontWeight: Typography.weights.bold,
    color: Colors.gray800,
  },
  heading3: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray700,
  },
  bodyLarge: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray600,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.normal,
    fontWeight: Typography.weights.medium,
  },
  body: {
    fontSize: Typography.sizes.base,
    color: Colors.gray600,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  bodySmall: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray500,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  caption: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray400,
    fontWeight: Typography.weights.medium,
  },

  // === CARDS ===
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    ...Shadows.lg,
  },
  cardGlass: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    ...Shadows.primaryShadow,
  },
  cardContent: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.glassWhiteLight,
  },

  // === BUTTONS ===
  buttonPrimary: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    ...Shadows.md,
  },
  buttonSecondary: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.sm,
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
    color: Colors.white,
  },
  buttonTextSecondary: {
    color: Colors.primary,
  },

  // === INPUTS ===
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
    color: Colors.gray800,
    borderWidth: 1,
    borderColor: Colors.gray200,
    ...Shadows.sm,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    ...Shadows.md,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: "#fef2f2",
  },

  // === LISTS ===
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  listItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  listItemPressed: {
    backgroundColor: Colors.gray50,
    ...Shadows.md,
  },

  // === MODALS & OVERLAYS ===
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["3xl"],
    width: "100%",
    maxWidth: screenWidth - Spacing["4xl"],
    ...Shadows["2xl"],
  },

  // === AVATARS & IMAGES ===
  avatar: {
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.md,
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
    backgroundColor: Colors.success,
  },
  badgeWarning: {
    backgroundColor: Colors.warning,
  },
  badgeError: {
    backgroundColor: Colors.error,
  },
  badgeInfo: {
    backgroundColor: Colors.info,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
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
    color: Colors.gray500,
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
    color: Colors.gray700,
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.gray500,
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

// === ANIMATION CONFIGS ===
export const AnimationConfigs = {
  spring: {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
  },
  springGentle: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },
  springBouncy: {
    damping: 15,
    stiffness: 500,
    mass: 0.6,
  },
  timing: {
    duration: 600,
    easing: "bezier(0.4, 0, 0.2, 1)" as const,
  },
  timingFast: {
    duration: 300,
    easing: "bezier(0.4, 0, 0.2, 1)" as const,
  },
  timingSlow: {
    duration: 800,
    easing: "bezier(0.4, 0, 0.2, 1)" as const,
  },
};

// === DEVICE UTILITIES ===
export const Device = {
  width: screenWidth,
  height: screenHeight,
  isSmall: screenWidth < 375,
  isMedium: screenWidth >= 375 && screenWidth < 414,
  isLarge: screenWidth >= 414,
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
};

// Export utility objects for use by other files (e.g., DarkTheme.ts)
export { Typography, Spacing, BorderRadius, Shadows };

export default GlobalStyles;
