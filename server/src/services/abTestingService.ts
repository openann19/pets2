/**
 * A/B Testing Service
 * Manages experiments for conversion optimization
 */

import User from '../models/User';
import AnalyticsEvent from '../models/AnalyticsEvent';
import logger from '../utils/logger';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: Array<{
    id: string;
    name: string;
    weight: number; // 0-100, percentage of users to assign
    config: Record<string, unknown>;
  }>;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  metrics: {
    conversions: Record<string, number>; // variantId -> conversion count
    impressions: Record<string, number>; // variantId -> impression count
  };
}

export interface ABTestAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
}

class ABTestingService {
  private tests: Map<string, ABTest> = new Map();

  /**
   * Create a new A/B test
   */
  createTest(test: Omit<ABTest, 'metrics'> & { metrics?: ABTest['metrics'] }): ABTest {
    const fullTest: ABTest = {
      ...test,
      metrics: test.metrics || {
        conversions: {},
        impressions: {}
      }
    };

    this.tests.set(test.id, fullTest);
    logger.info('A/B test created', { testId: test.id, testName: test.name });
    return fullTest;
  }

  /**
   * Get variant assignment for a user
   * Uses consistent hashing to ensure same user gets same variant
   */
  assignVariant(userId: string, testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || !test.isActive) {
      return null;
    }

    // Check if test is within date range
    const now = new Date();
    if (test.startDate > now || (test.endDate && test.endDate < now)) {
      return null;
    }

    // Use consistent hashing based on userId + testId
    const hash = this.hashString(`${userId}-${testId}`);
    const hashValue = hash % 100;

