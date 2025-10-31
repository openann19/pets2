/**
 * WIRE INTEGRATION - Rapid Prototyping & Wireframing System
 *
 * Integrates wireframing capabilities into the existing pet-first architecture
 * for rapid UI iteration, A/B testing, and design validation.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { logger } from '@pawfectmatch/core';

// Extend existing types for wireframing
import type { ReactNode } from 'react';

export interface WireframeConfig {
  enabled: boolean;
  theme: 'wireframe' | 'mockup' | 'production';
  showGrid: boolean;
  showMeasurements: boolean;
  interactiveMode: boolean;
  dataSource: 'mock' | 'api' | 'hybrid';
}

export interface WireframeComponent {
  name: string;
  props: Record<string, unknown>;
  children?: WireframeComponent[];
  wireframe?: {
    placeholder?: ReactNode;
    dimensions?: { width: number; height: number };
    interactions?: string[];
  };
}

const WireframeContext = createContext<WireframeConfig | null>(null);

export const useWireframe = () => {
  const context = useContext(WireframeContext);
  return context || { enabled: false, theme: 'production' as const };
};

export const WireframeProvider: React.FC<{
  children: ReactNode;
  config?: Partial<WireframeConfig>;
}> = ({ children, config = {} }) => {
  const [wireframeConfig, setWireframeConfig] = useState<WireframeConfig>(() => {
    // Check for admin-enabled wireframe settings first
    try {
      const adminConfig = JSON.parse(localStorage.getItem('pawfectmatch-wireframe') || '{}');
      if (adminConfig.enabled !== undefined) {
        return {
          enabled: adminConfig.enabled,
          theme: adminConfig.theme || 'production',
          showGrid: adminConfig.showGrid ?? true,
          showMeasurements: adminConfig.showMeasurements ?? false,
          interactiveMode: adminConfig.interactiveMode ?? true,
          dataSource: adminConfig.dataSource || 'mock',
          ...config,
        };
      }
    } catch (error) {
      logger.warn('Failed to load admin wireframe config:', { error });
    }

    // Fall back to development auto-enable or provided config
    return {
      enabled: __DEV__, // Auto-enable in development by default
      theme: 'production',
      showGrid: false,
      showMeasurements: false,
      interactiveMode: true,
      dataSource: 'mock',
      ...config,
    };
  });

  // Persist wireframe settings in development
  useEffect(() => {
    if (__DEV__) {
      const stored = localStorage.getItem('pawfectmatch-wireframe');
      if (stored) {
        try {
          setWireframeConfig(prev => ({ ...prev, ...JSON.parse(stored) }));
        } catch (error) {
          logger.warn('Failed to load wireframe config:', { error });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (__DEV__) {
      localStorage.setItem('pawfectmatch-wireframe', JSON.stringify(wireframeConfig));
    }
  }, [wireframeConfig]);

  return (
    <WireframeContext.Provider value={wireframeConfig}>
      <WireframeOverlay config={wireframeConfig}>
        {children}
      </WireframeOverlay>
    </WireframeContext.Provider>
  );
};

// Wireframe Overlay Component
const WireframeOverlay: React.FC<{
  children: ReactNode;
  config: WireframeConfig;
}> = ({ children, config }) => {
  if (!config.enabled) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      {children}
      {config.showGrid && <WireframeGrid />}
      {config.showMeasurements && <MeasurementOverlay />}
      <WireframeControls config={config} />
    </div>
  );
};

// Wireframe Grid Overlay
const WireframeGrid: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      backgroundImage: `
        linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
    }}
  />
);

// Measurement Overlay
const MeasurementOverlay: React.FC = () => {
  // This would measure and display dimensions of components
  // For now, just a placeholder
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        zIndex: 10000,
      }}
    >
      Wireframe Mode
    </div>
  );
};

// Wireframe Controls Panel
const WireframeControls: React.FC<{ config: WireframeConfig }> = ({ config }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 10000,
      }}
    >
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            padding: '8px 12px',
            background: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          Wireframe
        </button>
      ) : (
        <div
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 16,
            minWidth: 250,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h4 style={{ margin: 0 }}>Wireframe Controls</h4>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          {/* Theme Selector */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Theme:
            </label>
            <select
              value={config.theme}
              onChange={(e) => {
                // This would update the config
                logger.info('Theme changed to:', ({ value: e.target.value }));
              }}
              style={{
                width: '100%',
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
              }}
            >
              <option value="production">Production</option>
              <option value="wireframe">Wireframe</option>
              <option value="mockup">Mockup</option>
            </select>
          </div>

          {/* Toggles */}
          {[
            { key: 'showGrid', label: 'Show Grid' },
            { key: 'showMeasurements', label: 'Show Measurements' },
            { key: 'interactiveMode', label: 'Interactive Mode' },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={config[key as keyof WireframeConfig] as boolean}
                  onChange={(e) => {
                    // This would update the config
                    logger.info(`${key} changed to:`, ({ checked: e.target.checked }));
                  }}
                />
                {label}
              </label>
            </div>
          ))}

          {/* Data Source */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Data Source:
            </label>
            <select
              value={config.dataSource}
              onChange={(e) => {
                logger.info('Data source changed to:', ({ value: e.target.value }));
              }}
              style={{
                width: '100%',
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
              }}
            >
              <option value="mock">Mock Data</option>
              <option value="api">API</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => logger.info('Take Screenshot')}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                Screenshot
              </button>
              <button
                onClick={() => logger.info('Export Wireframe')}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
