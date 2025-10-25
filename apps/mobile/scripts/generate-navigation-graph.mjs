/**
 * Generate Navigation Graph JSON
 * Extracts navigation structure, routes, params, and guards
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function parseNavigation() {
  const appFile = resolve('src/App.tsx');
  const adminFile = resolve('src/navigation/AdminNavigator.tsx');
  const typesFile = resolve('src/navigation/types.ts');
  
  const appContent = readFileSync(appFile, 'utf-8');
  const adminContent = readFileSync(adminFile, 'utf-8');
  const typesContent = readFileSync(typesFile, 'utf-8');
  
  const navigation = {
    root: {
      stack: [],
      initialRoute: 'Home',
      options: { headerShown: false }
    },
    admin: {
      stack: [],
      guard: 'role === admin',
      initialRoute: 'AdminDashboard'
    },
    screens: {}
  };
  
  // Parse root stack from App.tsx
  const rootStackRegex = /<Stack\.Screen\s+name="(\w+)"\s+component={(\w+)}/g;
  let match;
  
  while ((match = rootStackRegex.exec(appContent)) !== null) {
    navigation.root.stack.push({
      name: match[1],
      component: match[2],
      params: extractParams(typesContent, match[1]),
      guards: []
    });
  }
  
  // Parse admin stack from AdminNavigator.tsx
  const adminStackRegex = /<Stack\.Screen\s+name="(\w+)"\s+component={(\w+)}/g;
  
  while ((match = adminStackRegex.exec(adminContent)) !== null) {
    navigation.admin.stack.push({
      name: match[1],
      component: match[2],
      params: extractParams(typesContent, match[1]),
      guards: ['AdminAccess']
    });
  }
  
  // Extract screen params from types file
  function extractParams(content, screenName) {
    const typeDefinition = new RegExp(`${screenName}:\\s*([^;]+)`, 'g');
    const match = typeDefinition.exec(content);
    if (!match) return undefined;
    
    const paramStr = match[1].trim();
    if (paramStr === 'undefined') return undefined;
    
    // Try to parse params
    try {
      // Look for { ... } pattern
      const paramMatch = paramStr.match(/\{([^}]+)\}/);
      if (paramMatch) {
        const paramFields = paramMatch[1].split(':').map(s => s.trim());
        return paramFields.filter(f => f.length > 0);
      }
    } catch {
      return paramStr;
    }
    
    return paramStr;
  }
  
  // Build screen metadata
  const allScreens = [...navigation.root.stack, ...navigation.admin.stack];
  
  allScreens.forEach(screen => {
    const params = extractParams(typesContent, screen.name);
    navigation.screens[screen.name] = {
      name: screen.name,
      component: screen.component,
      params: params || undefined,
      guards: screen.guards || [],
      isReachable: true, // Will be validated
      requiresAuth: true, // Assume all need auth except Login/Register
      isPremium: false // Will be updated
    };
  });
  
  return navigation;
}

function main() {
  console.log('🔍 Generating navigation graph...');
  
  const navigation = parseNavigation();
  
  const outputPath = resolve('reports/navigation_graph.json');
  writeFileSync(outputPath, JSON.stringify(navigation, null, 2), 'utf-8');
  
  console.log(`✅ Navigation graph generated: ${outputPath}`);
  console.log(`   - Root screens: ${navigation.root.stack.length}`);
  console.log(`   - Admin screens: ${navigation.admin.stack.length}`);
  console.log(`   - Total screens: ${Object.keys(navigation.screens).length}`);
}

main();

