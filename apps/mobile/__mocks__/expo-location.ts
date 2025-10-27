// Mock for expo-location
const Accuracy = {
  Lowest: 1,
  Low: 2,
  Balanced: 3,
  High: 4,
  Highest: 5,
  BestForNavigation: 6,
};

const getCurrentPositionAsync = jest.fn().mockResolvedValue({
  coords: {
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: null,
    accuracy: 5,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});

const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
  canAskAgain: true,
});

const getForegroundPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
  canAskAgain: true,
});

const watchPositionAsync = jest.fn().mockReturnValue({
  remove: jest.fn(),
});

const GeofencingEventType = {
  Enter: 'enter',
  Exit: 'exit',
};

const GeofencingRegionState = {
  Unknown: 'unknown',
  Inside: 'inside',
  Outside: 'outside',
};

// Export both as default and as named exports
const Location = {
  Accuracy,
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  getForegroundPermissionsAsync,
  watchPositionAsync,
  GeofencingEventType,
  GeofencingRegionState,
};

export default Location;

// Also export as named exports for namespace imports
export {
  Accuracy,
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  getForegroundPermissionsAsync,
  watchPositionAsync,
  GeofencingEventType,
  GeofencingRegionState,
};
