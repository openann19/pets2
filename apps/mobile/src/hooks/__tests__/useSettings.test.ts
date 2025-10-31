/**
 * useSettings Hook Tests
 * Tests the settings management hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useSettings } from '../useSettings';

// Mock storage service
jest.mock('../services/storage', () => ({
  readJSON: jest.fn(),
  writeJSON: jest.fn(),
}));

import { readJSON, writeJSON } from '../services/storage';

const mockReadJSON = readJSON as jest.MockedFunction<typeof readJSON>;
const mockWriteJSON = writeJSON as jest.MockedFunction<typeof writeJSON>;

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should load settings from storage on mount', async () => {
    const storedSettings = {
      notifications: { matches: false, messages: true, nearby: false },
      privacy: { showAge: false, showDistance: true, showOnline: true },
      premiumHints: false,
    };

    mockReadJSON.mockResolvedValue(storedSettings);

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    expect(result.current.ready).toBe(false);

    await act(async () => {
      await waitForNextUpdate();
      jest.runAllTimers();
    });

    expect(result.current.ready).toBe(true);
    expect(result.current.settings).toEqual(storedSettings);
    expect(mockReadJSON).toHaveBeenCalledWith('pm_settings_v1', expect.any(Object));
  });

  it('should use defaults when storage fails', async () => {
    mockReadJSON.mockRejectedValue(new Error('Storage error'));

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    await act(async () => {
      await waitForNextUpdate();
      jest.runAllTimers();
    });

    expect(result.current.ready).toBe(true);
    expect(result.current.settings).toEqual({
      notifications: { matches: true, messages: true, nearby: true },
      privacy: { showAge: true, showDistance: true, showOnline: true },
      premiumHints: true,
    });
  });

  it('should update settings and persist to storage', async () => {
    mockReadJSON.mockResolvedValue({
      notifications: { matches: true, messages: true, nearby: true },
      privacy: { showAge: true, showDistance: true, showOnline: true },
      premiumHints: true,
    });

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    await act(async () => {
      await waitForNextUpdate();
      jest.runAllTimers();
    });

    await act(async () => {
      await result.current.update((settings) => {
        settings.notifications.matches = false;
      });
    });

    expect(result.current.settings.notifications.matches).toBe(false);
    expect(mockWriteJSON).toHaveBeenCalledWith('pm_settings_v1', expect.objectContaining({
      notifications: expect.objectContaining({
        matches: false,
      }),
    }));
  });

  it('should maintain stable update function reference', async () => {
    mockReadJSON.mockResolvedValue({
      notifications: { matches: true, messages: true, nearby: true },
      privacy: { showAge: true, showDistance: true, showOnline: true },
      premiumHints: true,
    });

    const { result, waitForNextUpdate, rerender } = renderHook(() => useSettings());

    await act(async () => {
      await waitForNextUpdate();
      jest.runAllTimers();
    });

    const firstUpdate = result.current.update;
    rerender();
    const secondUpdate = result.current.update;

    expect(firstUpdate).toBe(secondUpdate);
  });
});
