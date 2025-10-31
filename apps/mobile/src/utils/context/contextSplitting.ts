/**
 * Context Splitting Utilities
 * 
 * Splits React contexts by update frequency to prevent unnecessary re-renders
 */
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * Creates a context selector hook to prevent unnecessary re-renders
 */
export function createContextSelector<T>(
  context: React.Context<T>,
  _selectorName: string,
) {
  return function useContextSelector<U>(
    selector: (value: T) => U,
    equalityFn?: (a: U, b: U) => boolean,
  ): U {
    const contextValue = useContext(context);
    const selectedValue = useMemo(() => selector(contextValue), [contextValue, selector]);

    // Use previous value to compare
    const prevRef = React.useRef<U>();
    
    if (prevRef.current !== undefined && equalityFn) {
      if (equalityFn(prevRef.current, selectedValue)) {
        return prevRef.current;
      }
    }

    prevRef.current = selectedValue;
    return selectedValue;
  };
}

/**
 * Splits a context into separate contexts by update frequency
 */
export function splitContext<T extends Record<string, any>>(
  contexts: {
    name: string;
    updateFrequency: 'rare' | 'normal' | 'frequent';
    defaultValue: any;
  }[],
) {
  const contextMap = new Map<string, React.Context<any>>();

  contexts.forEach(({ name, defaultValue }) => {
    contextMap.set(name, createContext(defaultValue));
  });

  return {
    contexts: Object.fromEntries(contextMap),
    createProvider: (values: Partial<T>) => {
      return function SplitContextProvider({ children }: { children: ReactNode }) {
        let result: ReactNode = children;
        
        // Wrap children with each context provider
        contexts.reverse().forEach(({ name, defaultValue }) => {
          const Context = contextMap.get(name)!;
          const value = values[name] ?? defaultValue;
          
          result = React.createElement(
            Context.Provider,
            { value },
            result,
          );
        });
        
        return result;
      };
    },
  };
}

/**
 * Example: Split auth context
 */
// Usage example (not executed, just for reference):
/*
const { contexts, createProvider } = splitContext([
  { name: 'user', updateFrequency: 'rare', defaultValue: null },
  { name: 'preferences', updateFrequency: 'normal', defaultValue: {} },
  { name: 'notifications', updateFrequency: 'frequent', defaultValue: [] },
]);

const AuthProvider = createProvider({
  user: currentUser,
  preferences: userPreferences,
  notifications: userNotifications,
});

// Use only what you need
const user = useContext(contexts.user); // Rare updates
const notifications = useContext(contexts.notifications); // Frequent updates
*/
