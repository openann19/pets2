import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import HeatmapOverlay from './HeatmapOverlay';
import { ClusterMarkers } from './ClusterMarkers';
import type { PulsePin } from '../hooks/screens/useMapScreen';

interface MapViewProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  userLocation: { latitude: number; longitude: number } | null;
  filteredPins: PulsePin[];
  filters: {
    showMyPets?: boolean;
    showMatches?: boolean;
    showNearby?: boolean;
    activityTypes: string[];
    radius: number;
    timeRange?: string;
    showHeatmap?: boolean;
    showClusters?: boolean;
    densityFilter?: 'low' | 'medium' | 'high' | 'all';
  };
  heatmapPoints: Array<{ latitude: number; longitude: number; weight?: number }>;
  onMarkerPress: (pin: PulsePin) => void;
  getMarkerColor: (activity: string, flag?: boolean) => string;
  getStableMatchFlag: (pin: PulsePin) => boolean;
}

export const MapViewComponent: React.FC<MapViewProps> = ({
  region,
  userLocation,
  filteredPins,
  filters,
  heatmapPoints,
  onMarkerPress,
  getMarkerColor,
  getStableMatchFlag,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [showHeatmap, setShowHeatmap] = useState(filters?.showHeatmap ?? false);
  const [useClustering, setUseClustering] = useState(filters?.showClusters ?? true);

  // Filter pins by density if needed
  const densityFilteredPins = React.useMemo(() => {
    if (!filters.densityFilter || filters.densityFilter === 'all') {
      return filteredPins;
    }

    // Calculate density and filter
    const densityMap = new Map<string, number>();
    const gridSize = 0.005; // ~500m grid

    filteredPins.forEach((pin) => {
      const gridX = Math.floor(pin.longitude / gridSize);
      const gridY = Math.floor(pin.latitude / gridSize);
      const key = `${gridX},${gridY}`;
      densityMap.set(key, (densityMap.get(key) || 0) + 1);
    });

    const threshold = filters.densityFilter === 'high' ? 5 : filters.densityFilter === 'medium' ? 3 : 1;

    return filteredPins.filter((pin) => {
      const gridX = Math.floor(pin.longitude / gridSize);
      const gridY = Math.floor(pin.latitude / gridSize);
      const key = `${gridX},${gridY}`;
      const density = densityMap.get(key) || 0;
      return density >= threshold;
    });
  }, [filteredPins, filters.densityFilter]);

  const handleClusterPress = React.useCallback(
    (cluster: { pins: PulsePin[] }) => {
      // Zoom in on cluster
      if (cluster.pins.length === 1) {
        onMarkerPress(cluster.pins[0]!);
      } else {
        // Could implement zoom-to-cluster functionality here
        onMarkerPress(cluster.pins[0]!);
      }
    },
    [onMarkerPress],
  );

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
        testID="map-view"
      >
        {filters?.radius && userLocation ? (
          <Circle
            testID="map-radius"
            center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
            radius={filters.radius * 1000} // Convert km to meters
            strokeColor="rgba(99,102,241,0.4)"
            fillColor="rgba(99,102,241,0.15)"
          />
        ) : null}

        {/* Heatmap Overlay */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <HeatmapOverlay points={heatmapPoints} />
        )}

        {/* Clustered or Individual Markers */}
        {useClustering ? (
          <ClusterMarkers
            pins={densityFilteredPins}
            region={region}
            clusterRadius={100} // 100 meters
            onClusterPress={handleClusterPress}
            onMarkerPress={onMarkerPress}
            getMarkerColor={(pin) => getMarkerColor(pin.activity, getStableMatchFlag(pin))}
          />
        ) : (
          densityFilteredPins.map((pin) => (
            <MapView.Marker
              key={pin._id}
              testID={`marker-${pin._id}`}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              pinColor={getMarkerColor(pin.activity, getStableMatchFlag(pin))}
              onPress={() => {
                onMarkerPress(pin);
              }}
              title={pin.activity}
              description={pin.message || ''}
            />
          ))
        )}
      </MapView>

      {/* Map Control Toggles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, showHeatmap && styles.controlButtonActive]}
          onPress={() => setShowHeatmap(!showHeatmap)}
          testID="toggle-heatmap"
        >
          <Text style={[styles.controlText, showHeatmap && styles.controlTextActive]}>
            🔥 Heatmap
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, useClustering && styles.controlButtonActive]}
          onPress={() => setUseClustering(!useClustering)}
          testID="toggle-clusters"
        >
          <Text style={[styles.controlText, useClustering && styles.controlTextActive]}>
            📍 Clusters
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    controls: {
      position: 'absolute',
      top: 16,
      right: 16,
      gap: 8,
    },
    controlButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    controlButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    controlText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    controlTextActive: {
      color: theme.colors.surface,
    },
  });
}
