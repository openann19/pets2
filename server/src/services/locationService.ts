/**
 * Location Service for PawfectMatch
 * Handles geolocation, distance calculations, and location-based features
 */

import logger from '../utils/logger';

class LocationService {
  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearby locations
   */
  async findNearbyLocations(center: [number, number], radius: number, locations: any[]): Promise<any[]> {
    try {
      const nearby = locations.filter(location => {
        if (!location.coordinates) return false;
        const distance = this.calculateDistance(center, location.coordinates);
        return distance <= radius;
      });

      // Sort by distance
      nearby.sort((a, b) => {
        const distA = this.calculateDistance(center, a.coordinates);
        const distB = this.calculateDistance(center, b.coordinates);
        return distA - distB;
      });

      return nearby;
    } catch (error) {
      logger.error('Error finding nearby locations', { error, center, radius });
      return [];
    }
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(coordinates: [number, number]): boolean {
    const [lat, lng] = coordinates;
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return false;
    }
    
    if (lat < -90 || lat > 90) {
      return false;
    }
    
    if (lng < -180 || lng > 180) {
      return false;
    }
    
    return true;
  }

  /**
   * Get address from coordinates
   */
  async reverseGeocode(coordinates: [number, number]): Promise<any> {
    try {
      // Mock reverse geocoding - in real implementation would use Google Maps API
      const [lat, lng] = coordinates;
      
      const address = {
        street: '123 Main St',
        city: 'Sample City',
        state: 'Sample State',
        zipCode: '12345',
        country: 'United States',
        formatted: '123 Main St, Sample City, Sample State 12345, United States'
      };

      logger.info('Reverse geocoding completed', { coordinates, address });
      return address;
    } catch (error) {
      logger.error('Error reverse geocoding', { error, coordinates });
      return null;
    }
  }

  /**
   * Get coordinates from address
   */
  async geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      // Mock geocoding - in real implementation would use Google Maps API
      const coordinates: [number, number] = [40.7128, -74.0060]; // New York City
      
      logger.info('Geocoding completed', { address, coordinates });
      return coordinates;
    } catch (error) {
      logger.error('Error geocoding address', { error, address });
      return null;
    }
  }

  /**
   * Calculate bounding box
   */
  calculateBoundingBox(center: [number, number], radius: number): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    const [lat, lng] = center;
    const latDelta = radius / 111; // Approximate km per degree latitude
    const lngDelta = radius / (111 * Math.cos(this.toRadians(lat))); // Adjust for longitude
    
    return {
      north: lat + latDelta,
      south: lat - latDelta,
      east: lng + lngDelta,
      west: lng - lngDelta
    };
  }

  /**
   * Check if coordinates are within bounding box
   */
  isWithinBoundingBox(coordinates: [number, number], boundingBox: any): boolean {
    const [lat, lng] = coordinates;
    
    return lat >= boundingBox.south &&
           lat <= boundingBox.north &&
           lng >= boundingBox.west &&
           lng <= boundingBox.east;
  }
}

export default new LocationService();
