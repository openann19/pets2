/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { usePetProfileSetupScreen } from "../usePetProfileSetupScreen";

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

const mockRoute = {
  params: {
    userIntent: "find_playmate",
  },
};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

// Mock pet profile setup domain hook
const mockUpdateProfile = jest.fn();
const mockSetCurrentStep = jest.fn();
const mockUploadPhoto = jest.fn();
const mockRemovePhoto = jest.fn();
const mockValidateCurrentStep = jest.fn();
const mockSubmitProfile = jest.fn();

const mockDomainHook = {
  profile: {
    name: "",
    breed: "",
    age: "",
    bio: "",
    photos: [],
  },
  state: {
    currentStep: 0,
    isSubmitting: false,
    error: null,
  },
  updateProfile: mockUpdateProfile,
  setCurrentStep: mockSetCurrentStep,
  uploadPhoto: mockUploadPhoto,
  removePhoto: mockRemovePhoto,
  validateCurrentStep: mockValidateCurrentStep,
  canProceed: false,
  progressPercentage: 0,
  submitProfile: mockSubmitProfile,
};

jest.mock("../../domains/onboarding/usePetProfileSetup", () => ({
  usePetProfileSetup: () => mockDomainHook,
}));

describe("usePetProfileSetupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateCurrentStep.mockReturnValue(true);
  });

  it("should initialize with data from domain hook", () => {
    const { result } = renderHook(() => usePetProfileSetupScreen());

    expect(result.current.profile).toEqual(mockDomainHook.profile);
    expect(result.current.state).toEqual(mockDomainHook.state);
    expect(result.current.canProceed).toBe(false);
    expect(result.current.progressPercentage).toBe(0);
  });

  it("should expose userIntent from route params", () => {
    const { result } = renderHook(() => usePetProfileSetupScreen());

    expect(result.current.userIntent).toBe("find_playmate");
  });

  it("should provide all navigation handlers", () => {
    const { result } = renderHook(() => usePetProfileSetupScreen());

    expect(typeof result.current.handleNext).toBe("function");
    expect(typeof result.current.handlePrevious).toBe("function");
    expect(typeof result.current.handleComplete).toBe("function");
    expect(typeof result.current.handleGoBack).toBe("function");
  });

  it("should handle next step when can proceed", () => {
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: true,
        state: { currentStep: 0, isSubmitting: false, error: null },
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
  });

  it("should not proceed to next step when cannot proceed", () => {
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: false,
        state: { currentStep: 0, isSubmitting: false, error: null },
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetCurrentStep).not.toHaveBeenCalled();
  });

  it("should not exceed max step (step 2)", () => {
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: true,
        state: { currentStep: 2, isSubmitting: false, error: null },
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetCurrentStep).not.toHaveBeenCalled();
  });

  it("should handle previous step", () => {
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        state: { currentStep: 1, isSubmitting: false, error: null },
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    act(() => {
      result.current.handlePrevious();
    });

    expect(mockSetCurrentStep).toHaveBeenCalledWith(0);
  });

  it("should not go below step 0", () => {
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        state: { currentStep: 0, isSubmitting: false, error: null },
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    act(() => {
      result.current.handlePrevious();
    });

    expect(mockSetCurrentStep).not.toHaveBeenCalled();
  });

  it("should handle complete and navigate to preferences", async () => {
    mockSubmitProfile.mockResolvedValue(undefined);

    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: true,
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    await act(async () => {
      await result.current.handleComplete();
    });

    expect(mockSubmitProfile).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("PreferencesSetup", {
      userIntent: "find_playmate",
    });
  });

  it("should not complete when cannot proceed", async () => {
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: false,
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    await act(async () => {
      await result.current.handleComplete();
    });

    expect(mockSubmitProfile).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should handle error during completion", async () => {
    const error = new Error("Submission failed");
    mockSubmitProfile.mockRejectedValue(error);

    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: true,
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    await act(async () => {
      await result.current.handleComplete();
    });

    expect(mockSubmitProfile).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should handle go back navigation", () => {
    const { result } = renderHook(() => usePetProfileSetupScreen());

    act(() => {
      result.current.handleGoBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it("should expose domain hook methods", () => {
    const { result } = renderHook(() => usePetProfileSetupScreen());

    expect(result.current.updateProfile).toBe(mockUpdateProfile);
    expect(result.current.setCurrentStep).toBe(mockSetCurrentStep);
    expect(result.current.uploadPhoto).toBe(mockUploadPhoto);
    expect(result.current.removePhoto).toBe(mockRemovePhoto);
    expect(result.current.validateCurrentStep).toBe(mockValidateCurrentStep);
  });

  it("should track progress percentage from domain hook", () => {
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        progressPercentage: 66,
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    expect(result.current.progressPercentage).toBe(66);
  });

  it("should expose profile data from domain hook", () => {
    const mockProfile = {
      name: "Buddy",
      breed: "Golden Retriever",
      age: "3",
      bio: "Friendly dog",
      photos: ["photo1.jpg", "photo2.jpg"],
    };

    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        profile: mockProfile,
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    expect(result.current.profile).toEqual(mockProfile);
  });

  it("should expose state from domain hook", () => {
    const mockState = {
      currentStep: 2,
      isSubmitting: true,
      error: "Validation error",
    };

    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        state: mockState,
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    expect(result.current.state).toEqual(mockState);
  });

  it("should handle multi-step navigation flow", () => {
    const { result, rerender } = renderHook(() => usePetProfileSetupScreen());

    // Step 0 -> Step 1
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: true,
        state: { currentStep: 0, isSubmitting: false, error: null },
      });

    rerender();

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetCurrentStep).toHaveBeenCalledWith(1);

    // Step 1 -> Step 2
    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: true,
        state: { currentStep: 1, isSubmitting: false, error: null },
      });

    rerender();

    act(() => {
      result.current.handleNext();
    });

    expect(mockSetCurrentStep).toHaveBeenCalledWith(2);
  });

  it("should pass userIntent to PreferencesSetup on complete", async () => {
    mockSubmitProfile.mockResolvedValue(undefined);

    const customRoute = {
      params: {
        userIntent: "find_companion",
      },
    };

    jest
      .mocked(require("@react-navigation/native").useRoute)
      .mockReturnValue(customRoute);

    jest
      .mocked(
        require("../../domains/onboarding/usePetProfileSetup")
          .usePetProfileSetup,
      )
      .mockReturnValue({
        ...mockDomainHook,
        canProceed: true,
      });

    const { result } = renderHook(() => usePetProfileSetupScreen());

    await act(async () => {
      await result.current.handleComplete();
    });

    expect(mockNavigate).toHaveBeenCalledWith("PreferencesSetup", {
      userIntent: "find_companion",
    });
  });
});
