/**
 * 🎯 HEADER BUS - Event emitter for screen-to-header communication
 * Lightweight, type-safe, local-only
 */

import { EventEmitter } from 'events';
import type { SharedValue } from 'react-native-reanimated';
import type { HeaderContext } from './actions';

export type HeaderPayload = {
  title?: string;
  subtitle?: string;
  ctxPatch?: Partial<HeaderContext>;
  scrollY?: SharedValue<number>;
};

class HeaderBus extends EventEmitter {
  private static instance: HeaderBus;

  static getInstance(): HeaderBus {
    if (!HeaderBus.instance) {
      HeaderBus.instance = new HeaderBus();
    }
    return HeaderBus.instance;
  }

  setHeader(payload: HeaderPayload): void {
    this.emit('update', payload);
  }

  onUpdate(callback: (payload: HeaderPayload) => void): () => void {
    this.on('update', callback);
    return () => this.off('update', callback);
  }
}

export const headerBus = HeaderBus.getInstance();

export function setHeader(payload: HeaderPayload): void {
  headerBus.setHeader(payload);
}

