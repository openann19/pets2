#!/usr/bin/env node
/**
 * Android Data Safety Declaration Generator
 * Generates JSON for Google Play Console Data Safety section
 * 
 * Usage: node scripts/generate-android-data-safety.mjs > android-data-safety.json
 */

const dataSafety = {
  data_types: [
    {
      type: 'name',
      optional: true,
      collected: true,
      shared: false,
      required_reason: 'App functionality',
      purposes: ['App functionality'],
    },
    {
      type: 'email',
      optional: false,
      collected: true,
      shared: false,
      required_reason: 'App functionality',
      purposes: ['App functionality'],
    },
    {
      type: 'user_id',
      optional: false,
      collected: true,
      shared: false,
      required_reason: 'App functionality',
      purposes: ['App functionality'],
    },
    {
      type: 'photos',
      optional: false,
      collected: true,
      shared: false,
      required_reason: 'App functionality',
      purposes: ['App functionality'],
      encrypted: true,
    },
    {
      type: 'location',
      optional: true,
      collected: true,
      shared: false,
      required_reason: 'App functionality',
      purposes: ['App functionality'],
      approximate: true,
      precise: false,
    },
    {
      type: 'device_id',
      optional: false,
      collected: true,
      shared: true,
      shared_with: ['Analytics providers', 'Crash reporting'],
      required_reason: 'Analytics',
      purposes: ['Analytics'],
    },
    {
      type: 'crash_logs',
      optional: false,
      collected: true,
      shared: true,
      shared_with: ['Crash reporting'],
      required_reason: 'Analytics',
      purposes: ['Analytics'],
    },
    {
      type: 'product_interaction',
      optional: false,
      collected: true,
      shared: false,
      required_reason: 'Analytics',
      purposes: ['Analytics'],
    },
  ],
  privacy_policy_url: 'https://pawfectmatch.com/privacy',
  security_practices: {
    encryption_in_transit: true,
    data_deletion_request: true,
    data_encrypted: true,
  },
  shared_collected: [
    {
      type: 'device_id',
      shared_with: ['Stripe (payment processing)', 'Sentry (crash reporting)'],
      purposes: ['Payment processing', 'Crash reporting'],
    },
  ],
};

console.log(JSON.stringify(dataSafety, null, 2));

