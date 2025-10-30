/**
 * AI Compatibility Analyzer Screen for Mobile
 * Advanced compatibility scoring and analysis between pets
 * Refactored to use custom hooks and UI components
 */

import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CompatibilityResults } from '../../components/compatibility/CompatibilityResults';
import { PetSelectionSection } from '../../components/compatibility/PetSelectionSection';
import { useAICompatibility } from '../../hooks/screens/useAICompatibility';
import type { RootStackParamList } from '../../navigation/types';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '500',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 4,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
      marginLeft: 8,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    historyButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    analysisSection: {
      marginBottom: 24,
    },
    analyzeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    analyzeButtonDisabled: {
      opacity: 0.7,
    },
    analyzeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

type AICompatibilityScreenProps = NativeStackScreenProps<RootStackParamList, 'AICompatibility'>;

const AICompatibilityScreen = ({
  navigation,
  route,
}: AICompatibilityScreenProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;
  const {
    pets,
    selectedPetA,
    selectedPetB,
    isAnalyzing,
    analysisResult,
    analysisHistory,
    loading,
    handlePetSelection,
    handleAnalyze,
  } = useAICompatibility({ route });

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.colors.success;
    if (score >= 80) return theme.colors.info;
    if (score >= 70) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>Loading pets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            testID="AICompatibility-back-button"
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.onSurface }]}>Compatibility Analyzer</Text>
          <View style={styles.headerActions}>
            {analysisHistory.length > 0 && (
              <TouchableOpacity
                style={[styles.historyButton, { backgroundColor: colors.primary }]}
                testID="AICompatibility-history-button"
                accessibilityLabel="View analysis history"
                accessibilityRole="button"
                onPress={() => {
                  Alert.alert('Analysis History', `${analysisHistory.length} previous analyses`);
                }}
              >
                <Ionicons
                  name="time"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pet Selection */}
        <PetSelectionSection
          selectedPetA={selectedPetA}
          selectedPetB={selectedPetB}
          pets={pets}
          handlePetSelection={handlePetSelection}
        />

        {/* Analyze Button */}
        {selectedPetA && selectedPetB && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                { backgroundColor: colors.primary },
                isAnalyzing && styles.analyzeButtonDisabled,
              ]}
              testID="AICompatibility-analyze-button"
              accessibilityLabel="Analyze compatibility"
              accessibilityRole="button"
              onPress={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="analytics"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.analyzeButtonText}>Analyze Compatibility</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <CompatibilityResults
            analysisResult={analysisResult}
            getScoreColor={getScoreColor}
            getScoreLabel={getScoreLabel}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default AICompatibilityScreen;
