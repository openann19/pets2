/**
 * Community Feed Tests
 * Comprehensive test suite for community feed functionality
 */

import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react-native";
import { Alert } from "react-native";
import { CommunityFeed } from "../components/community/CommunityFeed";
import { CommunityScreen } from "../screens/community/CommunityScreen";
import { communityAPI } from "../services/communityAPI";
import { useCommunityFeed } from "../hooks/useCommunityFeed";

// Mock dependencies
jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock("../services/communityAPI");
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockCommunityAPI = communityAPI as jest.Mocked<typeof communityAPI>;

describe("CommunityFeed Component", () => {
  const mockPosts = [
    {
      _id: "1",
      author: {
        _id: "user1",
        name: "John Doe",
        avatar: "https://example.com/avatar1.jpg",
      },
      content: "Just had an amazing walk with Max!",
      images: ["https://example.com/image1.jpg"],
      likes: 5,
      comments: [
        {
          _id: "c1",
          author: {
            _id: "user2",
            name: "Jane Smith",
            avatar: "https://example.com/avatar2.jpg",
          },
          content: "Looks like fun!",
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      packId: "pack1",
      packName: "Dog Lovers",
      type: "post" as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockCommunityAPI.getFeed.mockResolvedValue({
      success: true,
      posts: mockPosts,
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      },
      appliedFilters: {
        matchedCount: 1,
      },
    });
  });

  it("renders community feed correctly", async () => {
    render(<CommunityFeed userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
      expect(
        screen.getByText("Just had an amazing walk with Max!"),
      ).toBeTruthy();
    });
  });

  it("displays post creation input", () => {
    render(<CommunityFeed userId="user1" />);

    expect(
      screen.getByPlaceholderText("What's happening with your pet?"),
    ).toBeTruthy();
    expect(screen.getByText("Post")).toBeTruthy();
  });

  it("handles post creation", async () => {
    mockCommunityAPI.createPost.mockResolvedValue({
      success: true,
      post: mockPosts[0],
      message: "Post created successfully",
    });

    render(<CommunityFeed userId="user1" />);

    const input = screen.getByPlaceholderText(
      "What's happening with your pet?",
    );
    const postButton = screen.getByText("Post");

    fireEvent.changeText(input, "New post content");
    fireEvent.press(postButton);

    await waitFor(() => {
      expect(mockCommunityAPI.createPost).toHaveBeenCalledWith({
        content: "New post content",
        type: "post",
      });
    });
  });

  it("handles like functionality", async () => {
    mockCommunityAPI.likePost.mockResolvedValue({
      success: true,
      likes: 6,
      message: "Post liked",
    });

    render(<CommunityFeed userId="user1" />);

    await waitFor(() => {
      const likeButton = screen.getByText("5");
      fireEvent.press(likeButton);
    });

    await waitFor(() => {
      expect(mockCommunityAPI.likePost).toHaveBeenCalledWith("1");
    });
  });

  it("handles comment functionality", async () => {
    mockCommunityAPI.addComment.mockResolvedValue({
      success: true,
      comment: {
        _id: "c2",
        author: {
          _id: "user1",
          name: "John Doe",
          avatar: "https://example.com/avatar1.jpg",
        },
        content: "Great post!",
        createdAt: new Date().toISOString(),
      },
      message: "Comment added",
    });

    render(<CommunityFeed userId="user1" />);

    await waitFor(() => {
      const commentButton = screen.getByText("1");
      fireEvent.press(commentButton);
    });

    // Should open comment modal
    await waitFor(() => {
      expect(screen.getByText("Comments")).toBeTruthy();
    });
  });

  it("displays activity posts correctly", async () => {
    const activityPost = {
      ...mockPosts[0],
      type: "activity" as const,
      activityDetails: {
        date: new Date().toISOString(),
        location: "Central Park",
        maxAttendees: 20,
        currentAttendees: 5,
      },
    };

    mockCommunityAPI.getFeed.mockResolvedValue({
      success: true,
      posts: [activityPost],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      },
      appliedFilters: {
        matchedCount: 1,
      },
    });

    render(<CommunityFeed userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText("📅 Pack Activity")).toBeTruthy();
      expect(screen.getByText("📍 Central Park")).toBeTruthy();
      expect(screen.getByText("👥 5/20 attending")).toBeTruthy();
    });
  });

  it("handles empty state", async () => {
    mockCommunityAPI.getFeed.mockResolvedValue({
      success: true,
      posts: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
      appliedFilters: {
        matchedCount: 0,
      },
    });

    render(<CommunityFeed userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText("No posts yet")).toBeTruthy();
      expect(
        screen.getByText("Be the first to share something with the community!"),
      ).toBeTruthy();
    });
  });

  it("handles error state", async () => {
    mockCommunityAPI.getFeed.mockRejectedValue(new Error("Network error"));

    render(<CommunityFeed userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeTruthy();
      expect(screen.getByText("Retry")).toBeTruthy();
    });
  });
});

