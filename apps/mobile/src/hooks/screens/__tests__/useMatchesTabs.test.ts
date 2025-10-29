/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { useMatchesTabs } from '../useMatchesTabs';

describe('useMatchesTabs', () => {
  it('should initialize with matches tab as active', () => {
    const { result } = renderHook(() => useMatchesTabs());

    expect(result.current.activeTab).toBe('matches');
  });

  it('should switch to different tab', () => {
    const { result } = renderHook(() => useMatchesTabs());

    act(() => {
      result.current.setActiveTab('likes');
    });

    expect(result.current.activeTab).toBe('likes');
  });

  it('should check if tab is active', () => {
    const { result } = renderHook(() => useMatchesTabs());

    expect(result.current.isActive('matches')).toBe(true);
    expect(result.current.isActive('likes')).toBe(false);
    expect(result.current.isActive('passes')).toBe(false);
  });

  it('should update isActive checks when tab changes', () => {
    const { result } = renderHook(() => useMatchesTabs());

    act(() => result.current.setActiveTab('likes'));

    expect(result.current.isActive('matches')).toBe(false);
    expect(result.current.isActive('likes')).toBe(true);
    expect(result.current.isActive('passes')).toBe(false);
  });

  it('should support all tab types', () => {
    const { result } = renderHook(() => useMatchesTabs());

    const tabs = ['matches', 'likes', 'passes'] as const;

    tabs.forEach((tab) => {
      act(() => result.current.setActiveTab(tab));
      expect(result.current.activeTab).toBe(tab);
      expect(result.current.isActive(tab)).toBe(true);
    });
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useMatchesTabs());

    const firstSetActiveTab = result.current.setActiveTab;
    const firstIsActive = result.current.isActive;

    rerender();

    expect(result.current.setActiveTab).toBe(firstSetActiveTab);
    expect(result.current.isActive).toBe(firstIsActive);
  });

  it('should provide tab configuration', () => {
    const { result } = renderHook(() => useMatchesTabs());

    // Should provide tab configuration for UI rendering
    expect(typeof result.current.setActiveTab).toBe('function');
    expect(typeof result.current.isActive).toBe('function');
    expect(['matches', 'likes', 'passes']).toContain(result.current.activeTab);
  });
});
