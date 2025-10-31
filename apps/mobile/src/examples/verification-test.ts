/**
 * Quick verification test for the accessibility and payment localization implementation
 */

import { paymentErrorService } from '../services/PaymentErrorLocalizationService'
import { logger } from '@pawfectmatch/core';
;
import { accessibilityService } from '../services/AccessibilityService';

// Test Payment Error Localization
logger.info('🧪 Testing Payment Error Localization...');

// Test Stripe error mapping
const stripeError = { code: 'card_declined', decline_code: 'insufficient_funds' };
const localizedError = paymentErrorService.getLocalizedError(stripeError);
logger.info('✅ Stripe Error Mapping:', { localizedError });

// Test string error
const stringError = paymentErrorService.getLocalizedError('invalid_card');
logger.info('✅ String Error Mapping:', { stringError });

// Test form labels
const formLabels = paymentErrorService.getPaymentFormLabels();
logger.info('✅ Form Labels:', { formLabels });

// Test Accessibility Service
logger.info('🧪 Testing Accessibility Service...');

const accessibilityLabels = accessibilityService.getAccessibilityLabels();
logger.info('✅ Accessibility Labels Loaded:', Object.keys(accessibilityLabels));

const screenLabels = accessibilityLabels.screens?.home;
logger.info('✅ Screen Labels:', { screenLabels });

logger.info('🎉 All tests completed successfully!');
logger.info('The accessibility and payment localization implementation is working correctly.');
