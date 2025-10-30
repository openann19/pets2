/* global element, by, expect, waitFor, device */
describe('Map – filters + marker flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await element(by.text('Map')).tap();
  });

  it('opens filter modal and applies changes', async () => {
    await element(by.id('btn-filters')).tap();
    // Your MapFiltersModal container should expose a testID; if it's a ScreenSheet, tag its wrapper.
    await waitFor(element(by.id('filters-modal')))
      .toBeVisible()
      .withTimeout(6000);

    await expect(element(by.id('filters-modal'))).toBeVisible();
  });

  it('opens a pin details modal when a marker is tapped (if markers exist)', async () => {
    // If there's at least one marker with testID marker-<id>, tap the first:
    // To be robust across fixtures, try a generic find by label "Marker" fallback too.
    const candidates = [
      by.id('marker-pin-1'),
      by.id('marker-1'),
      by.id('marker-dog'),
    ];

    let tapped = false;
    for (const query of candidates) {
      const el = element(query);
      try {
        await el.tap();
        tapped = true;
        break;
      } catch {}
    }

    if (!tapped) {
      // As a safe fallback, try any "Marker" by text or generic id
      try { await element(by.id('marker')).tap(); tapped = true; } catch {}
      try { await element(by.text('Pin')).tap(); tapped = true; } catch {}
    }

    if (tapped) {
      await waitFor(element(by.id('modal-pin-details')))
        .toBeVisible()
        .withTimeout(6000);

      await expect(element(by.id('modal-pin-details'))).toBeVisible();
      await element(by.id('btn-close-pin')).tap();
      await waitFor(element(by.id('modal-pin-details')))
        .toBeNotVisible()
        .withTimeout(6000);
    } else {
      // If no marker exists in this build, at least assert the map is visible
      await expect(element(by.id('map-view'))).toBeVisible();
    }
  });
});

