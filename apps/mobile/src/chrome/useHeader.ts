/**
 * 🎯 USE HEADER - Hook for screens to update header
 * Simple API for setting title, subtitle, and context
 */

import { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import type { SharedValue } from 'react-native-reanimated';
import { setHeader } from './HeaderBus';
import type { HeaderPayload } from './HeaderBus';

type UseHeaderOptions = {
  title?: string;
  subtitle?: string;
  counts?: {
    messages?: number;
    notifications?: number;
    community?: number;
  };
  scrollY?: SharedValue<number>;
};

export function useHeader(options: UseHeaderOptions): void {
  const route = useRoute();

  useEffect(() => {
    const cleanPayload: HeaderPayload = {};
    if (options.title !== undefined) cleanPayload.title = options.title;
    if (options.subtitle !== undefined)
      cleanPayload.subtitle = options.subtitle;
    if (options.scrollY !== undefined) cleanPayload.scrollY = options.scrollY;

    if (route.name || options.counts) {
      cleanPayload.ctxPatch = {
        route: route.name,
        ...(options.counts && {
          counts: {
            messages: options.counts.messages ?? 0,
            notifications: options.counts.notifications ?? 0,
            community: options.counts.community ?? 0,
          },
        }),
      };
    }

    setHeader(cleanPayload);
  }, [options.title, options.subtitle, options.counts, options.scrollY, route.name]);
}

