/**
 * ChatScreen - WEB VERSION
 * Messaging interface matching mobile ChatScreen exactly
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '@/components/layout/AdvancedHeader';
import { useTheme } from '@/theme';
import { useChatScreen } from '@/hooks/screens/useChatScreen';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import MessageInput from '@/components/Chat/MessageInput';
import MessageList from '@/components/Chat/MessageList';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { useAuthStore } from '@pawfectmatch/core';

export default function ChatScreen() {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams<{ matchId: string }>();
  const { t } = useTranslation('chat');
  const { user } = useAuthStore();
  
  const matchId = params.matchId || '';
  const petName = 'Match'; // TODO: Get from match data

  // Network status
  const { isOnline, isOffline } = useNetworkStatus();

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

  // Chat screen hook
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
  } = useChatScreen(matchId, petName, navigate as any);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data.messages]);

  const currentUserId = user?.id || '';

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: petName,
            subtitle: data.isOnline ? t('online') || 'Online' : t('offline') || 'Offline',
            showBackButton: true,
            onBackPress: () => navigate(-1),
            rightButtons: [
              {
                type: 'custom',
                icon: 'call-outline',
                onPress: handleVoiceCall,
                variant: 'glass',
                haptic: 'light',
              },
              {
                type: 'custom',
                icon: 'videocam-outline',
                onPress: handleVideoCall,
                variant: 'glass',
                haptic: 'light',
              },
            ],
          })}
        />
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
          padding: theme.spacing.lg,
        }}
      >
        {/* Error State */}
        {(data.error || errorHandlingError) && data.messages.length === 0 && (
          <Card padding="xl" radius="md" shadow="elevation2" tone="surface">
            <div className="text-center">
              <h3
                style={{
                  fontSize: theme.typography.h2.size,
                  fontWeight: 'bold',
                  color: theme.colors.onSurface,
                  marginBottom: theme.spacing.md,
                }}
              >
                {t('error.title') || 'Unable to load messages'}
              </h3>
              <p
                style={{
                  color: theme.colors.onMuted,
                  fontSize: theme.typography.body.size,
                  marginBottom: theme.spacing.lg,
                }}
              >
                {errorHandlingError?.message || data.error || t('error.message') || 'Please check your connection and try again'}
              </p>
              <Button
                title={t('error.retry') || 'Retry'}
                variant="primary"
                onPress={() => {
                  clearError();
                  retry();
                }}
              />
            </div>
          </Card>
        )}

        {/* Messages List */}
        {!data.error && (
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingBottom: theme.spacing.md,
            }}
            onScroll={(e) => {
              handleScroll(e.currentTarget.scrollTop);
            }}
          >
            {data.messages.length === 0 && !data.isLoading ? (
              <Card padding="xl" radius="md" shadow="elevation1" tone="surface">
                <div className="text-center">
                  <p
                    style={{
                      color: theme.colors.onMuted,
                      fontSize: theme.typography.body.size,
                    }}
                  >
                    {t('empty') || 'No messages yet. Start the conversation!'}
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <MessageList
                  messages={data.messages}
                  currentUser={currentUserId}
                  isLoading={data.isLoading}
                  hasMoreMessages={false}
                  typingUsers={isTyping ? [petName] : []}
                  onLoadMore={() => {}}
                  onScroll={() => {}}
                />
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}

        {/* Message Input */}
        <div
          style={{
            marginTop: theme.spacing.md,
          }}
        >
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTypingChange}
            disabled={isOffline || data.isLoading}
            placeholder={t('input.placeholder') || 'Type a message...'}
            autoFocus
          />
        </div>
      </div>
    </ScreenShell>
  );
}
