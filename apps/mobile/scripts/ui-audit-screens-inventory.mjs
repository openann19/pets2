#!/usr/bin/env node
/**
 * UI Audit: Screens Inventory Generator
 * 
 * Enumerates all screens, routes, modals, sheets, and entry paths.
 * Generates comprehensive inventory with deeplinks and navigation flow.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

const SCREENS_DIR = path.join(rootDir, 'apps/mobile/src/screens');
const NAVIGATION_DIR = path.join(rootDir, 'apps/mobile/src/navigation');

/**
 * Extract screens from App.tsx navigation structure
 */
function extractScreensFromApp() {
  const appFile = path.join(rootDir, 'apps/mobile/src/App.tsx');
  const content = fs.readFileSync(appFile, 'utf-8');
  
  const screens = [];
  const screenRegex = /name="(\w+)"/g;
  let match;
  
  while ((match = screenRegex.exec(content)) !== null) {
    screens.push(match[1]);
  }
  
  return [...new Set(screens)];
}

/**
 * Extract deeplinks from linking.ts
 */
function extractDeeplinks() {
  const linkingFile = path.join(NAVIGATION_DIR, 'linking.ts');
  const content = fs.readFileSync(linkingFile, 'utf-8');
  
  const deeplinks = {};
  
  // Extract path patterns
  const pathRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = pathRegex.exec(content)) !== null) {
    const [, screenName, path] = match;
    deeplinks[screenName] = `pawfectmatch://${path}`;
  }
  
  // Extract nested paths
  const nestedPathRegex = /(\w+):\s*\{[\s\S]*?path:\s*['"]([^'"]+)['"]/g;
  while ((match = nestedPathRegex.exec(content)) !== null) {
    const [, screenName, path] = match;
    deeplinks[screenName] = `pawfectmatch://${path}`;
  }
  
  return deeplinks;
}

/**
 * Scan for modal/sheet components
 */
function findModalsAndSheets() {
  const componentsDir = path.join(rootDir, 'apps/mobile/src/components');
  const modals = [];
  const sheets = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        if (entry.name.toLowerCase().includes('modal')) {
          modals.push({
            name: entry.name.replace('.tsx', ''),
            path: path.relative(rootDir, fullPath),
          });
        }
        
        if (entry.name.toLowerCase().includes('sheet')) {
          sheets.push({
            name: entry.name.replace('.tsx', ''),
            path: path.relative(rootDir, fullPath),
          });
        }
      }
    }
  }
  
  scanDir(componentsDir);
  return { modals, sheets };
}

/**
 * Categorize screens by type
 */
function categorizeScreens(screens) {
  const categories = {
    auth: [],
    onboarding: [],
    main: [],
    premium: [],
    ai: [],
    settings: [],
    admin: [],
    adoption: [],
    pet: [],
    social: [],
    live: [],
    demo: [],
    other: [],
  };
  
  const patterns = {
    auth: /^(Login|Register|ForgotPassword|ResetPassword)$/i,
    onboarding: /^(Welcome|UserIntent|PreferencesSetup|PetProfileSetup)$/i,
    main: /^(Home|Swipe|Matches|Profile|Map|Chat)$/i,
    premium: /^(Premium|Subscription|ManageSubscription|PremiumSuccess|PremiumCancel)$/i,
    ai: /^(AI|AIBio|AIPhotoAnalyzer|AICompatibility)$/i,
    settings: /^(Settings|Privacy|Blocked|Safety|Verification|Notification|Help|About|Deactivate|EditProfile|AdvancedFilters|Moderation)$/i,
    admin: /^Admin/i,
    adoption: /^Adoption/i,
    pet: /^(Pet|MyPets|CreatePet|EnhancedPetProfile|PlaydateDiscovery|PackBuilder|PetFriendly|HealthPassport|LostPet)$/i,
    social: /^(Community|Stories|Leaderboard|MemoryWeave)$/i,
    live: /^(GoLive|LiveViewer|LiveBrowse)$/i,
    demo: /^(ComponentTest|NewComponentsTest|MigrationExample|PremiumDemo|UIDemo|MotionLab|Wireframe|DemoShowcase)$/i,
  };
  
  for (const screen of screens) {
    let categorized = false;
    
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(screen)) {
        categories[category].push(screen);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories.other.push(screen);
    }
  }
  
  return categories;
}

/**
 * Generate navigation flow map
 */
function generateFlowMap(categories, deeplinks) {
  const flows = {
    auth: {
      entry: ['Login', 'Register'],
      flow: ['Login', 'Register', 'ForgotPassword', 'ResetPassword'],
      exit: ['Home'],
    },
    onboarding: {
      entry: ['Welcome'],
      flow: ['Welcome', 'UserIntent', 'PetProfileSetup', 'PreferencesSetup'],
      exit: ['Home'],
    },
    main: {
      entry: ['Home'],
      flow: ['Home', 'Swipe', 'Matches', 'Profile', 'Map', 'Chat'],
      exit: ['Settings', 'Premium'],
    },
    premium: {
      entry: ['Premium', 'Settings'],
      flow: ['Premium', 'Subscription', 'ManageSubscription', 'PremiumSuccess'],
      exit: ['Home'],
    },
  };
  
  return flows;
}

/**
 * Main inventory generation
 */
function generateInventory() {
  const screens = extractScreensFromApp();
  const deeplinks = extractDeeplinks();
  const { modals, sheets } = findModalsAndSheets();
  const categories = categorizeScreens(screens);
  const flows = generateFlowMap(categories, deeplinks);
  
  const inventory = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalScreens: screens.length,
      totalDeeplinks: Object.keys(deeplinks).length,
      totalModals: modals.length,
      totalSheets: sheets.length,
    },
    screens: {
      all: screens,
      categories,
    },
    deeplinks,
    modals,
    sheets,
    flows,
    entryPaths: {
      unauthenticated: ['Login', 'Register', 'Welcome'],
      authenticated: ['Home', 'Swipe', 'Matches', 'Profile'],
      deepLinks: Object.entries(deeplinks).map(([screen, url]) => ({
        screen,
        url,
      })),
    },
  };
  
  return inventory;
}

// Generate and save
const inventory = generateInventory();
const outputPath = path.join(rootDir, 'docs/ui_audit_screens_inventory.json');

fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

console.log('✅ Screens inventory generated:', outputPath);
console.log(`   Total screens: ${inventory.summary.totalScreens}`);
console.log(`   Total deeplinks: ${inventory.summary.totalDeeplinks}`);
console.log(`   Total modals: ${inventory.summary.totalModals}`);
console.log(`   Total sheets: ${inventory.summary.totalSheets}`);

