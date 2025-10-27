/**
 * E2E Tests for AI Compatibility Screen
 * Tests the complete user journey of analyzing pet compatibility
 */

import { by, device, element, expect, waitFor } from "detox";
import { beforeEach, beforeAll } from "@jest/globals";

describe("AI Compatibility Screen", () => {
  beforeAll(async () => {
    // Launch app
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Navigate to AI Compatibility screen
    // This assumes you have a way to navigate to the screen
    await element(by.id("AICompatibilityScreen")).tap();
  });

  describe("Screen Rendering", () => {
    it("should render the compatibility analyzer screen", async () => {
      await waitFor(element(by.id("AICompatibilityScreen")))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text("AI Compatibility Analyzer"))).toBeVisible();
    });

    it("should display back button", async () => {
      await expect(element(by.id("back-button"))).toBeVisible();
    });

    it("should display loading state initially", async () => {
      // Screen should show loading indicator
      await expect(element(by.text("Loading pets..."))).toBeVisible();
    });
  });

  describe("Pet Selection Flow", () => {
    it("should display available pets after loading", async () => {
      // Wait for pets to load
      await waitFor(element(by.id("pet-selection-section")))
        .toBeVisible()
        .withTimeout(10000);

      // Should be able to see pet selection
      await expect(element(by.text("🐕 Select Two Pets"))).toBeVisible();
    });

    it("should allow selecting first pet", async () => {
      await waitFor(element(by.id("pet-card-0")))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id("pet-card-0")).tap();

      // Verify pet is selected
      await expect(element(by.text("Pet 1"))).toBeVisible();
    });

    it("should allow selecting second pet", async () => {
      // Select first pet
      await waitFor(element(by.id("pet-card-0")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-0")).tap();

      // Select second pet
      await waitFor(element(by.id("pet-card-1")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-1")).tap();

      // Verify both pets are selected
      await expect(element(by.text("Pet 1"))).toBeVisible();
      await expect(element(by.text("Pet 2"))).toBeVisible();
    });
  });

  describe("Compatibility Analysis", () => {
    it("should show analyze button when both pets are selected", async () => {
      // Select two pets
      await waitFor(element(by.id("pet-card-0")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-0")).tap();
      
      await waitFor(element(by.id("pet-card-1")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-1")).tap();

      // Verify analyze button is visible
      await expect(element(by.id("analyze-button"))).toBeVisible();
      await expect(element(by.text("Analyze Compatibility"))).toBeVisible();
    });

    it("should start analysis when button is tapped", async () => {
      // Select two pets
      await waitFor(element(by.id("pet-card-0")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-0")).tap();
      
      await waitFor(element(by.id("pet-card-1")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-1")).tap();

      // Tap analyze button
      await element(by.id("analyze-button")).tap();

      // Verify analyzing state
      await expect(element(by.text("Analyzing..."))).toBeVisible();
    });

    it("should display results after analysis completes", async () => {
      // Select two pets
      await waitFor(element(by.id("pet-card-0")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-0")).tap();
      
      await waitFor(element(by.id("pet-card-1")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-1")).tap();

      // Start analysis
      await element(by.id("analyze-button")).tap();

      // Wait for results
      await waitFor(element(by.text("🎯 Compatibility Results")))
        .toBeVisible()
        .withTimeout(30000);

      // Verify results are displayed
      await expect(element(by.text("💕 Compatibility Score"))).toBeVisible();
      await expect(element(by.text("📊 Detailed Breakdown"))).toBeVisible();
    });
  });

  describe("Analysis Results", () => {
    beforeEach(async () => {
      // Complete analysis before testing results
      await waitFor(element(by.id("pet-card-0")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-0")).tap();
      
      await waitFor(element(by.id("pet-card-1")))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id("pet-card-1")).tap();
      
      await element(by.id("analyze-button")).tap();
      
      await waitFor(element(by.text("🎯 Compatibility Results")))
        .toBeVisible()
        .withTimeout(30000);
    });

    it("should display compatibility score", async () => {
      await expect(element(by.text("💕 Compatibility Score"))).toBeVisible();
    });

    it("should display breakdown sections", async () => {
      await expect(element(by.text("📊 Detailed Breakdown"))).toBeVisible();
    });

    it("should display recommendations", async () => {
      await expect(element(by.text("💡 Recommendations"))).toBeVisible();
    });

    it("should allow resetting analysis", async () => {
      // Tap reset/new analysis button
      await element(by.text("New Analysis")).tap();

      // Verify we're back to pet selection
      await expect(element(by.text("🐕 Select Two Pets"))).toBeVisible();
    });
  });

  describe("Error Handling", () => {
    it("should show error when no pets selected", async () => {
      // Try to analyze without selecting pets
      // This should show an alert
      // Note: This test assumes the screen handles this case
    });

    it("should handle network errors gracefully", async () => {
      // This test would require mocking network conditions
      // Implement based on your error handling
    });
  });

  describe("Navigation", () => {
    it("should navigate back when back button is tapped", async () => {
      await element(by.id("back-button")).tap();

      // Verify we've navigated away from compatibility screen
      await expect(element(by.id("AICompatibilityScreen"))).not.toBeVisible();
    });
  });
});

