import React, {
  Suspense,
  lazy,
  type ComponentType,
  type ReactNode,
} from "react";
import { logger } from "@pawfectmatch/core";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/theme";

interface LazyScreenProps {
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Lazy Screen Wrapper Component
 * Implements P-03: Lazy-load heavy screens with React.lazy() + Suspense boundary
 * Features:
 * - Code splitting for better performance
 * - Custom loading fallbacks
 * - Error boundaries for failed loads
 * - Accessibility support
 * - Memory optimization
 */

/**
 * Default Loading Component
 */
function DefaultLoadingFallback() {
  const { colors } = useTheme();

  return (
    <View
      style={StyleSheet.flatten([
        styles.loadingContainer,
        { backgroundColor: colors.bg },
      ])}
      accessible={true}
      accessibilityLabel="Loading screen"
      accessibilityRole="progressbar"
    >
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loadingIndicator}
      />
      <Text
        style={StyleSheet.flatten([styles.loadingText, { color: colors.onSurface}])}
      >
        Loading...
      </Text>
    </View>
  );
}

/**
 * Default Error Boundary Component
 */
function DefaultErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={StyleSheet.flatten([
        styles.errorContainer,
        { backgroundColor: colors.bg },
      ])}
      accessible={true}
      accessibilityLabel="Screen failed to load"
      accessibilityRole="alert"
    >
      <Text
        style={StyleSheet.flatten([styles.errorTitle, { color: colors.onSurface}])}
      >
        Oops! Something went wrong
      </Text>
      <Text
        style={StyleSheet.flatten([
          styles.errorMessage,
          { color: colors.onSurface},
        ])}
      >
        {error.message || "Failed to load this screen"}
      </Text>
      <Text
        style={StyleSheet.flatten([
          styles.retryButton,
          { color: colors.primary },
        ])}
        onPress={retry}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading screen"
      >
        Tap to retry
      </Text>
    </View>
  );
}

/**
 * Error Boundary Class Component
 */
class LazyScreenErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error; retry: () => void }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: ReactNode;
    fallback: ComponentType<{ error: Error; retry: () => void }>;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error("LazyScreen Error:", { error, errorInfo });
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      const ErrorComponent = this.props.fallback;
      return <ErrorComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

/**
 * Create a lazy screen wrapper
 */
export const createLazyScreen = <P extends object>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  options: LazyScreenProps = {},
) => {
  const LazyComponent = lazy(importFunction);
  const LoadingFallback = options.fallback || DefaultLoadingFallback;
  const ErrorBoundary = options.errorBoundary || DefaultErrorBoundary;

  function LazyScreenWrapper(props: P) {
    return (
      <LazyScreenErrorBoundary fallback={ErrorBoundary}>
        <Suspense fallback={<LoadingFallback />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </LazyScreenErrorBoundary>
    );
  }

  // displayName will be set after component is created since LazyComponent is lazy
  if ("displayName" in LazyComponent && LazyComponent.displayName) {
    LazyScreenWrapper.displayName = `LazyScreen(${String(LazyComponent.displayName)})`;
  } else {
    LazyScreenWrapper.displayName = "LazyScreen(Component)";
  }

  return LazyScreenWrapper;
};

/**
 * Preload a lazy component
 * Useful for preloading screens the user is likely to visit
 */
export const preloadLazyScreen = (
  importFunction: () => Promise<{ default: ComponentType<any> }>,
): void => {
  // Start loading the component in the background
  importFunction().catch((error) => {
    logger.warn("Failed to preload lazy screen:", { error });
  });
};

/**
 * Hook for managing lazy screen preloading
 */
export const useLazyScreenPreloader = () => {
  const preloadScreens = React.useCallback(
    (
      importFunctions: Array<() => Promise<{ default: ComponentType<any> }>>,
    ) => {
      importFunctions.forEach((importFunction) => {
        preloadLazyScreen(importFunction);
      });
    },
    [],
  );

  return { preloadScreens };
};

// Pre-configured lazy screen creators for common heavy screens
export const LazyProfileScreen = createLazyScreen(
  () => import("../screens/ProfileScreen"),
  {
    fallback: () => {
      const { colors } = useTheme();
      return (
        <View
          style={StyleSheet.flatten([
            styles.loadingContainer,
            { backgroundColor: colors.bg },
          ])}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurface},
            ])}
          >
            Loading Profile...
          </Text>
        </View>
      );
    },
  },
);

export const LazySettingsScreen = createLazyScreen(
  () => import("../screens/SettingsScreen"),
  {
    fallback: () => {
      const { colors } = useTheme();
      return (
        <View
          style={StyleSheet.flatten([
            styles.loadingContainer,
            { backgroundColor: colors.bg },
          ])}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurface},
            ])}
          >
            Loading Settings...
          </Text>
        </View>
      );
    },
  },
);

export const LazyMatchesScreen = createLazyScreen(
  () => import("../screens/MatchesScreen"),
  {
    fallback: () => {
      const { colors } = useTheme();
      return (
        <View
          style={StyleSheet.flatten([
            styles.loadingContainer,
            { backgroundColor: colors.bg },
          ])}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurface},
            ])}
          >
            Loading Matches...
          </Text>
        </View>
      );
    },
  },
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 20,
  },
  retryButton: {
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default createLazyScreen;
