import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMapScreen } from "../hooks/screens/useMapScreen";
import { MapViewComponent } from "../components/map/MapViewComponent";
import { MapControls } from "../components/map/MapControls";
import { MapStatsPanel, MapFiltersModal, PinDetailsModal, CreateActivityModal } from "../components/map";
import { ScreenShell } from "../ui/layout/ScreenShell";
import { AdvancedHeader, HeaderConfigs } from "../components/Advanced/AdvancedHeader";
import { haptic } from "../ui/haptics";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "@/theme";
import { useTranslation } from 'react-i18next';

type MapScreenProps = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation }: MapScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('map');
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

  // Dynamic styles that depend on theme
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
    fabCreate: { backgroundColor: theme.colors.primary },
    fabText: { fontSize: 18 },
  });

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
            title: t('pet_activity_map'),
            subtitle: t('real_time_locations'),
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
      <MapViewComponent
        region={region}
        userLocation={userLocation}
        filteredPins={filteredPins}
        filters={filters}
        heatmapPoints={heatmapPoints}
        onMarkerPress={setSelectedPin}
        getMarkerColor={getMarkerColor}
        getStableMatchFlag={getStableMatchFlag}
      />

      {/* Stats Panel */}
      <MapStatsPanel stats={stats} opacity={statsOpacity} />

      {/* Floating controls */}
      <MapControls
        onLocatePress={getCurrentLocation}
        onARPress={() => {
          haptic.confirm();
          navigation.navigate("ARScentTrails", { initialLocation: userLocation });
        }}
        onCreatePress={() => setShowCreate(true)}
        onFilterPress={toggleFilterPanel}
      />

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
        onClose={() => { setSelectedPin(null); }}
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

