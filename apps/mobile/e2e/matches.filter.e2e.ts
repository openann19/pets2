describe("Matches Filter", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it("applies search/species/sort", async () => {
    await element(by.id("tab-matches")).tap();
    await element(by.id("btn-matches-filter")).tap();
    await expect(element(by.id("matches-filter-modal"))).toBeVisible();

    await element(by.id("filter-q")).replaceText("buddy");
    await element(by.id("filter-species-dog")).tap();
    await element(by.id("filter-sort-alpha")).tap();
    await element(by.id("filter-apply")).tap();

    await waitFor(element(by.text("buddy")).atIndex(0)).toBeVisible().withTimeout(5000);
  });
});

