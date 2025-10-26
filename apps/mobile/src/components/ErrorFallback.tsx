import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Universal Error Fallback Component for React Native
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error: _error,
  resetError,
}) => {
  const { isDark } = useTheme();

  return (
    <View
      style={StyleSheet.flatten([
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ])}
    >
      <Ionicons
        name="warning"
        size={48}
        color={isDark ? "#FF6B6B" : "#F44336"}
      />

      <Text
        style={StyleSheet.flatten([
          styles.title,
          isDark ? styles.titleDark : styles.titleLight,
        ])}
      >
        Something went wrong
      </Text>

      <Text
        style={StyleSheet.flatten([
          styles.message,
          isDark ? styles.messageDark : styles.messageLight,
        ])}
      >
        Please try again or contact support if the issue persists.
      </Text>

      <TouchableOpacity
        style={StyleSheet.flatten([styles.button, styles.retryButton])}
        onPress={resetError}
      >
        <Ionicons name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  containerLight: {
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#1E1E1E",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  titleLight: {
    color: "#1A1A1A",
  },
  titleDark: {
    color: "#FFFFFF",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  messageLight: {
    color: "#666666",
  },
  messageDark: {
    color: "#CCCCCC",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: "center",
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ErrorFallback;
