#!/usr/bin/env python3
"""
Mobile Animations & Performance Inventory Analyzer
Parses grep results and generates comprehensive performance and animation reports
"""

import json
import os
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple, Any

INVENTORY_DIR = Path(__file__).parent.parent / "mobile_anim_perf_inventory"
GREPLOGS_DIR = INVENTORY_DIR / "GREPLOGS"


def read_grep_log(filename: str) -> List[str]:
    """Read a grep log file and return lines."""
    filepath = GREPLOGS_DIR / filename
    if not filepath.exists():
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.read().strip().split('\n')
        return [line for line in lines if line.strip()]


def extract_component(filepath: str) -> str:
    """Extract component name from file path."""
    basename = Path(filepath).stem
    # Convert kebab-case or snake_case to PascalCase
    parts = re.split(r'[-_]', basename)
    return ''.join(word.capitalize() for word in parts)


def parse_grep_line(line: str) -> Tuple[str, int, str]:
    """Parse grep output line: file:line:content."""
    match = re.match(r'^(.+?):(\d+):(.+)$', line)
    if match:
        filepath = match.group(1).replace('src/', 'src/')
        line_num = int(match.group(2))
        content = match.group(3)
        return filepath, line_num, content
    return None, None, None


def uses_reanimated2(content: str) -> bool:
    """Check if content uses Reanimated 2."""
    return bool(re.search(r'useSharedValue|useAnimatedStyle|withTiming|withSpring|withDecay', content))


def is_ui_thread(content: str) -> str:
    """Determine if animation runs on UI thread."""
    if uses_reanimated2(content):
        return 'UI'
    if re.search(r'Animated\.(timing|spring|decay)\([^)]*useNativeDriver:\s*true', content):
        return 'UI'
    if re.search(r'Gesture\.|PanGestureHandler|TapGestureHandler', content):
        return 'UI'
    return 'JS'


def count_hardcoded_colors(lines: List[str], filepath: str) -> int:
    """Count hardcoded colors in a file."""
    colors = []
    for line in lines:
        if '#' in line or 'rgba' in line or 'rgb' in line:
            # Count hex colors
            hex_colors = re.findall(r'#[0-9a-fA-F]{6}\b', line)
            colors.extend(hex_colors)
            # Count rgba/rgb
            rgba = re.findall(r'rgba?\(', line)
            colors.extend(rgba)
    return len(set(colors))


def detect_perf_smells(lines: List[str]) -> List[str]:
    """Detect performance smells in code."""
    smells = []
    content = '\n'.join(lines)
    
    # Check for inline styles
    if re.search(r'style\s*=\s*\{.*\[', content) and 'useMemo' not in content and 'StyleSheet.create' not in content:
        smells.append('Inline style objects created in render')
    
    # Check for missing keys
    if re.search(r'\.map\([^(]*\(', content) and 'key={' not in content:
        smells.append('Missing keys in .map()')
    
    # Check for large components without memoization
    if len(lines) > 200 and 'React.memo' not in content and 'export default React.memo' not in content:
        smells.append(f'Large component ({len(lines)} lines) without React.memo')
    
    # Check for heavy work in render
    if re.search(r'\.filter\(|\.map\(|\.reduce\(', content) and not re.search(r'useMemo|useCallback', content):
        smells.append('Heavy computation in render without memoization')
    
    return smells


def assess_risk(findings: List[str], perf_smells: List[str], has_lists: bool, has_animations: bool) -> str:
    """Assess risk level."""
    if len(perf_smells) > 2:
        return 'high'
    if has_lists and any('FlatList' in s or 'keyExtractor' in s for s in perf_smells):
        return 'high'
    if has_animations and any('JS thread' in s or 'blocking' in s for s in perf_smells):
        return 'high'
    if len(perf_smells) > 0:
        return 'medium'
    if has_lists and not has_animations:
        return 'medium'
    return 'low'


