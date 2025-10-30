/**
 * Heatmap Overlay Component
 * Displays activity density heatmap on the map
 */
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/theme';

export type HeatPoint = { latitude: number; longitude: number; weight?: number };

interface Props {
  points: HeatPoint[];
  radius?: number;
  opacity?: number;
}

export default function HeatmapOverlay({ 
  points, 
  radius = 40, 
  opacity = 0.6 
}: Props): React.JSX.Element | null {
  const theme = useTheme();

  // Normalize points to react-native-maps format
  const normalizedPoints = useMemo(() => {
    return points.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      weight: point.weight || 1,
    }));
  }, [points]);

  if (!normalizedPoints?.length) return null;

  // Heatmap is only supported on iOS with Google Maps provider
  if (Platform.OS === 'android') {
    // Android doesn't support native heatmap - could implement custom overlay
    // For now, return null to avoid errors
    return null;
  }

  return (
    <Heatmap
      points={normalizedPoints}
      radius={radius}
      opacity={opacity}
      gradient={{
        colors: [
          'rgba(99, 102, 241, 0)', // Transparent blue
          'rgba(99, 102, 241, 0.3)', // Light blue
          theme.colors.primary, // Primary color
          theme.colors.success || '#4CAF50', // Green
          theme.colors.warning || '#FF9800', // Orange
          theme.colors.danger || '#F44336', // Red
        ],
        startPoints: [0, 0.1, 0.3, 0.5, 0.7, 0.9],
        colorMapSize: 256,
      }}
    />
  );
}
