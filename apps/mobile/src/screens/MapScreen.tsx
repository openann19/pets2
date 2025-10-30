import { useTheme } from '@mobile/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import {
  CreateActivityModal,
  MapFiltersModal,
  MapStatsPanel,
  PinDetailsModal,
} from '../components/map';
import { MapControls } from '../components/map/MapControls';
import { MapViewComponent } from '../components/map/MapViewComponent';
import { useMapScreen } from '../hooks/screens/useMapScreen';
import type { RootStackParamList } from '../navigation/types';
import { haptic } from '../ui/haptics';
import { ScreenShell } from '../ui/layout/ScreenShell';

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: MapScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('map');
  const {
    region,
    userLocation,
    filteredPins,
    filters,
    stats,
    selectedPin,
    showFilters,
    filterPanelHeight,
    statsOpacity,
    activityTypes,
    setSelectedPin,
    setFilters,
    getCurrentLocation,
    toggleFilterPanel,
    handlePinPress,
    toggleActivity,
    getMarkerColor,
    getStableMatchFlag,
    heatmapPoints,
  } = useMapScreen();

  const [showCreate, setShowCreate] = useState(false);

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    map: { flex: 1 },
    fabs: {
      position: 'absolute',
      right: theme.spacing.md,
      bottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    fab: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.border,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    fabLocate: { backgroundColor: theme.colors.surface },
    fabAR: { backgroundColor: theme.colors.surface },
    fabFilters: { backgroundColor: theme.colors.surface },
    fabCreate: { backgroundColor: theme.colors.primary },
    fabText: { fontSize: theme.typography.body.size + 2 },
  });

  const handleARPress = () => {
    haptic.confirm();
    if (userLocation) {
      navigation.navigate('ARScentTrails', {
        initialLocation: userLocation,
      });
    }
  };

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('pet_activity_map'),
            subtitle: t('real_time_locations'),
            showBackButton: true,
            onBackPress: () => {
              haptic.tap();
              navigation.goBack();
            },
          })}
        />
      }
    >
      <View
        testID="MapScreen"
        style={styles.container}
      >
        {/* MapView */}
        <MapViewComponent
          region={region}
          userLocation={userLocation}
          filteredPins={filteredPins}
          filters={filters}
          heatmapPoints={heatmapPoints}
          onMarkerPress={setSelectedPin}
          getMarkerColor={getMarkerColor}
          getStableMatchFlag={getStableMatchFlag}
        />

        {/* Stats Panel */}
        <MapStatsPanel
          stats={stats}
          opacity={statsOpacity}
        />

        {/* Floating controls */}
        <MapControls
          onLocatePress={getCurrentLocation}
          onARPress={() => {
            haptic.confirm();
            navigation.navigate('ARScentTrails', { initialLocation: userLocation });
          }}
          onCreatePress={() => setShowCreate(true)}
          onFilterPress={toggleFilterPanel}
        />

        {/* Filters modal */}
        {showFilters && (
          <View testID="filters-modal-wrapper">
            <MapFiltersModal
              filters={filters}
              activityTypes={activityTypes}
              onToggleActivity={toggleActivity}
              onSetFilters={setFilters}
            />
          </View>
        )}

        {/* Pin details */}
        <PinDetailsModal
          visible={!!selectedPin}
          pin={selectedPin as any}
          activityTypes={activityTypes.map((a) => a.id)}
          onClose={() => {
            setSelectedPin(null);
          }}
          onLike={() => navigation.navigate('Swipe')}
          onChat={() => {
            // Navigate to chat if match exists, otherwise show prompt
            navigation.navigate('Matches');
          }}
          testID="pin-details-modal"
        />

        {/* Create activity */}
        <View testID="create-activity-modal">
          <CreateActivityModal
            visible={showCreate}
            onClose={() => {
              haptic.selection();
              setShowCreate(false);
            }}
            pets={[]}
            activityTypes={activityTypes}
          />
        </View>
      </View>
    </ScreenShell>
  );
}
