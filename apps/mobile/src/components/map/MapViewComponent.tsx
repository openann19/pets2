import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";

interface MapViewProps {
  region: any;
  userLocation: any;
  filteredPins: any[];
  filters: any;
  heatmapPoints: any[];
  onMarkerPress: (pin: any) => void;
  getMarkerColor: (activity: string, flag: boolean) => string;
  getStableMatchFlag: (pin: any) => boolean;
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
}) => (
  <MapView
    provider={PROVIDER_GOOGLE}
    style={styles.map}
    initialRegion={region}
    showsUserLocation
    testID="map-view"
  >
    {filters?.radius && userLocation ? (
      <Circle
        testID="map-radius"
        center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
        radius={filters.radius}
        strokeColor="rgba(99,102,241,0.4)"
        fillColor="rgba(99,102,241,0.15)"
      />
    ) : null}

    {/* Heatmap */}
    {/* <HeatmapOverlay points={heatmapPoints} /> */}

    {/* Pins */}
    {filteredPins.map((pin) => (
      <Marker
        key={pin._id}
        testID={`marker-${pin._id}`}
        coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
        pinColor={getMarkerColor(pin.activity, getStableMatchFlag(pin))}
        onPress={() => { onMarkerPress(pin); }}
        title={pin.activity}
        description={pin.message || ""}
      />
    ))}
  </MapView>
);

const styles = StyleSheet.create({
  map: { flex: 1 },
});
