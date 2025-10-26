import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getCompatibility, CompatibilityResult } from "../services/aiCompatService";
import { useNavigation } from "@react-navigation/native";

interface Pet {
  _id: string;
  name: string;
}

export default function AICompatibilityScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [selectedA, setSelectedA] = useState<Pet | null>(null);
  const [selectedB, setSelectedB] = useState<Pet | null>(null);

  // This would be replaced with actual pet selection logic
  const handleSelectPets = () => {
    // Placeholder - would normally show a pet picker
    Alert.alert("Select Pets", "Choose two pets to compare");
  };

  const run = async () => {
    if (!selectedA || !selectedB) {
      Alert.alert("Error", "Please select two pets");
      return;
    }
    setLoading(true);
    try {
      const r = await getCompatibility(selectedA._id, selectedB._id);
      setResult(r);
    } catch (error: any) {
      Alert.alert("Analysis Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Compatibility</Text>
        <Text style={styles.subtitle}>See how two pets would get along</Text>
      </View>

      <TouchableOpacity style={styles.selectButton} onPress={handleSelectPets}>
        <Text style={styles.selectButtonText}>
          {selectedA && selectedB 
            ? `${selectedA.name} & ${selectedB.name}` 
            : "Select Two Pets"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={run}
        disabled={!selectedA || !selectedB || loading}
        style={[styles.analyzeButton, (!selectedA || !selectedB || loading) && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Compatibility</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View testID="compat-result" style={styles.resultCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreValue}>{result.value}%</Text>
            <Text style={styles.compatibilityStatus}>
              {result.compatible ? "✅ Compatible" : "⚠️ Maybe Compatible"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Breakdown:</Text>
          {Object.entries(result.breakdown).map(([key, value]) => (
            <View key={key} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{key}</Text>
              <Text style={styles.breakdownValue}>{Math.round(value * 100)}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  selectButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  analyzeButton: {
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  disabled: {
    backgroundColor: "#ccc",
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  scoreHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  compatibilityStatus: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  breakdownLabel: {
    fontSize: 16,
    color: "#666",
    textTransform: "capitalize",
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
