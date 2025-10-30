/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserIntentScreen } from '../useUserIntentScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock domain hook
const mockSelectIntent = jest.fn();
const mockConfirmIntent = jest.fn();

const mockIntents = [
  {
    id: 'find_match',
    title: 'Find a Match',
    description: 'Find a pet for mine',
  },
  {
    id: 'find_home',
    title: 'Find a Home',
    description: 'Find a home for my pet',
  },
  { id: 'browse', title: 'Just Browsing', description: 'Looking around' },
];

jest.mock('../../domains/onboarding/useUserIntent', () => ({
  useUserIntent: () => ({
    intents: mockIntents,
    selectedIntent: null,
    isNavigating: false,
    selectIntent: mockSelectIntent,
    confirmIntent: mockConfirmIntent,
    isValidSelection: false,
  }),
}));

describe('useUserIntentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with intents data', () => {
    const { result } = renderHook(() => useUserIntentScreen());

    expect(result.current.intents).toHaveLength(3);
    expect(result.current.selectedIntent).toBe(null);
    expect(result.current.isNavigating).toBe(false);
    expect(result.current.isValidSelection).toBe(false);
  });

  it('should provide intent selection function', () => {
    const { result } = renderHook(() => useUserIntentScreen());

    act(() => {
      result.current.selectIntent('find_match');
    });

    expect(mockSelectIntent).toHaveBeenCalledWith('find_match');
  });

  it('should not navigate when selection is invalid', async () => {
    const { result } = renderHook(() => useUserIntentScreen());

    await act(async () => {
      await result.current.handleContinue();
    });

    expect(mockConfirmIntent).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate when selection is valid', async () => {
    // Mock valid selection
    jest.resetModules();
    jest.mock('../../domains/onboarding/useUserIntent', () => ({
      useUserIntent: () => ({
        intents: mockIntents,
        selectedIntent: 'find_match',
        isNavigating: false,
        selectIntent: mockSelectIntent,
        confirmIntent: mockConfirmIntent.mockResolvedValue('find_match'),
        isValidSelection: true,
      }),
    }));

    mockConfirmIntent.mockResolvedValue('find_match');

    const { result } = renderHook(() => useUserIntentScreen());

    await act(async () => {
      await result.current.handleContinue();
    });

    expect(mockConfirmIntent).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('PetProfileSetup', {
      userIntent: 'find_match',
    });
  });

  it('should handle navigation back', () => {
    const { result } = renderHook(() => useUserIntentScreen());

    act(() => {
      result.current.handleGoBack();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('should handle confirmation errors gracefully', async () => {
    // Mock valid selection but error on confirmation
    jest.resetModules();
    mockConfirmIntent.mockRejectedValue(new Error('Network error'));

    jest.mock('../../domains/onboarding/useUserIntent', () => ({
      useUserIntent: () => ({
        intents: mockIntents,
        selectedIntent: 'find_match',
        isNavigating: false,
        selectIntent: mockSelectIntent,
        confirmIntent: mockConfirmIntent,
        isValidSelection: true,
      }),
    }));

    const { result } = renderHook(() => useUserIntentScreen());

    // Should not throw
    await act(async () => {
      await result.current.handleContinue();
    });

    expect(mockConfirmIntent).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should provide all intents data', () => {
    const { result } = renderHook(() => useUserIntentScreen());

    expect(result.current.intents).toEqual(mockIntents);
    expect(result.current.intents[0].id).toBe('find_match');
    expect(result.current.intents[1].id).toBe('find_home');
    expect(result.current.intents[2].id).toBe('browse');
  });

  it('should expose navigation state', () => {
    const { result } = renderHook(() => useUserIntentScreen());

    expect(result.current.isNavigating).toBe(false);
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useUserIntentScreen());

    const firstSelectIntent = result.current.selectIntent;
    const firstHandleContinue = result.current.handleContinue;
    const firstHandleGoBack = result.current.handleGoBack;

    rerender();

    expect(result.current.selectIntent).toBe(firstSelectIntent);
    expect(result.current.handleContinue).toBe(firstHandleContinue);
    expect(result.current.handleGoBack).toBe(firstHandleGoBack);
  });
});
