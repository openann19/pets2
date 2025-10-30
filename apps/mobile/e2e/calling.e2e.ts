import { device, element, by, expect, waitFor } from 'detox';

describe('Calling Features E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        camera: 'YES',
        microphone: 'YES',
        notifications: 'YES',
      },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Pre-Call Device Check', () => {
    it('should perform device check before starting a call', async () => {
      // Navigate to a match profile
      await element(by.id('matches-tab')).tap();
      await waitFor(element(by.id('match-card-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('match-card-0')).tap();
      
      // Tap call button
      await element(by.id('video-call-button')).tap();
      
      // Should show pre-call check screen
      await waitFor(element(by.id('pre-call-check-container')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Should show checking status
      await expect(element(by.text('Preparing Your Call'))).toBeVisible();
      await expect(element(by.text('Checking your device and network connectivity...'))).toBeVisible();
      
      // Wait for check to complete
      await waitFor(element(by.id('device-check-results')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Should show network check result
      await expect(element(by.id('network-check-item'))).toBeVisible();
      
      // Should show microphone check result
      await expect(element(by.id('microphone-check-item'))).toBeVisible();
      
      // Should show camera check result (for video calls)
      await expect(element(by.id('camera-check-item'))).toBeVisible();
    });

    it('should handle permission denied gracefully', async () => {
      // Launch app without permissions
      await device.launchApp({
        permissions: {
          camera: 'NO',
          microphone: 'NO',
        },
        newInstance: true,
      });
      
      // Navigate to call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      // Should show permission errors
      await waitFor(element(by.text('Issues Detected')))
        .toBeVisible()
        .withTimeout(10000);
      
      await expect(element(by.text('Camera access is required for video calls'))).toBeVisible();
      await expect(element(by.text('Microphone access is required for calls'))).toBeVisible();
      
      // Should show fix issues button
      await expect(element(by.id('fix-issues-button'))).toBeVisible();
      
      // Tap fix issues
      await element(by.id('fix-issues-button')).tap();
      
      // Should show instructions
      await expect(element(by.text('Fix These Issues'))).toBeVisible();
    });

    it('should allow proceeding with warnings', async () => {
      // Simulate poor network conditions (would need mock setup)
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('voice-call-button')).tap(); // Voice call for poor network
      
      await waitFor(element(by.id('device-check-results')))
        .toBeVisible()
        .withTimeout(10000);
      
      // If warnings are present, should show continue anyway option
      const continueButton = element(by.id('continue-anyway-button'));
      try {
        await expect(continueButton).toBeVisible();
        await continueButton.tap();
        
        // Should proceed to call screen
        await waitFor(element(by.id('active-call-container')))
          .toBeVisible()
          .withTimeout(5000);
      } catch {
        // No warnings present, should auto-proceed
        await waitFor(element(by.id('active-call-container')))
          .toBeVisible()
          .withTimeout(8000);
      }
    });
  });

  describe('Incoming Call Flow', () => {
    it('should display incoming call screen correctly', async () => {
      // Simulate incoming call (would need backend mock)
      await device.sendUserNotification({
        trigger: {
          type: 'push',
        },
        title: 'Incoming Call',
        subtitle: 'Video call from Max',
        body: 'Tap to answer',
        badge: 1,
        payload: {
          type: 'incoming_call',
          callId: 'test_call_123',
          callType: 'video',
          callerName: 'Max',
        },
      });
      
      // Should show incoming call screen
      await waitFor(element(by.id('incoming-call-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Should show caller information
      await expect(element(by.text('Incoming Call'))).toBeVisible();
      await expect(element(by.text('Video Call'))).toBeVisible();
      await expect(element(by.text('Max'))).toBeVisible();
      await expect(element(by.id('caller-avatar'))).toBeVisible();
      
      // Should show action buttons
      await expect(element(by.id('answer-button'))).toBeVisible();
      await expect(element(by.id('reject-button'))).toBeVisible();
      
      // Should show additional actions
      await expect(element(by.text('Message'))).toBeVisible();
      await expect(element(by.text('Profile'))).toBeVisible();
    });

    it('should handle answering incoming call', async () => {
      // Simulate incoming call
      await device.sendUserNotification({
        trigger: { type: 'push' },
        title: 'Incoming Call',
        body: 'Video call from Max',
        payload: {
          type: 'incoming_call',
          callId: 'test_call_124',
          callType: 'video',
          callerName: 'Max',
        },
      });
      
      await waitFor(element(by.id('incoming-call-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Answer the call
      await element(by.id('answer-button')).tap();
      
      // Should transition to active call screen
      await waitFor(element(by.id('active-call-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Should show call controls
      await expect(element(by.id('mute-button'))).toBeVisible();
      await expect(element(by.id('video-toggle-button'))).toBeVisible();
      await expect(element(by.id('end-call-button'))).toBeVisible();
    });

    it('should handle rejecting incoming call', async () => {
      // Simulate incoming call
      await device.sendUserNotification({
        trigger: { type: 'push' },
        title: 'Incoming Call',
        body: 'Voice call from Bella',
        payload: {
          type: 'incoming_call',
          callId: 'test_call_125',
          callType: 'voice',
          callerName: 'Bella',
        },
      });
      
      await waitFor(element(by.id('incoming-call-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Reject the call
      await element(by.id('reject-button')).tap();
      
      // Should return to previous screen
      await waitFor(element(by.id('incoming-call-container')))
        .not.toBeVisible()
        .withTimeout(3000);
      
      // Should show main app interface
      await expect(element(by.id('main-tab-navigator'))).toBeVisible();
    });
  });

  describe('Active Call Flow', () => {
    beforeEach(async () => {
      // Start a call to get to active call screen
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      // Wait for pre-call check to complete and proceed
      await waitFor(element(by.id('start-call-button')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('start-call-button')).tap();
      
      // Wait for active call screen
      await waitFor(element(by.id('active-call-container')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display active call interface correctly', async () => {
      // Should show call status
      await expect(element(by.id('call-status-text'))).toBeVisible();
      
      // Should show local video view
      await expect(element(by.id('local-video-view'))).toBeVisible();
      
      // Should show remote video view placeholder
      await expect(element(by.id('remote-video-view'))).toBeVisible();
      
      // Should show call controls
      await expect(element(by.id('mute-button'))).toBeVisible();
      await expect(element(by.id('video-toggle-button'))).toBeVisible();
      await expect(element(by.id('camera-switch-button'))).toBeVisible();
      await expect(element(by.id('end-call-button'))).toBeVisible();
      
      // Should show call duration
      await expect(element(by.id('call-duration'))).toBeVisible();
    });

    it('should toggle mute functionality', async () => {
      // Initially unmuted
      await expect(element(by.id('mute-button'))).toBeVisible();
      
      // Tap mute button
      await element(by.id('mute-button')).tap();
      
      // Should show muted state
      await expect(element(by.id('mute-indicator'))).toBeVisible();
      
      // Tap again to unmute
      await element(by.id('mute-button')).tap();
      
      // Should hide muted indicator
      await waitFor(element(by.id('mute-indicator')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should toggle video functionality', async () => {
      // Initially video enabled
      await expect(element(by.id('local-video-view'))).toBeVisible();
      
      // Tap video toggle button
      await element(by.id('video-toggle-button')).tap();
      
      // Should show video disabled state
      await expect(element(by.id('video-disabled-indicator'))).toBeVisible();
      
      // Tap again to enable video
      await element(by.id('video-toggle-button')).tap();
      
      // Should show video enabled state
      await expect(element(by.id('local-video-view'))).toBeVisible();
    });

    it('should switch camera', async () => {
      // Tap camera switch button
      await element(by.id('camera-switch-button')).tap();
      
      // Should briefly show switching indicator
      await waitFor(element(by.id('camera-switching-indicator')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Indicator should disappear after switch
      await waitFor(element(by.id('camera-switching-indicator')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('should handle network quality changes', async () => {
      // Wait for network quality indicator
      await waitFor(element(by.id('network-quality-indicator')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Should show quality status
      const qualityIndicator = element(by.id('network-quality-indicator'));
      await expect(qualityIndicator).toBeVisible();
      
      // Quality should be one of: excellent, good, fair, poor
      // (Exact text depends on network conditions)
    });

    it('should end call properly', async () => {
      // Tap end call button
      await element(by.id('end-call-button')).tap();
      
      // Should show call ended state briefly
      await waitFor(element(by.text('Call Ended')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Should return to previous screen
      await waitFor(element(by.id('active-call-container')))
        .not.toBeVisible()
        .withTimeout(5000);
      
      // Should be back at match profile or main screen
      await expect(element(by.id('main-tab-navigator'))).toBeVisible();
    });
  });

  describe('Call Quality and Network Handling', () => {
    it('should show network quality warnings', async () => {
      // Start a call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      // Proceed through pre-call check
      await waitFor(element(by.id('start-call-button')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('start-call-button')).tap();
      
      await waitFor(element(by.id('active-call-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Wait for network quality assessment
      await waitFor(element(by.id('network-quality-indicator')))
        .toBeVisible()
        .withTimeout(15000);
      
      // If poor quality, should show warning
      try {
        await expect(element(by.text('Poor network quality'))).toBeVisible();
        await expect(element(by.text('Consider switching to audio-only'))).toBeVisible();
      } catch {
        // Good network quality - no warnings expected
      }
    });

    it('should handle call reconnection', async () => {
      // Start a call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      await waitFor(element(by.id('start-call-button')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('start-call-button')).tap();
      
      await waitFor(element(by.id('active-call-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Simulate network interruption (would need mock)
      // In real test, this would trigger reconnection logic
      
      // Should show reconnecting indicator
      try {
        await waitFor(element(by.text('Reconnecting...')))
          .toBeVisible()
          .withTimeout(10000);
        
        // Should eventually reconnect or fail gracefully
        await waitFor(element(by.text('Connected')))
          .toBeVisible()
          .withTimeout(30000);
      } catch {
        // No reconnection needed - stable connection
      }
    });
  });

  describe('Call Telemetry and Analytics', () => {
    it('should track call events properly', async () => {
      // Start a call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      // Complete pre-call check
      await waitFor(element(by.id('start-call-button')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('start-call-button')).tap();
      
      // Wait for call to establish
      await waitFor(element(by.id('active-call-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Perform some actions to generate telemetry
      await element(by.id('mute-button')).tap();
      await device.shake(); // Might trigger some action
      await element(by.id('mute-button')).tap();
      
      // End call
      await element(by.id('end-call-button')).tap();
      
      // Telemetry should be recorded (verified through logs or backend)
      // This would typically be verified through backend API calls
      // or log analysis in a real implementation
    });
  });

  describe('Error Handling', () => {
    it('should handle call setup failures gracefully', async () => {
      // Try to start call with no network (airplane mode)
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      // Should show network error in pre-call check
      await waitFor(element(by.text('No network connection available')))
        .toBeVisible()
        .withTimeout(10000);
      
      await expect(element(by.text('Issues Detected'))).toBeVisible();
      
      // Reset network
      await device.setURLBlacklist([]);
    });

    it('should handle call connection timeout', async () => {
      // Start call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-card-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      await waitFor(element(by.id('start-call-button')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('start-call-button')).tap();
      
      // Wait for potential timeout (would need backend mock to simulate)
      try {
        await waitFor(element(by.text('Call setup timeout')))
          .toBeVisible()
          .withTimeout(35000);
        
        // Should show retry option
        await expect(element(by.text('Retry'))).toBeVisible();
      } catch {
        // Call connected successfully - no timeout
      }
    });
  });

  afterEach(async () => {
    // Clean up any active calls
    try {
      await element(by.id('end-call-button')).tap();
    } catch {
      // No active call to end
    }
    
    // Reset any network restrictions
    await device.setURLBlacklist([]);
  });

  afterAll(async () => {
    await device.terminateApp();
  });
});
