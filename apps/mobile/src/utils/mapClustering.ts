/**
 * Map Clustering Utilities
 * Helper functions for marker clustering and density calculations
 */

export interface Point {
  latitude: number;
  longitude: number;
  weight?: number;
}

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  points: Point[];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
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
 * Calculate activity density for heatmap
 */
export function calculateActivityDensity(
  points: Point[],
  gridSize: number = 0.01, // ~1km grid
): Array<{ latitude: number; longitude: number; weight: number }> {
  if (points.length === 0) return [];

  const grid = new Map<string, { lat: number; lng: number; count: number; weight: number }>();

  points.forEach((point) => {
    const gridX = Math.floor(point.longitude / gridSize);
    const gridY = Math.floor(point.latitude / gridSize);
    const key = `${gridX},${gridY}`;

    if (!grid.has(key)) {
      grid.set(key, {
        lat: point.latitude,
        lng: point.longitude,
        count: 0,
        weight: 0,
      });
    }

    const cell = grid.get(key)!;
    cell.count++;
    cell.weight += point.weight || 1;
  });

  // Convert grid cells to heatmap points
  const heatmapPoints: Array<{ latitude: number; longitude: number; weight: number }> = [];
  grid.forEach((cell) => {
    if (cell.count >= 2) {
      // Only include cells with at least 2 points
      heatmapPoints.push({
        latitude: cell.lat,
        longitude: cell.lng,
        weight: Math.min(cell.weight / cell.count, 1), // Normalize to 0-1
      });
    }
  });

  return heatmapPoints;
}

/**
 * Get zoom level from region delta
 */
export function getZoomLevel(latitudeDelta: number): number {
  return Math.round(Math.log2(360 / latitudeDelta));
}

/**
 * Get adaptive cluster radius based on zoom level
 */
export function getAdaptiveClusterRadius(
  baseRadius: number,
  zoomLevel: number,
): number {
  if (zoomLevel < 10) return baseRadius * 3; // Very zoomed out
  if (zoomLevel < 12) return baseRadius * 2;
  if (zoomLevel < 14) return baseRadius;
  return baseRadius * 0.5; // Very zoomed in
}

