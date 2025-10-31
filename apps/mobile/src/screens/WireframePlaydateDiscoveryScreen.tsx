/**
 * WIREFRAME PLAYDATE DISCOVERY - Rapid Prototyping Version
 *
 * Demonstrates wireframing integration with our pet-first discovery screen
 * Toggle between wireframe, mockup, and production modes
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

// Wireframe System
import { useWireframe, useTheme } from '../hooks';
import {
  WireframeScreen,
  WireframeCard,
  WireframePetCard,
  generateWireframePets,
  wireframeApiResponses
} from '../components/wireframe/WireframeComponents';

// Existing hooks for fallback
import { usePlaydateMatching, usePets } from '../hooks/domains/pet';

type WireframePlaydateDiscoveryProps = {
  navigation: any;
  route?: {
    params?: {
      petId?: string;
    };
  };
};

export default function WireframePlaydateDiscoveryScreen({
  navigation,
  route
}: WireframePlaydateDiscoveryProps) {
  const wireframe = useWireframe();
  const theme = useTheme();
  const { petId } = route?.params || {};

  // Use mock data in wireframe mode, real hooks otherwise
  const mockPets = generateWireframePets(8);
  const selectedPet = mockPets.find(p => p._id === petId) || mockPets[0];

  // State for wireframe interactions
  const [selectedFilters, setSelectedFilters] = useState({
    distance: 5,
    playStyles: [] as string[],
    energy: undefined as number | undefined,
    size: undefined as 'small' | 'medium' | 'large' | undefined,
  });

  const [matches] = useState(
    wireframe.dataSource === 'mock'
      ? Array.from({ length: 6 }, () => wireframeApiResponses.getPlaydateMatches('mock-pet'))
      : []
  );

  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  // Wireframe interaction handlers
  const handleFilterToggle = useCallback((filterType: string, value: any) => {
    if (wireframe.theme === 'wireframe') {
      // Mock interaction - just show alert
      Alert.alert('Wireframe Interaction', `${filterType} filter toggled to: ${value}`);
      return;
    }

    setSelectedFilters(prev => {
      if (filterType === 'playStyles') {
        const currentStyles = prev.playStyles;
        const newStyles = currentStyles.includes(value)
          ? currentStyles.filter(s => s !== value)
          : [...currentStyles, value];
        return { ...prev, playStyles: newStyles };
      }

      if (filterType === 'energy') {
        return { ...prev, energy: prev.energy === value ? undefined : value };
      }

      if (filterType === 'size') {
        return { ...prev, size: prev.size === value ? undefined : value };
      }

      if (filterType === 'distance') {
        return { ...prev, distance: value };
      }

      return prev;
    });
  }, [wireframe.theme]);

  const handleSearch = useCallback(() => {
    if (wireframe.theme === 'wireframe') {
      Alert.alert('Wireframe Action', 'Search filters applied');
      return;
    }
    // Real search logic would go here
  }, [wireframe.theme]);

  const handleCreatePlaydate = useCallback((match: any) => {
    if (wireframe.theme === 'wireframe') {
      Alert.alert('Wireframe Navigation', 'Navigate to Pack Builder');
      return;
    }
    navigation.navigate('PackBuilder', { hostPetId: petId, initialMatch: match });
  }, [wireframe.theme, navigation, petId]);

  const renderFilters = () => (
    <WireframeCard
      title="Search Filters"
      height={200}
      content={
        <View style={styles.filtersContent}>
          <View style={styles.distanceOptions}>
            {[1, 5, 10, 25].map(distance => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceOption,
                  {
                    backgroundColor: selectedFilters.distance === distance
                      ? theme.colors.primary
                      : theme.colors.bgElevated,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleFilterToggle('distance', distance)}
              >
                <Text style={[
                  styles.distanceText,
                  {
                    color: selectedFilters.distance === distance
                      ? theme.colors.primaryText
                      : theme.colors.text
                  }
                ]}>
                  {distance}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSearch}
          >
            <Text style={[styles.searchButtonText, { color: theme.colors.primaryText }]}>
              🔍 Find Playmates
            </Text>
          </TouchableOpacity>
        </View>
      }
    />
  );

  const renderMatchCard = (match: any, index: number) => (
    <WireframePetCard
      key={index}
      pet={wireframe.dataSource === 'mock' ? generateWireframePets(1)[0] : undefined}
      showDetails={true}
    />
  );

  return (
    <WireframeScreen
      title={`Find Playmates for ${selectedPet?.name || 'Pet'}`}
      showHeader={true}
      showTabs={false}
    >
      {/* Filters Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Discovery Filters
        </Text>
        {renderFilters()}
      </View>

      {/* Results Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Compatible Playmates ({matches.length})
        </Text>

        {matches.length === 0 ? (
          <WireframeCard
            title="No matches found"
            content={
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Try adjusting your filters to find more playmates for {selectedPet?.name || 'your pet'}
              </Text>
            }
          />
        ) : (
          matches.map((match, index) => renderMatchCard(match, index))
        )}
      </View>

      {/* Wireframe Mode Indicator */}
      {wireframe.enabled && (
        <View style={[styles.wireframeIndicator, { backgroundColor: theme.colors.warning }]}>
          <Text style={[styles.wireframeIndicatorText, { color: theme.colors.primaryText }]}>
            🎨 Wireframe Mode: {wireframe.theme}
          </Text>
          <Text style={[styles.wireframeIndicatorSubtext, { color: theme.colors.primaryText }]}>
            Data Source: {wireframe.dataSource}
          </Text>
        </View>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Playmate Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedMatch(null)}>
                <Text style={[styles.closeButton, { color: theme.colors.primary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <WireframeCard
                title="Compatibility Breakdown"
                height={150}
                content={
                  <Text style={[styles.compatibilityText, { color: theme.colors.textMuted }]}>
                    Play Style: 95% • Energy: 90% • Size: 85%
                  </Text>
                }
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton, { borderColor: theme.colors.border }]}
                onPress={() => setSelectedMatch(null)}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setSelectedMatch(null);
                  handleCreatePlaydate(selectedMatch);
                }}
              >
                <Text style={[styles.primaryButtonText, { color: theme.colors.primaryText }]}>
                  🐾 Create Playdate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </WireframeScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filtersContent: {
    gap: 12,
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  wireframeIndicator: {
    position: 'absolute',
    top: 100,
    right: 16,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  wireframeIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  wireframeIndicatorSubtext: {
    fontSize: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
    maxHeight: 300,
  },
  compatibilityText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {},
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