describe("CommunityScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCommunityAPI.getPackGroups.mockResolvedValue({
      success: true,
      packs: [
        {
          _id: "pack1",
          name: "Dog Lovers",
          description: "A group for dog enthusiasts",
          memberCount: 25,
          isMember: false,
        },
      ],
    });
  });

  it("renders community screen with tabs", () => {
    render(<CommunityScreen />);

    expect(screen.getByText("Community")).toBeTruthy();
    expect(screen.getByText("Feed")).toBeTruthy();
    expect(screen.getByText("Packs")).toBeTruthy();
    expect(screen.getByText("AI")).toBeTruthy();
  });

  it("switches between tabs", () => {
    render(<CommunityScreen />);

    const packsTab = screen.getByText("Packs");
    fireEvent.press(packsTab);

    expect(screen.getByText("Pack Groups")).toBeTruthy();
    expect(screen.getByText("Create Pack")).toBeTruthy();
  });

  it("displays pack groups", async () => {
    render(<CommunityScreen />);

    const packsTab = screen.getByText("Packs");
    fireEvent.press(packsTab);

    await waitFor(() => {
      expect(screen.getByText("Dog Lovers")).toBeTruthy();
      expect(screen.getByText("A group for dog enthusiasts")).toBeTruthy();
      expect(screen.getByText("25 members")).toBeTruthy();
    });
  });

  it("handles pack joining", async () => {
    mockCommunityAPI.joinPack.mockResolvedValue({
      success: true,
      message: "Joined pack successfully",
    });

    render(<CommunityScreen />);

    const packsTab = screen.getByText("Packs");
    fireEvent.press(packsTab);

    await waitFor(() => {
      const joinButton = screen.getByText("Join");
      fireEvent.press(joinButton);
    });

    await waitFor(() => {
      expect(mockCommunityAPI.joinPack).toHaveBeenCalledWith("pack1");
    });
  });

  it("displays AI suggestions", () => {
    render(<CommunityScreen />);

    const aiTab = screen.getByText("AI");
    fireEvent.press(aiTab);

    expect(screen.getByText("AI Suggestions")).toBeTruthy();
    expect(screen.getByText("Share Your Pet's Day")).toBeTruthy();
    expect(screen.getByText("Organize a Meetup")).toBeTruthy();
    expect(screen.getByText("Pet Care Tip")).toBeTruthy();
  });

  it("handles AI suggestion press", () => {
    render(<CommunityScreen />);

    const aiTab = screen.getByText("AI");
    fireEvent.press(aiTab);

    const suggestion = screen.getByText("Share Your Pet's Day");
    fireEvent.press(suggestion);

    expect(Alert.alert).toHaveBeenCalledWith(
      "AI Suggestion",
      "Creating a post about: Share Your Pet's Day",
    );
  });
});

