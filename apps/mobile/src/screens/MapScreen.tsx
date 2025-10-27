import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMapScreen } from "../hooks/screens/useMapScreen";
import { MapFiltersModal, MapStatsPanel, PinDetailsModal, HeatmapOverlay, CreateActivityModal } from "../components/map";
import { ScreenShell } from "../ui/layout/ScreenShell";
import { AdvancedHeader, HeaderConfigs } from "../components/Advanced/AdvancedHeader";
import { haptic } from "../ui/haptics";
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

  const handleARPress = () => {
    haptic.confirm();
    if (userLocation) {
      navigation.navigate("ARScentTrails", {
        initialLocation: userLocation,
      });
    }
  };

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: "Pet Activity Map",
            subtitle: "Real-time locations",
            showBackButton: true,
            onBackPress: () => {
              haptic.tap();
              navigation.goBack();
            },
          })}
        />
      }
    >
      <View testID="MapScreen" style={styles.container}>

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
          onPress={() => {
            haptic.tap();
            getCurrentLocation();
          }}
          testID="fab-locate"
        >
          <Text style={styles.fabText}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabAR]}
          onPress={() => {
            haptic.confirm();
            navigation.navigate("ARScentTrails", { initialLocation: userLocation });
          }}
          testID="fab-ar"
        >
          <Text style={styles.fabText}>👁️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabCreate]}
          onPress={() => {
            haptic.confirm();
            setShowCreate(true);
          }}
          testID="fab-create-activity"
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabFilters]}
          onPress={() => {
            haptic.tap();
            toggleFilterPanel();
          }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
