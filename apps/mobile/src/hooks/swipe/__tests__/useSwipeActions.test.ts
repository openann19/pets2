/**
 * Tests for useSwipeActions hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSwipeActions } from '../useSwipeActions';
import { logger } from '../../../services/logger';

jest.mock('../../../services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

const mockPet = {
  _id: 'pet1',
  name: 'Fluffy',
  age: 2,
};

describe('useSwipeActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSwipeActions());

    expect(result.current.isProcessing).toBe(false);
  });

  it('should handle like action', async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useSwipeActions({
        onLike,
      }),
    );

    await act(async () => {
      await result.current.handleLike(mockPet);
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });

    expect(onLike).toHaveBeenCalledWith(mockPet);
    expect(logger.info).toHaveBeenCalledWith('Liked pet:', { petName: mockPet.name });
  });

  it('should handle pass action', async () => {
    const onPass = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useSwipeActions({
        onPass,
      }),
    );

    await act(async () => {
      await result.current.handlePass(mockPet);
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });

    expect(onPass).toHaveBeenCalledWith(mockPet);
    expect(logger.info).toHaveBeenCalledWith('Passed pet:', { petName: mockPet.name });
  });

  it('should handle super like action', async () => {
    const onSuperLike = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useSwipeActions({
        onSuperLike,
      }),
    );

    await act(async () => {
      await result.current.handleSuperLike(mockPet);
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });

    expect(onSuperLike).toHaveBeenCalledWith(mockPet);
    expect(logger.info).toHaveBeenCalledWith('Super liked pet:', { petName: mockPet.name });
  });

  it('should set isProcessing during action', async () => {
    const onLike = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const { result } = renderHook(() =>
      useSwipeActions({
        onLike,
      }),
    );

    act(() => {
      void result.current.handleLike(mockPet);
    });

    expect(result.current.isProcessing).toBe(true);

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
  });

  it('should not process if already processing', async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useSwipeActions({
        onLike,
      }),
    );

    await act(async () => {
      await Promise.all([result.current.handleLike(mockPet), result.current.handleLike(mockPet)]);
    });

    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    const onLike = jest.fn().mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() =>
      useSwipeActions({
        onLike,
      }),
    );

    await act(async () => {
      await result.current.handleLike(mockPet);
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it('should work without callbacks', async () => {
    const { result } = renderHook(() => useSwipeActions());

    await act(async () => {
      await result.current.handleLike(mockPet);
    });

    expect(result.current.isProcessing).toBe(false);
    expect(logger.info).toHaveBeenCalled();
  });
});
