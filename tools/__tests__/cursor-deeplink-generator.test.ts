/**
 * Tests for Cursor Deep Link Generator
 */

import {
  generatePromptDeeplink,
  generateMultipleDeeplinks,
  parseDeeplink,
  type DeeplinkOptions,
} from '../cursor-deeplink-generator';

describe('Cursor Deep Link Generator', () => {
  describe('generatePromptDeeplink', () => {
    it('should generate app format deeplink by default', () => {
      const result = generatePromptDeeplink('Create a React component');
      expect(result).toContain('cursor://anysphere.cursor-deeplink/prompt');
      expect(result).toContain('text=');
      expect(result).toContain(encodeURIComponent('Create a React component'));
    });

    it('should generate web format deeplink when isWeb is true', () => {
      const result = generatePromptDeeplink('Fix TypeScript errors', {
        isWeb: true,
      });
      expect(result).toBe('https://cursor.com/link/prompt?text=Fix%20TypeScript%20errors');
    });

    it('should encode prompt text correctly', () => {
      const result = generatePromptDeeplink('Hello World!');
      expect(result).toContain('text=Hello%20World%21');
    });

    it('should handle special characters', () => {
      const result = generatePromptDeeplink('Test with & special chars = yes');
      expect(result).toContain('text=');
      // The text should be properly encoded
      expect(decodeURIComponent(result.split('text=')[1] ?? '')).toBe(
        'Test with & special chars = yes'
      );
    });

    it('should include additional parameters', () => {
      const result = generatePromptDeeplink('Add feature', {
        additionalParams: { context: 'mobile', priority: 'high' },
      });
      expect(result).toContain('text=Add%20feature');
      expect(result).toContain('context=mobile');
      expect(result).toContain('priority=high');
    });

    it('should sanitize additional parameter keys', () => {
      const result = generatePromptDeeplink('Test', {
        additionalParams: { 'invalid key!': 'value', 'valid_key': 'value2' },
      });
      // Invalid key should be sanitized or removed
      expect(result).toContain('valid_key');
    });

    it('should throw error for empty prompt', () => {
      expect(() => generatePromptDeeplink('')).toThrow('Prompt text cannot be empty');
      expect(() => generatePromptDeeplink('   ')).toThrow('Prompt text cannot be empty');
    });

    it('should throw error for non-string input', () => {
      // @ts-expect-error Testing invalid input
      expect(() => generatePromptDeeplink(null)).toThrow('Prompt text must be a string');
      // @ts-expect-error Testing invalid input
      expect(() => generatePromptDeeplink(123)).toThrow('Prompt text must be a string');
    });

    it('should throw error for prompt exceeding max length', () => {
      const longPrompt = 'a'.repeat(10001);
      expect(() => generatePromptDeeplink(longPrompt)).toThrow('exceeds maximum length');
    });

    it('should trim whitespace from prompt', () => {
      const result = generatePromptDeeplink('  Hello World  ');
      expect(result).toContain(encodeURIComponent('Hello World'));
    });

    it('should handle multiline prompts', () => {
      const multilinePrompt = 'Line 1\nLine 2\nLine 3';
      const result = generatePromptDeeplink(multilinePrompt);
      expect(decodeURIComponent(result.split('text=')[1] ?? '')).toBe(multilinePrompt);
    });
  });

  describe('generateMultipleDeeplinks', () => {
    it('should generate multiple deeplinks', () => {
      const prompts = ['Prompt 1', 'Prompt 2', 'Prompt 3'];
      const results = generateMultipleDeeplinks(prompts);

      expect(results).toHaveLength(3);
      expect(results[0]).toContain(encodeURIComponent('Prompt 1'));
      expect(results[1]).toContain(encodeURIComponent('Prompt 2'));
      expect(results[2]).toContain(encodeURIComponent('Prompt 3'));
    });

    it('should apply options to all prompts', () => {
      const prompts = ['Test 1', 'Test 2'];
      const results = generateMultipleDeeplinks(prompts, { isWeb: true });

      results.forEach((result) => {
        expect(result).toContain('https://cursor.com/link/prompt');
      });
    });
  });

  describe('parseDeeplink', () => {
    it('should parse app format deeplink', () => {
      const deeplink =
        'cursor://anysphere.cursor-deeplink/prompt?text=Create%20a%20React%20component';
      const parsed = parseDeeplink(deeplink);

      expect(parsed).not.toBeNull();
      if (parsed !== null) {
        expect(parsed.format).toBe('app');
        expect(parsed.promptText).toBe('Create a React component');
      }
    });

    it('should parse web format deeplink', () => {
      const deeplink = 'https://cursor.com/link/prompt?text=Fix%20TypeScript%20errors';
      const parsed = parseDeeplink(deeplink);

      expect(parsed).not.toBeNull();
      if (parsed !== null) {
        expect(parsed.format).toBe('web');
        expect(parsed.promptText).toBe('Fix TypeScript errors');
      }
    });

    it('should parse additional parameters', () => {
      const deeplink =
        'cursor://anysphere.cursor-deeplink/prompt?text=Test&context=mobile&priority=high';
      const parsed = parseDeeplink(deeplink);

      expect(parsed).not.toBeNull();
      if (parsed !== null) {
        expect(parsed.additionalParams.context).toBe('mobile');
        expect(parsed.additionalParams.priority).toBe('high');
      }
    });

    it('should return null for invalid deeplink format', () => {
      expect(parseDeeplink('invalid-url')).toBeNull();
      expect(parseDeeplink('https://example.com')).toBeNull();
      expect(parseDeeplink('cursor://invalid/path')).toBeNull();
    });

    it('should return null for invalid web path', () => {
      expect(parseDeeplink('https://cursor.com/invalid/path')).toBeNull();
    });

    it('should handle missing text parameter gracefully', () => {
      const deeplink = 'cursor://anysphere.cursor-deeplink/prompt?other=param';
      const parsed = parseDeeplink(deeplink);

      expect(parsed).not.toBeNull();
      if (parsed !== null) {
        expect(parsed.promptText).toBe('');
      }
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle the original example from user', () => {
      const result = generatePromptDeeplink(
        'Create a React component for user authentication'
      );
      const expectedApp =
        'cursor://anysphere.cursor-deeplink/prompt?text=Create%20a%20React%20component%20for%20user%20authentication';
      expect(result).toBe(expectedApp);
    });

    it('should generate equivalent web format for the same prompt', () => {
      const prompt = 'Create a React component for user authentication';
      const appResult = generatePromptDeeplink(prompt, { isWeb: false });
      const webResult = generatePromptDeeplink(prompt, { isWeb: true });

      const appParsed = parseDeeplink(appResult);
      const webParsed = parseDeeplink(webResult);

      expect(appParsed?.promptText).toBe(webParsed?.promptText);
      expect(appParsed?.format).toBe('app');
      expect(webParsed?.format).toBe('web');
    });
  });
});

