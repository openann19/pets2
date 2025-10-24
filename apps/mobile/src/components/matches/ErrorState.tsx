import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityLabel="Error loading matches">
      <Image
        source={require("../../../assets/error-pet.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.subtitle}>
        We couldn't load your matches. Please try again.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
        accessibilityLabel="Retry loading matches"
      >
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#a21caf",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
