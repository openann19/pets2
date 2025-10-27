import React from "react";
import { fireEvent } from "@testing-library/react-native";
import { Animated } from "react-native";
import { renderWithProviders, mockNavigate } from "./test-utils";
import MapScreen from "../MapScreen";

/* ---- Stable module mocks ---- */
jest.mock("react-native-maps");
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children, ...rest }: any) => (
      <View accessibilityLabel="LinearGradient" {...rest}>
        {children}
      </View>
    ),
  };
});
jest.mock("../../hooks/navigation/useTabDoublePress", () => ({
  useTabDoublePress: (cb: () => void) => void cb,
}));
const mockGetCurrentLocation = jest.fn();
const mockToggleFilterPanel = jest.fn();
const mockSetSelectedPin = jest.fn();
const mockSetFilters = jest.fn();
const mockToggleActivity = jest.fn();

jest.mock("../../components/map", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    MapFiltersModal: ({ onSetFilters, onToggleActivity }: any) => (
      <View testID="MapFiltersModal">
        <TouchableOpacity
          accessibilityLabel="apply-filters"
           testID="MapScreen.base.test-button-2" accessibilityRole="button" onPress={() => {
            onToggleActivity("walk");
            onSetFilters({ radius: 1000 });
          }}
        >
          <Text>Filters</Text>
        </TouchableOpacity>
      </View>
    ),
    MapStatsPanel: ({ stats }: { stats: any }) => (
      <View testID="MapStatsPanel">
        <Text>{JSON.stringify(stats)}</Text>
      </View>
    ),
    PinDetailsModal: ({ visible, onClose }: any) =>
      visible ? (
        <View testID="PinDetailsModal">
          <TouchableOpacity accessibilityLabel="close-pin"  testID="MapScreen.base.test-button-2" accessibilityRole="button" onPress={onClose}>
            <Text>Close Pin</Text>
          </TouchableOpacity>
        </View>
      ) : null,
  };
});

jest.mock("../../hooks/screens/useMapScreen", () => {
  const { Animated } = require("react-native");
  return {
    useMapScreen: () => ({
      region: {
        latitude: 42.6977,
        longitude: 23.3219,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      userLocation: { latitude: 42.6977, longitude: 23.3219 },
      filteredPins: [
        {
          _id: "pin-1",
          latitude: 42.698,
          longitude: 23.322,
          activity: "walk",
          message: "Dog walking spotted",
          title: "Pin #1",
        },
      ],
      filters: { radius: 500, types: { walk: true } },
      stats: { activeDogs: 3, activeCats: 1, hotspots: 2 },
      selectedPin: null,
      filterPanelHeight: new Animated.Value(120),
      statsOpacity: new Animated.Value(1),
      activityTypes: ["walk", "play", "lost_pet"],
      setSelectedPin: mockSetSelectedPin,
      setFilters: mockSetFilters,
      getCurrentLocation: mockGetCurrentLocation,
      toggleFilterPanel: mockToggleFilterPanel,
      toggleActivity: mockToggleActivity,
      getMarkerColor: (activity: string, isMatch: boolean) => {
        if (isMatch) return "#00ff88";
        if (activity === "walk") return "#4da6ff";
        return "#ffffff";
      },
      getStableMatchFlag: (pin: any) => pin.activity === "walk",
    }),
  };
});

/* ---- Tests ---- */

describe("MapScreen (base)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders header title and subtitle", () => {
    const { getByText } = renderWithProviders(<MapScreen navigation={{ navigate: mockNavigate }} as any />);
    expect(getByText("Pet Activity Map")).toBeTruthy();
    expect(getByText("Real-time locations")).toBeTruthy();
  });

  it("shows MapView, Circle (radius), and at least one Marker", () => {
    const { getByTestId, getAllByTestId } = renderWithProviders(<MapScreen navigation={{ navigate: mockNavigate }} as any />);
    expect(getByTestId("MapView")).toBeTruthy();
    expect(getByTestId("Circle")).toBeTruthy();
    expect(getAllByTestId("Marker").length).toBeGreaterThan(0);
  });

  it("FAB: pressing location triggers getCurrentLocation()", () => {
    const { getAllByText } = renderWithProviders(<MapScreen navigation={{ navigate: mockNavigate }} as any />);
    fireEvent.press(getAllByText("📍")[0]);
    expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
  });

  it("settings button toggles filter panel", () => {
    const { getByText } = renderWithProviders(<MapScreen navigation={{ navigate: mockNavigate }} as any />);
    fireEvent.press(getByText("⚙️"));
    expect(mockToggleFilterPanel).toHaveBeenCalledTimes(1);
  });

  it("AR FAB navigates to ARScentTrails with user location", () => {
    const { getAllByText } = renderWithProviders(<MapScreen navigation={{ navigate: mockNavigate }} as any />);
    fireEvent.press(getAllByText("👁️")[0]);
    expect(mockNavigate).toHaveBeenCalledWith("ARScentTrails", {
      initialLocation: { latitude: 42.6977, longitude: 23.3219 },
    });
  });

  it("filters modal: apply triggers activity toggle + setFilters", () => {
    const { getByTestId, getByText } = renderWithProviders(<MapScreen navigation={{ navigate: mockNavigate }} as any />);
    expect(getByTestId("MapFiltersModal")).toBeTruthy();
    fireEvent.press(getByText("Filters"));
    expect(mockToggleActivity).toHaveBeenCalledWith("walk");
    expect(mockSetFilters).toHaveBeenCalledWith({ radius: 1000 });
  });

  it("stats panel renders stats payload", () => {
    const { getByTestId } = renderWithProviders(<MapScreen navigation={{ navigate: mockNavigate }} as any />);
    const statsNode = getByTestId("MapStatsPanel");
    expect(statsNode).toBeTruthy();
    expect(statsNode.props.children.props.children).toContain('activeDogs');
  });
});

