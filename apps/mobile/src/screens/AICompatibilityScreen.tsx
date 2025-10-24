import { Ionicons } from '@expo/vector-icons'
import { logger } from '@pawfectmatch/core';
;
import { useAuthStore } from '@pawfectmatch/core';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import type { NavigationProp, RouteProp } from '../navigation/types';

const { width: screenWidth } = Dimensions.get('window');

interface AICompatibilityScreenProps {
  navigation: NavigationProp;
  route?: RouteProp;
}

interface Pet {
  _id: string;
  name: string;
  photos: string[];
  breed: string;
  age: number;
  species: string;
  owner: {
    _id: string;
    name: string;
  };
}

interface CompatibilityResult {
  compatibility_score: number;
  ai_analysis: string;
  breakdown: {
    personality_compatibility: number;
    lifestyle_compatibility: number;
    activity_compatibility: number;
    social_compatibility: number;
    environment_compatibility: number;
  };
  recommendations: {
    meeting_suggestions: string[];
    activity_recommendations: string[];
    supervision_requirements: string[];
    success_probability: number;
  };
}

export default function AICompatibilityScreen({ navigation, route }: AICompatibilityScreenProps) {
  const { user } = useAuthStore();
  const { isDark, colors } = useTheme();
  
  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [selectedPet1, setSelectedPet1] = useState<Pet | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<Pet | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailablePets();
    
    // Check if pets were passed via route params
    if (route?.params?.pet1Id && route?.params?.pet2Id) {
      // Load specific pets for analysis
      loadSpecificPets(route.params.pet1Id, route.params.pet2Id);
    }
  }, [route?.params]);

  const loadAvailablePets = async () => {
    try {
      setIsLoadingPets(true);
      // This would typically fetch pets from the API
      // For now, we'll use mock data
      const mockPets: Pet[] = [
        {
          _id: '1',
          name: 'Buddy',
          photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=200'],
          breed: 'Golden Retriever',
          age: 3,
          species: 'dog',
          owner: { _id: user?._id || '1', name: user?.name || 'You' }
        },
        {
          _id: '2',
          name: 'Luna',
          photos: ['https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200'],
          breed: 'Labrador',
          age: 2,
          species: 'dog',
          owner: { _id: '2', name: 'Sarah' }
        },
        {
          _id: '3',
          name: 'Max',
          photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200'],
          breed: 'German Shepherd',
          age: 4,
          species: 'dog',
          owner: { _id: '3', name: 'Mike' }
        },
        {
          _id: '4',
          name: 'Bella',
          photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200'],
          breed: 'Border Collie',
          age: 1,
          species: 'dog',
          owner: { _id: '4', name: 'Emma' }
        }
      ];
      
      setAvailablePets(mockPets);
    } catch (err: any) {
      logger.error('Error loading pets:', { error });
      setError('Failed to load pets. Please try again.');
    } finally {
      setIsLoadingPets(false);
    }
  };

  const loadSpecificPets = async (pet1Id: string, pet2Id: string) => {
    try {
      // In a real app, you'd fetch these pets from the API
      const pet1 = availablePets.find(p => p._id === pet1Id);
      const pet2 = availablePets.find(p => p._id === pet2Id);
      
      if (pet1 && pet2) {
        setSelectedPet1(pet1);
        setSelectedPet2(pet2);
        // Auto-analyze if both pets are selected
        setTimeout(() => analyzeCompatibility(), 500);
      }
    } catch (err: any) {
      logger.error('Error loading specific pets:', { error });
      setError('Failed to load pet information.');
    }
  };

  const analyzeCompatibility = async () => {
    if (!selectedPet1 || !selectedPet2) {
      Alert.alert('Selection Required', 'Please select two pets to analyze compatibility.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await api.ai.analyzeCompatibility({
        pet1Id: selectedPet1._id,
        pet2Id: selectedPet2._id,
      });
      setCompatibilityResult(result);
    } catch (err: any) {
      logger.error('Compatibility analysis error:', { error });
      setError(err.message || 'Failed to analyze compatibility. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedPet1(null);
    setSelectedPet2(null);
    setCompatibilityResult(null);
    setError(null);
  };

  const renderPetCard = (pet: Pet, isSelected: boolean, onSelect: () => void) => (
    <TouchableOpacity
      style={[
        styles.petCard,
        { backgroundColor: colors.card },
        isSelected && { borderColor: colors.primary, borderWidth: 2 }
      ]}
      onPress={onSelect}
    >
      <Image source={{ uri: pet.photos[0] }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
        <Text style={[styles.petBreed, { color: colors.textSecondary }]}>{pet.breed}</Text>
        <Text style={[styles.petAge, { color: colors.textSecondary }]}>{pet.age} years old</Text>
        <Text style={[styles.petOwner, { color: colors.textSecondary }]}>
          Owner: {pet.owner.name}
        </Text>
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCompatibilityScore = () => {
    if (!compatibilityResult) return null;
    
    const score = Math.round(compatibilityResult.compatibility_score);
    const getScoreColor = (score: number) => {
      if (score >= 80) return '#4CAF50';
      if (score >= 60) return '#FF9800';
      return '#F44336';
    };
    
    const getScoreLabel = (score: number) => {
      if (score >= 80) return 'Excellent Match!';
      if (score >= 60) return 'Good Compatibility';
      if (score >= 40) return 'Moderate Compatibility';
      return 'Low Compatibility';
    };
    
    return (
      <View style={styles.scoreSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          💕 Compatibility Score
        </Text>
        
        <View style={styles.scoreCard}>
          <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>
            {score}/100
          </Text>
          <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
            {getScoreLabel(score)}
          </Text>
          <Text style={[styles.scoreDescription, { color: colors.textSecondary }]}>
            {compatibilityResult.ai_analysis}
          </Text>
        </View>
      </View>
    );
  };

  const renderBreakdown = () => {
    if (!compatibilityResult?.breakdown) return null;
    
    const breakdown = compatibilityResult.breakdown;
    const categories = [
      { key: 'personality_compatibility', label: 'Personality', icon: '😊' },
      { key: 'lifestyle_compatibility', label: 'Lifestyle', icon: '🏠' },
      { key: 'activity_compatibility', label: 'Activity Level', icon: '⚡' },
      { key: 'social_compatibility', label: 'Social Behavior', icon: '👥' },
      { key: 'environment_compatibility', label: 'Environment', icon: '🌍' },
    ];
    
    return (
      <View style={styles.breakdownSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📊 Detailed Breakdown
        </Text>
        
        <View style={styles.breakdownCard}>
          {categories.map((category) => {
            const score = Math.round((breakdown as any)[category.key] * 100);
            const getBarColor = (score: number) => {
              if (score >= 80) return '#4CAF50';
              if (score >= 60) return '#FF9800';
              return '#F44336';
            };
            
            return (
              <View key={category.key} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownIcon}>{category.icon}</Text>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                    {category.label}
                  </Text>
                  <Text style={[styles.breakdownScore, { color: getBarColor(score) }]}>
                    {score}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${score}%`, 
                        backgroundColor: getBarColor(score) 
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!compatibilityResult?.recommendations) return null;
    
    const { recommendations } = compatibilityResult;
    
    return (
      <View style={styles.recommendationsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          💡 Recommendations
        </Text>
        
        <View style={styles.recommendationsCard}>
          {recommendations.meeting_suggestions.length > 0 && (
            <View style={styles.recommendationGroup}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>
                🎯 Meeting Suggestions
              </Text>
              {recommendations.meeting_suggestions.map((suggestion, index) => (
                <Text key={index} style={[styles.recommendation, { color: colors.textSecondary }]}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          )}
          
          {recommendations.activity_recommendations.length > 0 && (
            <View style={styles.recommendationGroup}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>
                🎾 Activity Recommendations
              </Text>
              {recommendations.activity_recommendations.map((activity, index) => (
                <Text key={index} style={[styles.recommendation, { color: colors.textSecondary }]}>
                  • {activity}
                </Text>
              ))}
            </View>
          )}
          
          {recommendations.supervision_requirements.length > 0 && (
            <View style={styles.recommendationGroup}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>
                ⚠️ Supervision Requirements
              </Text>
              {recommendations.supervision_requirements.map((requirement, index) => (
                <Text key={index} style={[styles.recommendation, { color: colors.textSecondary }]}>
                  • {requirement}
                </Text>
              ))}
            </View>
          )}
          
          <View style={styles.successProbability}>
            <Text style={[styles.successLabel, { color: colors.text }]}>
              Success Probability:
            </Text>
            <Text style={[styles.successValue, { color: colors.primary }]}>
              {Math.round(recommendations.success_probability * 100)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoadingPets) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading pets...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Compatibility</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!compatibilityResult ? (
          <>
            <View style={styles.selectionSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🐕 Select Two Pets
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                Choose two pets to analyze their compatibility using AI technology.
              </Text>
              
              <View style={styles.petSelection}>
                <View style={styles.petColumn}>
                  <Text style={[styles.columnTitle, { color: colors.text }]}>
                    Pet 1
                  </Text>
                  {selectedPet1 ? (
                    renderPetCard(selectedPet1, true, () => { setSelectedPet1(null); })
                  ) : (
                    <View style={[styles.placeholderCard, { backgroundColor: colors.card }]}>
                      <Ionicons name="paw" size={40} color={colors.textSecondary} />
                      <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                        Select Pet 1
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.vsContainer}>
                  <Text style={[styles.vsText, { color: colors.primary }]}>VS</Text>
                </View>
                
                <View style={styles.petColumn}>
                  <Text style={[styles.columnTitle, { color: colors.text }]}>
                    Pet 2
                  </Text>
                  {selectedPet2 ? (
                    renderPetCard(selectedPet2, true, () => { setSelectedPet2(null); })
                  ) : (
                    <View style={[styles.placeholderCard, { backgroundColor: colors.card }]}>
                      <Ionicons name="paw" size={40} color={colors.textSecondary} />
                      <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                        Select Pet 2
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <Text style={[styles.availablePetsTitle, { color: colors.text }]}>
                Available Pets
              </Text>
              
              <FlatList
                data={availablePets}
                keyExtractor={(item) => item._id}
                numColumns={2}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const isSelected = selectedPet1?._id === item._id || selectedPet2?._id === item._id;
                  const isDisabled = isSelected || 
                    (selectedPet1 && selectedPet2) ||
                    (selectedPet1 && selectedPet1.owner._id === item.owner._id) ||
                    (selectedPet2 && selectedPet2.owner._id === item.owner._id);
                  
                  return (
                    <TouchableOpacity
                      style={[
                        styles.availablePetCard,
                        { backgroundColor: colors.card },
                        isDisabled && { opacity: 0.5 }
                      ]}
                      onPress={() => {
                        if (isDisabled) return;
                        if (!selectedPet1) {
                          setSelectedPet1(item);
                        } else if (!selectedPet2) {
                          setSelectedPet2(item);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <Image source={{ uri: item.photos[0] }} style={styles.availablePetImage} />
                      <Text style={[styles.availablePetName, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.availablePetBreed, { color: colors.textSecondary }]}>
                        {item.breed}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              
              {selectedPet1 && selectedPet2 && (
                <TouchableOpacity
                  style={[styles.analyzeButton, { opacity: isAnalyzing ? 0.7 : 1 }]}
                  onPress={analyzeCompatibility}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="analytics" size={20} color="#fff" />
                  )}
                  <Text style={styles.analyzeButtonText}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Compatibility'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsTitle, { color: colors.text }]}>
                  🎯 Compatibility Results
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetAnalysis}
                >
                  <Ionicons name="refresh" size={20} color={colors.primary} />
                  <Text style={[styles.resetButtonText, { color: colors.primary }]}>
                    New Analysis
                  </Text>
                </TouchableOpacity>
              </View>
              
              {renderCompatibilityScore()}
              {renderBreakdown()}
              {renderRecommendations()}
            </View>
          </>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ff4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  selectionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  petSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  petColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  petCard: {
    width: '100%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  petInfo: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 14,
    marginBottom: 2,
  },
  petAge: {
    fontSize: 12,
    marginBottom: 2,
  },
  petOwner: {
    fontSize: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  placeholderCard: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
  },
  vsContainer: {
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  availablePetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  availablePetCard: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  availablePetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  availablePetName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  availablePetBreed: {
    fontSize: 12,
    textAlign: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  scoreSection: {
    marginBottom: 25,
  },
  scoreCard: {
    backgroundColor: '#f8f9fa',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  breakdownSection: {
    marginBottom: 25,
  },
  breakdownCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  breakdownLabel: {
    fontSize: 16,
    flex: 1,
  },
  breakdownScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationsSection: {
    marginBottom: 25,
  },
  recommendationsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  recommendationGroup: {
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  successProbability: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  successLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  errorText: {
    color: '#c62828',
    marginLeft: 10,
    flex: 1,
  },
});