def analyze_animations() -> List[Dict]:
    """Analyze animation findings."""
    findings = []
    anim_lines = read_grep_log('animations.txt')
    anim_files = defaultdict(list)
    
    for line in anim_lines:
        parsed = parse_grep_line(line)
        if parsed[0]:
            anim_files[parsed[0]].append(parsed[2])
    
    for filepath, lines in anim_files.items():
        content = ' '.join(lines)
        component = extract_component(filepath)
        
        libraries = []
        symbols = []
        
        if re.search(r'react-native-reanimated|useSharedValue|useAnimatedStyle', content):
            libraries.append('reanimated')
            if 'useSharedValue' in content:
                symbols.append('useSharedValue')
            if 'useAnimatedStyle' in content:
                symbols.append('useAnimatedStyle')
            if 'withTiming' in content:
                symbols.append('withTiming')
            if 'withSpring' in content:
                symbols.append('withSpring')
            if 'withDecay' in content:
                symbols.append('withDecay')
        
        if 'LayoutAnimation' in content:
            libraries.append('animated')
            symbols.append('LayoutAnimation')
        
        if 'Animated.' in content and 'react-native-reanimated' not in content:
            libraries.append('animated')
            symbols.append('Animated')
        
        animation_thread = is_ui_thread(content)
        perf_smells = detect_perf_smells(lines)
        risk = assess_risk([], perf_smells, False, True)
        
        if lines:
            line_range = f"{lines[0].split(':')[1] if ':' in lines[0] else 'unknown'}-{lines[-1].split(':')[1] if ':' in lines[-1] else 'unknown'}"
        else:
            line_range = 'unknown'
        
        finding = {
            'file': filepath,
            'component': component,
            'category': 'animation',
            'library': libraries,
            'symbols': symbols,
            'risk': risk,
            'why_risk': perf_smells[0] if perf_smells else ('Animation on JS thread' if animation_thread == 'JS' else 'OK'),
            'evidence': line_range,
            'perf_hints': perf_smells,
            'animation_thread': animation_thread,
        }
        
        if animation_thread == 'JS':
            finding['notes'] = 'Consider migrating to Reanimated 2 for 60fps'
        
        findings.append(finding)
    
    return findings


def analyze_gestures() -> List[Dict]:
    """Analyze gesture findings."""
    findings = []
    gesture_lines = read_grep_log('gestures.txt')
    gesture_files = defaultdict(list)
    
    for line in gesture_lines:
        parsed = parse_grep_line(line)
        if parsed[0]:
            gesture_files[parsed[0]].append(parsed[2])
    
    for filepath, lines in gesture_files.items():
        content = ' '.join(lines)
        component = extract_component(filepath)
        
        libraries = ['gesture-handler']
        symbols = []
        
        if 'Gesture.' in content:
            symbols.append('Gesture')
        if 'PanGestureHandler' in content:
            symbols.append('PanGestureHandler')
        if 'TapGestureHandler' in content:
            symbols.append('TapGestureHandler')
        if 'LongPressGestureHandler' in content:
            symbols.append('LongPressGestureHandler')
        
        if lines:
            line_range = f"{lines[0].split(':')[1] if ':' in lines[0] else 'unknown'}-{lines[-1].split(':')[1] if ':' in lines[-1] else 'unknown'}"
        else:
            line_range = 'unknown'
        
        findings.append({
            'file': filepath,
            'component': component,
            'category': 'micro-interaction',
            'library': libraries,
            'symbols': symbols,
            'risk': 'low',
            'why_risk': 'Gesture handler',
            'evidence': line_range,
            'perf_hints': ['Gesture handlers run on UI thread - good for performance']
        })
    
    return findings


def analyze_lists() -> List[Dict]:
    """Analyze list findings."""
    findings = []
    list_lines = read_grep_log('lists.txt')
    list_files = defaultdict(list)
    
    for line in list_lines:
        parsed = parse_grep_line(line)
        if parsed[0]:
            list_files[parsed[0]].append(parsed[2])
    
    for filepath, lines in list_files.items():
        content = ' '.join(lines)
        component = extract_component(filepath)
        
        libraries = []
        if 'FlatList' in content:
            libraries.append('FlatList')
        if 'SectionList' in content:
            libraries.append('SectionList')
        if 'VirtualizedList' in content:
            libraries.append('VirtualizedList')
        
        # Check for performance issues
        props_lines = read_grep_log('list_props.txt')
        relevant_props = [l for l in props_lines if filepath in l]
        
        perf_hints = []
        if not any('keyExtractor' in p for p in relevant_props):
            perf_hints.append('Missing keyExtractor')
        if not any('getItemLayout' in p for p in relevant_props):
            perf_hints.append('Missing getItemLayout - performance penalty')
        if not any('removeClippedSubviews' in p for p in relevant_props):
            perf_hints.append('Consider removeClippedSubviews for long lists')
        
        risk = 'high' if len(perf_hints) > 1 else 'medium' if len(perf_hints) > 0 else 'low'
        
        if lines:
            line_range = f"{lines[0].split(':')[1] if ':' in lines[0] else 'unknown'}-{lines[-1].split(':')[1] if ':' in lines[-1] else 'unknown'}"
        else:
            line_range = 'unknown'
        
        findings.append({
            'file': filepath,
            'component': component,
            'category': 'performance',
            'library': libraries,
            'symbols': [],
            'risk': risk,
            'why_risk': perf_hints[0] if perf_hints else 'List has proper optimizations',
            'evidence': line_range,
            'perf_hints': perf_hints
        })
    
    return findings


