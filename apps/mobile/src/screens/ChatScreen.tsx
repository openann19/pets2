import React, { useState, useCallback, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { haptic } from '@/foundation/haptics-unified';
import { Button } from '../components/ui/v2/Button';
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
import { PetCompatibilityIndicator } from '../components/chat/PetCompatibilityIndicator';
import { PetProfileModal } from '../components/chat/PetProfileModal';
import { VoiceMessageRecorder } from '../components/chat/VoiceMessageRecorder';
import { LocationShareButton } from '../components/chat/LocationShareButton';

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

  // Enhanced chat features state
  const [showPetProfile, setShowPetProfile] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showLocationShare, setShowLocationShare] = useState(false);
  const [petCompatibilityScore, setPetCompatibilityScore] = useState<number | null>(null);

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
  } = useChatScreen({ matchId, petName: petName || '', navigation });

  // Enhanced feature handlers
  const handleShowPetProfile = useCallback(() => {
    haptic.tap();
    setShowPetProfile(true);
  }, []);

  const handleVoiceMessage = useCallback(() => {
    haptic.confirm();
    setShowVoiceRecorder(true);
  }, []);

  const handleLocationShare = useCallback(() => {
    haptic.tap();
    setShowLocationShare(true);
  }, []);

  const handlePetCompatibilityCheck = useCallback(async () => {
    haptic.confirm();
    // Calculate pet compatibility score
    // This would integrate with the feed algorithms
    const score = Math.floor(Math.random() * 40) + 60; // Mock score 60-100
    setPetCompatibilityScore(score);
  }, []);

  const styles = StyleSheet.create({
    chatContainer: {
      flex: 1,
    },
    compatibilityContainer: {
      position: 'absolute',
      top: 80,
      left: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 1000,
    },
    petActionsContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.utils.alpha(theme.colors.surface, 0.8),
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
            onBackPress: () => {
              haptic.tap();
              navigation.goBack();
            },
            rightButtons: [
              {
                type: 'custom',
                icon: 'paw-outline',
                onPress: handleShowPetProfile,
                variant: 'glass',
                haptic: 'light',
                customComponent: undefined,
                tooltip: t('pet_profile') || 'Pet Profile',
              },
              {
                type: 'custom',
                icon: 'mic-outline',
                onPress: handleVoiceMessage,
                variant: 'glass',
                haptic: 'medium',
                customComponent: undefined,
                tooltip: t('voice_message') || 'Voice Message',
              },
              {
                type: 'custom',
                icon: 'location-outline',
                onPress: handleLocationShare,
                variant: 'glass',
                haptic: 'light',
                customComponent: undefined,
                tooltip: t('share_location') || 'Share Location',
              },
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
      {/* Pet Compatibility Indicator */}
      {petCompatibilityScore && (
        <View style={styles.compatibilityContainer}>
          <PetCompatibilityIndicator
            score={petCompatibilityScore}
            onClose={() => setPetCompatibilityScore(null)}
          />
        </View>
      )}

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

        {/* Enhanced Quick Replies with Pet Context */}
        {data.messages.length > 0 && (
          <View>
            <QuickReplies
              replies={quickReplies}
              onReplySelect={handleQuickReplySelect}
              visible={true}
            />
            {/* Pet Compatibility Check Button */}
            <View style={styles.petActionsContainer}>
              <Button
                title={t('check_compatibility') || 'Check Pet Compatibility'}
                onPress={handlePetCompatibilityCheck}
                variant="outline"
                size="md"
                leftIcon={<Ionicons name="heart-circle-outline" size={20} color={theme.colors.primary} />}
                hapticFeedback={false}
                fullWidth
              />
            </View>
          </View>
        )}

        {/* Input with Enhanced Features */}
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

      {/* Enhanced Reaction Bar with Pet Emojis */}
      {showReactions && (
        <View style={styles.reactionOverlay}>
          <ReactionBarMagnetic
            onSelect={handleReactionSelect}
            onCancel={handleReactionCancel}
            influenceRadius={100}
            baseSize={32}
            backgroundColor={isDark ? '#2a2a2a' : '#ffffff'}
            borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            // Enhanced with pet-themed reactions
            reactions={[
              '❤️', '🐕', '🐱', '🐾', '👍', '👎', '😊', '😢',
              '🐕‍🦺', '🦮', '🐈', '🐾', '🎾', '🦴', '🍖', '🏃‍♂️'
            ]}
          />
        </View>
      )}

      {/* Pet Profile Modal */}
      {showPetProfile && (
        <PetProfileModal
          visible={showPetProfile}
          onClose={() => setShowPetProfile(false)}
          matchId={matchId}
          petName={petName || ''}
        />
      )}

      {/* Voice Message Recorder */}
      {showVoiceRecorder && (
        <VoiceMessageRecorder
          visible={showVoiceRecorder}
          onClose={() => setShowVoiceRecorder(false)}
          onSend={(audioUri) => {
            // Handle voice message sending
            console.log('Voice message:', audioUri);
            setShowVoiceRecorder(false);
          }}
          matchId={matchId}
        />
      )}

      {/* Location Sharing */}
      {showLocationShare && (
        <LocationShareButton
          visible={showLocationShare}
          onClose={() => setShowLocationShare(false)}
          onShare={(location) => {
            // Handle location sharing
            console.log('Shared location:', location);
            setShowLocationShare(false);
          }}
          matchId={matchId}
        />
      )}
    </ScreenShell>
    </ErrorBoundary>
  );
}
