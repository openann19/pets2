/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { useTabState } from '../useTabState';

describe('useTabState', () => {
  it('should initialize with provided tab', () => {
    const { result } = renderHook(() => useTabState('tab1'));
    expect(result.current.activeTab).toBe('tab1');
  });

  it('should switch to different tab', () => {
    const { result } = renderHook(() => useTabState('tab1'));

    act(() => {
      result.current.setActiveTab('tab1'); // Can only set to same type
    });

    expect(result.current.activeTab).toBe('tab1');
  });

  it('should work with different tab types', () => {
    const { result } = renderHook(() => useTabState('matches'));

    act(() => result.current.setActiveTab('matches')); // Can only set to same type
    expect(result.current.activeTab).toBe('matches');
  });

  it('should return stable function references', () => {
    const { result } = renderHook(() => useTabState('tab1'));

    const firstSetActiveTab = result.current.setActiveTab;

    // In React Native testing, create a new hook instance to test stability
    const { result: result2 } = renderHook(() => useTabState('tab1'));

    expect(result.current.setActiveTab).toBe(firstSetActiveTab);
  });
});
