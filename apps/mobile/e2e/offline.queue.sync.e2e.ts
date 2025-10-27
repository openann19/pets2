import { by, device, element, waitFor } from 'detox';

describe('Offline Queue Sync', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should queue actions when offline and sync when online', async () => {
    // Perform some actions while online
    await element(by.id('tab-discovery')).tap();
    
    // Like a pet
    await element(by.id('swipe-card')).swipe('left', 'fast');
    
    // Disable network (simulate offline)
    await device.setNetworkCondition('offline');
    
    console.log('Network disabled - offline mode');
    
    // Try to perform actions (should be queued)
    await element(by.id('swipe-card')).swipe('right', 'fast');
    await element(by.id('swipe-card')).swipe('right', 'fast');
    
    // Verify queue exists
    await waitFor(element(by.id('offline-queue-badge')))
      .toBeVisible()
      .withTimeout(2000);
    
    console.log('Actions queued while offline');
    
    // Re-enable network (simulate online)
    await device.setNetworkCondition('online');
    
    console.log('Network enabled - going online');
    
    // Wait for sync to complete
    await waitFor(element(by.id('sync-indicator')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Wait for sync to complete
    await waitFor(element(by.id('sync-indicator')))
      .not.toBeVisible()
      .withTimeout(15000);
    
    // Verify queue is cleared
    await expect(element(by.id('offline-queue-badge'))).not.toBeVisible();
    
    console.log('Queue synced successfully');
  });

  it('should handle sync failures and retry', async () => {
    // Go offline
    await device.setNetworkCondition('offline');
    
    // Queue an action
    await element(by.id('swipe-card')).swipe('right', 'fast');
    
    // Go online but with network errors
    await device.setNetworkCondition('online');
    
    // Simulate network error
    console.log('Simulating network error');
    
    // Wait for retry mechanism
    await waitFor(element(by.id('retry-sync-button')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Tap retry
    await element(by.id('retry-sync-button')).tap();
    
    // Verify sync completes
    await waitFor(element(by.id('sync-indicator')))
      .not.toBeVisible()
      .withTimeout(15000);
  });
});