    // Assign variant based on weight distribution
    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (hashValue < cumulativeWeight) {
        // Track impression
        this.trackImpression(testId, variant.id, userId);
        return variant.id;
      }
    }

    // Fallback to first variant
    return test.variants[0]?.id || null;
  }

  /**
   * Track conversion for a variant
   */
  async trackConversion(
    testId: string,
    variantId: string,
    userId: string,
    conversionType: string = 'default'
  ): Promise<void> {
    try {
      const test = this.tests.get(testId);
      if (!test) {
        logger.warn('Conversion tracked for unknown test', { testId, variantId, userId });
        return;
      }

      // Increment conversion count
      if (!test.metrics.conversions[variantId]) {
        test.metrics.conversions[variantId] = 0;
      }
      test.metrics.conversions[variantId]++;

      // Log to analytics
      await AnalyticsEvent.create({
        userId,
        eventType: 'ab_test_conversion',
        entityType: 'ab_test',
        metadata: {
          testId,
          variantId,
          conversionType
        },
        createdAt: new Date()
      });

      logger.info('A/B test conversion tracked', { testId, variantId, userId, conversionType });
    } catch (error) {
      logger.error('Error tracking A/B test conversion', { error, testId, variantId, userId });
    }
  }

  /**
   * Track impression (variant shown to user)
   */
  private trackImpression(testId: string, variantId: string, userId: string): void {
    const test = this.tests.get(testId);
    if (!test) return;

    if (!test.metrics.impressions[variantId]) {
      test.metrics.impressions[variantId] = 0;
    }
    test.metrics.impressions[variantId]++;
  }

  /**
   * Get test results
   */
  getTestResults(testId: string): {
    test: ABTest | undefined;
    conversionRates: Record<string, number>;
    statisticalSignificance?: number;
  } {
    const test = this.tests.get(testId);
    if (!test) {
      return {
        test: undefined,
        conversionRates: {}
      };
    }

    // Calculate conversion rates
    const conversionRates: Record<string, number> = {};
    for (const variant of test.variants) {
      const impressions = test.metrics.impressions[variant.id] || 0;
      const conversions = test.metrics.conversions[variant.id] || 0;
      conversionRates[variant.id] = impressions > 0
        ? Number(((conversions / impressions) * 100).toFixed(2))
        : 0;
    }

    // Calculate statistical significance (simplified chi-square test)
    const statisticalSignificance = this.calculateSignificance(test);

    return {
      test,
      conversionRates,
      statisticalSignificance
    };
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTest[] {
    const now = new Date();
    return Array.from(this.tests.values()).filter(test => {
      if (!test.isActive) return false;
      if (test.startDate > now) return false;
      if (test.endDate && test.endDate < now) return false;
      return true;
    });
  }

  /**
   * Initialize default A/B tests
   */
  initializeDefaultTests(): void {
    // Paywall design test
    this.createTest({
      id: 'paywall_design_v1',
      name: 'Paywall Design Test',
      description: 'Testing different paywall designs for conversion optimization',
      variants: [
        {
          id: 'control',
          name: 'Control (Original)',
          weight: 50,
          config: { design: 'original', pricing: 'standard' }
        },
        {
          id: 'variant_a',
          name: 'Variant A (Minimal)',
          weight: 25,
          config: { design: 'minimal', pricing: 'standard' }
        },
        {
          id: 'variant_b',
          name: 'Variant B (Social Proof)',
          weight: 25,
          config: { design: 'social_proof', pricing: 'standard', showTestimonials: true }
        }
      ],
      startDate: new Date(),
      endDate: null,
      isActive: true
    });

    // Pricing test
    this.createTest({
      id: 'pricing_strategy_v1',
      name: 'Pricing Strategy Test',
      description: 'Testing different pricing displays',
      variants: [
        {
          id: 'control',
          name: 'Control (Standard Pricing)',
          weight: 50,
          config: { showMonthly: true, showAnnual: true, highlightMonthly: false }
        },
        {
          id: 'variant_a',
          name: 'Variant A (Annual Highlighted)',
          weight: 50,
          config: { showMonthly: true, showAnnual: true, highlightAnnual: true }
        }
      ],
      startDate: new Date(),
      endDate: null,
      isActive: true
    });

    logger.info('Default A/B tests initialized');
  }

  /**
   * Simple hash function for consistent assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate statistical significance using chi-square test
   * Returns confidence level (0-100)
   */
  private calculateSignificance(test: ABTest): number {
    const variants = test.variants;
    if (variants.length < 2) return 0;

    // Get data for all variants
    const variantData = variants.map(v => ({
      id: v.id,
      impressions: test.metrics.impressions[v.id] || 0,
      conversions: test.metrics.conversions[v.id] || 0
    }));

    const totalImpressions = variantData.reduce((sum, v) => sum + v.impressions, 0);
    const totalConversions = variantData.reduce((sum, v) => sum + v.conversions, 0);

    if (totalImpressions === 0 || totalConversions === 0) return 0;

    // Calculate expected conversion rate (pooled)
    const expectedConversionRate = totalConversions / totalImpressions;

    // Chi-square test (2x2 contingency table for control vs variant)
    if (variants.length === 2) {
      const control = variantData[0];
      const variant = variantData[1];

      if (control.impressions === 0 || variant.impressions === 0) return 0;

      // Expected values
      const controlExpectedConversions = control.impressions * expectedConversionRate;
      const variantExpectedConversions = variant.impressions * expectedConversionRate;
      const controlExpectedNonConversions = control.impressions * (1 - expectedConversionRate);
      const variantExpectedNonConversions = variant.impressions * (1 - expectedConversionRate);

      // Chi-square statistic
      const chiSquare = 
        Math.pow(control.conversions - controlExpectedConversions, 2) / controlExpectedConversions +
        Math.pow(control.impressions - control.conversions - controlExpectedNonConversions, 2) / controlExpectedNonConversions +
        Math.pow(variant.conversions - variantExpectedConversions, 2) / variantExpectedConversions +
        Math.pow(variant.impressions - variant.conversions - variantExpectedNonConversions, 2) / variantExpectedNonConversions;

      // Degrees of freedom = 1 for 2x2 table
      // Critical value for 95% confidence (p < 0.05) = 3.84
      // Critical value for 99% confidence (p < 0.01) = 6.63
      if (chiSquare >= 6.63) return 99; // 99% confidence
      if (chiSquare >= 3.84) return 95; // 95% confidence
      if (chiSquare >= 2.71) return 90; // 90% confidence
      if (chiSquare >= 1.32) return 75; // 75% confidence

      // Scale based on chi-square value
      return Math.min(95, Math.max(0, Math.round((chiSquare / 6.63) * 95)));
    }

    // For multiple variants, use simplified calculation
    // In production, use proper multi-variant statistical tests
    const minSampleSize = Math.min(...variantData.map(v => v.impressions));
    if (minSampleSize > 1000) return 90;
    if (minSampleSize > 500) return 75;
    if (minSampleSize > 100) return 50;
    return 25;
  }
}

export default new ABTestingService();
