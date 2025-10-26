/**
 * Window Global Extensions
 * 
 * Defines global window methods for debugging and development tools.
 */

interface Window {
  /**
   * UndoPill debugging methods
   * Used for manual testing of undo functionality in development
   */
  __undoPillShow?: () => void;
  __undoPillHide?: () => void;
  
  /**
   * Development debugging helpers
   */
  __DEV__?: boolean;
  
  /**
   * Reactotron integration (if enabled)
   */
  tron?: {
    log: (...args: unknown[]) => void;
    display: (config: {
      name: string;
      value: unknown;
      preview?: string;
    }) => void;
    clear: () => void;
  };
}

export {};

