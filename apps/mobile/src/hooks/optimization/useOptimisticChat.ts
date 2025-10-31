/**
 * Optimistic Chat Hook
 * 
 * Enhances chat message sending with optimistic updates
 */
import { useCallback } from 'react';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import type { Message } from '../useChatData';

interface OptimisticChatOptions {
  /** Current messages */
  messages: Message[];
  /** Callback to update messages */
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  /** User ID */
  userId: string;
  /** Match ID */
  matchId: string;
  /** Send message function */
  sendMessageFn: (content: string) => Promise<Message>;
}

/**
 * Hook for optimistic chat messages
 */
export function useOptimisticChat({
  messages,
  setMessages,
  userId,
  matchId,
  sendMessageFn,
}: OptimisticChatOptions) {
  const { update: optimisticSend } = useOptimisticUpdate(messages, {
    rollbackOnError: true,
  });

  /**
   * Send message with optimistic update
   */
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      // Create optimistic message
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: Message = {
        _id: tempId,
        senderId: userId,
        content: content.trim(),
        timestamp: new Date(),
        status: 'sending',
        type: 'text',
      };

      // Optimistically add message
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        // Update with actual API response
        await optimisticSend(
          [...messages, optimisticMessage],
          async () => {
            const sentMessage = await sendMessageFn(content);
            
            // Replace temp message with real one
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === tempId
                  ? { ...sentMessage, status: 'sent' }
                  : msg
              )
            );
            
            return [...messages, { ...sentMessage, status: 'sent' }];
          },
        );
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        // Update message status to error
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...msg, status: 'error' }
              : msg
          )
        );
        
        // Optionally remove optimistic message on error
        // setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        
        throw err;
      }
    },
    [messages, setMessages, userId, sendMessageFn, optimisticSend],
  );

  /**
   * Retry failed message
   */
  const retryMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const failedMessage = messages.find((m) => m._id === messageId);
      if (!failedMessage || failedMessage.status !== 'error') return;

      // Remove failed message
      setMessages((prev) => prev.filter((m) => m._id !== messageId));

      // Retry sending
      await sendMessage(failedMessage.content);
    },
    [messages, setMessages, sendMessage],
  );

  return {
    sendMessage,
    retryMessage,
  };
}
