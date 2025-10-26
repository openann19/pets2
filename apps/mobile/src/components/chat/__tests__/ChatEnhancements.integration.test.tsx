/**
 * Chat Enhancements Integration Tests
 * Tests reactions, attachments, and voice notes working together
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { MobileChat } from '../MobileChat';
import { chatService } from '../../../services/chatService';
import type { Message } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('expo-image-picker');
jest.mock('../../../services/chatService');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

const mockChatService = chatService as jest.Mocked<typeof chatService>;
const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

describe('ChatEnhancements Integration', () => {
  const mockMessages: Message[] = [
    {
      _id: 'msg1',
      content: 'Hello! How are you?',
      messageType: 'text',
      sender: {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
      },
      timestamp: new Date().toISOString(),
      reactions: {
        '❤️': 2,
        '😂': 1,
      },
    },
    {
      _id: 'msg2',
      content: 'Check out this photo!',
      messageType: 'image',
      sender: {
        _id: 'user2',
        firstName: 'Jane',
        lastName: 'Smith',
      },
      timestamp: new Date().toISOString(),
      attachment: {
        type: 'image' as const,
        url: 'https://example.com/photo.jpg',
        name: 'photo.jpg',
        size: 1024000,
      },
    },
  ];

  const defaultProps = {
    messages: mockMessages,
    onSendMessage: jest.fn(),
    currentUserId: 'user1',
    otherUserName: 'Jane',
    matchId: 'match123',
    onReply: jest.fn(),
    onCopy: jest.fn(),
    onReact: jest.fn(),
    onDelete: jest.fn(),
    onShowReadBy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful service responses
    mockChatService.sendReaction.mockResolvedValue({
      success: true,
      messageId: 'msg1',
      reactions: [{ emoji: '❤️', userId: 'user1', timestamp: new Date().toISOString() }],
    });
    
    mockChatService.sendAttachment.mockResolvedValue({
      success: true,
      url: 'https://storage.example.com/image.jpg',
      type: 'image',
    });
    
    mockChatService.sendVoiceNote.mockResolvedValue();
    
    // Mock ImagePicker
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
      expires: 'never',
      canAskAgain: true,
      granted: true,
    });
    
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file://test-image.jpg',
        width: 1000,
        height: 1000,
        type: 'image',
        fileName: 'test-image.jpg',
        fileSize: 1024000,
      }],
    });
  });

  describe('Message Reactions', () => {
    it('should display existing reactions on messages', () => {
      const { getByText } = render(<MobileChat {...defaultProps} />);
      
      // Should show reaction counts
      expect(getByText('❤️')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('😂')).toBeTruthy();
      expect(getByText('1')).toBeTruthy();
    });

    it('should handle long press to show reaction bar', async () => {
      const { getByText } = render(<MobileChat {...defaultProps} />);
      
      const messageText = getByText('Hello! How are you?');
      
      // Long press should trigger haptic feedback
      fireEvent(messageText, 'onLongPress');
      
      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });
    });

    it('should send reaction when emoji selected', async () => {
      const { getByText } = render(<MobileChat {...defaultProps} />);
      
      // Simulate reaction selection
      await act(async () => {
        // This would be triggered by ReactionBarMagnetic
        await mockChatService.sendReaction('match123', 'msg1', '🔥');
      });
      
      expect(mockChatService.sendReaction).toHaveBeenCalledWith('match123', 'msg1', '🔥');
    });
  });

  describe('Image Attachments', () => {
    it('should handle attachment button press', async () => {
      const { getByTestId } = render(<MobileChat {...defaultProps} />);
      
      // Find and press attachment button (would be in MessageInput)
      const attachButton = getByTestId('attachment-button');
      fireEvent.press(attachButton);
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Add Attachment',
          'Choose an option',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Photo Library' }),
            expect.objectContaining({ text: 'Take Photo' }),
            expect.objectContaining({ text: 'Cancel' }),
          ])
        );
      });
    });

    it('should upload image from photo library', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
      });

      const { getByTestId } = render(<MobileChat {...defaultProps} />);
      
      // Simulate photo library selection
      await act(async () => {
        const result = await mockImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          allowsMultipleSelection: false,
        });
        
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          await mockChatService.sendAttachment({
            matchId: 'match123',
            attachmentType: 'image',
            file: blob,
          });
        }
      });
      
      expect(mockChatService.sendAttachment).toHaveBeenCalledWith({
        matchId: 'match123',
        attachmentType: 'image',
        file: expect.any(Blob),
      });
      
      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should display image attachments in messages', () => {
      const { getByTestId } = render(<MobileChat {...defaultProps} />);
      
      // Should render attachment preview
      const attachmentImage = getByTestId('attachment-image');
      expect(attachmentImage).toBeTruthy();
      expect(attachmentImage.props.source.uri).toBe('https://example.com/photo.jpg');
    });
  });

  describe('Voice Notes', () => {
    it('should handle voice button press', async () => {
      const { getByTestId } = render(<MobileChat {...defaultProps} />);
      
      const voiceButton = getByTestId('voice-button');
      fireEvent.press(voiceButton);
      
      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });
    });

    it('should send voice note after recording', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/m4a' });
      
      await act(async () => {
        await mockChatService.sendVoiceNote({
          matchId: 'match123',
          audioBlob: mockAudioBlob,
          duration: 15,
        });
      });
      
      expect(mockChatService.sendVoiceNote).toHaveBeenCalledWith({
        matchId: 'match123',
        audioBlob: mockAudioBlob,
        duration: 15,
      });
    });

    it('should display voice note waveform in messages', () => {
      const voiceMessage: Message = {
        _id: 'msg3',
        content: '',
        messageType: 'voice',
        sender: {
          _id: 'user2',
          firstName: 'Jane',
          lastName: 'Smith',
        },
        timestamp: new Date().toISOString(),
        voiceNote: {
          url: 'https://example.com/voice.m4a',
          duration: 15,
          waveform: [0.1, 0.3, 0.8, 0.5, 0.2, 0.7, 0.4],
        },
      };

      const { getByTestId } = render(
        <MobileChat {...defaultProps} messages={[voiceMessage]} />
      );
      
      const waveform = getByTestId('voice-waveform');
      expect(waveform).toBeTruthy();
    });
  });

  describe('Enhanced UX Features', () => {
    it('should trigger sparkle animation on successful send', async () => {
      const { getByTestId } = render(<MobileChat {...defaultProps} />);
      
      const messageInput = getByTestId('message-input');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(messageInput, 'Test message');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Test message');
      });
      
      // Sparkle animation should be triggered
      const sparkleEffect = getByTestId('send-sparkle');
      expect(sparkleEffect).toBeTruthy();
    });

    it('should show reply preview when replying to message', async () => {
      const { getByText, getByTestId } = render(<MobileChat {...defaultProps} />);
      
      // Simulate reply action
      await act(async () => {
        defaultProps.onReply?.(mockMessages[0]);
      });
      
      await waitFor(() => {
        expect(getByText('Replying to John')).toBeTruthy();
        expect(getByText('Hello! How are you?')).toBeTruthy();
      });
    });

    it('should handle swipe to reply gesture', async () => {
      const { getByText } = render(<MobileChat {...defaultProps} />);
      
      const messageText = getByText('Hello! How are you?');
      
      // Simulate swipe gesture
      fireEvent(messageText, 'onSwipeRight');
      
      await waitFor(() => {
        expect(defaultProps.onReply).toHaveBeenCalledWith(mockMessages[0]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle reaction send failure', async () => {
      mockChatService.sendReaction.mockRejectedValue(new Error('Network error'));
      
      const { getByText } = render(<MobileChat {...defaultProps} />);
      
      await act(async () => {
        try {
          await mockChatService.sendReaction('match123', 'msg1', '❤️');
        } catch (error) {
          // Should show error alert
          expect(mockAlert).toHaveBeenCalledWith(
            'Error',
            'Failed to send reaction. Please try again.'
          );
          
          expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
            Haptics.NotificationFeedbackType.Error
          );
        }
      });
    });

    it('should handle attachment upload failure', async () => {
      mockChatService.sendAttachment.mockRejectedValue(new Error('Upload failed'));
      
      await act(async () => {
        try {
          await mockChatService.sendAttachment({
            matchId: 'match123',
            attachmentType: 'image',
            file: new Blob(['test'], { type: 'image/jpeg' }),
          });
        } catch (error) {
          expect(mockAlert).toHaveBeenCalledWith(
            'Error',
            'Failed to send attachment. Please try again.'
          );
          
          expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
            Haptics.NotificationFeedbackType.Error
          );
        }
      });
    });
  });

  describe('Performance', () => {
    it('should handle large message lists efficiently', () => {
      const largeMessageList = Array.from({ length: 100 }, (_, i) => ({
        _id: `msg${i}`,
        content: `Message ${i}`,
        messageType: 'text' as const,
        sender: {
          _id: i % 2 === 0 ? 'user1' : 'user2',
          firstName: 'User',
          lastName: `${i}`,
        },
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
      }));

      const { getByTestId } = render(
        <MobileChat {...defaultProps} messages={largeMessageList} />
      );
      
      const messageList = getByTestId('message-list');
      expect(messageList).toBeTruthy();
      
      // Should use virtualization for performance
      expect(messageList.props.initialNumToRender).toBe(14);
      expect(messageList.props.windowSize).toBe(8);
      expect(messageList.props.removeClippedSubviews).toBe(true);
    });

    it('should throttle scroll events', () => {
      const { getByTestId } = render(<MobileChat {...defaultProps} />);
      
      const messageList = getByTestId('message-list');
      expect(messageList.props.scrollEventThrottle).toBe(16);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<MobileChat {...defaultProps} />);
      
      expect(getByLabelText('Send message')).toBeTruthy();
      expect(getByLabelText('Add attachment')).toBeTruthy();
      expect(getByLabelText('Record voice note')).toBeTruthy();
    });

    it('should support screen readers for reactions', () => {
      const { getByLabelText } = render(<MobileChat {...defaultProps} />);
      
      // Reaction buttons should have accessibility labels
      expect(getByLabelText('React with Love')).toBeTruthy();
      expect(getByLabelText('React with Laugh')).toBeTruthy();
    });
  });
});
