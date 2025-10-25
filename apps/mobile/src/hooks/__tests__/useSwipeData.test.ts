/**
 * useSwipeData Test Suite
 * Comprehensive tests for swipe data hook
 */

import { renderHook, act } from "@testing-library/react-hooks";
import { useSwipeData } from "../useSwipeData";
import { useAuthStore } from "../../stores/useAuthStore";
import { useFilterStore } from "../../store/filterStore";
import { matchesAPI } from "../../services/api";
import { logger } from "../../services/logger";
import {
  createMockPet,
  createMockUser,
} from "../../__tests__/utils/testFactories";

// Mock dependencies
jest.mock("../../stores/useAuthStore");
jest.mock("../../store/filterStore");
jest.mock("../../services/api");
jest.mock("../../services/logger");
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe("useSwipeData", () => {
  const mockUser = createMockUser();
  const mockPets = [createMockPet(), createMockPet()];
  const mockFilters = {
    species: "dog",
    breed: "Golden Retriever",
    ageMin: 1,
    ageMax: 5,
    distance: 25,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({ user: mockUser });
    (useFilterStore as jest.Mock).mockReturnValue({
      filters: mockFilters,
      setFilters: jest.fn(),
    });
    (matchesAPI.getPets as jest.Mock).mockResolvedValue(mockPets);
    (matchesAPI.likePet as jest.Mock).mockResolvedValue({ success: true });
    (matchesAPI.passPet as jest.Mock).mockResolvedValue({ success: true });
    (matchesAPI.superLikePet as jest.Mock).mockResolvedValue({ success: true });
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useSwipeData());

      expect(result.current.pets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.showFilters).toBe(false);
      expect(result.current.showMatchModal).toBe(false);
      expect(result.current.matchedPet).toBeNull();
    });

    it("should initialize filters from store", () => {
      const { result } = renderHook(() => useSwipeData());

      expect(result.current.filters).toEqual({
        species: "dog",
        breed: "Golden Retriever",
        ageMin: 1,
        ageMax: 5,
        distance: 25,
      });
    });
  });

  describe("Load Pets", () => {
    it("should load pets successfully", async () => {
      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.pets).toEqual(mockPets);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.currentIndex).toBe(0);
      expect(matchesAPI.getPets).toHaveBeenCalledWith({
        species: "dog",
        breed: "Golden Retriever",
        minAge: 1,
        maxAge: 5,
        maxDistance: 25,
      });
    });

    it("should handle loading state during pet fetch", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (matchesAPI.getPets as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useSwipeData());

      act(() => {
        result.current.loadPets();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockPets);
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle error when loading pets fails", async () => {
      const error = new Error("Network error");
      (matchesAPI.getPets as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.isLoading).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it("should not load pets when user is not authenticated", async () => {
      (useAuthStore as jest.Mock).mockReturnValue({ user: null });

      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.error).toBe("User not authenticated");
      expect(matchesAPI.getPets).not.toHaveBeenCalled();
    });

    it("should build API filters correctly", async () => {
      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(matchesAPI.getPets).toHaveBeenCalledWith({
        species: "dog",
        breed: "Golden Retriever",
        minAge: 1,
        maxAge: 5,
        maxDistance: 25,
      });
    });
  });

  describe("Swipe Actions", () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useSwipeData());
      await act(async () => {
        await result.current.loadPets();
      });
    });

    it("should handle like action", async () => {
      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        await result.current.handleSwipe("like");
      });

      expect(matchesAPI.likePet).toHaveBeenCalledWith(mockPets[0]._id);
      expect(result.current.currentIndex).toBe(1);
    });

    it("should handle pass action", async () => {
      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        await result.current.handleSwipe("pass");
      });

      expect(matchesAPI.passPet).toHaveBeenCalledWith(mockPets[0]._id);
      expect(result.current.currentIndex).toBe(1);
    });

    it("should handle superlike action", async () => {
      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        await result.current.handleSwipe("superlike");
      });

      expect(matchesAPI.superLikePet).toHaveBeenCalledWith(mockPets[0]._id);
      expect(result.current.currentIndex).toBe(1);
    });

    it("should handle button swipe actions", async () => {
      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        result.current.handleButtonSwipe("like");
      });

      expect(matchesAPI.likePet).toHaveBeenCalledWith(mockPets[0]._id);
      expect(result.current.currentIndex).toBe(1);
    });

    it("should handle match when like is successful", async () => {
      (matchesAPI.likePet as jest.Mock).mockResolvedValue({
        success: true,
        isMatch: true,
        matchId: "match-123",
      });

      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        await result.current.handleSwipe("like");
      });

      expect(result.current.showMatchModal).toBe(true);
      expect(result.current.matchedPet).toEqual(mockPets[0]);
    });

    it("should handle swipe errors gracefully", async () => {
      const error = new Error("Swipe failed");
      (matchesAPI.likePet as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        await result.current.handleSwipe("like");
      });

      expect(result.current.error).toBe("Swipe failed");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("State Management", () => {
    it("should set current index", () => {
      const { result } = renderHook(() => useSwipeData());

      act(() => {
        result.current.setCurrentIndex(2);
      });

      expect(result.current.currentIndex).toBe(2);
    });

    it("should toggle filters visibility", () => {
      const { result } = renderHook(() => useSwipeData());

      act(() => {
        result.current.setShowFilters(true);
      });

      expect(result.current.showFilters).toBe(true);

      act(() => {
        result.current.setShowFilters(false);
      });

      expect(result.current.showFilters).toBe(false);
    });

    it("should toggle match modal visibility", () => {
      const { result } = renderHook(() => useSwipeData());

      act(() => {
        result.current.setShowMatchModal(true);
      });

      expect(result.current.showMatchModal).toBe(true);

      act(() => {
        result.current.setShowMatchModal(false);
      });

      expect(result.current.showMatchModal).toBe(false);
    });

    it("should set matched pet", () => {
      const { result } = renderHook(() => useSwipeData());
      const pet = createMockPet();

      act(() => {
        result.current.setMatchedPet(pet);
      });

      expect(result.current.matchedPet).toEqual(pet);
    });

    it("should update filters", () => {
      const { result } = renderHook(() => useSwipeData());
      const newFilters = {
        species: "cat",
        breed: "Siamese",
        ageMin: 2,
        ageMax: 8,
        distance: 30,
      };

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });
  });

  describe("Refresh Functionality", () => {
    it("should refresh pets", async () => {
      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        result.current.setCurrentIndex(2);
        result.current.refreshPets();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(matchesAPI.getPets).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty pets array", async () => {
      (matchesAPI.getPets as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.pets).toEqual([]);
      expect(result.current.currentIndex).toBe(0);
    });

    it("should handle single pet", async () => {
      const singlePet = [createMockPet()];
      (matchesAPI.getPets as jest.Mock).mockResolvedValue(singlePet);

      const { result } = renderHook(() => useSwipeData());

      await act(async () => {
        await result.current.loadPets();
        await result.current.handleSwipe("like");
      });

      expect(result.current.currentIndex).toBe(1);
    });

    it("should handle index out of bounds", () => {
      const { result } = renderHook(() => useSwipeData());

      act(() => {
        result.current.setCurrentIndex(-1);
      });

      expect(result.current.currentIndex).toBe(-1);

      act(() => {
        result.current.setCurrentIndex(100);
      });

      expect(result.current.currentIndex).toBe(100);
    });
  });

  describe("Filter Integration", () => {
    it("should sync with filter store", () => {
      const mockSetFilters = jest.fn();
      (useFilterStore as jest.Mock).mockReturnValue({
        filters: mockFilters,
        setFilters: mockSetFilters,
      });

      const { result } = renderHook(() => useSwipeData());

      act(() => {
        result.current.setFilters({
          species: "cat",
          breed: "Persian",
          ageMin: 3,
          ageMax: 7,
          distance: 40,
        });
      });

      expect(mockSetFilters).toHaveBeenCalled();
    });

    it("should handle undefined filter values", () => {
      (useFilterStore as jest.Mock).mockReturnValue({
        filters: {
          species: undefined,
          breed: undefined,
          ageMin: undefined,
          ageMax: undefined,
          distance: undefined,
        },
        setFilters: jest.fn(),
      });

      const { result } = renderHook(() => useSwipeData());

      expect(result.current.filters).toEqual({
        species: "",
        breed: "",
        ageMin: 0,
        ageMax: 20,
        distance: 50,
      });
    });
  });
});
