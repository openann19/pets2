/**
 * useSmartSuggestions Hook Tests
 * Tests the smart suggestions hook
 */

import { useSmartSuggestions } from '../useSmartSuggestions';

describe('useSmartSuggestions', () => {
  it('should import without errors', () => {
    expect(useSmartSuggestions).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof useSmartSuggestions).toBe('function');
  });
});
