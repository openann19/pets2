import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { liveKitService } from '../services/livekitService';
import { logger } from '../services/logger';
import { API_URL } from '../config/environment';

export interface UseLiveStreamReturn {
  room: Room | null;
  isConnected: boolean;
  isPublishing: boolean;
  participants: RemoteParticipant[];
  localParticipant: LocalParticipant | null;
  viewerCount: number;
  error: string | null;

  // Actions
  startStream: (streamId: string) => Promise<void>;
  endStream: () => Promise<void>;
  watchStream: (streamId: string) => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  switchCamera: () => Promise<void>;
  sendChatMessage: (message: string) => void;
  sendReaction: (emoji: string) => void;
}

export function useLiveStream(): UseLiveStreamReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<any>(null);

  /**
   * Start a live stream (publisher)
   */
  const startStream = useCallback(async (streamId: string) => {
    try {
      setError(null);

      // Get token from backend
      const response = await fetch(`${API_URL}/live/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token from store
        },
        body: JSON.stringify({
          title: `Live Stream ${new Date().toLocaleTimeString()}`,
          tags: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      const { token, url, roomName } = await response.json();

      // Connect to LiveKit
      const roomInstance = await liveKitService.connect({ url, token });
      setRoom(roomInstance);
      setIsConnected(true);
      setIsPublishing(true);
      setLocalParticipant(roomInstance.localParticipant);

      logger.info('Stream started successfully', { roomName, streamId });

      // Connect to Socket.IO for chat
      // socketRef.current = connectToChat(roomName);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start stream');
      logger.error('Failed to start stream', { error });
      setError(error.message);
    }
  }, []);

  /**
   * Watch a live stream (subscriber)
   */
  const watchStream = useCallback(async (streamId: string) => {
    try {
      setError(null);

      // Get token from backend
      const response = await fetch(`${API_URL}/live/${streamId}/watch`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to join stream');
      }

      const { token, url, roomName } = await response.json();

      // Connect to LiveKit
      const roomInstance = await liveKitService.connect({ url, token });
      setRoom(roomInstance);
      setIsConnected(true);
      setIsPublishing(false);
      setParticipants(Array.from(roomInstance.remoteParticipants.values()));

      logger.info('Joined stream successfully', { roomName, streamId });

      // Setup listeners
      setupRoomListeners(roomInstance);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to watch stream');
      logger.error('Failed to watch stream', { error });
      setError(error.message);
    }
  }, []);

  /**
   * End the live stream
   */
  const endStream = useCallback(async () => {
    try {
      if (!room) return;

      await liveKitService.disconnect();

      // Call backend to end stream
      if (isPublishing) {
        const streamId = room.name.replace('live_', '').split('_')[0];
        await fetch(`${API_URL}/live/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamId }),
        });
      }

      setRoom(null);
      setIsConnected(false);
      setIsPublishing(false);
      setParticipants([]);
      setLocalParticipant(null);
      setViewerCount(0);

      // Disconnect Socket.IO
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to end stream');
      logger.error('Failed to end stream', { error });
    }
  }, [room, isPublishing]);

  /**
   * Toggle camera
   */
  const toggleCamera = useCallback(async () => {
    await liveKitService.toggleCamera();
  }, []);

  /**
   * Toggle microphone
   */
  const toggleMicrophone = useCallback(async () => {
    await liveKitService.toggleMicrophone();
  }, []);

  /**
   * Switch camera
   */
  const switchCamera = useCallback(async () => {
    await liveKitService.switchCamera();
  }, []);

  /**
   * Send chat message
   */
  const sendChatMessage = useCallback(
    (message: string) => {
      if (socketRef.current && room) {
        socketRef.current.emit('live:message', { content: message });
      }
    },
    [room],
  );

  /**
   * Send reaction
   */
  const sendReaction = useCallback((emoji: string) => {
    if (socketRef.current) {
      socketRef.current.emit('live:reaction', { emoji });
    }
  }, []);

  /**
   * Setup room event listeners
   */
  const setupRoomListeners = useCallback((roomInstance: Room) => {
    roomInstance.on('participantConnected', (participant: RemoteParticipant) => {
      setParticipants(Array.from(roomInstance.remoteParticipants.values()));
    });

    roomInstance.on('participantDisconnected', (participant: RemoteParticipant) => {
      setParticipants(Array.from(roomInstance.remoteParticipants.values()));
    });

    roomInstance.on('disconnected', () => {
      setIsConnected(false);
    });

    roomInstance.on('reconnecting', () => {
      setIsConnected(false);
    });

    roomInstance.on('reconnected', () => {
      setIsConnected(true);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endStream();
    };
  }, [endStream]);

  return {
    room,
    isConnected,
    isPublishing,
    participants,
    localParticipant,
    viewerCount,
    error,
    startStream,
    endStream,
    watchStream,
    toggleCamera,
    toggleMicrophone,
    switchCamera,
    sendChatMessage,
    sendReaction,
  };
}
