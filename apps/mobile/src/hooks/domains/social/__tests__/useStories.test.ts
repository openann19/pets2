/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useStories } from "../useStories";

// Mock dependencies
const mockRefetch = jest.fn();
const mockMutateAsync = jest.fn();
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({
    data: mockStoryGroups,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: mockMutateAsync,
  })),
}));

jest.mock("../../../useSocket", () => ({
  useSocket: () => mockSocket,
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
  },
}));

jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockStoryGroups = [
  {
    userId: "user1",
    user: {
      _id: "user1",
      username: "alice",
      profilePhoto: "photo1.jpg",
    },
    stories: [
      {
        _id: "story1",
        userId: "user1",
        mediaType: "photo" as const,
        mediaUrl: "story1.jpg",
        duration: 5,
        viewCount: 10,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "story2",
        userId: "user1",
        mediaType: "video" as const,
        mediaUrl: "story2.mp4",
        duration: 10,
        viewCount: 5,
        createdAt: new Date().toISOString(),
      },
    ],
    storyCount: 2,
  },
  {
    userId: "user2",
    user: {
      _id: "user2",
      username: "bob",
    },
    stories: [
      {
        _id: "story3",
        userId: "user2",
        mediaType: "photo" as const,
        mediaUrl: "story3.jpg",
        duration: 5,
        viewCount: 20,
        createdAt: new Date().toISOString(),
      },
    ],
    storyCount: 1,
  },
];

describe("useStories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useStories());

    expect(result.current.currentGroupIndex).toBe(0);
    expect(result.current.currentStoryIndex).toBe(0);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("should provide story data", () => {
    const { result } = renderHook(() => useStories());

    expect(result.current.storyGroups).toEqual(mockStoryGroups);
    expect(result.current.currentGroup).toEqual(mockStoryGroups[0]);
    expect(result.current.currentStory).toEqual(mockStoryGroups[0].stories[0]);
  });

  it("should navigate to next story in same group", () => {
    const { result } = renderHook(() => useStories());

    act(() => {
      result.current.goToNextStory();
    });

    expect(result.current.currentGroupIndex).toBe(0);
    expect(result.current.currentStoryIndex).toBe(1);
    expect(result.current.currentStory).toEqual(mockStoryGroups[0].stories[1]);
  });

  it("should navigate to next group when stories end", () => {
    const { result } = renderHook(() => useStories(0));

    // Go to last story of first group
    act(() => {
      result.current.goToStory(0, 1);
    });

    expect(result.current.currentStoryIndex).toBe(1);

    // Navigate to next (should move to next group)
    act(() => {
      result.current.goToNextStory();
    });

    expect(result.current.currentGroupIndex).toBe(1);
    expect(result.current.currentStoryIndex).toBe(0);
    expect(result.current.currentStory).toEqual(mockStoryGroups[1].stories[0]);
  });

  it("should navigate to previous story", () => {
    const { result } = renderHook(() => useStories());

    // Go to second story
    act(() => {
      result.current.goToNextStory();
    });

    expect(result.current.currentStoryIndex).toBe(1);

    // Go back
    act(() => {
      result.current.goToPreviousStory();
    });

    expect(result.current.currentStoryIndex).toBe(0);
  });

  it("should navigate to previous group when at start of stories", () => {
    const { result } = renderHook(() => useStories(1));

    expect(result.current.currentGroupIndex).toBe(1);

    // Go to previous (should move to previous group, last story)
    act(() => {
      result.current.goToPreviousStory();
    });

    expect(result.current.currentGroupIndex).toBe(0);
    expect(result.current.currentStoryIndex).toBe(1); // Last story of previous group
  });

  it("should navigate to specific group", () => {
    const { result } = renderHook(() => useStories());

    act(() => {
      result.current.goToGroup(1);
    });

    expect(result.current.currentGroupIndex).toBe(1);
    expect(result.current.currentStoryIndex).toBe(0);
    expect(result.current.currentGroup).toEqual(mockStoryGroups[1]);
  });

  it("should navigate to specific story", () => {
    const { result } = renderHook(() => useStories());

    act(() => {
      result.current.goToStory(0, 1);
    });

    expect(result.current.currentGroupIndex).toBe(0);
    expect(result.current.currentStoryIndex).toBe(1);
    expect(result.current.currentStory).toEqual(mockStoryGroups[0].stories[1]);
  });

  it("should pause and unpause playback", () => {
    const { result } = renderHook(() => useStories());

    act(() => {
      result.current.setPaused(true);
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.setPaused(false);
    });

    expect(result.current.isPaused).toBe(false);
  });

  it("should toggle mute state", () => {
    const { result } = renderHook(() => useStories());

    act(() => {
      result.current.setMuted(true);
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.setMuted(false);
    });

    expect(result.current.isMuted).toBe(false);
  });

  it("should mark story as viewed", async () => {
    mockMutateAsync.mockResolvedValue({ success: true, viewCount: 15 });

    const { result } = renderHook(() => useStories());

    await act(async () => {
      await result.current.markAsViewed("story1");
    });

    expect(mockMutateAsync).toHaveBeenCalledWith("story1");
  });

  it("should refresh stories", async () => {
    mockRefetch.mockResolvedValue({ data: mockStoryGroups });

    const { result } = renderHook(() => useStories());

    await act(async () => {
      await result.current.refreshStories();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should handle socket events for view updates", () => {
    const { result } = renderHook(() => useStories());

    expect(mockSocket.on).toHaveBeenCalledWith(
      "story:viewed",
      expect.any(Function),
    );
  });

  it("should reset progress when navigating", () => {
    const { result } = renderHook(() => useStories());

    // Set some progress
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Navigate
    act(() => {
      result.current.goToNextStory();
    });

    expect(result.current.progress).toBe(0);
  });

  it("should provide timer refs", () => {
    const { result } = renderHook(() => useStories());

    expect(result.current.timerRef).toBeDefined();
    expect(result.current.progressIntervalRef).toBeDefined();
    expect(result.current.longPressTimer).toBeDefined();
  });

  it("should not navigate beyond last story", () => {
    const { result } = renderHook(() => useStories(1));

    // Go to last story of last group
    expect(result.current.currentGroupIndex).toBe(1);
    expect(result.current.currentStoryIndex).toBe(0);

    // Try to go next (should stay at same position)
    act(() => {
      result.current.goToNextStory();
    });

    expect(result.current.currentGroupIndex).toBe(1);
    expect(result.current.currentStoryIndex).toBe(0);
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() => useStories());

    const firstGoToNextStory = result.current.goToNextStory;
    const firstSetPaused = result.current.setPaused;

    rerender();

    expect(result.current.goToNextStory).toBe(firstGoToNextStory);
    expect(result.current.setPaused).toBe(firstSetPaused);
  });
});