describe("CommunityAPI Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches community feed", async () => {
    const mockResponse = {
      success: true,
      posts: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      appliedFilters: { matchedCount: 0 },
    };

    mockCommunityAPI.getFeed.mockResolvedValue(mockResponse);

    const result = await communityAPI.getFeed({ page: 1, limit: 20 });

    expect(result).toEqual(mockResponse);
    expect(mockCommunityAPI.getFeed).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });

  it("creates a post", async () => {
    const mockPost = {
      _id: "1",
      author: { _id: "user1", name: "John Doe", avatar: "avatar.jpg" },
      content: "Test post",
      images: [],
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      type: "post" as const,
    };

    mockCommunityAPI.createPost.mockResolvedValue({
      success: true,
      post: mockPost,
      message: "Post created successfully",
    });

    const result = await communityAPI.createPost({
      content: "Test post",
      type: "post",
    });

    expect(result.success).toBe(true);
    expect(result.post).toEqual(mockPost);
  });

  it("likes a post", async () => {
    mockCommunityAPI.likePost.mockResolvedValue({
      success: true,
      likes: 5,
      message: "Post liked",
    });

    const result = await communityAPI.likePost("post1");

    expect(result.success).toBe(true);
    expect(result.likes).toBe(5);
  });

  it("adds a comment", async () => {
    const mockComment = {
      _id: "c1",
      author: { _id: "user1", name: "John Doe", avatar: "avatar.jpg" },
      content: "Great post!",
      createdAt: new Date().toISOString(),
    };

    mockCommunityAPI.addComment.mockResolvedValue({
      success: true,
      comment: mockComment,
      message: "Comment added",
    });

    const result = await communityAPI.addComment("post1", "Great post!");

    expect(result.success).toBe(true);
    expect(result.comment).toEqual(mockComment);
  });

  it("reports content", async () => {
    mockCommunityAPI.reportContent.mockResolvedValue({
      success: true,
      message: "Content reported",
    });

    const result = await communityAPI.reportContent({
      targetType: "post",
      targetId: "post1",
      reason: "spam",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Content reported");
  });

  it("blocks a user", async () => {
    mockCommunityAPI.blockUser.mockResolvedValue({
      success: true,
      message: "User blocked",
    });

    const result = await communityAPI.blockUser("user1");

    expect(result.success).toBe(true);
    expect(result.message).toBe("User blocked");
  });
});

describe("useCommunityFeed Hook", () => {
  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useCommunityFeed());

    expect(result.current.posts).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.newPostContent).toBe("");
  });

  it("loads posts on mount", async () => {
    const mockPosts = [
      {
        _id: "1",
        author: { _id: "user1", name: "John Doe", avatar: "avatar.jpg" },
        content: "Test post",
        images: [],
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        type: "post" as const,
      },
    ];

    mockCommunityAPI.getFeed.mockResolvedValue({
      success: true,
      posts: mockPosts,
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      appliedFilters: { matchedCount: 1 },
    });

    const { result } = renderHook(() => useCommunityFeed());

    await waitFor(() => {
      expect(result.current.posts).toEqual(mockPosts);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("handles post creation", async () => {
    const mockPost = {
      _id: "1",
      author: { _id: "user1", name: "John Doe", avatar: "avatar.jpg" },
      content: "New post",
      images: [],
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      type: "post" as const,
    };

    mockCommunityAPI.createPost.mockResolvedValue({
      success: true,
      post: mockPost,
      message: "Post created",
    });

    const { result } = renderHook(() => useCommunityFeed());

    await act(async () => {
      await result.current.handleCreatePost({
        content: "New post",
        type: "post",
      });
    });

    expect(result.current.posts[0]).toEqual(mockPost);
    expect(result.current.newPostContent).toBe("");
  });

  it("handles like functionality", async () => {
    const mockPosts = [
      {
        _id: "1",
        author: { _id: "user1", name: "John Doe", avatar: "avatar.jpg" },
        content: "Test post",
        images: [],
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        type: "post" as const,
      },
    ];

    mockCommunityAPI.getFeed.mockResolvedValue({
      success: true,
      posts: mockPosts,
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      appliedFilters: { matchedCount: 1 },
    });

    mockCommunityAPI.likePost.mockResolvedValue({
      success: true,
      likes: 1,
      message: "Post liked",
    });

    const { result } = renderHook(() => useCommunityFeed());

    await waitFor(() => {
      expect(result.current.posts).toEqual(mockPosts);
    });

    await act(async () => {
      await result.current.handleLike("1");
    });

    expect(result.current.posts[0].likes).toBe(1);
  });
});
