/**
 * Load Testing for Chat Endpoints
 * Using Artillery.js for performance testing
 */

const { expect } = require('chai');

describe('Chat Load Test Configuration', () => {
  it('should have valid scenario definitions', () => {
    expect(scenarios).toBeDefined();
  });
});

const scenarios = {
  chatReactions: {
    name: 'Chat Reactions Load Test',
    weight: 30,
    flow: [
      {
        post: {
          url: '{{ $baseUrl }}/api/chat/reactions',
          headers: {
            Authorization: 'Bearer {{ $token }}',
            'Content-Type': 'application/json',
          },
          json: {
            matchId: '{{ $randomMatchId }}',
            messageId: '{{ $randomMessageId }}',
            reaction: 'heart',
          },
          capture: {
            json: '$.messageId',
            as: 'reactionId',
          },
        },
      },
    ],
  },
  chatAttachments: {
    name: 'Chat Attachments Load Test',
    weight: 20,
    flow: [
      {
        post: {
          url: '{{ $baseUrl }}/api/chat/attachments',
          headers: {
            Authorization: 'Bearer {{ $token }}',
          },
          file: {
            file: './tests/fixtures/test-image.jpg',
            filename: 'test-image.jpg',
            contentType: 'image/jpeg',
          },
          capture: {
            json: '$.url',
            as: 'attachmentUrl',
          },
        },
      },
    ],
  },
  voicePresign: {
    name: 'Voice Notes Presign Load Test',
    weight: 25,
    flow: [
      {
        post: {
          url: '{{ $baseUrl }}/api/chat/voice/presign',
          headers: {
            Authorization: 'Bearer {{ $token }}',
            'Content-Type': 'application/json',
          },
          json: {
            contentType: 'audio/webm',
          },
          capture: {
            json: '$.key',
            as: 'presignKey',
          },
        },
      },
      {
        put: {
          url: '{{ presignUrl }}',
          headers: {
            'Content-Type': 'audio/webm',
          },
          file: './tests/fixtures/test-voice.webm',
        },
      },
    ],
  },
  gdprExport: {
    name: 'GDPR Export Load Test',
    weight: 10,
    flow: [
      {
        post: {
          url: '{{ $baseUrl }}/api/account/export-data',
          headers: {
            Authorization: 'Bearer {{ $token }}',
            'Content-Type': 'application/json',
          },
          json: {
            format: 'json',
            includeMessages: true,
            includeMatches: true,
            includeProfileData: true,
          },
          capture: {
            json: '$.exportId',
            as: 'exportId',
          },
        },
      },
    ],
  },
  premiumCheckout: {
    name: 'Premium Checkout Load Test',
    weight: 15,
    flow: [
      {
        post: {
          url: '{{ $baseUrl }}/api/premium/subscribe',
          headers: {
            Authorization: 'Bearer {{ $token }}',
            'Content-Type': 'application/json',
          },
          json: {
            plan: 'premium',
            interval: 'month',
          },
          capture: {
            json: '$.data.sessionId',
            as: 'checkoutSession',
          },
        },
      },
    ],
  },
};

const config = {
  target: process.env.TARGET_URL || 'http://localhost:3000',
  phases: [
    { duration: 60, arrivalRate: 1, name: 'Warm up' },
    { duration: 120, arrivalRate: 5, name: 'Ramp up' },
    { duration: 300, arrivalRate: 10, name: 'Sustained load' },
    { duration: 120, arrivalRate: 2, name: 'Cool down' },
  ],
  variables: {
    baseUrl: process.env.TARGET_URL || 'http://localhost:3000',
  },
  plugins: {
    expect: {},
  },
};

module.exports = { config, scenarios };

