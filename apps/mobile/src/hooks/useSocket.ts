import { useAuthStore } from "@pawfectmatch/core";
import { logger } from "@pawfectmatch/core";
import { useEffect, useState, useRef } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import type {
  UserTypingEvent,
  NewMessageEvent,
  UserStatusEvent,
  OnlineUsersUpdate,
} from "@pawfectmatch/core";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [_isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuthStore();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!user || !accessToken) {
      return;
    }

    function connectSocket(): Socket | null {
      try {
        const socketUrl =
          process.env["EXPO_PUBLIC_SOCKET_URL"] || "http://localhost:3001";
        const newSocket = io(socketUrl, {
          auth: {
            token: accessToken,
            userId: user!._id, // Non-null assertion, guarded by check above
          },
          transports: ["websocket"],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: maxReconnectAttempts,
          reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
          logger.info("Socket connected:", { socketId: newSocket.id });
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        });

        newSocket.on("disconnect", (reason: string) => {
          logger.info("Socket disconnected:", { reason });
          setIsConnected(false);

          if (reason === "io server disconnect") {
            // Server disconnected, try to reconnect
            newSocket.connect();
          }
        });

        newSocket.on("connect_error", (err: Error) => {
          logger.error("Socket connection error:", { error: err });
          setError(err.message);
          reconnectAttempts.current++;

          if (reconnectAttempts.current >= maxReconnectAttempts) {
            setError("Failed to connect after multiple attempts");
          }
        });

        newSocket.on("error", (err: Error) => {
          logger.error("Socket error:", { error });
          setError(err.message || "Socket error occurred");
        });

        // Authentication error
        newSocket.on("auth_error", (_err: Error) => {
          logger.error("Socket auth error:", { error });
          setError("Authentication failed");
          newSocket.disconnect();
        });

        // User-specific events
        newSocket.on("user_online", (data: UserStatusEvent) => {
          logger.info("User came online:", { data });
        });

        newSocket.on("user_offline", (data: UserStatusEvent) => {
          logger.info("User went offline:", { data });
        });

        // Match events
        newSocket.on("new_match", (data: NewMessageEvent) => {
          logger.info("New match:", { data });
          // Handle new match notification
        });

        newSocket.on("new_message", (data: NewMessageEvent) => {
          logger.info("New message:", { data });
          // Handle new message notification
        });

        // Call events (handled by WebRTC service)
        newSocket.on("incoming_call", (data: OnlineUsersUpdate) => {
          logger.info("Incoming call:", { data });
        });

        setSocket(newSocket);

        return newSocket;
      } catch (err) {
        logger.error("Error creating socket:", { error });
        setError("Failed to create socket connection");
        return null;
      }
    }

    const socketInstance = connectSocket();

    return () => {
      if (socketInstance) {
        logger.info("Cleaning up socket connection");
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      setError(null);
    };
  }, [user, accessToken]);

  return socket;
}

// Hook for socket with connection status
export function useSocketWithStatus(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!user || !accessToken) {
      return;
    }

    const socketUrl =
      process.env["EXPO_PUBLIC_SOCKET_URL"] || "http://localhost:3001";
    const newSocket = io(socketUrl, {
      auth: {
        token: accessToken,
        userId: user._id, // Non-null assertion, guarded by check above
      },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err: Error) => {
      setError(err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setError(null);
    };
  }, [user, accessToken]);

  return { socket, isConnected, error };
}

// Emit helper with type-safe null handling
export function useSocketEmit(): (
  event: string,
  data?: Record<string, unknown> | null,
) => boolean {
  const socket = useSocket();

  function emit(event: string, data?: Record<string, unknown> | null): boolean {
    if (!socket || !socket.connected) {
      logger.warn("Socket not connected, cannot emit:", { event });
      return false;
    }
    
    // Ensure data is never null - use empty object as fallback
    const safeData = data ?? {};
    socket.emit(event, safeData);
    return true;
  }

  return emit;
}

export default useSocket;
