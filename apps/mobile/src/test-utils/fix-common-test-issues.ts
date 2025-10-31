/**
 * Common Test Issues Fix Utilities
 * Helps identify and fix common test issues like "Expected 1 argument" errors
 */

/**
 * Check if a mock function is being called incorrectly
 * Returns helpful error message if issue detected
 */
export function validateMockCall(
  mockFn: jest.Mock,
  expectedArgs: number,
  actualCall?: unknown[]
): string | null {
  if (!mockFn.mock) {
    return 'Mock function does not have mock property';
  }

  if (actualCall && actualCall.length !== expectedArgs) {
    return `Expected ${expectedArgs} argument(s), but got ${actualCall.length}`;
  }

  // Check all calls
  const invalidCalls = mockFn.mock.calls.filter(
    (call) => call.length !== expectedArgs
  );

  if (invalidCalls.length > 0) {
    return `Found ${invalidCalls.length} call(s) with wrong number of arguments. Expected ${expectedArgs}, got: ${invalidCalls.map((c) => c.length).join(', ')}`;
  }

  return null;
}

/**
 * Fix common mock issues in test files
 * This is a helper to identify issues, not a runtime fix
 */
export const commonMockIssues = {
  /**
   * Issue: mockResolvedValue() called without argument
   * Fix: mockResolvedValue(value) or mockResolvedValue(undefined) if truly no value
   */
  emptyMockResolvedValue: {
    pattern: /\.mockResolvedValue\(\)/g,
    fix: (line: string, context: string) => {
      // Determine expected return type from context
      if (context.includes('Promise<void>') || context.includes('void')) {
        return line.replace(/\.mockResolvedValue\(\)/, '.mockResolvedValue(undefined)');
      }
      // Default to empty object for API responses
      if (context.includes('api') || context.includes('fetch') || context.includes('get') || context.includes('post')) {
        return line.replace(/\.mockResolvedValue\(\)/, '.mockResolvedValue({ data: {} })');
      }
      // Default fix
      return line.replace(/\.mockResolvedValue\(\)/, '.mockResolvedValue(undefined)');
    },
  },

  /**
   * Issue: mockReturnValue() called without argument
   */
  emptyMockReturnValue: {
    pattern: /\.mockReturnValue\(\)/g,
    fix: (line: string) => line.replace(/\.mockReturnValue\(\)/, '.mockReturnValue(undefined)'),
  },

  /**
   * Issue: Relative import paths that should use aliases
   */
  relativeImports: {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\//g,
    fix: (line: string, filePath: string) => {
      // Count ../ to determine depth
      const depth = (line.match(/\.\.\//g) || []).length;
      // Convert to alias based on depth
      if (depth >= 3) {
        return line.replace(/from ['"]\.\.\/\.\.\/\.\.\/(.*)['"]/, "from '@/hooks/$1'");
      }
      return line;
    },
  },
};

/**
 * Get suggestions for fixing a test file
 */
export function getTestFileSuggestions(content: string, filePath: string): string[] {
  const suggestions: string[] = [];

  // Check for empty mockResolvedValue
  if (commonMockIssues.emptyMockResolvedValue.pattern.test(content)) {
    suggestions.push(
      'Found .mockResolvedValue() calls without arguments. These should have a value: .mockResolvedValue({}) or .mockResolvedValue(undefined)'
    );
  }

  // Check for empty mockReturnValue
  if (commonMockIssues.emptyMockReturnValue.pattern.test(content)) {
    suggestions.push(
      'Found .mockReturnValue() calls without arguments. These should have a value: .mockReturnValue({}) or .mockReturnValue(undefined)'
    );
  }

  // Check for deep relative imports
  if (commonMockIssues.relativeImports.pattern.test(content)) {
    suggestions.push(
      `Found deep relative imports (../../../). Consider using aliases like @/hooks/, @/services/, etc.`
    );
  }

  return suggestions;
}

/**
 * Type-safe mock helper that ensures arguments are provided
 */
export function createSafeMock<TArgs extends unknown[], TReturn>(
  defaultReturn: TReturn,
  implementation?: (...args: TArgs) => TReturn
): jest.Mock<TReturn, TArgs> {
  const mock = jest.fn<TReturn, TArgs>(implementation);
  
  // Set default return value so it always returns something
  if (defaultReturn !== undefined) {
    mock.mockReturnValue(defaultReturn as TReturn);
  } else {
    mock.mockReturnValue(undefined as TReturn);
  }
  
  return mock;
}

/**
 * Safe mock resolved value - ensures argument is provided
 */
export function safeMockResolvedValue<T>(
  mock: jest.Mock<Promise<T>, unknown[]>,
  value: T
): void {
  mock.mockResolvedValue(value);
}

/**
 * Safe mock return value - ensures argument is provided
 */
export function safeMockReturnValue<T>(
  mock: jest.Mock<T, unknown[]>,
  value: T
): void {
  mock.mockReturnValue(value);
}

