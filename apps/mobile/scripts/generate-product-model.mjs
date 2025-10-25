/**
 * Generate Product Model JSON
 * Extracts domain entities, relationships, screens, and actions
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const PRODUCT_MODEL = {
  entities: [],
  screens: [],
  apis: [],
  navigation: []
};

// Parse all screens directory
function parseScreens() {
  const screensDir = resolve('src/screens');
  const files = readdirSync(screensDir, { recursive: true });
  
  const screenFiles = files.filter(f => f.endsWith('.tsx') && !f.includes('__tests__'));
  
  screenFiles.forEach(file => {
    try {
      const content = readFileSync(join(screensDir, file), 'utf-8');
      const screenName = file.replace('.tsx', '').replace('/', '-');
      
      // Detect states
      const hasLoading = /isLoading|loading.*state/i.test(content);
      const hasError = /error.*state|catch.*error/i.test(content);
      const hasEmpty = /empty.*state|no.*data|length.*===.*0/i.test(content);
      const hasSuccess = /data.*\?|<FlatList|<ScrollView/i.test(content);
      const hasSkeleton = /skeleton|shimmer|placeholder/i.test(content);
      
      // Detect actions
      const actions = [];
      if (/handleLike|onLike|swipe.*like/i.test(content)) actions.push('like');
      if (/handlePass|onPass|swipe.*pass/i.test(content)) actions.push('pass');
      if (/handleSuperLike|superlike/i.test(content)) actions.push('superlike');
      if (/handleBoost|boost/i.test(content)) actions.push('boost');
      if (/handleReport|report/i.test(content)) actions.push('report');
      if (/handleUndo|undo|rewind/i.test(content)) actions.push('undo');
      if (/handleBack|goBack/i.test(content)) actions.push('back');
      
      PRODUCT_MODEL.screens.push({
        name: screenName,
        file: file,
        states: {
          loading: hasLoading,
          empty: hasEmpty,
          success: hasSuccess,
          error: hasError,
          skeleton: hasSkeleton
        },
        actions,
        hasTests: existsSync(join(screensDir, file.replace('.tsx', '.test.tsx'))),
        hasA11yIssues: false // Will be updated by a11y scan
      });
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
    }
  });
}

// Parse API services
function parseAPIs() {
  const servicesDir = resolve('src/services');
  const apiFile = join(servicesDir, 'api.ts');
  
  try {
    const content = readFileSync(apiFile, 'utf-8');
    
    // Extract GDPR endpoints
    const gdprEndpoints = [
      { name: 'deleteAccount', method: 'POST', path: '/users/delete-account', status: 'present' },
      { name: 'exportUserData', method: 'POST', path: '/users/export-data', status: 'present' },
      { name: 'confirmDeleteAccount', method: 'POST', path: '/users/confirm-deletion', status: 'present' },
      { name: 'cancelDeleteAccount', method: 'POST', path: '/users/cancel-deletion', status: 'present' },
    ];
    
    gdprEndpoints.forEach(endpoint => {
      const exists = content.includes(endpoint.name);
      PRODUCT_MODEL.apis.push({
        ...endpoint,
        status: exists ? 'present' : 'missing',
        critical: true,
        area: 'GDPR'
      });
    });
    
    // Extract chat endpoints
    const chatEndpoints = [
      { name: 'sendMessage', method: 'POST', path: '/matches/:matchId/messages' },
      { name: 'sendImage', method: 'POST', path: '/matches/:matchId/messages/image' },
      { name: 'sendVideo', method: 'POST', path: '/matches/:matchId/messages/video' },
      { name: 'sendVoice', method: 'POST', path: '/matches/:matchId/messages/voice' },
      { name: 'exportChat', method: 'POST', path: '/chat/:matchId/export' },
    ];
    
    chatEndpoints.forEach(endpoint => {
      const exists = content.includes(endpoint.name);
      PRODUCT_MODEL.apis.push({
        ...endpoint,
        status: exists ? 'present' : 'missing',
        critical: false,
        area: 'Chat'
      });
    });
    
    // Extract swipe endpoints
    const swipeEndpoints = [
      { name: 'likePet', method: 'POST', path: '/swipe/:petId/like' },
      { name: 'passPet', method: 'POST', path: '/swipe/:petId/pass' },
      { name: 'reportPet', method: 'POST', path: '/swipe/:petId/report' },
      { name: 'boostProfile', method: 'POST', path: '/users/boost' },
      { name: 'superLike', method: 'POST', path: '/swipe/:petId/superlike' },
    ];
    
    swipeEndpoints.forEach(endpoint => {
      const exists = content.includes(endpoint.name);
      PRODUCT_MODEL.apis.push({
        ...endpoint,
        status: exists ? 'present' : 'missing',
        critical: false,
        area: 'Swipe'
      });
    });
    
  } catch (error) {
    console.error('Error parsing API file:', error.message);
  }
}

// Parse entities
function parseEntities() {
  PRODUCT_MODEL.entities = [
    {
      name: 'User',
      fields: ['id', 'email', 'role', 'premium', 'name', 'avatar'],
      relations: [
        { type: 'hasMany', to: 'Pet' },
        { type: 'hasMany', to: 'Match' },
        { type: 'hasOne', to: 'Subscription' }
      ]
    },
    {
      name: 'Pet',
      fields: ['id', 'ownerId', 'breed', 'age', 'photos', 'name', 'species', 'bio'],
      relations: [
        { type: 'belongsTo', to: 'User' },
        { type: 'hasMany', to: 'Match' },
        { type: 'hasMany', to: 'Swipe' }
      ]
    },
    {
      name: 'Match',
      fields: ['id', 'userA', 'userB', 'createdAt', 'matchedAt'],
      relations: [
        { type: 'hasMany', to: 'Message' },
        { type: 'belongsTo', to: 'Pet', as: 'petA' },
        { type: 'belongsTo', to: 'Pet', as: 'petB' }
      ]
    },
    {
      name: 'Message',
      fields: ['id', 'matchId', 'senderId', 'type', 'content', 'createdAt', 'status'],
      relations: [
        { type: 'belongsTo', to: 'Match' },
        { type: 'belongsTo', to: 'User', as: 'sender' }
      ]
    },
    {
      name: 'Subscription',
      fields: ['userId', 'plan', 'status', 'renewsAt', 'priceId'],
      relations: [
        { type: 'belongsTo', to: 'User' }
      ]
    },
    {
      name: 'Adoption',
      fields: ['listingId', 'applicantId', 'status', 'createdAt'],
      relations: [
        { type: 'belongsTo', to: 'Pet', as: 'listing' }
      ]
    }
  ];
}

function existsSync(filePath) {
  try {
    readFileSync(filePath);
    return true;
  } catch {
    return false;
  }
}

// Main
function main() {
  console.log('🔍 Generating product model...');
  
  parseEntities();
  parseScreens();
  parseAPIs();
  
  // Write to file
  const outputPath = resolve('reports/product_model.json');
  writeFileSync(outputPath, JSON.stringify(PRODUCT_MODEL, null, 2), 'utf-8');
  
  console.log(`✅ Product model generated: ${outputPath}`);
  console.log(`   - Entities: ${PRODUCT_MODEL.entities.length}`);
  console.log(`   - Screens: ${PRODUCT_MODEL.screens.length}`);
  console.log(`   - APIs: ${PRODUCT_MODEL.apis.length}`);
}

main();