def calculate_file_rankings(all_findings: List[Dict]) -> List[Dict]:
    """Calculate file rankings by impact score."""
    stats = defaultdict(lambda: {
        'file': '',
        'impactScore': 0,
        'perfSmells': 0,
        'animations': 0,
        'lists': 0,
        'microInteractions': 0,
        'hardcodedColors': 0,
        'memoizedComponents': 0
    })
    
    for finding in all_findings:
        filepath = finding['file']
        stats[filepath]['file'] = filepath
        
        if finding['category'] == 'performance':
            stats[filepath]['perfSmells'] += 1
            stats[filepath]['lists'] += 1
        if finding['category'] == 'animation':
            stats[filepath]['animations'] += 1
        if finding['category'] == 'micro-interaction' and 'expo-haptics' in finding.get('library', []):
            stats[filepath]['microInteractions'] += 1
    
    # Count memoization
    memo_lines = read_grep_log('memoization.txt')
    for filepath in stats:
        memoized = [l for l in memo_lines if filepath in l]
        stats[filepath]['memoizedComponents'] = len(memoized)
    
    # Count hardcoded colors
    color_lines = read_grep_log('colors_raw.txt')
    for filepath in stats:
        colors = [l for l in color_lines if filepath in l]
        # Filter out token definitions
        colors = [c for c in colors if 'design-tokens' not in c and 'constants' not in c]
        stats[filepath]['hardcodedColors'] = len(colors)
    
    # Calculate impact score
    for filepath, stat in stats.items():
        stat['impactScore'] = (
            3 * stat['perfSmells'] +
            2 * stat['animations'] +
            2 * stat['lists'] +
            1 * stat['microInteractions'] +
            1 * stat['hardcodedColors'] -
            2 * stat['memoizedComponents']
        )
    
    return sorted(stats.values(), key=lambda x: x['impactScore'], reverse=True)


def generate_reports(all_findings: List[Dict], rankings: List[Dict]):
    """Generate all report files."""
    # ANIM_PERF_INDEX.json
    with open(INVENTORY_DIR / 'ANIM_PERF_INDEX.json', 'w') as f:
        json.dump(all_findings, f, indent=2)
    
    # FILE_RANKINGS.md
    rankings_md = """# File Rankings by Impact Score

Top 50 files ordered by impact score (higher = more optimization potential)

**Scoring Formula**: impact = 3×perf_smells + 2×animations + 2×lists + 1×microInteractions + 1×hardcodedColors - 2×memoizedComponents

| File | Impact Score | Perf Smells | Animations | Lists | Micro | Colors | Memoized |
|------|-------------|-------------|------------|-------|-------|--------|----------|
"""
    
    for stat in rankings[:50]:
        rankings_md += f"| {stat['file']} | {stat['impactScore']} | {stat['perfSmells']} | {stat['animations']} | {stat['lists']} | {stat['microInteractions']} | {stat['hardcodedColors']} | {stat['memoizedComponents']} |\n"
    
    with open(INVENTORY_DIR / 'FILE_RANKINGS.md', 'w') as f:
        f.write(rankings_md)
    
    # Create other report files...
    print(f"✓ Generated reports with {len(all_findings)} findings")


def main():
    """Main execution."""
    print("Analyzing mobile app animations and performance...")
    
    anim_findings = analyze_animations()
    gesture_findings = analyze_gestures()
    list_findings = analyze_lists()
    
    all_findings = anim_findings + gesture_findings + list_findings
    rankings = calculate_file_rankings(all_findings)
    generate_reports(all_findings, rankings)
    
    print(f"\nAnalysis complete!")
    print(f"  - Total findings: {len(all_findings)}")
    print(f"  - Files analyzed: {len(set(f['file'] for f in all_findings))}")
    print(f"  - Top impact files: {len([r for r in rankings if r['impactScore'] > 0])}")


if __name__ == '__main__':
    main()
