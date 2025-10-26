/**
 * E2E Test: Complete Chat Flow
 * Tests: Chat navigation, messages, replies, voice, attachments, thread jump
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Complete Chat Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    // Login before each test if needed
    try {
      await element(by.id('login-email-input')).typeText('test@example.com');
      await element(by.id('login-password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    } catch (e) {
      // Already logged in or different state
    }
  });

  describe('Message Sending & Receiving', () => {
    it('should open chat from matches list', async () => {
      // Navigate to matches tab
      await element(by.id('matches-tab')).tap();
      
      // Wait for matches list
      await waitFor(element(by.id('matches-list')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Tap on first match
      await element(by.id('match-card-0')).tap();
      
      // Should open chat screen
      await detoxExpect(element(by.id('chat-screen'))).toBeVisible();
      await detoxExpect(element(by.id('chat-header'))).toBeVisible();
    });

    it('should display message input and action buttons', async () => {
      await element(by.id('chat-screen')).swipe('up', 'fast');
      
      await detoxExpect(element(by.id('message-input'))).toBeVisible();
      await detoxExpect(element(by.id('send-button'))).toBeVisible();
      await detoxExpect(element(by.id('attach-button'))).toBeVisible();
      await detoxExpect(element(by.id('voice-button'))).toBeVisible();
    });

    it('should send a text message', async () => {
      const testMessage = 'Hello! This is a test message 🐾';
      
      // Type message
      await element(by.id('message-input')).typeText(testMessage);
      
      // Tap send
      await element(by.id('send-button')).tap();
      
      // Wait for message to appear
      await waitFor(element(by.text(testMessage)))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify message appears in list
      await detoxExpect(element(by.text(testMessage))).toBeVisible();
    });

    it('should display typing indicator', async () => {
      // Start typing
      await element(by.id('message-input')).tap();
      await element(by.id('message-input')).typeText('Typing test');
      
      // Should show typing indicator
      await waitFor(element(by.id('typing-indicator')))
        .toBeVisible()
        .withTimeout(1000);
    });

    it('should show message status indicators', async () => {
      // Check last message has status
      await detoxExpect(element(by.id('message-status'))).toBeVisible();
    });
  });

  describe('Reply & Quote Functionality', () => {
    it('should long press message to show reply option', async () => {
      // Long press on a message
      await element(by.id('message-item-0')).longPress();
      
      // Should show reply option
      await waitFor(element(by.id('reply-button')))
        .toBeVisible()
        .withTimeout(1000);
    });

    it('should show reply preview bar after selecting reply', async () => {
      await element(by.id('message-item-0')).longPress();
      await element(by.id('reply-button')).tap();
      
      // Should show reply preview
      await waitFor(element(by.id('reply-preview-bar')))
        .toBeVisible()
        .withTimeout(1000);
      
      // Should show cancel button
      await detoxExpect(element(by.id('cancel-reply-button'))).toBeVisible();
    });

    it('should send reply with quoted message', async () => {
      // Long press to reply
      await element(by.id('message-item-0')).longPress();
      await element(by.id('reply-button')).tap();
      
      // Type reply
      await element(by.id('message-input')).typeText('This is my reply');
      
      // Send
      await element(by.id('send-button')).tap();
      
      // Verify reply was sent
      await waitFor(element(by.text('This is my reply')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify quoted message is shown
      await detoxExpect(element(by.id('quoted-message'))).toBeVisible();
    });

    it('should cancel reply by tapping cancel', async () => {
      await element(by.id('message-item-0')).longPress();
      await element(by.id('reply-button')).tap();
      
      // Cancel reply
      await element(by.id('cancel-reply-button')).tap();
      
      // Reply preview should be gone
      await waitFor(element(by.id('reply-preview-bar')))
        .not.toBeVisible()
        .withTimeout(1000);
    });

    it('should show swipe hint on first message', async () => {
      // Check if swipe hint is visible
      await detoxExpect(element(by.id('swipe-to-reply-hint'))).toBeVisible();
    });

    it('should support swipe-to-reply gesture', async () => {
      // Swipe right on message
      await element(by.id('message-item-1')).swipe('right', 'fast', 0.3);
      
      // Should show reply preview
      await waitFor(element(by.id('reply-preview-bar')))
        .toBeVisible()
        .withTimeout(1000);
    });
  });

  describe('Voice Messages', () => {
    it('should open voice recorder', async () => {
      await element(by.id('voice-button')).tap();
      
      // Should show voice recorder
      await waitFor(element(by.id('voice-recorder')))
        .toBeVisible()
        .withTimeout(1000);
    });

    it('should record voice message', async () => {
      await element(by.id('voice-button')).tap();
      
      // Start recording
      await element(by.id('record-button')).tap();
      
      // Wait for recording
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stop recording
      await element(by.id('stop-button')).tap();
      
      // Should show waveform
      await detoxExpect(element(by.id('voice-waveform'))).toBeVisible();
    });

    it('should send voice message', async () => {
      await element(by.id('voice-button')).tap();
      await element(by.id('record-button')).tap();
      
      // Record for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await element(by.id('stop-button')).tap();
      
      // Send voice message
      await element(by.id('send-voice-button')).tap();
      
      // Should send and close recorder
      await waitFor(element(by.id('voice-recorder')))
        .not.toBeVisible()
        .withTimeout(2000);
      
      // Should show voice message in chat
      await detoxExpect(element(by.id('voice-message'))).toBeVisible();
    });

    it('should cancel voice message', async () => {
      await element(by.id('voice-button')).tap();
      await element(by.id('record-button')).tap();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cancel
      await element(by.id('cancel-voice-button')).tap();
      
      // Should close recorder
      await waitFor(element(by.id('voice-recorder')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Attachments', () => {
    it('should open attachment picker', async () => {
      await element(by.id('attach-button')).tap();
      
      // Should show attachment options
      await waitFor(element(by.text('Photo Library')))
        .toBeVisible()
        .withTimeout(1000);
      
      await detoxExpect(element(by.text('Take Photo'))).toBeVisible();
    });

    it('should attach and send image from library', async () => {
      await element(by.id('attach-button')).tap();
      
      // Select photo library
      await element(by.text('Photo Library')).tap();
      
      // Grant permission if needed
      try {
        await element(by.text('Allow')).tap();
      } catch (e) {
        // Already granted
      }
      
      // Select first photo
      await element(by.id('photo-item-0')).tap();
      
      // Should show preview
      await detoxExpect(element(by.id('attachment-preview'))).toBeVisible();
      
      // Send
      await element(by.id('send-button')).tap();
      
      // Should show image message
      await waitFor(element(by.id('image-message')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should cancel attachment', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      await element(by.id('photo-item-0')).tap();
      
      // Cancel
      await element(by.id('cancel-attachment-button')).tap();
      
      // Preview should be gone
      await waitFor(element(by.id('attachment-preview')))
        .not.toBeVisible()
        .withTimeout(1000);
    });
  });

  describe('Link Previews', () => {
    it('should detect URL in message', async () => {
      const messageWithUrl = 'Check this out: https://example.com';
      
      await element(by.id('message-input')).typeText(messageWithUrl);
      await element(by.id('send-button')).tap();
      
      // Wait for link preview to load
      await waitFor(element(by.id('link-preview-card')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display link preview card', async () => {
      const messageWithUrl = 'https://github.com';
      await element(by.id('message-input')).typeText(messageWithUrl);
      await element(by.id('send-button')).tap();
      
      // Should show preview
      await waitFor(element(by.id('link-preview-card')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Should have title
      await detoxExpect(element(by.id('link-preview-title'))).toBeVisible();
    });

    it('should open link from preview card', async () => {
      // Assuming link preview exists
      await element(by.id('link-preview-card')).tap();
      
      // Should open link (external browser)
      // The exact behavior depends on implementation
    });
  });

  describe('Read Receipts & Status', () => {
    it('should show read receipts', async () => {
      // Check last message has read indicator
      await detoxExpect(element(by.id('read-receipt'))).toBeVisible();
    });

    it('should show message delivery status', async () => {
      // Should show sent/s delivered/read states
      await detoxExpect(element(by.id('message-status-delivered'))).toBeVisible();
    });
  });

  describe('Reactions', () => {
    it('should add reaction to message', async () => {
      // Long press message
      await element(by.id('message-item-0')).longPress();
      
      // Tap react button
      await element(by.id('react-button')).tap();
      
      // Should show reaction picker
      await waitFor(element(by.id('reaction-picker')))
        .toBeVisible()
        .withTimeout(1000);
      
      // Select reaction
      await element(by.id('reaction-like')).tap();
      
      // Should show reaction on message
      await detoxExpect(element(by.id('message-reaction'))).toBeVisible();
    });
  });

  describe('Navigation & Thread Jump', () => {
    it('should navigate to quoted message', async () => {
      // Send a reply first
      await element(by.id('message-item-0')).longPress();
      await element(by.id('reply-button')).tap();
      await element(by.id('message-input')).typeText('Reply message');
      await element(by.id('send-button')).tap();
      
      // Wait for reply to be sent
      await waitFor(element(by.text('Reply message')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Tap on quoted message in the reply
      await element(by.id('quoted-message')).tap();
      
      // Should scroll to original message
      // Exact behavior depends on implementation
    });

    it('should navigate back to matches', async () => {
      await element(by.id('chat-back-button')).tap();
      
      // Should return to matches list
      await detoxExpect(element(by.id('matches-screen'))).toBeVisible();
    });
  });

  describe('Empty States', () => {
    it('should show empty state for new chat', async () => {
      // Create new match and open chat
      // ... navigate to empty chat
      
      await detoxExpect(element(by.text('Start the conversation'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should show error state for failed message', async () => {
      // Send message with network down
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('message-input')).typeText('This will fail');
      await element(by.id('send-button')).tap();
      
      // Should show retry badge
      await waitFor(element(by.id('retry-badge')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Re-enable network
      await device.setURLBlacklist([]);
    });

    it('should retry failed message', async () => {
      // Assuming retry badge is visible
      await element(by.id('retry-badge')).tap();
      
      // Should attempt to resend
      await detoxExpect(element(by.id('retry-badge'))).not.toBeVisible();
    });
  });

  afterEach(async () => {
    // Reset network state
    await device.setURLBlacklist([]);
  });
});

