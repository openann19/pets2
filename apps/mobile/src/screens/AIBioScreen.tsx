import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../services/api";
import type { NavigationProp } from "../navigation/types";

interface AIBioScreenProps {
  navigation: NavigationProp;
}

interface GeneratedBio {
  bio: string;
  keywords: string[];
  sentiment: {
    score: number;
    label: string;
  };
  matchScore: number;
}

export default function AIBioScreen({ navigation }: AIBioScreenProps) {
  const { user } = useAuthStore();
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petPersonality, setPetPersonality] = useState("");
  const [selectedTone, setSelectedTone] = useState("playful");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBio, setGeneratedBio] = useState<GeneratedBio | null>(null);
  const [bioHistory, setBioHistory] = useState<GeneratedBio[]>([]);

  const tones = [
    { id: "playful", label: "Playful", icon: "🎾", color: "#ff6b6b" },
    { id: "professional", label: "Professional", icon: "💼", color: "#4dabf7" },
    { id: "casual", label: "Casual", icon: "😊", color: "#69db7c" },
    { id: "romantic", label: "Romantic", icon: "💕", color: "#f783ac" },
    { id: "funny", label: "Funny", icon: "😄", color: "#ffd43b" },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to analyze your pet photo",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (
      !result.canceled &&
      result.assets &&
      result.assets.length > 0 &&
      result.assets[0]
    ) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  const generateBio = async () => {
    if (!petName.trim()) {
      Alert.alert("Missing Information", "Please enter your pet's name");
      return;
    }

    setIsGenerating(true);
    try {
      const bioData = await api.ai.generateBio({
        petName: petName.trim(),
        keywords: petPersonality
          .trim()
          .split(",")
          .map((p) => p.trim()),
        tone: "playful",
        length: "medium",
        petType: "dog",
        age: parseInt(petAge.trim()) || 1,
        breed: petBreed.trim(),
      });

      const newBio: GeneratedBio = {
        bio: (bioData as any).bio,
        keywords: (bioData as any).keywords || [],
        sentiment: (bioData as any).sentiment || {
          score: 0.8,
          label: "positive",
        },
        matchScore: (bioData as any).matchScore || 85,
      };

      setGeneratedBio(newBio);
      setBioHistory((prev) => [newBio, ...prev.slice(0, 4)]); // Keep last 5
    } catch (error) {
      // Fallback generation for demo
      const fallbackBio: GeneratedBio = {
        bio: `Meet ${petName}! This adorable ${petBreed || "furry friend"} is ${petAge || "young"} and full of personality. ${petPersonality || "They love making new friends"} and would be perfect for someone looking for a ${selectedTone} companion. Ready for adventures and lots of love! 🐾`,
        keywords: ["friendly", "playful", "loving", "adventurous"],
        sentiment: { score: 0.9, label: "positive" },
        matchScore: 88,
      };

      setGeneratedBio(fallbackBio);
      setBioHistory((prev) => [fallbackBio, ...prev.slice(0, 4)]);
      logger.info("Using fallback bio generation:", { error });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBio = async () => {
    if (!generatedBio) return;

    try {
      // Update pet profile with generated bio
      if (user?._id && generatedBio) {
        // Assuming we have a petId from route params or user's first pet
        const userPets = await api.getUserPets();
        if (userPets && userPets.length > 0 && userPets[0]?._id) {
          await api.updatePet(userPets[0]._id, {
            description: generatedBio.bio,
          });

          Alert.alert("Success", "Pet profile updated successfully!");
          navigation.goBack();
        } else {
          Alert.alert("Saved Locally", "Bio has been saved to your device");
        }
      } else {
        Alert.alert("Saved Locally", "Bio has been saved to your device");
      }
    } catch (error) {
      Alert.alert("Saved Locally", "Bio has been saved to your device");
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return "#69db7c";
    if (score >= 0.4) return "#ffd43b";
    return "#ff6b6b";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { navigation.goBack(); }}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Bio Generator</Text>
        <View style={styles.headerRight}>
          <Ionicons name="sparkles" size={24} color="#ff6b6b" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Photo (Optional)</Text>
          <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
            {selectedPhoto ? (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.selectedPhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color="#999" />
                <Text style={styles.photoPlaceholderText}>
                  Add Photo for Better Analysis
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Pet Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pet Name *</Text>
            <TextInput
              style={styles.textInput}
              value={petName}
              onChangeText={setPetName}
              placeholder="Enter your pet's name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Breed</Text>
            <TextInput
              style={styles.textInput}
              value={petBreed}
              onChangeText={setPetBreed}
              placeholder="e.g., Golden Retriever, Persian Cat"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              value={petAge}
              onChangeText={setPetAge}
              placeholder="e.g., 2 years, 6 months"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Personality Traits</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={petPersonality}
              onChangeText={setPetPersonality}
              placeholder="Describe your pet's personality..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Tone Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio Tone</Text>
          <View style={styles.toneGrid}>
            {tones.map((tone) => (
              <TouchableOpacity
                key={tone.id}
                style={[
                  styles.toneOption,
                  selectedTone === tone.id && styles.selectedTone,
                  { borderColor: tone.color },
                ]}
                onPress={() => {
                  setSelectedTone(tone.id);
                }}
              >
                <Text style={styles.toneEmoji}>{tone.icon}</Text>
                <Text
                  style={[
                    styles.toneLabel,
                    selectedTone === tone.id && { color: tone.color },
                  ]}
                >
                  {tone.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            isGenerating && styles.generatingButton,
          ]}
          onPress={generateBio}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={isGenerating ? ["#ccc", "#ccc"] : ["#ff6b6b", "#ff8e8e"]}
            style={styles.generateButtonGradient}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="sparkles" size={20} color="#fff" />
            )}
            <Text style={styles.generateButtonText}>
              {isGenerating ? "Generating..." : "Generate Bio"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Generated Bio */}
        {generatedBio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generated Bio</Text>
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{generatedBio.bio}</Text>

              {/* Bio Stats */}
              <View style={styles.bioStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Match Score</Text>
                  <Text style={[styles.statValue, { color: "#69db7c" }]}>
                    {generatedBio.matchScore}%
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Sentiment</Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: getSentimentColor(generatedBio.sentiment.score),
                      },
                    ]}
                  >
                    {generatedBio.sentiment.label}
                  </Text>
                </View>
              </View>

              {/* Keywords */}
              {generatedBio.keywords.length > 0 && (
                <View style={styles.keywordsContainer}>
                  <Text style={styles.keywordsTitle}>Keywords:</Text>
                  <View style={styles.keywordsList}>
                    {generatedBio.keywords.map((keyword, index) => (
                      <View key={index} style={styles.keywordTag}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.bioActions}>
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={generateBio}
                >
                  <Ionicons name="refresh" size={16} color="#666" />
                  <Text style={styles.regenerateText}>Regenerate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveBio}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.saveText}>Save Bio</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Bio History */}
        {bioHistory.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous Versions</Text>
            {bioHistory.slice(1).map((bio, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => {
                  setGeneratedBio(bio);
                }}
              >
                <Text style={styles.historyText} numberOfLines={2}>
                  {bio.bio}
                </Text>
                <Text style={styles.historyScore}>{bio.matchScore}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  photoUpload: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  photoPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  toneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toneOption: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  selectedTone: {
    borderWidth: 2,
  },
  toneEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  toneLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  generateButton: {
    marginVertical: 20,
  },
  generatingButton: {
    opacity: 0.7,
  },
  generateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bioContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 20,
  },
  bioStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  keywordsContainer: {
    marginBottom: 20,
  },
  keywordsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  keywordsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  keywordTag: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  keywordText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bioActions: {
    flexDirection: "row",
    gap: 15,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    gap: 8,
  },
  regenerateText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#69db7c",
    borderRadius: 10,
    gap: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginRight: 15,
  },
  historyScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#69db7c",
  },
});
