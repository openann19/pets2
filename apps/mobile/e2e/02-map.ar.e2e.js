/* global device, element, by, expect, waitFor */
describe('Map – AR flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await element(by.text('Map')).tap();

    // Set a deterministic device location; then press locate FAB
    await device.setLocation(42.6977, 23.3219);
    await element(by.id('fab-locate')).tap();
  });

  it('opens AR Scent Trails when user location is known', async () => {
    await element(by.id('fab-ar')).tap();

    await waitFor(element(by.id('ARScentTrailsScreen')))
      .toBeVisible()
      .withTimeout(8000);

    await expect(element(by.id('ARScentTrailsScreen'))).toBeVisible();
  });
});

