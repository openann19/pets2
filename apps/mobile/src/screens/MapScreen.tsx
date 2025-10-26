import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import {
  Animated,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";

import {
  MapFiltersModal,
  MapStatsPanel,
  PinDetailsModal,
} from "../components/map";
import { useMapScreen } from "../hooks/screens/useMapScreen";
import type { RootStackParamList } from "../navigation/types";

type MapScreenProps = NativeStackScreenProps<RootStackParamList, "Map">;

type ArScentTrailsNavigation = {
  navigate: (
    screen: "ARScentTrails",
    params: RootStackParamList["ARScentTrails"],
  ) => void;
};

function MapScreen({ navigation }: MapScreenProps): React.JSX.Element {
  const {
    region,
    userLocation,
    filteredPins,
    filters,
    stats,
    selectedPin,
    filterPanelHeight,
    statsOpacity,
    activityTypes,
    setSelectedPin,
    setFilters,
    getCurrentLocation,
    toggleFilterPanel,
    toggleActivity,
    getMarkerColor,
    getStableMatchFlag,
  } = useMapScreen();

  const navigateToArScentTrails = useCallback(() => {
    const typedNavigation = navigation as unknown as ArScentTrailsNavigation;

    typedNavigation.navigate("ARScentTrails", {
      initialLocation: userLocation ?? null,
    });
  }, [navigation, userLocation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Header */}
      <LinearGradient colors={["#1F2937", "#374151"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🗺️</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Pet Activity Map</Text>
              <Text style={styles.headerSubtitle}>Real-time locations</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={toggleFilterPanel}>
            <Text style={styles.filterButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <MapStatsPanel stats={stats} opacity={statsOpacity} />
      </LinearGradient>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        loadingEnabled={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#EC4899"
          />
        )}

        {/* Pet activity markers */}
        {filteredPins.map((pin) => {
          const isMatch = getStableMatchFlag(pin);
          return (
            <React.Fragment key={pin._id}>
              <Marker
                coordinate={{
                  latitude: pin.latitude,
                  longitude: pin.longitude,
                }}
                title={pin.activity}
                description={pin.message || "Pet activity"}
                pinColor={getMarkerColor(pin.activity, isMatch)}
                onPress={() => {
                  setSelectedPin(pin);
                }}
              />

              {/* Activity radius circle */}
              <Circle
                center={{
                  latitude: pin.latitude,
                  longitude: pin.longitude,
                }}
                radius={100}
                strokeColor={getMarkerColor(pin.activity, isMatch)}
                fillColor={`${getMarkerColor(pin.activity, isMatch)}20`}
                strokeWidth={2}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Filter Panel */}
      <Animated.View
        style={[
          styles.filterPanel,
          { height: filterPanelHeight },
        ]}
      >
        <MapFiltersModal
          filters={filters}
          activityTypes={activityTypes}
          onToggleActivity={toggleActivity}
          onSetFilters={setFilters}
        />
      </Animated.View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.arFab]}
          onPress={navigateToArScentTrails}
        >
          <Text style={styles.fabIcon}>👁️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.locationFab]}
          onPress={getCurrentLocation}
        >
          <Text style={styles.fabIcon}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Pin Detail Modal */}
      <Modal
        visible={!!selectedPin}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSelectedPin(null);
        }}
      >
        <PinDetailsModal
          visible={!!selectedPin}
          pin={selectedPin}
          activityTypes={activityTypes}
          onClose={() => setSelectedPin(null)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EC4899",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#D1D5DB",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 18,
  },
  map: {
    flex: 1,
  },
  filterPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationFab: {
    backgroundColor: "#3B82F6",
  },
  arFab: {
    backgroundColor: "#8B5CF6",
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default MapScreen;