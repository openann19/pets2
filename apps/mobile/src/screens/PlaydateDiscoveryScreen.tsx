/**
 * PLAYDATE DISCOVERY SCREEN - Pet-First Matching
 *
 * Finds compatible playmates for pets based on:
 * - Play style compatibility (chase, tug, fetch, etc.)
 * - Energy level matching
 * - Size compatibility
 * - Sociability alignment
 * - Geographic proximity
 *
 * Uses existing EliteContainer architecture and pet-first hooks
 */

import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';

// Existing architecture components
import { EliteContainer, EliteHeader } from '../components/elite';
import { useTheme } from '@mobile/theme';
import { Skeleton, TextSkeleton } from '../components/common/LoadingSkeleton';

// Pet-first hooks
import { usePlaydateMatching } from '../hooks/domains/pet';
import { usePetProfile } from '../hooks/domains/pet';

// Extracted components and hooks
import { usePlaydateFilters } from './playdate-discovery/hooks/usePlaydateFilters';
import {
  PlaydateFiltersPanel,
  PlaydateMatchCard,
  MatchDetailModal,
} from './playdate-discovery/components';
import type { PlaydateMatch } from './playdate-discovery/types';

import type { RootStackScreenProps } from '../navigation/types';

type PlaydateDiscoveryScreenProps = RootStackScreenProps<'PlaydateDiscovery'>;

export default function PlaydateDiscoveryScreen({
  navigation,
  route,
}: PlaydateDiscoveryScreenProps) {
  const theme = useTheme();
  const { petId } = route.params;

  // Pet data
  const { pet } = usePetProfile(petId);

  // Matching functionality
  const { matches, loading, findMatches } = usePlaydateMatching(petId);

  // Filter state management
  const filterState = usePlaydateFilters();

  const [selectedMatch, setSelectedMatch] = useState<PlaydateMatch | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    try {
      setSearchError(null);
      const filters: {
        distance?: number;
        playStyles?: string[];
        energy?: number;
        size?: string;
      } = {
        distance: filterState.filters.distance,
      };
      if (filterState.filters.playStyles.length > 0) {
        filters.playStyles = filterState.filters.playStyles;
      }
      if (filterState.filters.energy !== undefined) {
        filters.energy = filterState.filters.energy;
      }
      if (filterState.filters.size !== undefined) {
        filters.size = filterState.filters.size;
      }
      await findMatches(filters);
    } catch {
      setSearchError('Failed to find matches. Please try again.');
    }
  }, [findMatches, filterState.filters]);

  const handleCreatePlaydate = useCallback(
    async (match: PlaydateMatch) => {
      try {
        navigation.navigate('PackBuilder', {
          hostPetId: petId,
          initialMatch: match,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to create playdate. Please try again.');
      }
    },
    [navigation, petId],
  );


  // Loading skeleton component
  const LoadingSkeleton = useMemo(() => (
    <View style={styles.skeletonContainer} testID="loading-skeleton">
      <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
        <Skeleton width="60%" height={24} borderRadius={8} />
        <View style={{ marginTop: 16, gap: 12 }}>
          <Skeleton width="100%" height={40} borderRadius={8} />
          <Skeleton width="100%" height={40} borderRadius={8} />
        </View>
      </View>
      <View style={styles.resultsContainer}>
        <Skeleton width="50%" height={20} borderRadius={8} />
        <View style={{ marginTop: 16, gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.matchCard, { backgroundColor: theme.colors.surface }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Skeleton width="40%" height={20} borderRadius={8} />
                <Skeleton width="20%" height={20} borderRadius={8} />
              </View>
              <TextSkeleton lines={3} />
            </View>
          ))}
        </View>
      </View>
    </View>
  ), [theme]);

  if (!pet) {
    return (
      <EliteContainer>
        <EliteHeader title="Find Playmates" />
        {LoadingSkeleton}
      </EliteContainer>
    );
  }

  return (
    <EliteContainer>
      <EliteHeader
        title={`Find Playmates for ${pet.name}`}
        subtitle={`${(pet as { playStyle?: string[]; energy?: number }).playStyle?.length || 0} play styles • Energy ${(pet as { energy?: number }).energy || 0}/5`}
      />

      <ScrollView style={styles.container}>
        {/* Filters */}
        <PlaydateFiltersPanel
          filters={filterState.filters}
          playStyles={filterState.playStyles}
          energyLevels={filterState.energyLevels}
          sizeOptions={filterState.sizeOptions}
          onFilterChange={filterState.updateFilter}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Results */}
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: theme.colors.onSurface }]}>
            Compatible Playmates ({matches.length})
          </Text>

          {loading ? (
            <View style={styles.loading}>
              <Text style={{ color: theme.colors.onSurface }}>Finding matches...</Text>
            </View>
          ) : matches.length === 0 ? (
            <View
              style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}
              testID="empty-matches-state"
              accessibilityRole="alert"
              accessibilityLabel="No matches found"
            >
              <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                🐾 No matches found
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                Try adjusting your filters to find more playmates for {pet.name}
              </Text>
            </View>
          ) : (
            matches.map((match) => (
              <PlaydateMatchCard
                key={`${match.pet1._id}-${match.pet2._id}`}
                match={match}
                onPress={() => setSelectedMatch(match)}
                onCreatePlaydate={handleCreatePlaydate}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Match Detail Modal */}
      <MatchDetailModal
        visible={!!selectedMatch}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onCreatePlaydate={handleCreatePlaydate}
      />
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  skeletonContainer: {
    padding: 16,
  },
  filtersContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  matchCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
