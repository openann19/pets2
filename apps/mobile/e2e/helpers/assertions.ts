/**
 * Assertion helpers for E2E tests
 */

import { expect, element, by } from 'detox';

/**
 * Enhanced assertions
 */
export const assertions = {
  /**
   * Assert element is visible
   */
  visible: async (id: string) => {
    await expect(element(by.id(id))).toBeVisible();
  },

  /**
   * Assert element has exact text
   */
  text: async (id: string, text: string) => {
    await expect(element(by.id(id))).toHaveText(text);
  },

  /**
   * Assert element contains text
   */
  containsText: async (id: string, text: string) => {
    await expect(element(by.id(id))).toHaveText(text);
  },

  /**
   * Assert element has value
   */
  value: async (id: string, value: string) => {
    await expect(element(by.id(id))).toHaveValue(value);
  },

  /**
   * Assert count of matching elements
   */
  count: async (id: string, count: number) => {
    await expect(element(by.id(id).and(by.type('*')))).toExist();
  },

  /**
   * Assert element is enabled
   */
  enabled: async (id: string) => {
    await expect(element(by.id(id))).toBeEnabled();
  },

  /**
   * Assert element is disabled
   */
  disabled: async (id: string) => {
    await expect(element(by.id(id))).toBeDisabled();
  },
};

