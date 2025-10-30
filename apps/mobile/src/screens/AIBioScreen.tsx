import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAIBioScreen } from "../hooks/screens/ai";
import { useTheme } from "@mobile/src/theme";

export default function AIBioScreen() {
  const theme = useTheme();
  const {
    // Form state
    petName,
    setPetName,
    petBreed,
    setPetBreed,
    petAge,
    setPetAge,
    petPersonality,
    setPetPersonality,
    selectedTone,
    setSelectedTone,
    selectedPhoto,

    // UI state
    isGenerating,
    generatedBio,
    bioHistory,
    tones,

    // Actions
    pickImage,
    generateBio,
    saveBio,
    handleGoBack,
  } = useAIBioScreen();

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return theme.colors.success;
    if (score >= 0.4) return theme.colors.warning;
    return theme.colors.danger;
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity  testID="AIBioScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Bio Generator</Text>
        <View style={styles.headerRight}>
          <Ionicons name="star" size={24} color={theme.colors.danger} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Photo (Optional)</Text>
          <TouchableOpacity style={styles.photoUpload}  testID="AIBioScreen-button-2" accessibilityLabel="selectedPhoto ? (" accessibilityRole="button" onPress={pickImage}>
            {selectedPhoto ? (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.selectedPhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color={theme.colors.onMuted} />
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
              placeholderTextColor={theme.colors.onMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Breed</Text>
            <TextInput
              style={styles.textInput}
              value={petBreed}
              onChangeText={setPetBreed}
              placeholder="e.g., Golden Retriever, Persian Cat"
              placeholderTextColor={theme.colors.onMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              value={petAge}
              onChangeText={setPetAge}
              placeholder="e.g., 2 years, 6 months"
              placeholderTextColor={theme.colors.onMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Personality Traits</Text>
            <TextInput
              style={StyleSheet.flatten([
                styles.textInput,
                styles.multilineInput,
              ])}
              value={petPersonality}
              onChangeText={setPetPersonality}
              placeholder="Describe your pet's personality..."
              placeholderTextColor={theme.colors.onMuted}
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
                style={StyleSheet.flatten([
                  styles.toneOption,
                  selectedTone === tone.id && styles.selectedTone,
                  { borderColor: tone.color },
                ])}
                 testID="AIBioScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  setSelectedTone(tone.id);
                }}
              >
                <Text style={styles.toneEmoji}>{tone.icon}</Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.toneLabel,
                    selectedTone === tone.id && { color: tone.color },
                  ])}
                >
                  {tone.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.generateButton,
            isGenerating && styles.generatingButton,
          ])}
           testID="AIBioScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={generateBio}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={isGenerating ? [theme.colors.onMuted, theme.colors.onMuted] : [theme.colors.danger, theme.colors.danger]}
            style={styles.generateButtonGradient}
          >
            {isGenerating ? (
              <ActivityIndicator color={theme.colors.bg} size="small" />
            ) : (
              <Ionicons name="star" size={20} color={theme.colors.bg} />
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
                  <Text
                    style={StyleSheet.flatten([
                      styles.statValue,
                      { color: theme.colors.success },
                    ])}
                  >
                    {generatedBio.matchScore}%
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Sentiment</Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.statValue,
                      {
                        color: getSentimentColor(generatedBio.sentiment.score),
                      },
                    ])}
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
                    {generatedBio.keywords.map((keyword: string, index: number) => (
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
                   testID="AIBioScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={generateBio}
                >
                  <Ionicons name="refresh" size={16} color={theme.colors.onMuted} />
                  <Text style={styles.regenerateText}>Regenerate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton}  testID="AIBioScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={saveBio}>
                  <Ionicons name="checkmark" size={16} color={theme.colors.bg} />
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
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText} numberOfLines={2}>
                  {bio.bio}
                </Text>
                <Text style={styles.historyScore}>{bio.matchScore}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.bg,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: theme.colors.onSurface,
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
    fontWeight: "bold" as const,
    color: theme.colors.onSurface,
    marginBottom: 15,
  },
  photoUpload: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden" as const,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.onSurface,
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
    backgroundColor: theme.colors.surface,
  },
  photoPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.onMuted,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.bg,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.onSurface,
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
    backgroundColor: theme.colors.bg,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
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
    color: theme.colors.onMuted,
  },
  generateButton: {
    marginVertical: 20,
  },
  generatingButton: {
    opacity: 0.7,
  },
  generateButtonGradient: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  generateButtonText: {
    color: theme.colors.bg,
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  bioContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    padding: 20,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.onSurface,
    marginBottom: 20,
  },
  bioStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onMuted,
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
    color: theme.colors.onMuted,
    marginBottom: 10,
  },
  keywordsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  keywordTag: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  keywordText: {
    color: theme.colors.bg,
    fontSize: 12,
    fontWeight: "600",
  },
  bioActions: {
    flexDirection: "row" as const,
    gap: 15,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    gap: 8,
  },
  regenerateText: {
    color: theme.colors.onMuted,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    backgroundColor: theme.colors.success,
    borderRadius: 10,
    gap: 8,
  },
  saveText: {
    color: theme.colors.bg,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  historyItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onMuted,
    marginRight: 15,
  },
  historyScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.success,
  },
});

const getStyles = (theme: any) => createStyles(theme);
