import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useAuthStore } from "@pawfectmatch/core";
import { logger } from "../services/logger";
import { matchesAPI } from "../services/api";
import { useSocket } from "./useSocket";

export interface Message {
  _id: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: "text" | "image" | "emoji";
  status?: "sending" | "sent" | "failed";
  error?: boolean;
}

export interface ChatData {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isOnline: boolean;
  otherUserTyping: boolean;
  typingUsers: string[];
  error: string | null;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  clearError: () => void;
}

export interface UseChatDataReturn {
  data: ChatData;
  actions: ChatActions;
}

const MAX_MESSAGE_LENGTH = 500;
const TYPING_TIMEOUT = 2000;
const MESSAGE_BATCH_SIZE = 20;

export function useChatData(matchId: string): UseChatDataReturn {
  const { user } = useAuthStore();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socket = useSocket();

  // Setup socket connection and event listeners
  useEffect(() => {
    if (!socket) {
      logger.debug("Socket not available yet", { matchId });
      return;
    }

    logger.info("Socket connected for chat", { matchId, socketId: socket.id });

    // Set up event listeners
    const handleNewMessage = (message: Message) => {
      logger.debug("New message received via socket", { message });
      setMessages((prev) => [...prev, message]);
    };

    const handleUserTyping = (data: {
      matchId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (data.matchId === matchId) {
        setOtherUserTyping(data.isTyping);
        if (data.isTyping) {
          setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
        }
      }
    };

    const handleUserOnline = (data: { userId: string }) => {
      setIsOnline(true);
      logger.debug("User came online", { data });
    };

    const handleUserOffline = (data: { userId: string }) => {
      setIsOnline(false);
      logger.debug("User went offline", { data });
    };

    // Register event listeners
    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleUserTyping);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    // Join the match room
    socket.emit("join_match", { matchId });

    // Cleanup on unmount
    return () => {
      logger.debug("Cleaning up socket listeners", { matchId });
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleUserTyping);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.emit("leave_match", { matchId });
    };
  }, [socket, matchId]);

  // Load messages from API
  const loadMessages = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const messagesData = await matchesAPI.getMessages(matchId);

      if (messagesData.length > 0) {
        setMessages(messagesData);
        await markAsRead();
      } else {
        setMessages([]);
      }
    } catch (err) {
      const errorMessage =
        "Failed to load messages. Please check your connection and try again.";
      logger.error("Failed to load messages", { error: err, matchId });
      setError(errorMessage);
      Alert.alert("Connection Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  // Send message with optimistic updates
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim() || isSending) return;

      const messageContent = content.trim();
      const tempId = `temp_${Date.now()}`;

      // Optimistic UI update
      const optimisticMessage: Message = {
        _id: tempId,
        content: messageContent,
        senderId: user?._id ?? "me",
        timestamp: new Date().toISOString(),
        read: false,
        type: "text",
        status: "sending",
      };

      setIsSending(true);
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const sentMessage = await matchesAPI.sendMessage(
          matchId,
          messageContent,
        );

        // Replace optimistic message with server response
        setMessages((prev) =>
          prev.map(
            (msg): Message =>
              msg._id === tempId ? { ...sentMessage, status: "sent" } : msg,
          ),
        );

        // Emit to socket for real-time updates
        if (socket && socket.connected) {
          socket.emit("send_message", sentMessage);
          socket.emit("typing", {
            matchId,
            userId: user?._id,
            isTyping: false,
          });
        }

        // Simulate realistic response for demo
        setTimeout(() => {
          setOtherUserTyping(true);
          setTimeout(
            () => {
              setOtherUserTyping(false);
              const response: Message = {
                _id: `response_${Date.now()}`,
                content: getIntelligentResponse(messageContent),
                senderId: "other",
                timestamp: new Date().toISOString(),
                read: false,
                type: "text",
              };

              setMessages((prev) => [...prev, response]);
            },
            1500 + Math.random() * 1000,
          );
        }, 800);
      } catch (err) {
        logger.error("Failed to send message", {
          error: err,
          matchId,
          content,
        });

        // Show error state
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...msg, status: "failed", error: true }
              : msg,
          ),
        );

        setError("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
      }
    },
    [isSending, user?._id, matchId],
  );

  // Retry failed message
  const retryMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const message = messages.find((msg) => msg._id === messageId);
      if (!message) return;

      const retryMessage: Message = {
        ...message,
        _id: `retry_${Date.now()}`,
        status: "sending",
        error: false,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? retryMessage : msg)),
      );

      try {
        await matchesAPI.sendMessage(matchId, message.content);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === retryMessage._id
              ? { ...msg, status: "sent", error: false }
              : msg,
          ),
        );
      } catch (err) {
        logger.error("Failed to retry message", { error: err, messageId });
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === retryMessage._id
              ? { ...msg, status: "failed", error: true }
              : msg,
          ),
        );
      }
    },
    [messages, matchId],
  );

  // Mark messages as read
  const markAsRead = useCallback(async (): Promise<void> => {
    try {
      // API call would be implemented here if endpoint exists
      logger.debug("Messages marked as read", { matchId });
      setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
    } catch (err) {
      logger.error("Failed to mark messages as read", { error: err, matchId });
    }
  }, [matchId]);

  // Clear error state
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    data: {
      messages,
      isLoading,
      isSending,
      isOnline,
      otherUserTyping,
      typingUsers,
      error,
    },
    actions: {
      sendMessage,
      loadMessages,
      retryMessage,
      markAsRead,
      clearError,
    },
  };
}

// Intelligent response generation based on message content
function getIntelligentResponse(messageContent: string): string {
  const content = messageContent.toLowerCase();

  if (
    content.includes("weekend") ||
    content.includes("saturday") ||
    content.includes("sunday")
  ) {
    return "Weekends work perfectly for me! My schedule is pretty flexible then 📅";
  }
  if (content.includes("park") || content.includes("dog park")) {
    return "The dog park sounds amazing! My pup absolutely loves meeting new friends there 🌳🐕";
  }
  if (content.includes("time") || content.includes("when")) {
    return "I'm pretty flexible with timing! What works best for your schedule? ⏰";
  }
  if (
    content.includes("weather") ||
    content.includes("sunny") ||
    content.includes("perfect")
  ) {
    return "Yes! I checked the forecast too - it's going to be beautiful! Perfect day for our pets to play ☀️";
  }
  if (
    content.includes("excited") ||
    content.includes("can't wait") ||
    content.includes("looking forward")
  ) {
    return "Me too! This is going to be so much fun. I think our pets are going to be best friends! 🐾💕";
  }
  if (
    content.includes("photo") ||
    content.includes("picture") ||
    content.includes("pic")
  ) {
    return "I'd love to see more photos! Your pet is absolutely adorable 📸✨";
  }

  // Default contextual responses
  const responses = [
    "That sounds absolutely perfect! I'm really looking forward to it 🎾",
    "Amazing! My pet is going to be so excited to meet yours 🐕💕",
    "Perfect! I think this is going to be the start of a beautiful friendship 😊",
    "Wonderful! I can already tell our pets are going to get along great 🌟",
    "Fantastic! This is exactly what I was hoping for 🎉",
    "Love it! I have a really good feeling about this playdate ✨",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
