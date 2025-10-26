import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMapScreen } from "../hooks/screens/useMapScreen";
import { MapFiltersModal, MapStatsPanel, PinDetailsModal, HeatmapOverlay, CreateActivityModal } from "../components/map";
import { startPetActivity } from "../services/petActivityService";
import type { RootStackParamList } from "../navigation/types";
import { Theme } from "../theme/unified-theme";

type MapScreenProps = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation }: MapScreenProps): React.JSX.Element {
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

  const onStartActivity = async (form: Parameters<typeof startPetActivity>[0]) => {
    await startPetActivity(form);
  };

  const handleARPress = () => {
    if (userLocation) {
      navigation.navigate("ARScentTrails", {
        initialLocation: userLocation,
      });
    }
  };

  return (
    <View testID="MapScreen" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pet Activity Map</Text>
        <Text style={styles.subtitle}>Real-time locations</Text>
      </View>

      {/* MapView */}
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
        <HeatmapOverlay points={heatmapPoints} />

        {/* Pins */}
        {filteredPins.map((pin) => (
          <Marker
            key={pin._id}
            testID={`marker-${pin._id}`}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            pinColor={getMarkerColor(pin.activity, getStableMatchFlag(pin))}
            onPress={() => setSelectedPin(pin)}
            title={pin.activity}
            description={pin.message || ""}
          />
        ))}
      </MapView>

      {/* Stats Panel */}
      <MapStatsPanel stats={stats} opacity={statsOpacity} />

      {/* Floating controls */}
      <View style={styles.fabs}>
        <TouchableOpacity
          style={[styles.fab, styles.fabLocate]}
          onPress={getCurrentLocation}
          testID="fab-locate"
        >
          <Text style={styles.fabText}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabAR]}
          onPress={() => navigation.navigate("ARScentTrails", { initialLocation: userLocation })}
          testID="fab-ar"
        >
          <Text style={styles.fabText}>👁️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabCreate]}
          onPress={() => setShowCreate(true)}
          testID="fab-create-activity"
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabFilters]}
          onPress={toggleFilterPanel}
          testID="btn-filters"
        >
          <Text style={styles.fabText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filters modal */}
      {showFilters && (
        <View testID="filters-modal-wrapper">
          <MapFiltersModal filters={filters} activityTypes={activityTypes} onToggleActivity={toggleActivity} onSetFilters={setFilters} />
        </View>
      )}

      {/* Pin details */}
      <PinDetailsModal
        visible={!!selectedPin}
        pin={selectedPin as any}
        activityTypes={activityTypes.map(a => a.id)}
        onClose={() => setSelectedPin(null)}
        onLike={() => navigation.navigate("Swipe")}
        onChat={() => {
          // Navigate to chat if match exists, otherwise show prompt
          navigation.navigate("Matches");
        }}
        testID="pin-details-modal"
      />

      {/* Create activity */}
      <CreateActivityModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onStart={onStartActivity}
        testID="create-activity-modal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingTop: 12, paddingBottom: 8, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: "800", color: Theme.colors.neutral[800] },
  subtitle: { color: Theme.colors.neutral[500], marginTop: 2 },
  map: { flex: 1 },
  fabs: { position: "absolute", right: 12, bottom: 24, gap: 10 },
  fab: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  fabLocate: { backgroundColor: "#fff" },
  fabAR: { backgroundColor: "#fff" },
  fabFilters: { backgroundColor: "#fff" },
  fabCreate: { backgroundColor: Theme.colors.primary[500] },
  fabText: { fontSize: 18 },
});
