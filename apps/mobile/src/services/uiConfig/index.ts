/**
 * 🎛️ UI Config - Main Export
 * Complete SDK for remote UI configuration
 */

export { loadConfig, loadPreviewConfig, clearPreviewMode, type LoadConfigOptions } from './loader';
export { useUIConfig, usePreviewConfig, type UseUIConfigResult } from './hooks';
export { 
  configToTheme, 
  getMotionConfig, 
  shouldRespectReducedMotion, 
  getLowEndDevicePolicy,
  applyMicroInteractionGuards,
} from './apply';
export { getDefaultUIConfig } from './defaults';
export {
  saveConfig,
  loadConfigFromStorage,
  savePreviewCode,
  loadPreviewCode,
  clearPreviewCode,
  getLastFetchTime,
  clearConfigStorage,
} from './storage';

export type { UIConfig } from '@pawfectmatch/core';

