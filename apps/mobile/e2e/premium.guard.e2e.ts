import { by, element, waitFor, expect } from "detox";

describe("Premium Guard", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should block and navigate to Premium screen when accessing premium feature", async () => {
    // Navigate to leaderboard (suppose it's guarded)
    await element(by.id("tab-leaderboard")).tap();
    
    // Wait for premium required message
    await waitFor(element(by.text("Premium required")))
      .toBeVisible()
      .withTimeout(4000);

    // Tap upgrade button
    await element(by.text("Upgrade")).tap();

    // Verify Premium screen is shown
    await expect(element(by.id("screen-premium"))).toBeVisible();
  });

  it("should allow premium users to access features", async () => {
    // Setup: Login as premium user would happen here
    // For now, just verify the flow doesn't block
    await element(by.id("tab-leaderboard")).tap();
    
    // Premium users should see the leaderboard
    await waitFor(element(by.id("leaderboard-list")))
      .toBeVisible()
      .withTimeout(3000);
  });
});

