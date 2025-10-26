import { useCallback } from "react";
import type { Message } from "../useChatData";
import { matchesAPI } from "../../services/api";
import { logger } from "../../services/logger";

export interface UseMessageActionsOptions {
  matchId: string;
  onMessageRetried?: (messageId: string) => void;
  onMessageDeleted?: (messageId: string) => void;
}

export interface UseMessageActionsReturn {
  retryMessage: (
    messageId: string,
    currentMessages: Message[],
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

/**
 * Hook for managing message actions (retry, delete, etc.)
 */
export function useMessageActions({
  matchId,
  onMessageRetried,
  onMessageDeleted,
}: UseMessageActionsOptions): UseMessageActionsReturn {
  const retryMessage = useCallback(
    async (messageId: string, currentMessages: Message[]) => {
      const message = currentMessages.find((msg) => msg._id === messageId);
      if (!message) return;

      try {
        await matchesAPI.sendMessage(matchId, message.content);
        logger.info("Message retried", { messageId, matchId });
        onMessageRetried?.(messageId);
      } catch (error) {
        logger.error("Failed to retry message", { error, messageId });
        throw error;
      }
    },
    [matchId, onMessageRetried],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await matchesAPI.deleteMessage(matchId, messageId);
        logger.info("Message deleted", { messageId, matchId });
        onMessageDeleted?.(messageId);
      } catch (error) {
        logger.error("Failed to delete message", { error, messageId });
        throw error;
      }
    },
    [matchId, onMessageDeleted],
  );

  return {
    retryMessage,
    deleteMessage,
  };
}
