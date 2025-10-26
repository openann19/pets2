/**
 * Premium Subscription Success Screen
 * Displayed after successful Stripe payment
 */

import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import type { RootStackParamList } from "../navigation/types";

const PremiumSuccessScreen = (): React.JSX.Element => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Simulate verification process
    const verifySubscription = async () => {
      // In a real app, you would verify the subscription status
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    void verifySubscription();
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("MainTabs");
  };

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
    >
      <View style={styles.content}>
        {isVerified ? (
          <>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>

            <Text
              style={StyleSheet.flatten([styles.title, { color: colors.text }])}
            >
              Welcome to Premium! 🎉
            </Text>

            <Text
              style={StyleSheet.flatten([
                styles.subtitle,
                { color: colors.textSecondary },
              ])}
            >
              Your subscription has been activated successfully. Enjoy all
              premium features!
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color="#10b981" />
                <Text
                  style={StyleSheet.flatten([
                    styles.featureText,
                    { color: colors.text },
                  ])}
                >
                  Unlimited swipes
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="eye" size={20} color="#10b981" />
                <Text
                  style={StyleSheet.flatten([
                    styles.featureText,
                    { color: colors.text },
                  ])}
                >
                  See who liked you
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={20} color="#10b981" />
                <Text
                  style={StyleSheet.flatten([
                    styles.featureText,
                    { color: colors.text },
                  ])}
                >
                  Priority matching
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.continueButton,
                { backgroundColor: colors.primary },
              ])}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Start Matching</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.loadingIcon}>
              <Ionicons name="time" size={60} color={colors.primary} />
            </View>

            <Text
              style={StyleSheet.flatten([styles.title, { color: colors.text }])}
            >
              Verifying Payment...
            </Text>

            <Text
              style={StyleSheet.flatten([
                styles.subtitle,
                { color: colors.textSecondary },
              ])}
            >
              Please wait while we confirm your subscription.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  loadingIcon: {
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
    marginBottom: 32,
  },
  featuresList: {
    alignSelf: "stretch",
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  continueButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PremiumSuccessScreen;
