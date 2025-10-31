/**
 * Real-time Feed Updates Hook
 * Phase 3: Advanced Features
 * 
 * Provides real-time feed updates via WebSocket:
 * - New pets added to feed
 * - Match notifications
 * - Feed refresh triggers
 * - Connection management
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { logger } from '@pawfectmatch/core';
import { useSocket } from '../useSocket';
import type { Pet } from '../../types/api';

export interface RealtimeFeedEvent {
  type: 'new_pet' | 'new_match' | 'feed_refresh' | 'pet_updated' | 'pet_removed';
  data: unknown;
  timestamp: number;
}

export interface NewPetEvent {
  pet: Pet;
  reason: 'new_pet' | 'within_range' | 'filter_match';
}

export interface NewMatchEvent {
  matchId: string;
  petId: string;
  petName: string;
  timestamp: number;
}

export interface UseRealtimeFeedUpdatesOptions {
  /** Enable real-time updates */
  enabled?: boolean;
  /** Callback for new pets */
  onNewPet?: (event: NewPetEvent) => void;
  /** Callback for new matches */
  onNewMatch?: (event: NewMatchEvent) => void;
  /** Callback for feed refresh */
  onFeedRefresh?: () => void;
  /** Callback for pet updates */
  onPetUpdate?: (petId: string, pet: Pet) => void;
  /** Callback for pet removal */
  onPetRemoved?: (petId: string) => void;
  /** Auto-refresh feed on updates */
  autoRefresh?: boolean;
}

export interface UseRealtimeFeedUpdatesReturn {
  /** Connection status */
  isConnected: boolean;
  /** Last event received */
  lastEvent: RealtimeFeedEvent | null;
  /** Event history (last 20 events) */
  eventHistory: RealtimeFeedEvent[];
  /** Manually refresh feed */
  refreshFeed: () => void;
  /** Subscribe to specific event type */
  subscribe: (eventType: RealtimeFeedEvent['type'], handler: (data: unknown) => void) => () => void;
  /** Unsubscribe from all events */
  unsubscribe: () => void;
}

/**
 * Real-time Feed Updates Hook
 * 
 * Manages WebSocket connections for feed updates
 */
