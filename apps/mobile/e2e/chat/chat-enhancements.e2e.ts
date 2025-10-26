/**
 * Chat Enhancements E2E Test Suite
 * 
 * Tests for chat feature enhancements:
 * - Message reactions
 * - File attachments
 * - Voice notes
 * - Real-time updates
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Chat Enhancements', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    // Login with test user
    await element(by.id('login-email-input')).typeText('test@chat.com');
    await element(by.id('login-password-input')).typeText('Test123!');
    await element(by.id('login-button')).tap();
    
    // Wait for home screen and navigate to matches
    await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
    await element(by.id('matches-tab')).tap();
    
    // Open a chat
    await element(by.id('match-item-0')).tap();
    
    // Wait for chat screen to load
    await waitFor(element(by.id('chat-screen'))).toBeVisible().withTimeout(3000);
  });

  describe('Message Reactions', () => {
    it('should long-press message to show reaction picker', async () => {
      // Long press on first message
      await element(by.id('message-0')).longPress(2000);
      
      // Verify reaction picker appears
      await detoxExpect(element(by.id('reaction-picker'))).toBeVisible();
      
      // Verify reaction options are visible
      await detoxExpect(element(by.id('reaction-like'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-love'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-laugh'))).toBeVisible();
    });

    it('should add reaction to message', async () => {
      // Long press to show picker
      await element(by.id('message-0')).longPress(2000);
      
      // Tap on like reaction
      await element(by.id('reaction-like')).tap();
      
      // Verify reaction appears on message
      await waitFor(element(by.id('message-reactions'))).toBeVisible().withTimeout(2000);
      
      // Verify like count is shown
      await detoxExpect(element(by.text('1'))).toBeVisible();
    });

    it('should show reaction from other user in real-time', async () => {
      // Send a message first
      await element(by.id('message-input')).typeText('Test message');
      await element(by.id('send-button')).tap();
      
      // Wait for message to appear
      await waitFor(element(by.text('Test message'))).toBeVisible().withTimeout(3000);
      
      // Simulate other user's reaction (this would come via socket in real app)
      // In E2E test, we can verify the UI updates correctly
      
      // Verify reaction appears on sent message
      // The backend should emit the reaction via socket
      await waitFor(element(by.id('message-reactions'))).toBeVisible().withTimeout(5000);
    });

    it('should remove reaction when tapped again', async () => {
      // Long press and add reaction
      await element(by.id('message-0')).longPress(2000);
      await element(by.id('reaction-like')).tap();
      
      // Wait for reaction to appear
      await waitFor(element(by.id('message-reactions'))).toBeVisible();
      
      // Tap reaction to remove
      await element(by.id('message-reactions')).tap();
      
      // Verify reaction is removed
      await waitFor(element(by.id('message-reactions'))).toBeNotVisible().withTimeout(2000);
    });
  });

  describe('File Attachments', () => {
    it('should show attachment picker when attach button is tapped', async () => {
      // Tap attach button
      await element(by.id('attach-button')).tap();
      
      // Verify attachment options appear
      await detoxExpect(element(by.id('attachment-picker'))).toBeVisible();
      await detoxExpect(element(by.id('attach-photo'))).toBeVisible();
      await detoxExpect(element(by.id('attach-camera'))).toBeVisible();
    });

    it('should attach and send an image', async () => {
      // Tap attach button
      await element(by.id('attach-button')).tap();
      
      // Tap photo library
      await element(by.id('attach-photo')).tap();
      
      // Select first image from gallery
      await element(by.id('gallery-image-0')).tap();
      
      // Verify image preview appears
      await detoxExpect(element(by.id('attachment-preview'))).toBeVisible();
      
      // Send the attachment
      await element(by.id('send-button')).tap();
      
      // Wait for message to appear with attachment
      await waitFor(element(by.id('attachment-message'))).toBeVisible().withTimeout(5000);
      
      // Verify image thumbnail is shown
      await detoxExpect(element(by.id('attachment-image'))).toBeVisible();
    });

    it('should show upload progress for large files', async () => {
      // Attach a large file
      await element(by.id('attach-button')).tap();
      await element(by.id('attach-photo')).tap();
      
      // Select a large image
      await element(by.id('gallery-image-5')).tap(); // Assuming larger image
      
      // Verify progress indicator appears
      await detoxExpect(element(by.id('upload-progress'))).toBeVisible();
      
      // Wait for upload to complete
      await waitFor(element(by.text('Sent'))).toBeVisible().withTimeout(30000);
    });

    it('should handle attachment upload failure gracefully', async () => {
      // Try to attach with simulated network failure
      await element(by.id('attach-button')).tap();
      await element(by.id('attach-photo')).tap();
      
      // Select image
      await element(by.id('gallery-image-0')).tap();
      
      // Simulate network failure (in real test would be via device.config)
      // Wait for error
      await waitFor(element(by.text('Upload failed'))).toBeVisible().withTimeout(15000);
      
      // Verify retry option is shown
      await detoxExpect(element(by.id('retry-upload-button'))).toBeVisible();
    });
  });

  describe('Voice Notes', () => {
    it('should show voice recording UI when record button is held', async () => {
      // Hold voice record button
      await element(by.id('voice-record-button')).longPress(1000);
      
      // Verify recording UI appears
      await detoxExpect(element(by.id('voice-recording-indicator'))).toBeVisible();
      
      // Verify waveform visualization appears
      await detoxExpect(element(by.id('voice-waveform'))).toBeVisible();
    });

    it('should send voice note when recording stops', async () => {
      // Start recording
      await element(by.id('voice-record-button')).longPress(3000);
      
      // Wait for recording to stop and send
      await waitFor(element(by.id('voice-note-sent'))).toBeVisible().withTimeout(5000);
      
      // Verify voice note message appears
      await detoxExpect(element(by.id('voice-note-message'))).toBeVisible();
      
      // Verify play button is shown
      await detoxExpect(element(by.id('voice-play-button'))).toBeVisible();
    });

    it('should play and pause voice note', async () => {
      // Assumes voice note was already sent
      // Tap play button
      await element(by.id('voice-play-button')).tap();
      
      // Verify playing indicator
      await detoxExpect(element(by.id('voice-playing-indicator'))).toBeVisible();
      
      // Tap to pause
      await element(by.id('voice-play-button')).tap();
      
      // Verify paused state
      await detoxExpect(element(by.id('voice-paused-indicator'))).toBeVisible();
    });

    it('should show duration and waveform for voice notes', async () => {
      // Verify voice note has duration displayed
      await detoxExpect(element(by.id('voice-duration'))).toBeVisible();
      
      // Verify waveform visualization exists
      await detoxExpect(element(by.id('voice-waveform'))).toBeVisible();
    });
  });

  describe('Real-time Updates', () => {
    it('should receive new messages in real-time', async () => {
      // Send a message from current user
      await element(by.id('message-input')).typeText('Hello!');
      await element(by.id('send-button')).tap();
      
      // Simulate receiving a reply from other user
      // In real implementation, socket would emit message
      
      // Wait for new message to appear
      await waitFor(element(by.text('Hello back!'))).toBeVisible().withTimeout(10000);
    });

    it('should show typing indicator when other user is typing', async () => {
      // Wait for typing indicator
      await waitFor(element(by.id('typing-indicator'))).toBeVisible().withTimeout(5000);
      
      // Verify typing animation is shown
      await detoxExpect(element(by.id('typing-dot-0'))).toBeVisible();
    });
  });

  afterEach(async () => {
    // Navigate back to matches screen
    await element(by.id('back-button')).tap();
  });
});

