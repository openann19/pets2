/**
 * ChatScreen - Web Version
 * Identical to mobile ChatScreen structure
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ScreenShell } from '@/src/components/layout/ScreenShell';
import { EmptyStates } from '@/src/components/common/EmptyStates';
import { useChatScreen } from '@/src/hooks/screens/useChatScreen';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useErrorHandling } from '@/src/hooks/useErrorHandling';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const petName = (params.petName as string) || 'Chat';
  const { t } = useTranslation('chat');

  // Network status monitoring
  const { isOnline: networkOnline, isOffline } = useNetworkStatus();

  // Error handling
  const {
    error: errorHandlingError,
    retry,
    clearError,
  } = useErrorHandling({
    maxRetries: 3,
    showAlert: false,
    logError: true,
  });

  const {
    inputText,
    setInputText,
    isTyping,
    showReactions,
    data,
    handleSendMessage,
    handleTypingChange,
    handleScroll,
    handleQuickReplySelect,
    handleMessageLongPress,
    handleReactionSelect,
    handleReactionCancel,
    handleVoiceCall,
    handleVideoCall,
    handleMoreOptions,
    quickReplies,
  } = useChatScreen(matchId, petName, router);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data.messages]);

  // Show offline state if network is offline and no messages
  if (isOffline && data.messages.length === 0 && data.isLoading) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    aria-label="Back"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">{petName}</h1>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <EmptyStates.Offline
          title={t('chat.offline.title') || "You're offline"}
          message={t('chat.offline.message') || 'Connect to the internet to see messages'}
        />
      </ScreenShell>
    );
  }

  // Show error state if error occurred
  if ((data.error || errorHandlingError) && data.messages.length === 0 && !data.isLoading) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">{petName}</h1>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <EmptyStates.Error
          title={t('chat.error.title') || 'Unable to load messages'}
          message={errorHandlingError?.userMessage || data.error || t('chat.error.message') || 'Please check your connection and try again'}
          actionLabel={t('chat.error.retry') || 'Retry'}
          onAction={() => {
            clearError();
            retry();
          }}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{petName}</h1>
                  <p className="text-sm text-gray-500">
                    {data.isOnline ? t('online_now') || 'Online now' : t('last_seen_recently') || 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleVoiceCall}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Voice Call"
                >
                  <PhoneIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Video Call"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleMoreOptions}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="More Options"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Messages List */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            handleScroll(target.scrollTop);
          }}
        >
          {data.isLoading && data.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : data.messages.length === 0 ? (
            <EmptyStates.NoData
              title={t('chat.no_messages') || 'No messages yet'}
              message={t('chat.start_conversation') || 'Start the conversation!'}
            />
          ) : (
            data.messages.map((message, index) => {
              const isOwn = message.senderId === 'current-user-id'; // Replace with actual user ID check
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleMessageLongPress(message._id);
                    }}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReplySelect(reply)}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Reaction Bar */}
        {showReactions && (
          <div className="px-4 py-2 border-t border-gray-200 flex gap-2">
            {['❤️', '😂', '😮', '😢', '👍', '👎'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  const messageId = data.messages[data.messages.length - 1]?._id;
                  if (messageId) {
                    handleReactionSelect(messageId, emoji);
                  }
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={handleReactionCancel}
              className="ml-auto px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleTypingChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t('chat.input_placeholder') || 'Type a message...'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('chat.send') || 'Send'}
            </button>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
