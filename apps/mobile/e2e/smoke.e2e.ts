describe('Smoke', () => {
  it('app launches', async () => {
    await device.launchApp({ newInstance: true });
    await expect(element(by.id('root'))).toBeVisible();
  });
});
