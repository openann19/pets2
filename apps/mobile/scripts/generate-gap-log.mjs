/**
 * Generate Gap Log YAML
 * Identifies gaps in implementation based on product model analysis
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function generateGapLog() {
  const gaps = [
    {
      id: 'gdpr-e2e-tests',
      title: 'GDPR: Delete Account E2E Tests',
      severity: 'critical',
      area: 'backend+mobile+testing',
      hypothesis: 'GDPR APIs exist but lack E2E tests for delete account, export data, grace period, and cancel deletion flows. Legal compliance risk.',
      acceptance: [
        'DELETE /users/delete-account tested with Detox',
        'POST /users/export-data produces downloadable JSON',
        'Grace period (30 days) UI confirms deletion date',
        'POST /users/cancel-deletion allows reversal during grace period',
        'All flows have E2E test coverage ≥90%'
      ],
      states: ['loading', 'confirm', 'grace-period', 'error'],
      tests: {
        unit: ['services/__tests__/api.test.ts'],
        integration: ['screens/__tests__/DeleteAccountScreen.int.test.tsx'],
        e2e: ['e2e/gdpr.delete-account.e2e.test.js', 'e2e/gdpr.export-data.e2e.test.js']
      },
      owner: 'ai-dev',
      links: [],
      status: 'open'
    },
    {
      id: 'chat-media-complete',
      title: 'Chat: Media Upload/Send Implementation',
      severity: 'high',
      area: 'ui+services+mobile',
      hypothesis: 'UI components exist for image/video/voice but actual upload/send logic missing. Users cannot share media in chats.',
      acceptance: [
        'Image picker → upload → send → display in chat',
        'Video picker → upload → send → display in chat',
        'Voice recorder → upload → send → playback in chat',
        'Export chat UI wired to POST /chat/:matchId/export',
        'All media types have loading/success/error states',
        'Integration tests for each media type'
      ],
      states: ['idle', 'picking', 'uploading', 'sending', 'sent', 'error'],
      tests: {
        unit: ['components/chat/__tests__/MessageInput.test.tsx'],
        integration: ['screens/__tests__/ChatScreen.int.test.tsx'],
        e2e: ['e2e/chat.media-upload.e2e.test.js']
      },
      owner: 'ai-dev',
      links: [],
      status: 'open'
    },
    {
      id: 'swipe-actions-complete',
      title: 'SwipeScreen: Missing Actions (Report, Complete Undo)',
      severity: 'high',
      area: 'ui+services+mobile',
      hypothesis: 'Report action missing UI/handler. Undo partially implemented but not fully tested. Back navigation incomplete.',
      acceptance: [
        'Report button + modal + API wiring to POST /swipe/:petId/report',
        'Undo/Rewind fully functional with validation',
        'Back button properly navigates',
        'All actions have loading/success/error states',
        'Unit + integration tests for all actions'
      ],
      states: ['idle', 'swiping', 'reporting', 'undoing', 'error'],
      tests: {
        unit: ['screens/__tests__/SwipeScreen.test.tsx', 'components/swipe/__tests__/SwipeActions.test.tsx'],
        integration: ['screens/__tests__/SwipeScreen.int.test.tsx'],
        e2e: ['e2e/swipe-actions.e2e.test.js']
      },
      owner: 'ai-dev',
      links: [],
      status: 'open'
    },
    {
      id: 'state-matrices',
      title: 'State Matrices: Skeleton Loaders Missing',
      severity: 'medium',
      area: 'ui+mobile',
      hypothesis: 'Many screens have loading/empty states but skeleton loaders missing. Users see blank screens during data fetch.',
      acceptance: [
        'All critical screens have skeleton loaders',
        'Consistent error recovery patterns across screens',
        'Offline state handling with retry',
        'Loading → Skeleton → Success state transitions',
        'Tests verify state transitions'
      ],
      states: ['loading-skeleton', 'loading-spinner', 'empty', 'error-retry', 'success'],
      tests: {
        unit: ['components/__tests__/SkeletonLoader.test.tsx'],
        integration: ['hooks/__tests__/useErrorRecovery.test.ts']
      },
      owner: 'ai-dev',
      links: [],
      status: 'open'
    },
    {
      id: 'a11y-compliance',
      title: 'Accessibility: Missing Labels/Roles/TestIDs',
      severity: 'high',
      area: 'ui+mobile+a11y',
      hypothesis: 'Touchables missing accessibility labels. Pro components lack testIDs. Hit targets not verified. A11y violations block app store approval.',
      acceptance: [
        'All TouchableOpacity/Button have accessibilityLabel',
        'All custom buttons have accessibilityRole',
        'All Pro components have testID props',
        'Hit targets ≥44x44',
        'A11y scanner reports 0 critical violations',
        'Reduce Motion support on all animations'
      ],
      states: [],
      tests: {
        unit: [],
        integration: [],
        e2e: [],
        a11y: ['__tests__/a11y/accessibility.test.tsx']
      },
      owner: 'ai-dev',
      links: [],
      status: 'open'
    },
    {
      id: 'e2e-critical-journeys',
      title: 'E2E: Critical User Journeys Missing',
      severity: 'critical',
      area: 'testing+e2e',
      hypothesis: 'Only auth E2E test exists. Critical journeys (Auth→Swipe→Match→Chat, Premium, GDPR) lack E2E coverage. Cannot verify production readiness.',
      acceptance: [
        'Auth → Swipe → Match → Chat journey fully tested',
        'Premium upgrade flow tested end-to-end',
        'Settings → GDPR flows tested',
        'Profile edit flow tested',
        'All critical journeys pass in CI'
      ],
      states: [],
      tests: {
        e2e: [
          'e2e/auth-swipe-match-chat.e2e.test.js',
          'e2e/premium-upgrade.e2e.test.js',
          'e2e/settings-gdpr.e2e.test.js',
          'e2e/profile-edit.e2e.test.js'
        ]
      },
      owner: 'ai-dev',
      links: [],
      status: 'open'
    }
  ];
  
  // Convert to YAML-like format (actually JSON for ease)
  const yamlContent = gaps.map(g => `
- id: ${g.id}
  title: "${g.title}"
  severity: ${g.severity}
  area: ${g.area}
  hypothesis: "${g.hypothesis}"
  acceptance:
${g.acceptance.map(a => `    - "${a}"`).join('\n')}
  states:
${g.states.map(s => `    - ${s}`).join('\n')}
  tests:
    unit:
${(g.tests.unit || []).map(t => `      - "${t}"`).join('\n')}
    integration:
${(g.tests.integration || []).map(t => `      - "${t}"`).join('\n')}
    e2e:
${(g.tests.e2e || []).map(t => `      - "${t}"`).join('\n')}
  owner: ${g.owner}
  links: ${JSON.stringify(g.links)}
  status: ${g.status}
`).join('');
  
  return gaps;
}

function main() {
  console.log('🔍 Generating gap log...');
  
  const gaps = generateGapLog();
  
  const outputPath = resolve('reports/gap_log.json');
  writeFileSync(outputPath, JSON.stringify(gaps, null, 2), 'utf-8');
  
  console.log(`✅ Gap log generated: ${outputPath}`);
  console.log(`   - Critical gaps: ${gaps.filter(g => g.severity === 'critical').length}`);
  console.log(`   - High gaps: ${gaps.filter(g => g.severity === 'high').length}`);
  console.log(`   - Medium gaps: ${gaps.filter(g => g.severity === 'medium').length}`);
}

main();

