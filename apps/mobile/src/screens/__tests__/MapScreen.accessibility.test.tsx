import React from "react";
import { renderWithProviders, mockNavigate } from "./test-utils";

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
  const { View, Text } = require("react-native");
  return {
    MapFiltersModal: () => <View testID="MapFiltersModal" />,
    MapStatsPanel: () => <View testID="MapStatsPanel"><Text>stats</Text></View>,
    PinDetailsModal: () => null,
  };
});
jest.mock("../../hooks/navigation/useTabDoublePress", () => ({
  useTabDoublePress: (cb: () => void) => void cb,
}));

jest.mock("../../hooks/screens/useMapScreen", () => ({
  useMapScreen: () => ({
    region: { latitude: 0, longitude: 0, latitudeDelta: 0.1, longitudeDelta: 0.1 },
    userLocation: { latitude: 1, longitude: 1 },
    filteredPins: [],
    filters: { radius: 400, types: { walk: true } },
    stats: { activeDogs: 0, activeCats: 0, hotspots: 0 },
    selectedPin: null,
    filterPanelHeight: { },
    statsOpacity: { },
    activityTypes: ["walk","play","lost_pet"],
    setSelectedPin: jest.fn(),
    setFilters: jest.fn(),
    getCurrentLocation: jest.fn(),
    toggleFilterPanel: jest.fn(),
    toggleActivity: jest.fn(),
    getMarkerColor: () => "#fff",
    getStableMatchFlag: () => false,
  }),
}));

describe("MapScreen (accessibility)", () => {
  it("has visible headings and decorative gradient container", async () => {
    const Screen = require("../MapScreen").default as React.ComponentType<any>;
    const { getByText, getByA11yLabel } = renderWithProviders(
      <Screen navigation={{ navigate: mockNavigate }} />
    );
    expect(getByText("Pet Activity Map")).toBeTruthy();
    expect(getByText("Real-time locations")).toBeTruthy();
    expect(getByA11yLabel("LinearGradient")).toBeTruthy();
  });
});

