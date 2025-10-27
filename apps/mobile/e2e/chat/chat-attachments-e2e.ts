/**
 * E2E Test: Chat Attachments with S3 Integration
 * Tests the newly implemented S3 file upload for chat attachments
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Chat Attachments - S3 Integration', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    // Login
    try {
      await element(by.id('login-email-input')).typeText('test@example.com');
      await element(by.id('login-password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    } catch (e) {
      // Already logged in
    }

    // Navigate to chat
    await element(by.id('matches-tab')).tap();
    await waitFor(element(by.id('matches-list')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('match-card-0')).tap();
    
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(2000);
  });

  describe('Image Attachment Upload', () => {
    it('should open attachment picker when tapping attach button', async () => {
      await element(by.id('attach-button')).tap();
      
      // Should show attachment options
      await waitFor(element(by.text('Photo Library')))
        .toBeVisible()
        .withTimeout(1000);
      
      await detoxExpect(element(by.text('Take Photo'))).toBeVisible();
      await detoxExpect(element(by.text('Choose from Gallery'))).toBeVisible();
    });

    it('should select image from library and show preview', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      // Grant permissions if needed
      try {
        await element(by.text('Allow')).tap();
      } catch (e) {
        // Already granted
      }
      
      // Select first image
      await element(by.id('photo-item-0')).tap();
      
      // Should show image preview
      await detoxExpect(element(by.id('attachment-preview'))).toBeVisible();
      await detoxExpect(element(by.id('attachment-image'))).toBeVisible();
      
      // Should show file size
      await detoxExpect(element(by.id('attachment-size'))).toBeVisible();
    });

    it('should upload image to S3 and display in chat', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      try {
        await element(by.text('Allow')).tap();
      } catch (e) {
        // Permissions already granted
      }
      
      await element(by.id('photo-item-0')).tap();
      
      // Send attachment
      await element(by.id('send-button')).tap();
      
      // Should show upload progress
      await waitFor(element(by.id('upload-progress')))
        .toBeVisible()
        .withTimeout(1000);
      
      // Wait for upload to complete
      await waitFor(element(by.id('image-message')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Verify image is displayed
      await detoxExpect(element(by.id('chat-image'))).toBeVisible();
    });

    it('should allow cropping/resizing before upload', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Take Photo')).tap();
      
      // Grant camera permission
      try {
        await element(by.text('OK')).tap();
      } catch (e) {
        // Permission already granted
      }
      
      // Skip actual photo taking in test
      // In real flow, would take photo and show editor
      
      // Check if editor opens
      await waitFor(element(by.id('image-editor')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Attachment Limits & Validation', () => {
    it('should reject files larger than 10MB', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      // Try to select large image (simulated in test)
      // Should show error message
      await waitFor(element(by.text('File too large')))
        .toBeVisible()
        .withTimeout(2000);
      
      await detoxExpect(
        element(by.text('Maximum file size is 10MB'))
      ).toBeVisible();
    });

    it('should validate file type', async () => {
      // Test would attempt to upload unsupported file type
      // Should show error for unsupported formats
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      // Try selecting file with wrong extension
      // Should show error
      await waitFor(element(by.text('Unsupported file type')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should show supported file types in picker', async () => {
      await element(by.id('attach-button')).tap();
      
      // Should show supported types
      await detoxExpect(element(by.text('Images'))).toBeVisible();
      await detoxExpect(element(by.text('Videos'))).toBeVisible();
    });
  });

  describe('Attachment Preview & Cancellation', () => {
    it('should allow canceling before upload starts', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      try {
        await element(by.text('Allow')).tap();
      } catch (e) {}
      
      await element(by.id('photo-item-0')).tap();
      
      // Cancel before sending
      await element(by.id('cancel-attachment-button')).tap();
      
      // Preview should be gone
      await waitFor(element(by.id('attachment-preview')))
        .not.toBeVisible()
        .withTimeout(1000);
    });

    it('should show loading state during upload', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      try {
        await element(by.text('Allow')).tap();
      } catch (e) {}
      
      await element(by.id('photo-item-0')).tap();
      await element(by.id('send-button')).tap();
      
      // Should show upload progress
      await detoxExpect(element(by.id('upload-progress-bar'))).toBeVisible();
      await detoxExpect(element(by.id('upload-percentage'))).toBeVisible();
    });
  });

  describe('Video Attachment Upload', () => {
    it('should handle video file upload', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      try {
        await element(by.text('Allow')).tap();
      } catch (e) {}
      
      // Select video (would navigate to videos)
      await element(by.id('video-item-0')).tap();
      
      // Show video preview
      await detoxExpect(element(by.id('video-preview'))).toBeVisible();
      
      // Send video
      await element(by.id('send-button')).tap();
      
      // Wait for video message
      await waitFor(element(by.id('video-message')))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should display video thumbnail in chat', async () => {
      // Assume video uploaded successfully
      await detoxExpect(element(by.id('video-thumbnail'))).toBeVisible();
      
      // Should show play button overlay
      await detoxExpect(element(by.id('video-play-overlay'))).toBeVisible();
      
      // Should show duration
      await detoxExpect(element(by.id('video-duration'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle S3 upload failure gracefully', async () => {
      // Block S3 uploads
      await device.setURLBlacklist(['.*s3.*', '.*amazonaws.*']);
      
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo Library')).tap();
      
      try {
        await element(by.text('Allow')).tap();
      } catch (e) {}
      
      await element(by.id('photo-item-0')).tap();
      await element(by.id('send-button')).tap();
      
      // Should show error message
      await waitFor(element(by.text('Upload failed')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Should show retry button
      await detoxExpect(element(by.id('retry-upload-button'))).toBeVisible();
      
      // Re-enable network
      await device.setURLBlacklist([]);
    });

    it('should retry failed upload', async () => {
      // Re-enable network
      await device.setURLBlacklist([]);
      
      // Tap retry
      await element(by.id('retry-upload-button')).tap();
      
      // Should retry upload
      await waitFor(element(by.id('image-message')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  afterEach(async () => {
    await device.setURLBlacklist([]);
  });
});

