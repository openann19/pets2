import { by, element, waitFor } from "detox";

describe("AI Photo Analyzer", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should analyze a photo successfully", async () => {
    // Navigate to AI tab
    await element(by.id("tab-ai")).tap();
    
    // Wait for screen to load
    await waitFor(element(by.text("AI Photo Analyzer")))
      .toBeVisible()
      .withTimeout(5000);

    // Pick photo (this would need to mock the picker in real tests)
    await element(by.id("btn-pick-photo")).tap();
    
    // Wait for photo selection (would need to be mocked)
    await waitFor(element(by.id("btn-analyze")))
      .toBeVisible()
      .withTimeout(3000);

    // Tap analyze button
    await element(by.id("btn-analyze")).tap();

    // Wait for analysis results
    await waitFor(element(by.id("analysis-result")))
      .toBeVisible()
      .withTimeout(8000);

    // Verify results are displayed
    await expect(element(by.text("Overall Score:"))).toBeVisible();
    await expect(element(by.text("Analysis Results"))).toBeVisible();
  });
});

