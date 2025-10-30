#!/usr/bin/env ts-node
/**
 * Cursor Prompt Deep Link Generator
 * 
 * Professional utility for generating Cursor IDE prompt deeplinks.
 * Supports both web format (cursor.com) and app format (cursor://).
 * 
 * Usage as module:
 *   import { generatePromptDeeplink } from './tools/cursor-deeplink-generator';
 *   const link = generatePromptDeeplink("Create a React component");
 * 
 * Usage as CLI:
 *   ts-node tools/cursor-deeplink-generator.ts "Your prompt text" [--web]
 */

/**
 * Configuration options for deeplink generation
 */
export interface DeeplinkOptions {
  /**
   * Whether to use web format (cursor.com) instead of app format (cursor://)
   * @default false
   */
  isWeb?: boolean;

  /**
   * Additional query parameters to include
   */
  additionalParams?: Record<string, string>;
}

/**
 * Validates and sanitizes prompt text
 * @param promptText The prompt text to validate
 * @returns Sanitized prompt text
 * @throws Error if prompt is invalid
 */
function validateAndSanitizePrompt(promptText: string): string {
  if (typeof promptText !== 'string') {
    throw new Error('Prompt text must be a string');
  }

  const trimmed = promptText.trim();

  if (trimmed.length === 0) {
    throw new Error('Prompt text cannot be empty');
  }

  if (trimmed.length > 10000) {
    throw new Error('Prompt text exceeds maximum length of 10000 characters');
  }

  // Remove control characters but preserve newlines and tabs
  return trimmed.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Encodes URL parameters safely
 * @param params Object with key-value pairs to encode
 * @returns URL-encoded query string
 */
function encodeQueryParams(params: Record<string, string>): string {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    // Validate key
    if (typeof key !== 'string' || key.length === 0) {
      continue;
    }

    // Sanitize key: only allow alphanumeric, hyphens, underscores, dots
    const sanitizedKey = key.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedKey.length === 0) {
      continue;
    }

    // Encode value
    const encodedValue = encodeURIComponent(value);
    pairs.push(`${sanitizedKey}=${encodedValue}`);
  }

  return pairs.join('&');
}

/**
 * Generates a Cursor prompt deeplink
 * 
 * @param promptText The prompt text to encode in the deeplink
 * @param options Optional configuration for deeplink generation
 * @returns Complete deeplink URL
 * 
 * @example
 * ```typescript
 * // App format (default)
 * const link = generatePromptDeeplink("Create a React component for user authentication");
 * // Returns: "cursor://anysphere.cursor-deeplink/prompt?text=Create%20a%20React%20component%20for%20user%20authentication"
 * 
 * // Web format
 * const webLink = generatePromptDeeplink("Fix TypeScript errors", { isWeb: true });
 * // Returns: "https://cursor.com/link/prompt?text=Fix%20TypeScript%20errors"
 * 
 * // With additional parameters
 * const linkWithParams = generatePromptDeeplink("Add feature", {
 *   additionalParams: { context: "mobile", priority: "high" }
 * });
 * ```
 */
export function generatePromptDeeplink(
  promptText: string,
  options: DeeplinkOptions = {}
): string {
  // Validate and sanitize input
  const sanitizedPrompt = validateAndSanitizePrompt(promptText);

  // Determine base URL based on format
  const isWeb = options.isWeb ?? false;
  const baseUrl = isWeb
    ? 'https://cursor.com/link/prompt'
    : 'cursor://anysphere.cursor-deeplink/prompt';

  // Build parameters
  const params: Record<string, string> = {
    text: sanitizedPrompt,
    ...(options.additionalParams ?? {}),
  };

  // Encode query string
  const queryString = encodeQueryParams(params);

  // Construct and return complete URL
  return `${baseUrl}?${queryString}`;
}

/**
 * Generates multiple deeplinks for batch processing
 * 
 * @param prompts Array of prompt texts
 * @param options Optional configuration (applied to all prompts)
 * @returns Array of deeplink URLs
 */
export function generateMultipleDeeplinks(
  prompts: string[],
  options: DeeplinkOptions = {}
): string[] {
  return prompts.map((prompt) => generatePromptDeeplink(prompt, options));
}

/**
 * Parses a Cursor deeplink back into its components
 * 
 * @param deeplink The deeplink URL to parse
 * @returns Parsed components or null if invalid
 */
export function parseDeeplink(deeplink: string): {
  format: 'web' | 'app';
  promptText: string;
  additionalParams: Record<string, string>;
} | null {
  try {
    // Check if it's a web or app format URL
    let url: URL;
    let format: 'web' | 'app';

    if (deeplink.startsWith('cursor://')) {
      // Convert custom scheme to http for URL parsing
      const httpUrl = deeplink.replace('cursor://', 'http://');
      url = new URL(httpUrl);
      format = 'app';
    } else if (deeplink.startsWith('https://cursor.com')) {
      url = new URL(deeplink);
      format = 'web';
    } else {
      return null;
    }

    // Verify path
    if (
      (format === 'web' && url.pathname !== '/link/prompt') ||
      (format === 'app' && url.pathname !== '/prompt')
    ) {
      return null;
    }

    // Extract parameters
    const promptText = url.searchParams.get('text') ?? '';
    const additionalParams: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      if (key !== 'text') {
        additionalParams[key] = value;
      }
    });

    return {
      format,
      promptText: decodeURIComponent(promptText),
      additionalParams,
    };
  } catch {
    return null;
  }
}

// ===== CLI Interface =====

/**
 * CLI entry point when executed directly
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Cursor Prompt Deep Link Generator

Usage:
  ts-node cursor-deeplink-generator.ts "<prompt text>" [options]

Options:
  --web              Generate web format (cursor.com) instead of app format
  --help, -h         Show this help message

Examples:
  ts-node cursor-deeplink-generator.ts "Create a React component for user authentication"
  ts-node cursor-deeplink-generator.ts "Fix TypeScript errors" --web
`);
    process.exit(0);
  }

  // Check for --web flag
  const isWebIndex = args.indexOf('--web');
  const isWeb = isWebIndex !== -1;

  // Remove --web flag from args to get prompt text
  const promptParts = isWeb
    ? args.filter((_, index) => index !== isWebIndex)
    : args;

  if (promptParts.length === 0) {
    console.error('❌ Error: Prompt text is required');
    console.error('Usage: ts-node cursor-deeplink-generator.ts "<prompt text>" [--web]');
    process.exit(1);
  }

  const promptText = promptParts.join(' ');

  try {
    const deeplink = generatePromptDeeplink(promptText, { isWeb });
    console.log(deeplink);
  } catch (error) {
    console.error(
      '❌ Error generating deeplink:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run CLI if executed directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

