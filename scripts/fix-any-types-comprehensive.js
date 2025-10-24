#!/usr/bin/env node

/**
 * Comprehensive Any Type Replacement Script
 * Replaces all 'any' types with professional TypeScript implementations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Professional type replacements
const TYPE_REPLACEMENTS = {
  // Generic types
  ': any': ': unknown',
  'as any': 'as unknown',
  'any[]': 'unknown[]',
  'Array<any>': 'Array<unknown>',
  'Record<string, any>': 'Record<string, unknown>',
  'Record<any, any>': 'Record<string, unknown>',
  
  // Function types
  '(data: any)': '(data: unknown)',
  '(value: any)': '(value: unknown)',
  '(error: any)': '(error: unknown)',
  '(item: any)': '(item: unknown)',
  '(result: any)': '(result: unknown)',
  '(response: any)': '(response: unknown)',
  '(config: any)': '(config: unknown)',
  '(options: any)': '(options: unknown)',
  '(params: any)': '(params: unknown)',
  '(payload: any)': '(payload: unknown)',
  '(event: any)': '(event: unknown)',
  '(callback: any)': '(callback: Function)',
  '(handler: any)': '(handler: Function)',
  
  // Zustand specific
  'immer((set: any)': 'immer((set: ZustandSetter<State>)',
  'immer((set: any, get: any)': 'immer((set: ZustandSetter<State>, get: ZustandGetter<State>)',
  
  // Event emitter types
  'emit(event: string, data?: any)': 'emit(event: string, data?: EventData)',
  'on(event: string, handler: (data: any)': 'on(event: string, handler: (data: EventData)',
  
  // API response types
  'response.data as any': 'response.data as unknown',
  'response as any': 'response as unknown',
  
  // WebRTC specific
  'report as any': 'report as RTCStatsUnion',
  'stats as any': 'stats as RTCStatsReport',
  
  // React specific
  'props: any': 'props: Record<string, unknown>',
  'state: any': 'state: Record<string, unknown>',
  'context: any': 'context: Record<string, unknown>',
  
  // Database/Storage types
  'data: any': 'data: EventData',
  'value: any': 'value: unknown',
  'key: any': 'key: string',
  
  // Validation types
  'input: any': 'input: unknown',
  'field: any': 'field: unknown',
  'schema: any': 'schema: Record<string, unknown>',
  
  // Analytics types
  'properties: any': 'properties: EventData',
  'metrics: any': 'metrics: EventData',
  'events: any': 'events: EventData',
  
  // Form types
  'formData: any': 'formData: Record<string, unknown>',
  'values: any': 'values: Record<string, unknown>',
  'errors: any': 'errors: Record<string, string>',
  
  // Navigation types
  'params: any': 'params: Record<string, unknown>',
  'route: any': 'route: { params: Record<string, unknown> }',
  'navigation: any': 'navigation: Record<string, unknown>',
  
  // Component types
  'children: any': 'children: React.ReactNode',
  'ref: any': 'ref: React.RefObject<HTMLElement>',
  'style: any': 'style: React.CSSProperties',
  'className: any': 'className: string',
  
  // Hook types
  'dependencies: any': 'dependencies: unknown[]',
  'initialValue: any': 'initialValue: unknown',
  'defaultValue: any': 'defaultValue: unknown',
  
  // Async types
  'promise: any': 'promise: Promise<unknown>',
  'result: any': 'result: unknown',
  'error: any': 'error: unknown',
  
  // Utility types
  'config: any': 'config: Record<string, unknown>',
  'options: any': 'options: Record<string, unknown>',
  'settings: any': 'settings: Record<string, unknown>',
  'preferences: any': 'preferences: Record<string, unknown>',
};

// Files to process
const FILES_TO_PROCESS = [
  'apps/web/src',
  'apps/mobile/src',
  'packages/core/src',
  'packages/ui/src',
  'packages/analytics/src',
  'packages/ai/src',
  'packages/testing/src'
];

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Import statements to add
const REQUIRED_IMPORTS = {
  'ZustandSetter': "import type { ZustandSetter } from '../types/advanced';",
  'ZustandGetter': "import type { ZustandGetter } from '../types/advanced';",
  'EventData': "import type { EventData } from '../types/advanced';",
  'EventListener': "import type { EventListener } from '../types/advanced';",
  'Callback': "import type { Callback } from '../types/advanced';",
  'AsyncCallback': "import type { AsyncCallback } from '../types/advanced';",
  'ErrorHandler': "import type { ErrorHandler } from '../types/advanced';",
  'Logger': "import type { Logger } from '../types/advanced';",
  'ApiResponse': "import type { ApiResponse } from '../types/advanced';",
  'ApiError': "import type { ApiError } from '../types/advanced';",
  'RequestConfig': "import type { RequestConfig } from '../types/advanced';",
  'WebSocketMessage': "import type { WebSocketMessage } from '../types/advanced';",
  'PetProfile': "import type { PetProfile } from '../types/advanced';",
  'PetRecommendation': "import type { PetRecommendation } from '../types/advanced';",
  'PetFilters': "import type { PetFilters } from '../types/advanced';",
  'UserProfile': "import type { UserProfile } from '../types/advanced';",
  'UserPreferences': "import type { UserPreferences } from '../types/advanced';",
  'SubscriptionInfo': "import type { SubscriptionInfo } from '../types/advanced';",
  'ChatMessage': "import type { ChatMessage } from '../types/advanced';",
  'ChatMatch': "import type { ChatMatch } from '../types/advanced';",
  'WeatherData': "import type { WeatherData } from '../types/advanced';",
  'WeatherForecast': "import type { WeatherForecast } from '../types/advanced';",
  'Toast': "import type { Toast } from '../types/advanced';",
  'ModalConfig': "import type { ModalConfig } from '../types/advanced';",
  'LoadingState': "import type { LoadingState } from '../types/advanced';",
  'OfflineAction': "import type { OfflineAction } from '../types/advanced';",
  'CacheEntry': "import type { CacheEntry } from '../types/advanced';",
  'SyncStatus': "import type { SyncStatus } from '../types/advanced';",
  'CallData': "import type { CallData } from '../types/advanced';",
  'CallState': "import type { CallState } from '../types/advanced';",
  'AnalyticsEvent': "import type { AnalyticsEvent } from '../types/advanced';",
  'PerformanceMetric': "import type { PerformanceMetric } from '../types/advanced';",
  'FormField': "import type { FormField } from '../types/advanced';",
  'FormState': "import type { FormState } from '../types/advanced';",
  'BaseStoreState': "import type { BaseStoreState } from '../types/advanced';",
  'PaginatedData': "import type { PaginatedData } from '../types/advanced';",
  'FilterState': "import type { FilterState } from '../types/advanced';",
};

function getAllFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let importsToAdd = new Set();
    
    // Apply type replacements
    for (const [pattern, replacement] of Object.entries(TYPE_REPLACEMENTS)) {
      if (content.includes(pattern)) {
        content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
        modified = true;
        
        // Determine which imports to add based on replacements used
        if (replacement.includes('ZustandSetter')) importsToAdd.add('ZustandSetter');
        if (replacement.includes('ZustandGetter')) importsToAdd.add('ZustandGetter');
        if (replacement.includes('EventData')) importsToAdd.add('EventData');
        if (replacement.includes('EventListener')) importsToAdd.add('EventListener');
        if (replacement.includes('Callback')) importsToAdd.add('Callback');
        if (replacement.includes('AsyncCallback')) importsToAdd.add('AsyncCallback');
        if (replacement.includes('ErrorHandler')) importsToAdd.add('ErrorHandler');
        if (replacement.includes('Logger')) importsToAdd.add('Logger');
        if (replacement.includes('ApiResponse')) importsToAdd.add('ApiResponse');
        if (replacement.includes('ApiError')) importsToAdd.add('ApiError');
        if (replacement.includes('RequestConfig')) importsToAdd.add('RequestConfig');
        if (replacement.includes('WebSocketMessage')) importsToAdd.add('WebSocketMessage');
        if (replacement.includes('PetProfile')) importsToAdd.add('PetProfile');
        if (replacement.includes('PetRecommendation')) importsToAdd.add('PetRecommendation');
        if (replacement.includes('PetFilters')) importsToAdd.add('PetFilters');
        if (replacement.includes('UserProfile')) importsToAdd.add('UserProfile');
        if (replacement.includes('UserPreferences')) importsToAdd.add('UserPreferences');
        if (replacement.includes('SubscriptionInfo')) importsToAdd.add('SubscriptionInfo');
        if (replacement.includes('ChatMessage')) importsToAdd.add('ChatMessage');
        if (replacement.includes('ChatMatch')) importsToAdd.add('ChatMatch');
        if (replacement.includes('WeatherData')) importsToAdd.add('WeatherData');
        if (replacement.includes('WeatherForecast')) importsToAdd.add('WeatherForecast');
        if (replacement.includes('Toast')) importsToAdd.add('Toast');
        if (replacement.includes('ModalConfig')) importsToAdd.add('ModalConfig');
        if (replacement.includes('LoadingState')) importsToAdd.add('LoadingState');
        if (replacement.includes('OfflineAction')) importsToAdd.add('OfflineAction');
        if (replacement.includes('CacheEntry')) importsToAdd.add('CacheEntry');
        if (replacement.includes('SyncStatus')) importsToAdd.add('SyncStatus');
        if (replacement.includes('CallData')) importsToAdd.add('CallData');
        if (replacement.includes('CallState')) importsToAdd.add('CallState');
        if (replacement.includes('AnalyticsEvent')) importsToAdd.add('AnalyticsEvent');
        if (replacement.includes('PerformanceMetric')) importsToAdd.add('PerformanceMetric');
        if (replacement.includes('FormField')) importsToAdd.add('FormField');
        if (replacement.includes('FormState')) importsToAdd.add('FormState');
        if (replacement.includes('BaseStoreState')) importsToAdd.add('BaseStoreState');
        if (replacement.includes('PaginatedData')) importsToAdd.add('PaginatedData');
        if (replacement.includes('FilterState')) importsToAdd.add('FilterState');
      }
    }
    
    // Add required imports
    if (importsToAdd.size > 0) {
      const importStatements = Array.from(importsToAdd)
        .map(importName => REQUIRED_IMPORTS[importName])
        .filter(Boolean)
        .join('\n');
      
      if (importStatements) {
        // Find the last import statement
        const importRegex = /^import.*$/gm;
        const imports = content.match(importRegex);
        
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport);
          const insertIndex = lastImportIndex + lastImport.length;
          
          content = content.slice(0, insertIndex) + '\n' + importStatements + content.slice(insertIndex);
          modified = true;
        } else {
          // No imports found, add at the top
          content = importStatements + '\n\n' + content;
          modified = true;
        }
      }
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed types in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting comprehensive any type replacement...\n');
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  FILES_TO_PROCESS.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Directory not found: ${fullPath}`);
      return;
    }
    
    console.log(`📁 Processing directory: ${dir}`);
    const files = getAllFiles(fullPath, FILE_EXTENSIONS);
    
    files.forEach(file => {
      totalFiles++;
      if (processFile(file)) {
        modifiedFiles++;
      }
    });
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - modifiedFiles}`);
  
  if (modifiedFiles > 0) {
    console.log('\n🎉 Any type replacement completed successfully!');
    console.log('💡 Run your linter to check for any remaining issues.');
  } else {
    console.log('\n✨ No files needed modification - all types are already professional!');
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { REQUIRED_IMPORTS, TYPE_REPLACEMENTS, processFile };

