/**
 * Marker Clustering Component
 * Groups nearby markers into clusters for better performance and UX
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export interface ClusterablePin {
  _id: string;
  latitude: number;
  longitude: number;
  activity?: string;
  [key: string]: unknown;
}

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  pins: ClusterablePin[];
}

interface ClusterMarkersProps {
  pins: ClusterablePin[];
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  clusterRadius?: number; // Distance in meters
  onClusterPress?: (cluster: Cluster) => void;
  onMarkerPress?: (pin: ClusterablePin) => void;
  getMarkerColor?: (pin: ClusterablePin) => string;
  renderCustomMarker?: (pin: ClusterablePin) => React.ReactNode;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cluster pins based on distance
 */
function clusterPins(
  pins: ClusterablePin[],
  clusterRadius: number,
  regionDelta: number,
): Cluster[] {
  if (pins.length === 0) return [];

  // Adaptive clustering radius based on zoom level
  const adaptiveRadius = Math.max(clusterRadius, regionDelta * 50000); // Scale with zoom

  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  pins.forEach((pin) => {
    if (processed.has(pin._id)) return;

    const cluster: Cluster = {
      id: `cluster_${pin._id}`,
      latitude: pin.latitude,
      longitude: pin.longitude,
      count: 1,
      pins: [pin],
    };

    // Find nearby pins
    pins.forEach((otherPin) => {
      if (otherPin._id === pin._id || processed.has(otherPin._id)) return;

      const distance = calculateDistance(
        pin.latitude,
        pin.longitude,
        otherPin.latitude,
        otherPin.longitude,
      );

      if (distance <= adaptiveRadius) {
        cluster.pins.push(otherPin);
        processed.add(otherPin._id);
      }
    });

    // Calculate cluster center (average of all pins)
    if (cluster.pins.length > 1) {
      const totalLat = cluster.pins.reduce((sum, p) => sum + p.latitude, 0);
      const totalLon = cluster.pins.reduce((sum, p) => sum + p.longitude, 0);
      cluster.latitude = totalLat / cluster.pins.length;
      cluster.longitude = totalLon / cluster.pins.length;
    }

    cluster.count = cluster.pins.length;
    clusters.push(cluster);
    processed.add(pin._id);
  });

  return clusters;
}

export function ClusterMarkers({
  pins,
  region,
  clusterRadius = 100, // 100 meters default
  onClusterPress,
  onMarkerPress,
  getMarkerColor,
  renderCustomMarker,
}: ClusterMarkersProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);

  // Calculate adaptive cluster radius based on zoom
  const zoomLevel = Math.log2(360 / region.latitudeDelta);
  const adaptiveClusterRadius = useMemo(() => {
    // Larger radius at lower zoom (zoomed out), smaller at higher zoom
    if (zoomLevel < 10) return clusterRadius * 3;
    if (zoomLevel < 12) return clusterRadius * 2;
    if (zoomLevel < 14) return clusterRadius;
    return clusterRadius * 0.5; // Very zoomed in - less clustering
  }, [zoomLevel, clusterRadius]);

  const clusters = useMemo(() => {
    return clusterPins(pins, adaptiveClusterRadius, region.latitudeDelta);
  }, [pins, adaptiveClusterRadius, region.latitudeDelta]);

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.count === 1) {
          // Single pin - render as regular marker
          const pin = cluster.pins[0]!;
          const markerColor = getMarkerColor?.(pin) || theme.colors.primary;

          if (renderCustomMarker) {
            return (
              <Marker
                key={pin._id}
                coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                onPress={() => onMarkerPress?.(pin)}
              >
                {renderCustomMarker(pin)}
              </Marker>
            );
          }

          return (
            <Marker
              key={pin._id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              pinColor={markerColor}
              onPress={() => onMarkerPress?.(pin)}
              title={pin.activity || 'Activity'}
            />
          );
        }

        // Cluster - render as cluster marker
        return (
          <Marker
            key={cluster.id}
            coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
            onPress={() => onClusterPress?.(cluster)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.clusterContainer}>
              <View style={styles.clusterCircle}>
                <Text style={styles.clusterText} adjustsFontSizeToFit numberOfLines={1}>
                  {cluster.count}
                </Text>
              </View>
            </View>
          </Marker>
        );
      })}
    </>
  );
}

function makeStyles(theme: AppTheme) {
  const clusterSize = 40;
  return StyleSheet.create({
    clusterContainer: {
      width: clusterSize,
      height: clusterSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clusterCircle: {
      width: clusterSize,
      height: clusterSize,
      borderRadius: clusterSize / 2,
      backgroundColor: theme.colors.primary,
      borderWidth: 3,
      borderColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    clusterText: {
      color: theme.colors.surface,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
}

