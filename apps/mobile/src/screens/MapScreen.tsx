// apps/mobile/src/screens/__tests__/MapScreen.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Animated } from "react-native";

import MapScreen from "../MapScreen";

// ---- Mocks ----

// react-navigation native stack props mock
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  return {
    // if you need more hooks from react-navigation, extend here
    useNavigation: () => ({ navigate: mockNavigate }),
  };
});

// mock navigation prop type that MapScreen receives from stack
const mockNavigationProp: any = {
  navigate: mockNavigate,
};

// mock map components so RN doesn't try to load native maps in Jest env
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const MockMapView = ({ children }: any) => (
    <View testID="MapView">{children}</View>
  );
  const MockMarker = ({ title }: any) => (
    <View testID="Marker">
      <Text>{title}</Text>
    </View>
  );
  const MockCircle = () => <View testID="Circle" />;

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
    Marker: MockMarker,
    Circle: MockCircle,
  };
});

// mock LinearGradient to a simple View
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

// mock tab double press hook => just call cb immediately for determinism
jest.mock("../../hooks/navigation/useTabDoublePress", () => ({
  useTabDoublePress: (cb: () => void) => {
    // we do NOT auto-call it here because in prod it's an event listener
    // Keeping it inert avoids side effects on mount.
    void cb;
  },
}));

// lightweight stubs for subpanels; render minimal content for assertions
jest.mock("../../components/map", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");

  return {
    MapFiltersModal: ({
      onSetFilters,
      onToggleActivity,
    }: {
      onSetFilters: any;
      onToggleActivity: any;
    }) => (
      <View testID="MapFiltersModal">
        <TouchableOpacity
          onPress={() => {
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
    PinDetailsModal: ({
      visible,
      onClose,
    }: {
      visible: boolean;
      onClose: () => void;
    }) =>
      visible ? (
        <View testID="PinDetailsModal">
          <TouchableOpacity onPress={onClose}>
            <Text>Close Pin</Text>
          </TouchableOpacity>
        </View>
      ) : null,
  };
});

// central hook mock: we fully control scenario data here
const mockGetCurrentLocation = jest.fn();
const mockToggleFilterPanel = jest.fn();
const mockSetSelectedPin = jest.fn();
const mockSetFilters = jest.fn();
const mockToggleActivity = jest.fn();

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
      userLocation: {
        latitude: 42.6977,
        longitude: 23.3219,
      },
      filteredPins: [
        {
          _id: "pin-1",
          latitude: 42.698,
          longitude: 23.322,
          activity: "walk",
          message: "Dog walking spotted",
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
      getStableMatchFlag: (pin: any) => {
        return pin.activity === "walk";
      },
    }),
  };
});

// ---- TESTS ----

describe("MapScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders header title and subtitle", () => {
    const { getByText } = render(<MapScreen navigation={mockNavigationProp} />);

    expect(getByText("Pet Activity Map")).toBeTruthy();
    expect(getByText("Real-time locations")).toBeTruthy();
  });

  it("shows MapView and at least one Marker", () => {
    const { getByTestId, getAllByTestId } = render(
      <MapScreen navigation={mockNavigationProp} />,
    );

    expect(getByTestId("MapView")).toBeTruthy();
    const markers = getAllByTestId("Marker");
    expect(markers.length).toBeGreaterThan(0);
  });

  it("pressing the location FAB triggers getCurrentLocation()", () => {
    const { getAllByText } = render(
      <MapScreen navigation={mockNavigationProp} />,
    );

    // "📍" is the location FAB icon
    const locateButtons = getAllByText("📍");
    fireEvent.press(locateButtons[0]);
    expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
  });

  it("pressing the filter button triggers toggleFilterPanel()", () => {
    const { getByText } = render(<MapScreen navigation={mockNavigationProp} />);

    // The filter/settings button has "⚙️"
    fireEvent.press(getByText("⚙️"));
    expect(mockToggleFilterPanel).toHaveBeenCalledTimes(1);
  });

  it("AR FAB navigates to ARScentTrails with user location", () => {
    const { getAllByText } = render(
      <MapScreen navigation={mockNavigationProp} />,
    );

    // "👁️" is AR FAB icon
    const arButtons = getAllByText("👁️");
    fireEvent.press(arButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("ARScentTrails", {
      initialLocation: {
        latitude: 42.6977,
        longitude: 23.3219,
      },
    });
  });
});
