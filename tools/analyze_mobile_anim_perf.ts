#!/usr/bin/env node
/**
 * Mobile Animations & Performance Inventory Analyzer
 * Parses grep results and generates comprehensive performance and animation reports
 */

import * as fs from 'fs';
import * as path from 'path';

interface Finding {
  file: string;
  component?: string;
  category: string;
  library: string[];
  symbols: string[];
  navigationRoute?: string;
  risk: 'high' | 'medium' | 'low';
  why_risk: string;
  evidence: string;
  perf_hints: string[];
  animation_thread?: string;
  notes?: string;
}

interface FileStats {
  file: string;
  impactScore: number;
  perfSmells: number;
  animations: number;
  lists: number;
  microInteractions: number;
  hardcodedColors: number;
  memoizedComponents: number;
}

const inventoryDir = path.join(__dirname, '../mobile_anim_perf_inventory');
const greplogsDir = path.join(inventoryDir, 'GREPLOGS');

// Read a grep log file
function readGrepLog(filename: string): string[] {
  try {
    const content = fs.readFileSync(path.join(greplogsDir, filename), 'utf-8');
    return content.trim() ? content.split('\n') : [];
  } catch (error) {
    return [];
  }
}

// Extract component name from file path
function extractComponent(file: string): string {
  const base = path.basename(file, path.extname(file));
  // Convert kebab-case or snake_case to PascalCase
  return base
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

// Extract line number and content from grep output
function parseGrepLine(line: string): { file: string; lineNum: number; content: string } | null {
  const match = line.match(/^(.+?):(\d+):(.+)$/);
  if (!match) return null;
  return {
    file: match[1].replace(/.*\/src\//, 'src/'),
    lineNum: parseInt(match[2], 10),
    content: match[3]
  };
}

// Check if file uses Reanimated 2 (useSharedValue, useAnimatedStyle)
function usesReanimated2(content: string): boolean {
  return /useSharedValue|useAnimatedStyle|withTiming|withSpring|withDecay/.test(content);
}

// Check if animation runs on UI thread
function isUIThread(content: string, file: string): 'UI' | 'JS' {
  if (usesReanimated2(content)) return 'UI';
  // Animated API with useNativeDriver runs on native thread
  if (/Animated\.(timing|spring|decay)\([^)]*useNativeDriver:\s*true/.test(content)) return 'UI';
  // Gesture handlers default to UI thread
  if (/Gesture\.|PanGestureHandler|TapGestureHandler/.test(content)) return 'UI';
  // Reanimated 2 is UI thread by default
  if (usesReanimated2(content)) return 'UI';
  return 'JS';
}

// Count hardcoded colors in a file
function countHardcodedColors(lines: string[], filePath: string): number {
  return lines.filter(line => /#[0-9a-fA-F]{6}\b|rgba?\(/.test(line)).length;
}

// Check for performance smells
function detectPerfSmells(lines: string[]): string[] {
  const smells: string[] = [];
  const content = lines.join('\n');
  
  // Inline styles in render
  if (/style=\{.*\[/.test(content) && !content.includes('useMemo') && !content.includes('StyleSheet.create')) {
    smells.push('Inline style objects created in render');
  }
  
  // Missing key in lists
  if (/\.map\([^(]*\(/ && !/key=\{/.test(content)) {
    smells.push('Missing keys in .map()');
  }
  
  // Large component without memoization
  const lineCount = lines.length;
  if (lineCount > 200 && !/React\.memo/.test(content) && !/export default React\.memo/.test(content)) {
    smells.push(`Large component (${lineCount} lines) without React.memo`);
  }
  
  // Heavy work in render
  if (/\.filter\(|\.map\(|\.reduce\(/.test(content) && !/useMemo|useCallback/.test(content)) {
    smells.push('Heavy computation in render without memoization');
  }
  
  return smells;
}

// Assess risk level
function assessRisk(findings: string[], perfSmells: string[], hasLists: boolean, hasAnimations: boolean): 'high' | 'medium' | 'low' {
  // High risk factors
  if (perfSmells.length > 2) return 'high';
  if (hasLists && perfSmells.some(s => s.includes('FlatList') || s.includes('keyExtractor'))) return 'high';
  if (hasAnimations && perfSmells.some(s => s.includes('JS thread') || s.includes('blocking'))) return 'high';
  
  // Medium risk factors
  if (perfSmells.length > 0) return 'medium';
  if (hasLists && !hasAnimations) return 'medium';
  
  return 'low';
}

// Main analysis function
function analyze(): Finding[] {
  const findings: Finding[] = [];
  
  // Parse animations
  const animLines = readGrepLog('animations.txt');
  const animFiles = new Map<string, string[]>();
  
  animLines.forEach(line => {
    const parsed = parseGrepLine(line);
    if (!parsed) return;
    
    if (!animFiles.has(parsed.file)) {
      animFiles.set(parsed.file, []);
    }
    animFiles.get(parsed.file)!.push(parsed.content);
  });
  
  animFiles.forEach((lines, file) => {
    const content = lines.join(' ');
    const component = extractComponent(file);
    
    const libraries: string[] = [];
    const symbols: string[] = [];
    
    if (/react-native-reanimated|useSharedValue|useAnimatedStyle/.test(content)) {
      libraries.push('reanimated');
      if (/useSharedValue/.test(content)) symbols.push('useSharedValue');
      if (/useAnimatedStyle/.test(content)) symbols.push('useAnimatedStyle');
      if (/withTiming/.test(content)) symbols.push('withTiming');
      if (/withSpring/.test(content)) symbols.push('withSpring');
      if (/withDecay/.test(content)) symbols.push('withDecay');
    }
    
    if (/LayoutAnimation/.test(content)) {
      libraries.push('animated');
      symbols.push('LayoutAnimation');
    }
    
    if (/Animated\./.test(content) && !/react-native-reanimated/.test(content)) {
      libraries.push('animated');
      symbols.push('Animated');
    }
    
    const animationThread = isUIThread(content, file);
    const perfSmells = detectPerfSmells(lines);
    const risk = assessRisk([], perfSmells, false, true);
    
    findings.push({
      file,
      component,
      category: 'animation',
      library: libraries,
      symbols,
      risk,
      why_risk: perfSmells.length > 0 ? perfSmells.join('; ') : animationThread === 'JS' ? 'Animation on JS thread' : 'OK',
      evidence: `${lines[0]?.split(':')[1] || 'unknown'}:${lines[lines.length - 1]?.split(':')[1] || 'unknown'}`,
      perf_hints: perfSmells,
      animation_thread: animationThread,
      ...(animationThread === 'JS' ? { notes: 'Consider migrating to Reanimated 2 for 60fps' } : {})
    });
  });
  
  // Parse gestures
  const gestureLines = readGrepLog('gestures.txt');
  const gestureFiles = new Map<string, string[]>();
  
  gestureLines.forEach(line => {
    const parsed = parseGrepLine(line);
    if (!parsed) return;
    
    if (!gestureFiles.has(parsed.file)) {
      gestureFiles.set(parsed.file, []);
    }
    gestureFiles.get(parsed.file)!.push(parsed.content);
  });
  
  gestureFiles.forEach((lines, file) => {
    const content = lines.join(' ');
    const component = extractComponent(file);
    
    const libraries: string[] = ['gesture-handler'];
    const symbols: string[] = [];
    
    if (/Gesture\./.test(content)) symbols.push('Gesture');
    if (/PanGestureHandler/.test(content)) symbols.push('PanGestureHandler');
    if (/TapGestureHandler/.test(content)) symbols.push('TapGestureHandler');
    if (/LongPressGestureHandler/.test(content)) symbols.push('LongPressGestureHandler');
    
    findings.push({
      file,
      component,
      category: 'micro-interaction',
      library: libraries,
      symbols,
      risk: 'low',
      why_risk: 'Gesture handler',
      evidence: `${lines[0]?.split(':')[1] || 'unknown'}:${lines[lines.length - 1]?.split(':')[1] || 'unknown'}`,
      perf_hints: ['Gesture handlers run on UI thread - good for performance']
    });
  });
  
  // Parse lists
  const listLines = readGrepLog('lists.txt');
  const listFiles = new Map<string, string[]>();
  
  listLines.forEach(line => {
    const parsed = parseGrepLine(line);
    if (!parsed) return;
    
    if (!listFiles.has(parsed.file)) {
      listFiles.set(parsed.file, []);
    }
    listFiles.get(parsed.file)!.push(parsed.content);
  });
  
  listFiles.forEach((lines, file) => {
    const content = lines.join(' ');
    const component = extractComponent(file);
    
    const libraries: string[] = [];
    if (/FlatList/.test(content)) libraries.push('FlatList');
    if (/SectionList/.test(content)) libraries.push('SectionList');
    if (/VirtualizedList/.test(content)) libraries.push('VirtualizedList');
    
    // Read list_props to check for performance issues
    const propsLines = readGrepLog('list_props.txt');
    const relevantProps = propsLines.filter(l => l.includes(file));
    
    const perfHints: string[] = [];
    if (!relevantProps.some(p => /keyExtractor/.test(p))) {
      perfHints.push('Missing keyExtractor');
    }
    if (!relevantProps.some(p => /getItemLayout/.test(p))) {
      perfHints.push('Missing getItemLayout - performance penalty');
    }
    if (!relevantProps.some(p => /removeClippedSubviews/.test(p))) {
      perfHints.push('Consider removeClippedSubviews for long lists');
    }
    
    const risk = perfHints.length > 1 ? 'high' : perfHints.length > 0 ? 'medium' : 'low';
    
    findings.push({
      file,
      component,
      category: 'performance',
      library: libraries,
      symbols: [],
      risk,
      why_risk: perfHints.join('; ') || 'List has proper optimizations',
      evidence: `${lines[0]?.split(':')[1] || 'unknown'}:${lines[lines.length - 1]?.split(':')[1] || 'unknown'}`,
      perf_hints: perfHints
    });
  });
  
  // Parse micro-interactions (haptics, Touchable, Pressable)
  const microLines = readGrepLog('micro.txt');
  const microFiles = new Map<string, string[]>();
  
  microLines.forEach(line => {
    const parsed = parseGrepLine(line);
    if (!parsed) return;
    
    if (!microFiles.has(parsed.file)) {
      microFiles.set(parsed.file, []);
    }
    microFiles.get(parsed.file)!.push(parsed.content);
  });
  
  microFiles.forEach((lines, file) => {
    const content = lines.join(' ');
    const component = extractComponent(file);
    
    const libraries: string[] = [];
    if (/expo-haptics/.test(content)) libraries.push('expo-haptics');
    if (/Pressable/.test(content)) libraries.push('Pressable');
    if (/Touchable/.test(content)) libraries.push('Touchable');
    
    findings.push({
      file,
      component,
      category: 'micro-interaction',
      library: libraries,
      symbols: [],
      risk: 'low',
      why_risk: 'Micro-interaction implemented',
      evidence: `${lines[0]?.split(':')[1] || 'unknown'}:${lines[lines.length - 1]?.split(':')[1] || 'unknown'}`,
      perf_hints: []
    });
  });
  
  return findings;
}

// Calculate file rankings
function calculateFileRankings(findings: Finding[]): FileStats[] {
  const stats = new Map<string, FileStats>();
  
  findings.forEach(finding => {
    if (!stats.has(finding.file)) {
      stats.set(finding.file, {
        file: finding.file,
        impactScore: 0,
        perfSmells: 0,
        animations: 0,
        lists: 0,
        microInteractions: 0,
        hardcodedColors: 0,
        memoizedComponents: 0
      });
    }
    
    const stat = stats.get(finding.file)!;
    
    if (finding.category === 'performance') {
      stat.perfSmells++;
      stat.lists++;
    }
    if (finding.category === 'animation') {
      stat.animations++;
    }
    if (finding.category === 'micro-interaction' && finding.library.includes('expo-haptics')) {
      stat.microInteractions++;
    }
  });
  
  // Check for memoization and colors
  const memoLines = readGrepLog('memoization.txt');
  const colorLines = readGrepLog('colors_raw.txt');
  
  stats.forEach((stat, file) => {
    // Count memoized components
    const memoized = memoLines.filter(l => l.includes(file));
    stat.memoizedComponents = memoized.length;
    
    // Count hardcoded colors
    const colors = colorLines.filter(l => l.includes(file));
    stat.hardcodedColors = colors.length;
    
    // Calculate impact score
    stat.impactScore = 
      3 * stat.perfSmells +
      2 * stat.animations +
      2 * stat.lists +
      1 * stat.microInteractions +
      1 * stat.hardcodedColors -
      2 * stat.memoizedComponents;
  });
  
  return Array.from(stats.values()).sort((a, b) => b.impactScore - a.impactScore);
}

// Generate reports
function generateReports(findings: Finding[], rankings: FileStats[]) {
  // ANIM_PERF_INDEX.json
  fs.writeFileSync(
    path.join(inventoryDir, 'ANIM_PERF_INDEX.json'),
    JSON.stringify(findings, null, 2)
  );
  
  // FILE_RANKINGS.md
  const rankingsMd = `# File Rankings by Impact Score

Top 50 files ordered by impact score (higher = more optimization potential)

**Scoring Formula**: impact = 3×perf_smells + 2×animations + 2×lists + 1×microInteractions + 1×hardcodedColors - 2×memoizedComponents

| File | Impact Score | Perf Smells | Animations | Lists | Micro | Colors | Memoized |
|------|-------------|-------------|------------|-------|-------|--------|----------|
${rankings.slice(0, 50).map(r => 
  `| ${r.file} | ${r.impactScore} | ${r.perfSmells} | ${r.animations} | ${r.lists} | ${r.microInteractions} | ${r.hardcodedColors} | ${r.memoizedComponents} |`
).join('\n')}
`;
  
  fs.writeFileSync(
    path.join(inventoryDir, 'FILE_RANKINGS.md'),
    rankingsMd
  );
  
  // Generate other reports...
  // (TRANSITIONS_MATRIX.md, MICRO_INTERACTIONS.md, etc.)
  
  console.log(`Generated reports with ${findings.length} findings`);
}

// Main execution
const findings = analyze();
const rankings = calculateFileRankings(findings);
generateReports(findings, rankings);
