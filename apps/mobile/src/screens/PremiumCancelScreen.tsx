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
import { useTheme } from "@mobile/src/theme";
import type { RootStackParamList } from "../navigation/types";

const PremiumCancelScreen = (): React.JSX.Element => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleTryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Premium");
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#e2e8f0"]}
      style={styles.backgroundGradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="close-circle" size={80} color={theme.colors.danger} />
          </View>

          <Text
            style={StyleSheet.flatten([styles.title, { color: colors.onSurface}])}
          >
            Payment Cancelled
          </Text>

          <Text
            style={StyleSheet.flatten([
              styles.subtitle,
              { color: colors.onMuted },
            ])}
          >
            No worries! Your payment was cancelled and you weren't charged. You
            can try again anytime.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ])}
               testID="PremiumCancelScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleTryAgain}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.secondaryButton,
                { borderColor: colors.primary },
              ])}
               testID="PremiumCancelScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleGoBack}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.secondaryButtonText,
                  { color: colors.primary },
                ])}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default PremiumCancelScreen;
