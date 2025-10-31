/**
 * 🎯 FOUNDATION: FEATURE FLAGS TESTS
 * 
 * Tests for feature flags provider and hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { FeatureFlagsProvider, useFlags } from '../FeatureFlagsProvider';
import { useFlag } from '../useFlag';
import { DEFAULT_FLAGS } from '../flags';
import React from 'react';

describe('FeatureFlagsProvider', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should provide default flags', () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
    );

    const { result } = renderHook(() => useFlags(), { wrapper });
    
    expect(result.current['effects.enabled']).toBe(true);
    expect(result.current['effects.galaxy.enabled']).toBe(true);
    expect(result.current['effects.galaxy.maxCount']).toBe(60000);
  });

  it('should load remote flags from /flags.json', async () => {
    const remoteFlags = {
      'effects.enabled': false,
      'effects.galaxy.maxCount': 30000,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => remoteFlags,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
    );

    const { result } = renderHook(() => useFlags(), { wrapper });
    
    await waitFor(() => {
      expect(result.current['effects.enabled']).toBe(false);
      expect(result.current['effects.galaxy.maxCount']).toBe(30000);
    });
  });

  it('should respect safeMode query parameter', () => {
    const originalSearch = window.location.search;
    window.location.search = '?safeMode=1';

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
    );

    const { result } = renderHook(() => useFlags(), { wrapper });
    
    expect(result.current['effects.safeMode']).toBe(true);

    window.location.search = originalSearch;
  });

  it('should merge bootstrap flags with defaults', () => {
    const bootstrap = {
      'effects.enabled': false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagsProvider bootstrap={bootstrap}>{children}</FeatureFlagsProvider>
    );

    const { result } = renderHook(() => useFlags(), { wrapper });
    
    expect(result.current['effects.enabled']).toBe(false);
    expect(result.current['effects.galaxy.enabled']).toBe(true); // From defaults
  });
});

describe('useFlag', () => {
  it('should return individual flag value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
    );

    const { result } = renderHook(() => useFlag('effects.enabled'), { wrapper });
    
    expect(result.current).toBe(true);
  });
});

