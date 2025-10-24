/// <reference types="@testing-library/jest-native" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveTextContent(text: string | RegExp): R;
      toHaveStyle(
        style: Record<string, unknown> | Record<string, unknown>[],
      ): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeVisible(): R;
      toContainElement(element: unknown): R;
      toBeEmptyElement(): R;
      toHaveProp(prop: string, value?: unknown): R;
    }
  }
}

export {};
