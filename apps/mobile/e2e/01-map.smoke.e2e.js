/* global device, element, by, expect, waitFor */
describe('Map – smoke', () => {
  beforeAll(async () => {
    // Ensure fresh start within the same app instance
    await device.reloadReactNative();
  });

  it('navigates to Map tab and renders essentials', async () => {
    // Tap bottom tab label "Map" (label rendered by EnhancedTabBar)
    await element(by.text('Map')).tap();

    await waitFor(element(by.id('MapScreen')))
      .toBeVisible()
      .withTimeout(10000);

    await expect(element(by.id('map-view'))).toBeVisible();
    await expect(element(by.id('map-radius'))).toBeVisible();

    // Filter button and locate FAB should be there
    await expect(element(by.id('btn-filters'))).toBeVisible();
    await expect(element(by.id('fab-locate'))).toBeVisible();
  });
});

