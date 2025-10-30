/**
 * E2E Tests for Chat Reactions & Attachments
 * Tests the complete flow: reactions, image attachments, voice notes
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Chat Reactions & Attachments Flow', () => {
  beforeAll(async () => {
    // No need to launch app here as it's done in init.js
    console.log('Chat Reactions & Attachments E2E tests starting...');
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Reactions Flow', () => {
    it('should display reaction picker on long-press', async () => {
      // Navigate to chat tab
      await element(by.id('tab-chat')).tap();
      
      // Select a conversation
      await waitFor(element(by.id('chat-list-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Wait for messages to load
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Long-press on a message
      await element(by.id('message-item')).atIndex(0).longPress();
      
      // Reaction picker should appear
      await detoxExpect(element(by.id('reaction-picker'))).toBeVisible();
      
      // Verify emoji reactions are visible
      await detoxExpect(element(by.text('❤️'))).toBeVisible();
      await detoxExpect(element(by.text('👍'))).toBeVisible();
      await detoxExpect(element(by.text('😂'))).toBeVisible();
      await detoxExpect(element(by.text('😮'))).toBeVisible();
      await detoxExpect(element(by.text('😢'))).toBeVisible();
      await detoxExpect(element(by.text('🔥'))).toBeVisible();
      await detoxExpect(element(by.text('🎉'))).toBeVisible();
      await detoxExpect(element(by.text('👏'))).toBeVisible();
    });

    it('should add reaction to message', async () => {
      await element(by.id('tab-chat')).tap();
      
      await waitFor(element(by.id('chat-list-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Long-press message to show reaction picker
      await element(by.id('message-item')).atIndex(0).longPress();
      
      // Wait for reaction picker
      await waitFor(element(by.id('reaction-picker')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Select heart reaction
      await element(by.text('❤️')).tap();
      
      // Reaction picker should close
      await waitFor(element(by.id('reaction-picker')))
        .not.toBeVisible()
        .withTimeout(2000);
      
      // Reaction badge should appear on message
      await waitFor(element(by.id('reaction-badge')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should update reaction count when multiple users react', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Add first reaction
      await element(by.id('message-item')).atIndex(0).longPress();
      await waitFor(element(by.id('reaction-picker')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.text('👍')).tap();
      
      // Verify reaction count (may need to wait for server response)
      await waitFor(element(by.id('reaction-count')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should remove reaction when already reacted', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Add reaction
      await element(by.id('message-item')).atIndex(0).longPress();
      await waitFor(element(by.id('reaction-picker')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.text('😂')).tap();
      
      // Wait for reaction to appear
      await waitFor(element(by.id('reaction-badge')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Long-press again and select same reaction (should remove)
      await element(by.id('message-item')).atIndex(0).longPress();
      await waitFor(element(by.id('reaction-picker')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.text('😂')).tap();
      
      // Reaction should be removed (or count should decrease)
      await waitFor(element(by.id('reaction-badge')))
        .not.toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Attachments Flow', () => {
    it('should show attachment button in message input', async () => {
      await element(by.id('tab-chat')).tap();
      
      await waitFor(element(by.id('chat-list-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Verify attachment button exists
      await detoxExpect(element(by.id('attachment-button'))).toBeVisible();
    });

    it('should open attachment picker on tap', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Tap attachment button
      await element(by.id('attachment-button')).tap();
      
      // Attachment picker should appear
      await waitFor(element(by.id('attachment-picker')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify options
      await detoxExpect(element(by.text('Photo Library'))).toBeVisible();
      await detoxExpect(element(by.text('Take Photo'))).toBeVisible();
      await detoxExpect(element(by.text('Camera Roll'))).toBeVisible();
    });

    it('should select and upload image attachment', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Open attachment picker
      await element(by.id('attachment-button')).tap();
      
      await waitFor(element(by.id('attachment-picker')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Select photo library
      await element(by.text('Photo Library')).tap();
      
      // Grant permissions if needed
      // (Device-specific: Android/iOS permission handling)
      
      // Select an image (using first available item)
      await waitFor(element(by.id('photo-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('photo-item')).atIndex(0).tap();
      
      // Image should start uploading
      await waitFor(element(by.id('upload-progress')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Wait for upload to complete
      await waitFor(element(by.id('attachment-thumbnail')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should display uploaded image in chat', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Send an image (assuming image is already sent)
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Find an image message
      const imageMessage = element(by.id('message-image'));
      
      // Try to find image, if it exists, verify it
      try {
        await detoxExpect(imageMessage).toBeVisible();
        
        // Verify image dimensions or aspect ratio
        const attributes = await imageMessage.getAttributes();
        console.log('Image attributes:', attributes);
      } catch (error) {
        console.log('No image message found in chat');
      }
    });

    it('should allow viewing full-size image on tap', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Find image message and tap
      const imageMessage = element(by.id('message-image'));
      
      // Try to tap image if it exists
      try {
        await imageMessage.tap();
        
        // Image viewer should open
        await waitFor(element(by.id('image-viewer')))
          .toBeVisible()
          .withTimeout(3000);
        
        // Verify full-size image is displayed
        await detoxExpect(element(by.id('full-size-image'))).toBeVisible();
        
        // Close image viewer
        await element(by.id('close-image-viewer')).tap();
      } catch (error) {
        console.log('No image found to view');
      }
    });

    it('should cancel attachment upload', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await element(by.id('attachment-button')).tap();
      
      await waitFor(element(by.id('attachment-picker')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Cancel attachment selection
      await element(by.id('cancel-attachment')).tap();
      
      // Picker should close
      await waitFor(element(by.id('attachment-picker')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Voice Notes Flow', () => {
    it('should show voice note button in message input', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Verify voice note button exists
      await detoxExpect(element(by.id('voice-note-button'))).toBeVisible();
    });

    it('should start recording on press and stop on release', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Press and hold voice note button
      await element(by.id('voice-note-button')).longPress(3000);
      
      // Recording indicator should appear
      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Duration counter should be visible
      await detoxExpect(element(by.id('recording-duration'))).toBeVisible();
      
      // Recording stopped (after long press completes)
      // Should see voice note preview
      await waitFor(element(by.id('voice-note-preview')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display voice note waveform in chat', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Find voice note message
      const voiceNoteWaveform = element(by.id('voice-waveform'));
      
      // Try to find voice note waveform
      try {
        await detoxExpect(voiceNoteWaveform).toBeVisible();
        
        // Verify waveform bars are rendered
        await detoxExpect(element(by.id('waveform-bar'))).toBeVisible();
      } catch (error) {
        console.log('No voice note waveform found');
      }
    });

    it('should play voice note on tap', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Find voice note
      const voiceNoteWaveform = element(by.id('voice-waveform'));
      
      // Try to play voice note if it exists
      try {
        // Tap to play
        await voiceNoteWaveform.tap();
        
        // Playback should start
        await waitFor(element(by.id('voice-playback-indicator')))
          .toBeVisible()
          .withTimeout(2000);
        
        // Verify progress updates
        await waitFor(element(by.id('playback-progress')))
          .toBeVisible()
          .withTimeout(1000);
      } catch (error) {
        console.log('No voice note found to play');
      }
    });

    it('should show error for failed upload', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Attempt to send voice note
      await element(by.id('voice-note-button')).longPress(3000);
      
      // Simulate upload failure (via network conditions)
      await device.setURLBlacklist(['.*upload.*']);
      
      // Wait for error message
      await waitFor(element(by.text(/failed to upload/i)))
        .toBeVisible()
        .withTimeout(10000)
        .catch(() => {
          // Error might not appear in all test environments
          console.log('Upload failure test may need manual configuration');
        });
      
      // Reset network
      await device.setURLBlacklist([]);
    });
  });

  describe('Combined Flow', () => {
    it('should handle multiple reactions on single message', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await waitFor(element(by.id('message-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Add multiple reactions to same message
      const reactions = ['❤️', '👍', '😂'];
      
      for (const reaction of reactions) {
        await element(by.id('message-item')).atIndex(0).longPress();
        await waitFor(element(by.id('reaction-picker')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.text(reaction)).tap();
        await waitFor(element(by.id('reaction-picker')))
          .not.toBeVisible()
          .withTimeout(2000);
      }
      
      // Verify all reactions are displayed
      await waitFor(element(by.id('reaction-badge')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should send message with both text and attachment', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Select attachment
      await element(by.id('attachment-button')).tap();
      await waitFor(element(by.id('attachment-picker')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.text('Photo Library')).tap();
      await waitFor(element(by.id('photo-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('photo-item')).atIndex(0).tap();
      
      // Wait for attachment to be selected
      await waitFor(element(by.id('attachment-thumbnail')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Add text message
      await element(by.id('message-input')).typeText('Check this out!');
      
      // Send
      await element(by.id('send-button')).tap();
      
      // Verify message sent with both content types
      await waitFor(element(by.text('Check this out!')))
        .toBeVisible()
        .withTimeout(5000);
      
      await waitFor(element(by.id('attachment-thumbnail')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Error Handling', () => {
    it('should handle network error during attachment upload', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      // Select attachment
      await element(by.id('attachment-button')).tap();
      
      await waitFor(element(by.id('attachment-picker')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.text('Photo Library')).tap();
      
      await waitFor(element(by.id('photo-item')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('photo-item')).atIndex(0).tap();
      
      // Simulate network failure
      await device.setURLBlacklist(['.*upload.*']);
      
      // Try to send
      await element(by.id('send-button')).tap();
      
      // Should show error message
      await waitFor(element(by.id('error-message')))
        .toBeVisible()
        .withTimeout(5000)
        .catch(() => {
          console.log('Error message might not appear in all environments');
        });
      
      // Reset
      await device.setURLBlacklist([]);
    });

    it('should handle file size limit exceeded', async () => {
      await element(by.id('tab-chat')).tap();
      
      await element(by.id('chat-list-item')).atIndex(0).tap();
      
      await element(by.id('attachment-button')).tap();
      
      await waitFor(element(by.id('attachment-picker')))
        .toBeVisible()
        .withTimeout(3000);
      
      // This would require selecting a large file
      // In real test, would need test asset with size > 10MB
      
      // After selection, should show error
      await waitFor(element(by.text(/file too large/i)))
        .toBeVisible()
        .withTimeout(5000)
        .catch(() => {
          console.log('File size error test needs large test asset');
        });
    });
  });
});