export function useRealtimeFeedUpdates(
  options: UseRealtimeFeedUpdatesOptions = {},
): UseRealtimeFeedUpdatesReturn {
  const {
    enabled = true,
    onNewPet,
    onNewMatch,
    onFeedRefresh,
    onPetUpdate,
    onPetRemoved,
    autoRefresh = true,
  } = options;

  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeFeedEvent | null>(null);
  const eventHistoryRef = useRef<RealtimeFeedEvent[]>([]);
  const handlersRef = useRef<Map<RealtimeFeedEvent['type'], Set<(data: unknown) => void>>>(
    new Map(),
  );

  /**
   * Add event to history
   */
  const addEventToHistory = useCallback((event: RealtimeFeedEvent) => {
    eventHistoryRef.current.push(event);
    // Keep last 20 events
    if (eventHistoryRef.current.length > 20) {
      eventHistoryRef.current.shift();
    }
    setLastEvent(event);
  }, []);

  /**
   * Handle new pet event
   */
  const handleNewPet = useCallback(
    (data: NewPetEvent) => {
      const event: RealtimeFeedEvent = {
        type: 'new_pet',
        data,
        timestamp: Date.now(),
      };

      addEventToHistory(event);
      onNewPet?.(data);

      if (autoRefresh && onFeedRefresh) {
        // Debounce refresh to avoid too many refreshes
        setTimeout(() => {
          onFeedRefresh();
        }, 500);
      }

      logger.info('New pet received via real-time', { petId: data.pet._id, reason: data.reason });
    },
    [addEventToHistory, onNewPet, onFeedRefresh, autoRefresh],
  );

  /**
   * Handle new match event
   */
  const handleNewMatch = useCallback(
    (data: NewMatchEvent) => {
      const event: RealtimeFeedEvent = {
        type: 'new_match',
        data,
        timestamp: Date.now(),
      };

      addEventToHistory(event);
      onNewMatch?.(data);

      logger.info('New match received via real-time', { matchId: data.matchId, petId: data.petId });
    },
    [addEventToHistory, onNewMatch],
  );

  /**
   * Handle feed refresh event
   */
  const handleFeedRefresh = useCallback(() => {
    const event: RealtimeFeedEvent = {
      type: 'feed_refresh',
      data: {},
      timestamp: Date.now(),
    };

    addEventToHistory(event);
    onFeedRefresh?.();

    logger.info('Feed refresh triggered via real-time');
  }, [addEventToHistory, onFeedRefresh]);

  /**
   * Handle pet update event
   */
  const handlePetUpdate = useCallback(
    (data: { petId: string; pet: Pet }) => {
      const event: RealtimeFeedEvent = {
        type: 'pet_updated',
        data,
        timestamp: Date.now(),
      };

      addEventToHistory(event);
      onPetUpdate?.(data.petId, data.pet);

      logger.info('Pet updated via real-time', { petId: data.petId });
    },
    [addEventToHistory, onPetUpdate],
  );

  /**
   * Handle pet removal event
   */
  const handlePetRemoved = useCallback(
    (data: { petId: string }) => {
      const event: RealtimeFeedEvent = {
        type: 'pet_removed',
        data,
        timestamp: Date.now(),
      };

      addEventToHistory(event);
      onPetRemoved?.(data.petId);

      logger.info('Pet removed via real-time', { petId: data.petId });
    },
    [addEventToHistory, onPetRemoved],
  );

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !enabled) {
      setIsConnected(false);
      return;
    }

    // Track connection status
    const onConnect = () => {
      setIsConnected(true);
      logger.info('Feed real-time connection established');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      logger.info('Feed real-time connection lost');
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Feed-specific events
    socket.on('feed:new_pet', handleNewPet);
    socket.on('feed:new_match', handleNewMatch);
    socket.on('feed:refresh', handleFeedRefresh);
    socket.on('feed:pet_updated', handlePetUpdate);
    socket.on('feed:pet_removed', handlePetRemoved);

    // Join feed room
    socket.emit('feed:join');

    // Cleanup
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('feed:new_pet', handleNewPet);
      socket.off('feed:new_match', handleNewMatch);
      socket.off('feed:refresh', handleFeedRefresh);
      socket.off('feed:pet_updated', handlePetUpdate);
      socket.off('feed:pet_removed', handlePetRemoved);
      socket.emit('feed:leave');
    };
  }, [
    socket,
    enabled,
    handleNewPet,
    handleNewMatch,
    handleFeedRefresh,
    handlePetUpdate,
    handlePetRemoved,
  ]);

  /**
   * Manually refresh feed
   */
  const refreshFeed = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('feed:request_refresh');
      handleFeedRefresh();
    } else {
      // Fallback: call refresh callback directly
      onFeedRefresh?.();
    }
  }, [socket, isConnected, handleFeedRefresh, onFeedRefresh]);

  /**
   * Subscribe to specific event type
   */
  const subscribe = useCallback(
    (eventType: RealtimeFeedEvent['type'], handler: (data: unknown) => void) => {
      if (!handlersRef.current.has(eventType)) {
        handlersRef.current.set(eventType, new Set());
      }

      const handlers = handlersRef.current.get(eventType)!;
      handlers.add(handler);

      // Return unsubscribe function
      return () => {
        handlers.delete(handler);
      };
    },
    [],
  );

  /**
   * Unsubscribe from all events
   */
  const unsubscribe = useCallback(() => {
    handlersRef.current.clear();
  }, []);

  // Get event history
  const eventHistory = eventHistoryRef.current;

  return {
    isConnected,
    lastEvent,
    eventHistory,
    refreshFeed,
    subscribe,
    unsubscribe,
  };
}

