/**
 * Web-only type declarations for React Native mobile app
 * These declarations allow TypeScript to understand web-only APIs without runtime errors
 */

declare const window: any;
declare type BodyInit = any;

declare class AudioBuffer {
  constructor(init?: any);
}

// Storybook declarations for mobile
declare module "@storybook/react-native" {
  export const storiesOf: any;
  export const addDecorator: any;
  export const configure: any;
  export const getStorybookUI: any;
}

// Additional web-only declarations that might be referenced
declare const document: any;
declare const navigator: any;
declare const localStorage: any;
declare const sessionStorage: any;

// DOM event types that might be used
declare type Event = any;
declare type MouseEvent = any;
declare type KeyboardEvent = any;
declare type TouchEvent = any;

// Web Audio API types
declare const AudioContext: any;
declare const webkitAudioContext: any;

// Canvas and graphics types
declare type CanvasRenderingContext2D = any;
declare type WebGLRenderingContext = any;

// Fetch API extensions
declare type RequestInit = any;
declare type Response = any;
declare type Headers = any;

// URL and URLSearchParams
declare const URL: any;
declare const URLSearchParams: any;

// Timer functions
declare const setTimeout: any;
declare const setInterval: any;
declare const clearTimeout: any;
declare const clearInterval: any;
