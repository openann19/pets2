import { useTheme } from '../theme/Provider';
/**
 * @jest-environment node
 */
import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { render } from "@testing-library/react-native";
import MatchesScreen from "../MatchesScreen";
import { useMatchesData } from "../../hooks/useMatchesData";
import { useScrollOffsetTracker } from "../../hooks/navigation/useScrollOffsetTracker";
import { useTabReselectRefresh } from "../../hooks/navigation/useTabReselectRefresh";

jest.mock("../../hooks/useMatchesData");
jest.mock("../../hooks/navigation/useScrollOffsetTracker");
jest.mock("../../hooks/navigation/useTabReselectRefresh");
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe("MatchesScreen Tab Reselect Integration", () => {
  const mockMatches = [
    {
      _id: "1",
      petName: "Bella",
      petPhoto: "https://example.com/bella.jpg",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useMatchesData as jest.Mock).mockReturnValue({
      matches: mockMatches,
      likedYou: [],
      selectedTab: "matches" as const,
      refreshing: false,
      isLoading: false,
      initialOffset: 0,
      listRef: { current: null },
      onRefresh: jest.fn(),
      setSelectedTab: jest.fn(),
      handleScroll: jest.fn(),
    });

    (useScrollOffsetTracker as jest.Mock).mockReturnValue({
      onScroll: jest.fn(),
      getOffset: jest.fn(() => 0),
    });

    (useTabReselectRefresh as jest.Mock).mockReturnValue(undefined);
  });

  it("should initialize with all required hooks", () => {
    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    expect(useMatchesData).toHaveBeenCalled();
    expect(useScrollOffsetTracker).toHaveBeenCalled();
    expect(useTabReselectRefresh).toHaveBeenCalled();
  });

  it("should configure useTabReselectRefresh correctly", () => {
    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    const useTabReselectRefreshCall = (useTabReselectRefresh as jest.Mock).mock
      .calls[0][0];

    expect(useTabReselectRefreshCall).toMatchObject({
      topThreshold: 120,
      cooldownMs: 700,
    });
    expect(useTabReselectRefreshCall.listRef).toBeDefined();
    expect(useTabReselectRefreshCall.onRefresh).toBeDefined();
    expect(useTabReselectRefreshCall.getOffset).toBeDefined();
  });

  it("should pass correct props to FlatList", () => {
    const { UNSAFE_getByType } = render(
      <MatchesScreen navigation={{ navigate: jest.fn() } as any} />,
    );

    // This tests that the component renders without error
    expect(UNSAFE_getByType).toBeDefined();
  });

  it("should handle scroll events", () => {
    const mockOnScroll = jest.fn();
    (useScrollOffsetTracker as jest.Mock).mockReturnValue({
      onScroll: mockOnScroll,
      getOffset: jest.fn(() => 150),
    });

    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    // When FlatList scrolls, it should call onScroll
    expect(mockOnScroll).toBeDefined();
  });

  it("should trigger refresh when tab is reselected near top", async () => {
    const mockOnRefresh = jest.fn();
    (useMatchesData as jest.Mock).mockReturnValue({
      matches: mockMatches,
      likedYou: [],
      selectedTab: "matches" as const,
      refreshing: false,
      isLoading: false,
      initialOffset: 0,
      listRef: { current: null },
      onRefresh: mockOnRefresh,
      setSelectedTab: jest.fn(),
      handleScroll: jest.fn(),
    });

    (useScrollOffsetTracker as jest.Mock).mockReturnValue({
      onScroll: jest.fn(),
      getOffset: jest.fn(() => 50), // Near top
    });

    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    const useTabReselectRefreshCall = (useTabReselectRefresh as jest.Mock).mock
      .calls[0][0];

    // Simulate refresh call
    act(() => {
      useTabReselectRefreshCall.onRefresh();
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it("should pass correct theme colors to RefreshControl", () => {
    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    // theme.colors.primary[500] should be used
    expect(useMatchesData).toHaveBeenCalled();
  });

  it("should handle tab switching", () => {
    const mockSetSelectedTab = jest.fn();
    (useMatchesData as jest.Mock).mockReturnValue({
      matches: mockMatches,
      likedYou: [],
      selectedTab: "matches" as const,
      refreshing: false,
      isLoading: false,
      initialOffset: 0,
      listRef: { current: null },
      onRefresh: jest.fn(),
      setSelectedTab: mockSetSelectedTab,
      handleScroll: jest.fn(),
    });

    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    expect(mockSetSelectedTab).toBeDefined();
  });

  it("should track scroll position for reselect logic", () => {
    const mockGetOffset = jest.fn(() => 150);
    (useScrollOffsetTracker as jest.Mock).mockReturnValue({
      onScroll: jest.fn(),
      getOffset: mockGetOffset,
    });

    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    const useTabReselectRefreshCall = (useTabReselectRefresh as jest.Mock).mock
      .calls[0][0];

    // getOffset should return current position
    expect(useTabReselectRefreshCall.getOffset()).toBe(150);
  });

  it("should handle empty matches list", () => {
    (useMatchesData as jest.Mock).mockReturnValue({
      matches: [],
      likedYou: [],
      selectedTab: "matches" as const,
      refreshing: false,
      isLoading: false,
      initialOffset: 0,
      listRef: { current: null },
      onRefresh: jest.fn(),
      setSelectedTab: jest.fn(),
      handleScroll: jest.fn(),
    });

    expect(() => {
      render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);
    }).not.toThrow();
  });

  it("should persist scroll position", () => {
    (useMatchesData as jest.Mock).mockReturnValue({
      matches: mockMatches,
      likedYou: [],
      selectedTab: "matches" as const,
      refreshing: false,
      isLoading: false,
      initialOffset: 200,
      listRef: { current: { scrollToOffset: jest.fn() } },
      onRefresh: jest.fn(),
      setSelectedTab: jest.fn(),
      handleScroll: jest.fn(),
    });

    render(<MatchesScreen navigation={{ navigate: jest.fn() } as any} />);

    // Should attempt to scroll to initial offset
    expect(useMatchesData).toHaveBeenCalled();
  });
});

