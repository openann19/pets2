/**
 * AI Compatibility Analyzer Screen (Refactored)
 * Uses useAICompatibilityScreen hook and extracted components
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { RootStackParamList } from '../../navigation/types';
import { useAICompatibilityScreen } from '../../hooks/screens/useAICompatibilityScreen';
import {
  PetSelectionSection,
  CompatibilityScoreCard,
  CompatibilityBreakdownCard,
  InteractionCompatibilityCard,
  AnalysisFactorsCard,
  DetailedAnalysisCard,
  TipsCard,
} from '../../components/compatibility';
import { PetItem } from '../../components/compatibility/PetItem';

type AICompatibilityScreenProps = NativeStackScreenProps<RootStackParamList, 'AICompatibility'>;

const AICompatibilityScreen = ({ navigation, route }: AICompatibilityScreenProps): React.JSX.Element => {
  const theme = useTheme();
  const {
    isAnalyzing,
    compatibilityResult,
    error,
    availablePets,
    isLoadingPets,
    selectedPet1,
    selectedPet2,
    setSelectedPet1,
    setSelectedPet2,
    analyzeCompatibility,
    handleGoBack,
    clearError,
  } = useAICompatibilityScreen(route);

  // Map hook result to UI format
  const mappedAnalysis = useMemo(() => {
    if (!compatibilityResult) return null;

    // Map breakdown from hook format to UI format
    const breakdown = {
      temperament: compatibilityResult.breakdown.personality_compatibility * 100,
      activity: compatibilityResult.breakdown.activity_compatibility * 100,
      size: compatibilityResult.breakdown.social_compatibility * 100,
      age: compatibilityResult.breakdown.social_compatibility * 100,
      interests: compatibilityResult.breakdown.lifestyle_compatibility * 100,
      lifestyle: compatibilityResult.breakdown.environment_compatibility * 100,
    };

    // Map factors
    const factors = {
      strengths: compatibilityResult.recommendations.meeting_suggestions || [],
      concerns: compatibilityResult.recommendations.supervision_requirements || [],
      recommendations: compatibilityResult.recommendations.activity_recommendations || [],
    };

    // Map interactions
    const interaction = {
      playdate: compatibilityResult.recommendations.success_probability * 100,
      adoption: compatibilityResult.recommendations.success_probability * 90,
      breeding: compatibilityResult.recommendations.success_probability * 70,
    };

    return {
      overall: compatibilityResult.compatibility_score * 100,
      breakdown,
      factors,
      interaction,
      summary: compatibilityResult.ai_analysis,
      detailed: compatibilityResult.ai_analysis,
      tips: [
        ...(compatibilityResult.recommendations.meeting_suggestions || []),
        ...(compatibilityResult.recommendations.activity_recommendations || []),
      ],
    };
  }, [compatibilityResult]);

  const getScoreColor = useCallback(
    (score: number) => {
      if (score >= 90) return theme.colors.success;
      if (score >= 80) return theme.colors.info;
      if (score >= 70) return theme.colors.warning;
      return theme.colors.danger;
    },
    [theme],
  );

  const getScoreLabel = useCallback((score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Poor';
  }, []);

  const handlePetSelection = useCallback(
    (pet: typeof availablePets[0], isPetA: boolean) => {
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (isPetA) {
        setSelectedPet1(pet);
      } else {
        setSelectedPet2(pet);
      }
    },
    [setSelectedPet1, setSelectedPet2],
  );

  const handleAnalyze = useCallback(() => {
    if (!selectedPet1 || !selectedPet2) {
      Alert.alert('Selection Required', 'Please select both pets to analyze compatibility');
      return;
    }

    if (selectedPet1._id === selectedPet2._id) {
      Alert.alert('Invalid Selection', 'Please select two different pets');
      return;
    }

    void analyzeCompatibility();
  }, [selectedPet1, selectedPet2, analyzeCompatibility]);

  const renderPetItem = useCallback(
    ({ item }: { item: typeof availablePets[0] }) => {
      const isPetA = selectedPet1?._id === item._id;
      const isPetB = selectedPet2?._id === item._id;
      const isSelected = isPetA || isPetB;

      return (
        <PetItem
          pet={item}
          isSelected={isSelected}
          selectionType={isPetA ? 'petA' : isPetB ? 'petB' : undefined}
          onPress={(pet) => {
            if (isPetA) {
              handlePetSelection(pet, true);
            } else if (isPetB) {
              handlePetSelection(pet, false);
            } else if (!selectedPet1) {
              handlePetSelection(pet, true);
            } else if (!selectedPet2) {
              handlePetSelection(pet, false);
            }
          }}
        />
      );
    },
    [selectedPet1, selectedPet2, handlePetSelection],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        scrollView: {
          flex: 1,
          paddingHorizontal: theme.spacing.md,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingText: {
          marginTop: theme.spacing.md,
          fontSize: 16,
          fontWeight: '500',
          color: theme.colors.onSurface,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xs,
        },
        backButton: {
          padding: theme.spacing.xs,
        },
        title: {
          fontSize: 20,
          fontWeight: 'bold',
          flex: 1,
          marginLeft: theme.spacing.xs,
          color: theme.colors.onSurface,
        },
        headerActions: {
          flexDirection: 'row',
          gap: theme.spacing.xs,
        },
        analysisSection: {
          marginBottom: theme.spacing.xl,
        },
        analyzeButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radii.lg,
          gap: theme.spacing.sm,
          backgroundColor: theme.colors.primary,
        },
        analyzeButtonDisabled: {
          opacity: 0.7,
        },
        analyzeButtonText: {
          color: theme.colors.onSurface,
          fontSize: 16,
          fontWeight: '600',
        },
        resultsSection: {
          marginBottom: theme.spacing.xl,
        },
      }),
    [theme],
  );

  if (isLoadingPets) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading pets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Compatibility Analyzer</Text>
          <View style={styles.headerActions} />
        </View>

        {/* Pet Selection - Using FlatList directly due to type compatibility */}
        {availablePets.length > 0 && (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text
              style={{
                fontSize: theme.typography.h2.size,
                fontWeight: theme.typography.h2.weight,
                color: theme.colors.onSurface,
                marginBottom: theme.spacing.md,
              }}
            >
              Select Pets to Compare
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.md,
                gap: theme.spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <Ionicons
                  name="paw"
                  size={20}
                  color={selectedPet1 ? theme.colors.primary : theme.colors.onMuted}
                />
                <Text
                  style={{
                    fontSize: theme.typography.body.size,
                    fontWeight: '600',
                    color: selectedPet1 ? theme.colors.onSurface : theme.colors.onMuted,
                  }}
                >
                  {selectedPet1 ? selectedPet1.name : 'Select Pet A'}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.onMuted} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <Ionicons
                  name="heart"
                  size={20}
                  color={selectedPet2 ? theme.colors.primary : theme.colors.onMuted}
                />
                <Text
                  style={{
                    fontSize: theme.typography.body.size,
                    fontWeight: '600',
                    color: selectedPet2 ? theme.colors.onSurface : theme.colors.onMuted,
                  }}
                >
                  {selectedPet2 ? selectedPet2.name : 'Select Pet B'}
                </Text>
              </View>
            </View>

            <FlatList
              data={availablePets}
              renderItem={renderPetItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              style={{ maxHeight: 300 }}
            />
          </View>
        )}

        {/* Analyze Button */}
        {selectedPet1 && selectedPet2 && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              accessibilityLabel="Analyze compatibility"
              accessibilityRole="button"
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator size="small" color={theme.colors.onSurface} />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="analytics" size={20} color={theme.colors.onSurface} />
                  <Text style={styles.analyzeButtonText}>Analyze Compatibility</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {mappedAnalysis && (
          <View style={styles.resultsSection}>
            <CompatibilityScoreCard
              overallScore={mappedAnalysis.overall}
              label={getScoreLabel(mappedAnalysis.overall)}
              summary={mappedAnalysis.summary}
            />

            <CompatibilityBreakdownCard breakdown={mappedAnalysis.breakdown} />

            <InteractionCompatibilityCard interactions={mappedAnalysis.interaction} />

            <AnalysisFactorsCard factors={mappedAnalysis.factors} />

            <DetailedAnalysisCard detailed={mappedAnalysis.detailed} />

            {mappedAnalysis.tips.length > 0 && <TipsCard tips={mappedAnalysis.tips} />}
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={{ padding: theme.spacing.md }}>
            <Text style={{ color: theme.colors.danger }}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={{ color: theme.colors.primary }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AICompatibilityScreen;

