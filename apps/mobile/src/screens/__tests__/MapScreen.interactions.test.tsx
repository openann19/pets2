import React from "react";
import { fireEvent } from "@testing-library/react-native";
import { renderWithProviders, mockNavigate } from "./test-utils";

/* Use shared pro map mock with onPress support */
jest.mock("react-native-maps");

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children, ...rest }: any) => (
      <View accessibilityLabel="LinearGradient" {...rest}>{children}</View>
    ),
  };
});

jest.mock("../../components/map", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    MapFiltersModal: () => <View testID="MapFiltersModal" />,
    MapStatsPanel: () => <View testID="MapStatsPanel"><Text>stats</Text></View>,
    PinDetailsModal: ({ visible, onClose }: any) =>
      visible ? (
        <View testID="PinDetailsModal">
          <TouchableOpacity accessibilityLabel="close-pin"  testID="MapScreen.interactions.test-button-2" accessibilityRole="button" onPress={onClose}>
            <Text>Close Pin</Text>
          </TouchableOpacity>
        </View>
      ) : null,
  };
});

const baseHook = {
  region: {
    latitude: 42.6977, longitude: 23.3219, latitudeDelta: 0.05, longitudeDelta: 0.05,
  },
  userLocation: { latitude: 42.6977, longitude: 23.3219 },
  filters: { radius: 500, types: { walk: true } },
  stats: { activeDogs: 3, activeCats: 1, hotspots: 2 },
  filterPanelHeight: { }, statsOpacity: { },
  activityTypes: ["walk","play","lost_pet"],
  setSelectedPin: jest.fn(),
  setFilters: jest.fn(),
  getCurrentLocation: jest.fn(),
  toggleFilterPanel: jest.fn(),
  toggleActivity: jest.fn(),
  getMarkerColor: (activity: string, isMatch: boolean) => isMatch ? "#00ff88" : activity==="walk" ? "#4da6ff" : "#fff",
  getStableMatchFlag: (pin: any) => pin.activity === "walk",
};

describe("MapScreen (interactions)", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("tapping a Marker calls setSelectedPin and opens PinDetailsModal; close hides it", async () => {
    jest.doMock("../../hooks/screens/useMapScreen", () => ({
      useMapScreen: () => ({
        ...baseHook,
        filteredPins: [
          { _id: "pin-1", latitude: 1, longitude: 1, activity: "walk", message: "hello", title: "Pin #1" },
        ],
        selectedPin: { _id: "pin-1" },
      }),
    }));

    const { default: MapScreen } = await import("../MapScreen");
    const { getAllByTestId, getByTestId, getByLabelText, queryByTestId } =
      renderWithProviders(<MapScreen navigation={{navigate: mockNavigate}} as any />);

    // Marker should be present and pressable
    const markers = getAllByTestId("Marker");
    expect(markers.length).toBeGreaterThan(0);
    fireEvent.press(markers[0]);

    // PinDetails visible
    expect(getByTestId("PinDetailsModal")).toBeTruthy();

    // Close
    fireEvent.press(getByLabelText("close-pin"));
    expect(queryByTestId("PinDetailsModal")).toBeFalsy();
  });

  it("AR FAB is disabled when userLocation is missing (no navigation occurs)", async () => {
    const navSpy = mockNavigate;
    jest.doMock("../../hooks/screens/useMapScreen", () => ({
      useMapScreen: () => ({
        ...baseHook,
        userLocation: null,
        filteredPins: [
          { _id: "pin-1", latitude: 1, longitude: 1, activity: "walk", title: "Pin #1" },
        ],
        selectedPin: null,
      }),
    }));

    const { default: MapScreen } = await import("../MapScreen");
    const { getAllByText } = renderWithProviders(<MapScreen navigation={{navigate: mockNavigate}} as any />);
    fireEvent.press(getAllByText("👁️")[0]);
    expect(navSpy).not.toHaveBeenCalled();
  });
});

