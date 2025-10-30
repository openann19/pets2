import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { MessageInput } from '../components/chat/MessageInput';
import { MessageList } from '../components/chat/MessageList';
import { QuickReplies } from '../components/chat/QuickReplies';
import ReactionBarMagnetic from '../components/chat/ReactionBarMagnetic';
import { useChatScreen } from '../hooks/screens/useChatScreen';
import type { RootStackScreenProps } from '../navigation/types';
import { ScreenShell } from '../ui/layout/ScreenShell';

type ChatScreenProps = RootStackScreenProps<'Chat'>;

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { matchId, petName } = route.params;
  const { isDark } = useTheme();
  const { t } = useTranslation('chat');

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

  return (
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
