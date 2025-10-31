/**
 * PET-AWARE CHAT HOOK
 * Extends existing chat functionality with pet-first features
 */

import { useState, useCallback, useEffect } from 'react';
import { PetAwareMessage, ChatContext } from '../../../core/src/types/chat-enhancements';
import { useChatData } from '../useChatData'; // Existing hook
import { useTheme } from '@/theme';
import { logger } from '../services/logger';

interface PetAwareChatOptions {
  conversationId: string;
  userPetId: string;
  otherPetId: string;
}

export const usePetAwareChat = ({ conversationId, userPetId, otherPetId }: PetAwareChatOptions) => {
  const theme = useTheme();
  const { messages, sendMessage, isLoading } = useChatData(conversationId);

  // Pet-aware state
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [showPlaydatePlanner, setShowPlaydatePlanner] = useState(false);
  const [showVetShare, setShowVetShare] = useState(false);
  const [selectedRecordType, setSelectedRecordType] = useState<'vaccine' | 'medication' | 'exam' | null>(null);

  // Load chat context (pet info, compatibility, etc.)
  const loadChatContext = useCallback(async () => {
    try {
      // This would call an API to get pet info and compatibility
      const response = await fetch(`/api/chat/${conversationId}/context`);
      const context = await response.json();
      setChatContext(context);
    } catch (error) {
      logger.error('Failed to load chat context:', error);
    }
  }, [conversationId]);

  // Enhanced send message with pet-aware features
  const sendPetAwareMessage = useCallback(async (
    content: string,
    petContext?: PetAwareMessage['petContext'],
    attachments?: any[]
  ) => {
    const enhancedMessage: Partial<PetAwareMessage> = {
      content,
      petContext,
      // Add any attachments (photos, etc.)
    };

    await sendMessage(enhancedMessage, attachments);
  }, [sendMessage]);

  // Play-date planning
  const proposePlaydate = useCallback(async (proposal: {
    proposedAt: string;
    venueId?: string;
    duration?: number;
    notes?: string;
  }) => {
    await sendPetAwareMessage(
      `🐾 Playdate proposal: ${new Date(proposal.proposedAt).toLocaleDateString()} at ${new Date(proposal.proposedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      {
        petId: userPetId,
        petName: chatContext?.pets.userPet.name || 'Pet',
        action: 'playdate_proposal'
      }
    );

    // Here you would also send the structured proposal data
    try {
      await fetch(`/api/chat/${conversationId}/playdate-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal),
      });
    } catch (error) {
      logger.error('Failed to send playdate proposal:', error);
    }

    setShowPlaydatePlanner(false);
  }, [conversationId, userPetId, chatContext, sendPetAwareMessage]);

  // Vet record sharing
  const shareVetRecord = useCallback(async (recordType: 'vaccine' | 'medication' | 'exam', recordId: string) => {
    try {
      const response = await fetch(`/api/chat/${conversationId}/share-vet-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordType,
          recordId,
          shareWith: otherPetId,
        }),
      });

      const shareData = await response.json();

      await sendPetAwareMessage(
        `📋 Shared ${recordType} record for ${chatContext?.pets.userPet.name || 'pet'}`,
        {
          petId: userPetId,
          petName: chatContext?.pets.userPet.name || 'Pet',
          action: 'vet_share'
        }
      );

      setShowVetShare(false);
    } catch (error) {
      logger.error('Failed to share vet record:', error);
    }
  }, [conversationId, otherPetId, userPetId, chatContext, sendPetAwareMessage]);

  // Behavioral context
  const sendBehaviorNote = useCallback(async (
    context: PetAwareMessage['behaviorNote']['context'],
    description: string,
    severity: 'low' | 'medium' | 'high'
  ) => {
    await sendPetAwareMessage(
      `💭 ${chatContext?.pets.userPet.name || 'Pet'} context: ${description}`,
      {
        petId: userPetId,
        petName: chatContext?.pets.userPet.name || 'Pet',
        action: 'behavior_note'
      }
    );
  }, [chatContext, userPetId, sendPetAwareMessage]);

  // Quick behavior chips
  const behaviorChips = [
    { context: 'playful' as const, emoji: '🎾', text: 'Very playful today' },
    { context: 'anxious' as const, emoji: '😰', text: 'A bit anxious around new dogs' },
    { context: 'protective' as const, emoji: '🛡️', text: 'Protective of food/toys' },
    { context: 'shy' as const, emoji: '😊', text: 'Shy with strangers at first' },
    { context: 'energetic' as const, emoji: '⚡', text: 'Extra energetic today!' },
  ];

  // Initialize chat context
  useEffect(() => {
    loadChatContext();
  }, [loadChatContext]);

  return {
    // Existing chat functionality
    messages,
    sendMessage: sendPetAwareMessage,
    isLoading,

    // Pet-aware enhancements
    chatContext,
    showPlaydatePlanner,
    setShowPlaydatePlanner,
    showVetShare,
    setShowVetShare,
    selectedRecordType,
    setSelectedRecordType,

    // Actions
    proposePlaydate,
    shareVetRecord,
    sendBehaviorNote,
    behaviorChips,

    // UI helpers
    theme,
  };
};
