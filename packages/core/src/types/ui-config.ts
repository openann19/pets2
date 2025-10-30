/**
 * 🎛️ Remote UI Control Plane - Type Definitions
 * TypeScript types exported for use across the monorepo
 */

export type {
  UIConfig,
  Tokens,
  MicroInteractions,
  Components,
  Screens,
  Audience,
} from '../schemas/ui-config';

/**
 * Preview session type for testing configs before publishing
 */
export interface PreviewSession {
  code: string;
  configId: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Config version metadata
 */
export interface UIConfigVersion {
  version: string;
  status: 'draft' | 'preview' | 'staged' | 'prod';
  createdAt: string;
  createdBy: string;
  changelog: string;
  audience?: {
    env?: 'dev' | 'stage' | 'prod';
    pct?: number;
    countryAllow?: string[];
  };
}

/**
 * Config publish request
 */
export interface PublishConfigRequest {
  version: string;
  status: 'preview' | 'staged' | 'prod';
  audience?: {
    env?: 'dev' | 'stage' | 'prod';
    pct?: number;
    countryAllow?: string[];
  };
}

/**
 * Config validation result
 */
export interface ValidationResult {
  ok: boolean;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Config diff for admin UI
 */
export interface ConfigDiff {
  added: Record<string, unknown>;
  removed: Record<string, unknown>;
  changed: Record<string, { old: unknown; new: unknown }>;
}

/**
 * Rollback request
 */
export interface RollbackRequest {
  version: string;
  reason?: string;
}

