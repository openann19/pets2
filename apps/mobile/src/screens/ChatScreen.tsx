import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { useHeaderWithCounts } from '../hooks/useHeaderWithCounts';
import { MessageInput } from '../components/chat/MessageInput';
import { MessageList } from '../components/chat/MessageList';
import { QuickReplies } from '../components/chat/QuickReplies';
import ReactionBarMagnetic from '../components/chat/ReactionBarMagnetic';
import { useChatScreen } from '../hooks/screens/useChatScreen';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { EmptyStates } from '../components/common';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import type { RootStackScreenProps } from '../navigation/types';
import { ScreenShell } from '../ui/layout/ScreenShell';

type ChatScreenProps = RootStackScreenProps<'Chat'>;

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { matchId, petName } = route.params;
  const { isDark } = useTheme();
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
    actions,
    flatListRef,
    inputRef,
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
  } = useChatScreen({ matchId, petName, navigation });

  // Update SmartHeader (chat uses custom header, but we still update counts)
  useHeaderWithCounts({
    title: petName,
    subtitle: data.isOnline ? t('online_now') : t('last_seen_recently'),
    fetchCounts: false, // Chat screen manages its own UI
  });

  // Show offline state if network is offline and no messages
  if (isOffline && data.messages.length === 0 && data.isLoading) {
    return (
      <ErrorBoundary screenName="ChatScreen">
        <ScreenShell
          header={
            <AdvancedHeader
              {...HeaderConfigs.glass({
                title: petName,
                showBackButton: true,
                onBackPress: () => navigation.goBack(),
              })}
            />
          }
        >
          <EmptyStates.Offline
            title={t('chat.offline.title') || "You're offline"}
            message={t('chat.offline.message') || 'Connect to the internet to see messages'}
          />
        </ScreenShell>
      </ErrorBoundary>
    );
  }

  // Show error state if error occurred
  if ((data.error || errorHandlingError) && data.messages.length === 0 && !data.isLoading) {
    return (
      <ErrorBoundary screenName="ChatScreen">
        <ScreenShell
          header={
            <AdvancedHeader
              {...HeaderConfigs.glass({
                title: petName,
                showBackButton: true,
                onBackPress: () => navigation.goBack(),
              })}
            />
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
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary screenName="ChatScreen">
      <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: petName,
            subtitle: data.isOnline ? t('online_now') : t('last_seen_recently'),
            showBackButton: true,
            onBackPress: () => navigation.goBack(),
            rightButtons: [
              {
                type: 'custom',
                icon: 'call-outline',
                onPress: handleVoiceCall,
                variant: 'glass',
                haptic: 'medium',
                customComponent: undefined,
              },
              {
                type: 'custom',
                icon: 'videocam-outline',
                onPress: handleVideoCall,
                variant: 'glass',
                haptic: 'medium',
                customComponent: undefined,
              },
              {
                type: 'custom',
                icon: 'ellipsis-vertical-outline',
                onPress: handleMoreOptions,
                variant: 'glass',
                haptic: 'light',
                customComponent: undefined,
              },
            ],
          })}
        />
      }
    >
      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <MessageList
          messages={data.messages}
          typingUsers={data.otherUserTyping ? [t('other_user_typing')] : []}
          isOnline={data.isOnline}
          currentUserId="current-user"
          matchId={matchId}
          onRetryMessage={actions.retryMessage}
          flatListRef={flatListRef}
          onScroll={handleScroll}
        />

        {/* Quick Replies */}
        {data.messages.length > 0 && (
          <QuickReplies
            replies={quickReplies}
            onReplySelect={handleQuickReplySelect}
            visible={true}
          />
        )}

        {/* Input */}
        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onTypingChange={handleTypingChange}
          isSending={data.isSending}
          inputRef={inputRef}
          matchId={matchId}
        />
      </KeyboardAvoidingView>

      {/* Reaction Bar Overlay */}
      {showReactions && (
        <View style={styles.reactionOverlay}>
          <ReactionBarMagnetic
            onSelect={handleReactionSelect}
            onCancel={handleReactionCancel}
            influenceRadius={100}
            baseSize={32}
            backgroundColor={isDark ? '#2a2a2a' : '#ffffff'}
            borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          />
        </View>
      )}
    </ScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
  reactionOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});
