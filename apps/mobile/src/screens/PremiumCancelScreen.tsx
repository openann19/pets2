/**
 * Premium Subscription Cancel Screen
 * Displayed when user cancels Stripe checkout
 */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@mobile/theme";
import type { RootStackParamList } from "../navigation/types";

const PremiumCancelScreen = (): React.JSX.Element => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleTryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Premium");
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const styles = makeStyles(theme);

  return (
    <LinearGradient
      colors={theme.palette.gradients.primary}
      style={styles.backgroundGradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="close-circle" size={80} color={theme.colors.danger} />
          </View>

          <Text style={styles.title}>
            Payment Cancelled
          </Text>

          <Text style={styles.subtitle}>
            No worries! Your payment was cancelled and you weren't charged. You
            can try again anytime.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              testID="PremiumCancelScreen-try-again-button"
              accessibilityLabel="Try again"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleTryAgain}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              testID="PremiumCancelScreen-go-back-button"
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleGoBack}
            >
              <Text style={styles.secondaryButtonText}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    backgroundGradient: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
    },
    iconContainer: {
      marginBottom: theme.spacing.lg + theme.spacing.xs,
    },
    title: {
      fontSize: theme.typography.h1.size * 1.166,
      fontWeight: theme.typography.h1.weight,
      textAlign: "center",
      marginBottom: theme.spacing.md,
      color: theme.colors.onSurface,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      textAlign: "center",
      lineHeight: theme.typography.body.lineHeight * 1.5,
      marginBottom: theme.spacing['2xl'] + theme.spacing.xs,
      color: theme.colors.onMuted,
    },
    buttonContainer: {
      width: "100%",
      gap: theme.spacing.lg,
    },
    primaryButton: {
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      alignItems: "center",
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h1.weight,
    },
    secondaryButton: {
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      borderWidth: 2,
      alignItems: "center",
      backgroundColor: "transparent",
      borderColor: theme.colors.primary,
    },
    secondaryButtonText: {
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.primary,
    },
  });
}

export default PremiumCancelScreen;
