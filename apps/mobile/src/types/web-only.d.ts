/**
 * Web-only type declarations for React Native mobile app
 * These declarations allow TypeScript to understand web-only APIs without runtime errors
 */

declare const window: unknown;
declare type BodyInit = unknown;

declare class AudioBuffer {
  constructor(init?: unknown);
}

// Blob API (web-only, polyfilled on native)
declare class Blob {
  constructor(parts?: unknown[], options?: { type?: string });
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  slice(start?: number, end?: number, contentType?: string): Blob;
}

// MediaRecorder API (web-only)
interface MediaRecorder extends EventTarget {
  readonly state: 'inactive' | 'recording' | 'paused';
  readonly stream: MediaStream;
  readonly mimeType: string;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onstart: (() => void) | null;
  onstop: (() => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
  start(timeslice?: number): void;
  stop(): void;
  pause(): void;
  resume(): void;
  requestData(): void;
}

declare var MediaRecorder: {
  prototype: MediaRecorder;
  new (stream: MediaStream, options?: { mimeType?: string; audioBitsPerSecond?: number }): MediaRecorder;
  isTypeSupported(mimeType: string): boolean;
};

// MediaStream API (web-only)
interface MediaStream extends EventTarget {
  readonly id: string;
  getTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
  clone(): MediaStream;
}

interface MediaStreamTrack {
  readonly kind: 'audio' | 'video';
  readonly id: string;
  readonly label: string;
  enabled: boolean;
  muted: boolean;
  readonly readyState: 'live' | 'ended';
  stop(): void;
}

declare var MediaStream: {
  prototype: MediaStream;
  new (streamOrTracks?: MediaStream | MediaStreamTrack[]): MediaStream;
};

// Storybook declarations for mobile
declare module '@storybook/react-native' {
  export const storiesOf: unknown;
  export const addDecorator: unknown;
  export const configure: unknown;
  export const getStorybookUI: unknown;
}

// Additional web-only declarations that might be referenced
declare const document: unknown;
declare const navigator: unknown;
declare const localStorage: unknown;
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
