import { device, element, by, waitFor } from "detox";

describe("Swipe rewind", () => {
  it("rewinds the last swipe when Undo is tapped", async () => {
    await device.launchApp({ newInstance: true });
    await element(by.id("tab-swipe")).tap();

    // swipe right on top card (provide testID on card root if needed)
    await element(by.id("swipe-card-0")).swipe("right");

    await element(by.id("undo-pill")).tap();
    await waitFor(element(by.id("swipe-card-0")))
      .toBeVisible()
      .withTimeout(5000); // same card reappears
  });
});

