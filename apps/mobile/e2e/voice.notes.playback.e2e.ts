import { by, device, element, waitFor } from 'detox';

describe('Voice Notes Playback', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should record and play voice notes', async () => {
    // Navigate to chat
    await element(by.id('tab-chat')).tap();
    
    // Select a conversation
    await waitFor(element(by.id('chat-list-item')))
      .toBeVisible()
      .withTimeout(5000);
    
    await element(by.id('chat-list-item')).tap();
    
    // Find voice note button
    await element(by.id('voice-note-button')).tap();
    
    // Start recording
    await element(by.id('start-recording-button')).tap();
    
    console.log('Recording started');
    
    // Record for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stop recording
    await element(by.id('stop-recording-button')).tap();
    
    console.log('Recording stopped');
    
    // Wait for upload/processing
    await waitFor(element(by.id('voice-note-uploaded')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Play the voice note
    await element(by.id('play-voice-note-button')).tap();
    
    console.log('Voice note playback started');
    
    // Wait for playback to progress
    await waitFor(element(by.id('playback-progress')))
      .toBeVisible()
      .withTimeout(2000);
    
    // Verify waveform or progress indicator
    await expect(element(by.id('waveform'))).toBeVisible();
    
    console.log('Voice note playback successful');
  });

  it('should handle playback errors gracefully', async () => {
    await element(by.id('tab-chat')).tap();
    
    // Try to play a corrupted/non-existent voice note
    await element(by.id('play-corrupted-note')).tap();
    
    // Verify error message
    await waitFor(element(by.id('playback-error')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.label('Unable to play voice note'))).toBeVisible();
  });

  it('should show playback progress', async () => {
    await element(by.id('tab-chat')).tap();
    
    // Start playback
    await element(by.id('play-voice-note-button')).tap();
    
    // Verify progress updates
    const progressElements = await element(by.id('playback-progress')).getAttributes();
    
    console.log('Playback progress:', progressElements);
    
    // Wait a bit for progress to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await expect(element(by.id('playback-progress'))).toBeVisible();
  });
});

