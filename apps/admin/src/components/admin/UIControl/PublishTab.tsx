'use client';

import { useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import type { UIConfig } from '@pawfectmatch/core';

interface PublishTabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

export function PublishTab({ config, onConfigChange }: PublishTabProps) {
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState<'draft' | 'preview' | 'staged' | 'prod'>('draft');
  const [changelog, setChangelog] = useState('');
  const [publishPercent, setPublishPercent] = useState(100);
  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ ok: boolean; errors?: string[] } | null>(null);

  const validateConfig = async () => {
    if (!config) return;

    setIsValidating(true);
    try {
      const response = await axiosInstance.post('/api/ui-config/validate', {
        config: {
          ...config,
          version: version || config.version,
          status: status || config.status,
          meta: {
            ...config.meta,
            changelog: changelog || config.meta.changelog,
            createdAt: new Date().toISOString(),
          },
        },
      });
      setValidationResult(response.data);
    } catch (error: any) {
      setValidationResult({
        ok: false,
        errors: [error.response?.data?.message || 'Validation failed'],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const createDraft = async () => {
    if (!config) return;

    setIsPublishing(true);
    try {
      const fullConfig: UIConfig = {
        ...config,
        version: version || `${new Date().toISOString().split('T')[0]?.replace(/-/g, '.')}-draft.1`,
        status: 'draft',
        meta: {
          ...config.meta,
          changelog: changelog || 'Draft configuration',
          createdAt: new Date().toISOString(),
        },
      } as UIConfig;

      await axiosInstance.post('/api/ui-config', { config: fullConfig });
      alert('Draft created successfully!');
    } catch (error: any) {
      alert(`Failed to create draft: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const generatePreviewCode = async () => {
    if (!config) return;

    setIsPublishing(true);
    try {
      // First create a draft if needed
      const draftVersion = version || `${new Date().toISOString().split('T')[0]?.replace(/-/g, '.')}-preview.1`;
      const fullConfig: UIConfig = {
        ...config,
        version: draftVersion,
        status: 'preview',
        meta: {
          ...config.meta,
          changelog: changelog || 'Preview configuration',
          createdAt: new Date().toISOString(),
        },
      } as UIConfig;

      const createResponse = await axiosInstance.post('/api/ui-config', { config: fullConfig });
      const configId = createResponse.data.data?.version || draftVersion;

      // Generate preview session
      const previewResponse = await axiosInstance.post('/api/ui-config/preview/session', {
        configId,
        expiresInHours: 24,
      });

      const code = previewResponse.data.data?.code;
      setPreviewCode(code);
      alert(`Preview code generated: ${code}`);
    } catch (error: any) {
      alert(`Failed to generate preview code: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const publishConfig = async () => {
    if (!config || !version) return;

    setIsPublishing(true);
    try {
      await axiosInstance.post(`/api/ui-config/${version}/publish`, {
        status,
        audience: status === 'staged' ? { pct: publishPercent } : undefined,
      });
      alert(`Configuration published as ${status}!`);
    } catch (error: any) {
      alert(`Failed to publish: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Version & Metadata */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Version & Metadata</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Version (e.g., 2025.01.27-rc.1)
            </label>
            <input
              type="text"
              value={version || config?.version || ''}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="2025.01.27-rc.1"
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Changelog</label>
            <textarea
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Describe the changes in this configuration..."
              rows={4}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* Validation */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Validation</h3>
        <button
          onClick={validateConfig}
          disabled={isValidating || !config}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isValidating ? 'Validating...' : 'Validate Configuration'}
        </button>
        {validationResult && (
          <div className={`mt-4 p-4 rounded ${validationResult.ok ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
            <p className={validationResult.ok ? 'text-green-400' : 'text-red-400'}>
              {validationResult.ok ? '✅ Configuration is valid' : '❌ Validation failed'}
            </p>
            {validationResult.errors && (
              <ul className="mt-2 list-disc list-inside text-sm text-red-300">
                {validationResult.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Publish Workflow */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Publish Workflow</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="draft">Draft</option>
              <option value="preview">Preview</option>
              <option value="staged">Staged (Rollout)</option>
              <option value="prod">Production</option>
            </select>
          </div>

          {status === 'staged' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rollout Percentage: {publishPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={publishPercent}
                onChange={(e) => setPublishPercent(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          )}

          {previewCode && (
            <div className="p-4 bg-blue-900/30 rounded">
              <p className="text-blue-400 font-semibold">Preview Code: {previewCode}</p>
              <p className="text-sm text-gray-400 mt-1">
                Share this code with testers to preview the configuration
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={createDraft}
              disabled={isPublishing || !config}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={generatePreviewCode}
              disabled={isPublishing || !config}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              Generate Preview Code
            </button>
            <button
              onClick={publishConfig}
              disabled={isPublishing || !config || !version}
              className="px-4 py-2 bg-admin-primary text-white rounded hover:bg-admin-primary/90 disabled:opacity-50"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

