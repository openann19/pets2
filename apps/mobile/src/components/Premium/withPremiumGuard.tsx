import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { usePremiumStatus } from "../../hooks/usePremium";

type Props = { feature: keyof ReturnType<typeof usePremiumStatus>["can"] };

export function withPremiumGuard<P extends object>(
  Wrapped: React.ComponentType<P>,
  feature: Props["feature"]
) {
  return (props: P) => {
    const nav = useNavigation<any>();
    const { can, loading } = usePremiumStatus();
    if (loading) return null;
    if (!can[feature]) {
      return (
        <View style={styles.container} testID="premium-guard">
          <Text style={styles.title}>Premium required</Text>
          <Text style={styles.description}>
            Unlock this feature with PawfectMatch Premium.
          </Text>
          <TouchableOpacity 
            onPress={() => nav.navigate("Premium")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <Wrapped {...props} />;
  };
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { 
    fontWeight: "700", 
    fontSize: 24,
    marginBottom: 8,
    color: "#000",
  },
  description: { 
    opacity: 0.7, 
    marginBottom: 12,
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

