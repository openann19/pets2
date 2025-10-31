/**
 * CDN Configuration Panel
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import adminApiService from '@/services/adminApi';
import { logger } from '@pawfectmatch/core';

interface CDNConfig {
  enabled: boolean;
  provider?: string;
  baseUrl?: string;
}

export function CDNPanel({
  config,
  colors,
  isDark,
  spacing,
}: {
  config: CDNConfig;
  colors: any;
  isDark: boolean;
  spacing: any;
}) {
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; latency?: number; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  const handleTestCDN = async () => {
    if (!testUrl) {
      alert('Please enter a test URL');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      const result = await adminApiService.testCDNUrl(testUrl);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleInvalidateCache = async (path: string) => {
    try {
      await adminApiService.invalidateCDNCache(path);
      alert('Cache invalidation requested');
    } catch (error) {
      alert('Failed to invalidate cache');
      logger.error('Failed to invalidate cache:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      {/* Configuration Status */}
      <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
          CDN Configuration
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          <ConfigItem label="Status" value={config.enabled ? 'Enabled' : 'Disabled'} colors={colors} isDark={isDark} />
          {config.provider && <ConfigItem label="Provider" value={config.provider} colors={colors} isDark={isDark} />}
          {config.baseUrl && <ConfigItem label="Base URL" value={config.baseUrl} colors={colors} isDark={isDark} />}
        </div>
      </div>

      {/* CDN Test */}
      {config.enabled && (
        <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
            Test CDN URL
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <input
              type="text"
              placeholder="Enter URL to test (e.g., https://cdn.example.com/image.jpg)"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                borderRadius: '8px',
                border: `1px solid ${isDark ? colors.neutral[700] : colors.neutral[300]}`,
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                color: onSurfaceColor,
                fontSize: '14px',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTestCDN}
              disabled={testing || !testUrl}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                borderRadius: '8px',
                backgroundColor: colors.primary[500],
                color: '#FFFFFF',
                border: 'none',
                cursor: testing || !testUrl ? 'not-allowed' : 'pointer',
                opacity: testing || !testUrl ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
            >
              <ArrowPathIcon
                style={{
                  width: '20px',
                  height: '20px',
                  animation: testing ? 'spin 1s linear infinite' : 'none',
                }}
              />
              Test URL
            </motion.button>
            {testResult && (
              <div
                style={{
                  padding: spacing[3],
                  borderRadius: '8px',
                  backgroundColor: testResult.success
                    ? isDark
                      ? colors.success[900]
                      : colors.success[50]
                    : isDark
                    ? colors.error[900]
                    : colors.error[50],
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                {testResult.success ? (
                  <CheckCircleIcon style={{ width: '20px', height: '20px', color: colors.success[500] }} />
                ) : (
                  <XCircleIcon style={{ width: '20px', height: '20px', color: colors.error[500] }} />
                )}
                <div>
                  <p style={{ color: onSurfaceColor, fontSize: '14px', fontWeight: '600' }}>
                    {testResult.success ? 'Success' : 'Failed'}
                  </p>
                  {testResult.latency && (
                    <p style={{ color: onMutedColor, fontSize: '12px' }}>
                      Latency: {testResult.latency}ms
                    </p>
                  )}
                  {testResult.error && (
                    <p style={{ color: colors.error[500], fontSize: '12px' }}>{testResult.error}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cache Invalidation */}
      {config.enabled && (
        <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
            Cache Invalidation
          </h3>
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <input
              type="text"
              placeholder="Path to invalidate (e.g., /images/pet-123.jpg)"
              id="invalidate-path"
              style={{
                flex: 1,
                padding: `${spacing[2]} ${spacing[3]}`,
                borderRadius: '8px',
                border: `1px solid ${isDark ? colors.neutral[700] : colors.neutral[300]}`,
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                color: onSurfaceColor,
                fontSize: '14px',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const input = document.getElementById('invalidate-path') as HTMLInputElement;
                handleInvalidateCache(input?.value || '');
              }}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                borderRadius: '8px',
                backgroundColor: colors.warning[500],
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <CloudArrowUpIcon style={{ width: '20px', height: '20px' }} />
              Invalidate
            </motion.button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ConfigItem({ label, value, colors, isDark }: { label: string; value: string; colors: any; isDark: boolean }) {
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: onMutedColor }}>{label}:</span>
      <span style={{ fontSize: '14px', fontWeight: '600', color: onSurfaceColor }}>{value}</span>
    </div>
  );
}

