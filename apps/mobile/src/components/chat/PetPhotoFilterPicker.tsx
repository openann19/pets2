/**
 * Pet Photo Filter Component
 * Fun filters for pet photos (hearts, paw prints, breed-themed)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';
import type { PetPhotoFilter } from '@pawfectmatch/core/types/pet-chat';

interface PetPhotoFilterPickerProps {
  selectedFilter?: PetPhotoFilter;
  onSelectFilter: (filter: PetPhotoFilter) => void;
  onClose: () => void;
}

const AVAILABLE_FILTERS: PetPhotoFilter[] = [
  {
    filterId: 'hearts',
    name: 'Hearts',
    category: 'hearts',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfjLk8L3RleHQ+PC9zdmc+',
  },
  {
    filterId: 'paw_prints',
    name: 'Paw Prints',
    category: 'paw_prints',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkYg8L3RleHQ+PC9zdmc+',
  },
  {
    filterId: 'dog_theme',
    name: 'Dog Lover',
    category: 'breed_themed',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkYk8L3RleHQ+PC9zdmc+',
  },
  {
    filterId: 'cat_theme',
    name: 'Cat Lover',
    category: 'breed_themed',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkYs8L3RleHQ+PC9zdmc+',
  },
  {
    filterId: 'summer',
    name: 'Summer Fun',
    category: 'seasonal',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfjLk8L3RleHQ+PC9zdmc+',
  },
  {
    filterId: 'winter',
    name: 'Winter Wonderland',
    category: 'seasonal',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkYg8L3RleHQ+PC9zdmc+',
  },
  {
    filterId: 'birthday',
    name: 'Birthday',
    category: 'seasonal',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkYg8L3RleHQ+PC9zdmc+',
  },
  {
    filterId: 'rainbow',
    name: 'Rainbow',
    category: 'fun',
    previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkYg8L3RleHQ+PC9zdmc+',
  },
];

export const PetPhotoFilterPicker: React.FC<PetPhotoFilterPickerProps> = ({
  selectedFilter,
  onSelectFilter,
  onClose,
}) => {
  const theme = useTheme();

  const filtersByCategory = AVAILABLE_FILTERS.reduce(
    (acc, filter) => {
      if (!acc[filter.category]) {
        acc[filter.category] = [];
      }
      acc[filter.category].push(filter);
      return acc;
    },
    {} as Record<string, PetPhotoFilter[]>,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Choose a Filter
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filtersList} showsVerticalScrollIndicator={false}>
        {Object.entries(filtersByCategory).map(([category, filters]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: theme.colors.onMuted }]}>
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
            </Text>
            <View style={styles.filtersGrid}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.filterId}
                  style={[
                    styles.filterItem,
                    {
                      backgroundColor:
                        selectedFilter?.filterId === filter.filterId
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor:
                        selectedFilter?.filterId === filter.filterId
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => onSelectFilter(filter)}
                >
                  <Image
                    source={{ uri: filter.previewImage }}
                    style={styles.filterPreview}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.filterName,
                      {
                        color:
                          selectedFilter?.filterId === filter.filterId
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  filtersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginTop: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterItem: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  filterPreview: {
    width: 60,
    height: 60,
  },
  filterName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

