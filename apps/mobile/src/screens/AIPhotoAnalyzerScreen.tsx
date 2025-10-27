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
import * as ImagePicker from "expo-image-picker";
import { analyzePhotoFromUri, type PhotoAnalysisResult } from "../services/aiPhotoService";
import { useNavigation } from "@react-navigation/native";

export default function AIPhotoAnalyzerScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant photo library access");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera access");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setResult(null);
    }
  };

  async function onAnalyze() {
    if (!photoUri) return;
    setLoading(true);
    try {
      const r = await analyzePhotoFromUri(photoUri, "image/jpeg");
      setResult(r);
    } catch (error: any) {
      Alert.alert("Analysis Failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Photo Analyzer</Text>
        <Text style={styles.subtitle}>Get insights on your pet's photos</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button}  testID="AIPhotoAnalyzerScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={pickPhoto}>
          <Text style={styles.buttonText}>Pick from Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}  testID="AIPhotoAnalyzerScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        testID="btn-analyze"
        accessibilityLabel={loading ? "Analyzing photo" : "Analyze photo"}
        accessibilityRole="button"
        onPress={onAnalyze}
        disabled={!photoUri || loading}
        style={[styles.analyzeButton, (!photoUri || loading) && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.analyzeButtonText}>
            {loading ? "Analyzing..." : "Analyze Photo"}
          </Text>
        )}
      </TouchableOpacity>

      {result && (
        <View testID="analysis-result" style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Results</Text>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Overall Score:</Text>
            <Text style={styles.metricValue}>{result.overall}/100</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Sharpness:</Text>
            <Text style={styles.metricValue}>{(result.quality.sharpness * 100).toFixed(1)}%</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Exposure:</Text>
            <Text style={styles.metricValue}>{(result.quality.exposure * 100).toFixed(1)}%</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Contrast:</Text>
            <Text style={styles.metricValue}>{(result.quality.contrast * 100).toFixed(1)}%</Text>
          </View>

          <Text style={styles.sectionTitle}>Detected Breeds:</Text>
          <Text style={styles.breeds}>
            {result.breedCandidates.map(b => b.name).join(", ") || "No breed detected"}
          </Text>

          {result.suggestions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Suggestions:</Text>
              {result.suggestions.map((s, idx) => (
                <Text key={idx} style={styles.suggestion}>
                  • {s}
                </Text>
              ))}
            </>
          )}
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
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
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
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  metricLabel: {
    fontSize: 16,
    color: "#666",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  breeds: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  suggestion: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    lineHeight: 20,
  },
});
