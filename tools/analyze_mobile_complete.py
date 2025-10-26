#!/usr/bin/env python3
"""
Complete Mobile Animations & Performance Inventory Analyzer
Generates all required reports: ANIM_PERF_INDEX.json, FILE_RANKINGS.md, etc.
"""

import json
import re
from collections import defaultdict
from pathlib import Path

INVENTORY_DIR = Path(__file__).parent.parent / "mobile_anim_perf_inventory"
GREPLOGS_DIR = INVENTORY_DIR / "GREPLOGS"
MOBILE_SRC = Path(__file__).parent.parent / "apps" / "mobile" / "src"


def read_grep_log(filename):
    """Read a grep log file and return lines."""
    filepath = GREPLOGS_DIR / filename
    if not filepath.exists():
        return []
    return [line.strip() for line in open(filepath).readlines() if line.strip()]


def parse_grep_line(line):
    """Parse grep output line: file:line:content."""
    match = re.match(r'^(.+?):(\d+):(.+)$', line)
    return (match.group(1), int(match.group(2)), match.group(3)) if match else (None, None, None)


def get_unique_colors():
    """Extract unique hardcoded colors across the codebase."""
    lines = read_grep_log('colors_raw.txt')
    colors = set()
    file_usage = defaultdict(list)
    
    for line in lines:
        parsed = parse_grep_line(line)
        if not parsed[0] or 'design-tokens' in parsed[0] or 'constants' in parsed[0]:
            continue
        
        # Extract hex colors
        hex_colors = re.findall(r'#([0-9a-fA-F]{6})\b', parsed[2])
        colors.update(hex_colors)
        
        for color in hex_colors:
            file_usage[f'#{color}'].append(parsed[0])
    
    return colors, dict(file_usage)


def get_animation_mapping():
    """Map animations by library."""
    lines = read_grep_log('animations.txt')
    mapping = defaultdict(lambda: defaultdict(list))
    
    for line in lines:
        parsed = parse_grep_line(line)
        if not parsed[0]:
            continue
        
        file = parsed[0]
        content = parsed[2]
        
        if 'useSharedValue' in content or 'useAnimatedStyle' in content:
            mapping['reanimated']['components'].append(file)
        if 'LayoutAnimation' in content:
            mapping['animated']['components'].append(file)
        if 'Animated.' in content and 'react-native-reanimated' not in content:
            mapping['animated']['components'].append(file)
    
    # Deduplicate
    for lib in mapping:
        mapping[lib]['components'] = list(set(mapping[lib]['components']))
    
    return dict(mapping)


def get_transitions():
    """Analyze navigation transitions."""
    lines = read_grep_log('navigation.txt')
    transitions = []
    
    # Simple extraction - in real app would parse screenOptions
    for line in lines:
        parsed = parse_grep_line(line)
        if not parsed[0]:
            continue
        
        if 'screenOptions' in parsed[2] or 'TransitionPresets' in parsed[2]:
            transitions.append({
                'file': parsed[0],
                'line': parsed[1],
                'content': parsed[2]
            })
    
    return transitions


def get_micro_interactions():
    """Map all micro-interactions."""
    lines = read_grep_log('micro.txt')
    interactions = defaultdict(list)
    
    for line in lines:
        parsed = parse_grep_line(line)
        if not parsed[0]:
            continue
        
        content = parsed[2]
        if 'expo-haptics' in content:
            interactions['haptics'].append(parsed[0])
        if 'Pressable' in content:
            interactions['pressable'].append(parsed[0])
        if 'Touchable' in content:
            interactions['touchable'].append(parsed[0])
        if 'onPressIn' in content or 'onPressOut' in content:
            interactions['press-states'].append(parsed[0])
    
    # Deduplicate
    return {k: list(set(v)) for k, v in interactions.items()}


def generate_additional_reports(all_findings):
    """Generate the remaining report files."""
    
    # ANIMATIONS_MAP.md
    anim_map = get_animation_mapping()
    anim_md = "# Animations by Library\n\n"
    for lib, data in anim_map.items():
        anim_md += f"## {lib}\n\n"
        anim_md += f"**Components:** {len(data['components'])}\n\n"
        for comp in sorted(set(data['components']))[:20]:  # Top 20
            anim_md += f"- `{comp}`\n"
        anim_md += "\n"
    
    with open(INVENTORY_DIR / 'ANIMATIONS_MAP.md', 'w') as f:
        f.write(anim_md)
    
    # TRANSITIONS_MATRIX.md
    transitions = get_transitions()
    trans_md = "# Navigation Transitions Matrix\n\n"
    trans_md += "| Route | File | Type |\n|-------|------|------|\n"
    for t in transitions[:30]:  # Top 30
        trans_md += f"| - | `{t['file']}` | {t['content'][:50]}... |\n"
    
    with open(INVENTORY_DIR / 'TRANSITIONS_MATRIX.md', 'w') as f:
        f.write(trans_md)
    
    # MICRO_INTERACTIONS.md
    micro_interactions = get_micro_interactions()
    micro_md = "# Micro-Interactions Inventory\n\n"
    for category, files in micro_interactions.items():
        micro_md += f"## {category}\n\n"
        micro_md += f"**Count:** {len(files)}\n\n"
        for file in sorted(set(files))[:20]:  # Top 20
            micro_md += f"- `{file}`\n"
        micro_md += "\n"
    
    with open(INVENTORY_DIR / 'MICRO_INTERACTIONS.md', 'w') as f:
        f.write(micro_md)
    
    # PERF_FINDINGS.md
    perf_md = "# Performance Findings\n\n"
    perf_findings = [f for f in all_findings if f['category'] == 'performance' and f['risk'] in ['high', 'medium']]
    
    high_risk = [f for f in perf_findings if f['risk'] == 'high']
    medium_risk = [f for f in perf_findings if f['risk'] == 'medium']
    
    perf_md += f"## Summary\n"
    perf_md += f"- High Risk: {len(high_risk)}\n"
    perf_md += f"- Medium Risk: {len(medium_risk)}\n\n"
    
    if high_risk:
        perf_md += "## High Risk Issues\n\n"
        for finding in high_risk[:10]:
            perf_md += f"### `{finding['file']}`\n"
            perf_md += f"- **Why:** {finding['why_risk']}\n"
            perf_md += f"- **Hints:** {', '.join(finding.get('perf_hints', []))}\n\n"
    
    with open(INVENTORY_DIR / 'PERF_FINDINGS.md', 'w') as f:
        f.write(perf_md)
    
    # THEME_TOKEN_USAGE.md
    colors, usage = get_unique_colors()
    
    # Check for token usage
    token_lines = read_grep_log('tokens.txt')
    token_files = set()
    for line in token_lines:
        parsed = parse_grep_line(line)
        if parsed[0]:
            token_files.add(parsed[0])
    
    theme_md = "# Theme & Token Usage\n\n"
    theme_md += f"## Color Usage\n"
    theme_md += f"- Hardcoded Colors Found: {len(colors)}\n"
    theme_md += f"- Files Using Tokens: {len(token_files)}\n"
    theme_md += f"- Token vs Hardcoded Ratio: {len(token_files) / max(len(colors), 1):.2f}\n\n"
    
    theme_md += "## Top Hardcoded Colors\n\n"
    top_colors = sorted([(k, len(set(v))) for k, v in usage.items()], key=lambda x: x[1], reverse=True)[:20]
    for color, count in top_colors:
        theme_md += f"- `{color}` - used in {count} files\n"
    
    with open(INVENTORY_DIR / 'THEME_TOKEN_USAGE.md', 'w') as f:
        f.write(theme_md)
    
    # LAYOUT_ARCHITECTURE.md
    style_lines = read_grep_log('styles.txt')
    
    # Find large components
    large_components = []
    for finding in all_findings:
        file = MOBILE_SRC / finding['file']
        if file.exists():
            with open(file) as f:
                lines = f.readlines()
                if len(lines) > 200:
                    large_components.append({
                        'file': finding['file'],
                        'lines': len(lines),
                        'component': finding.get('component', 'Unknown')
                    })
    
    arch_md = "# Layout Architecture\n\n"
    arch_md += f"## Large Components (>200 LOC)\n\n"
    arch_md += "| File | Lines | Component |\n|------|-------|-----------|\n"
    for comp in sorted(large_components, key=lambda x: x['lines'], reverse=True)[:20]:
        arch_md += f"| `{comp['file']}` | {comp['lines']} | {comp['component']} |\n"
    
    with open(INVENTORY_DIR / 'LAYOUT_ARCHITECTURE.md', 'w') as f:
        f.write(arch_md)
    
    print("✓ Generated additional reports")


# Read existing ANIM_PERF_INDEX.json and add reports
def main():
    print("Generating additional reports...")
    
    with open(INVENTORY_DIR / 'ANIM_PERF_INDEX.json') as f:
        all_findings = json.load(f)
    
    generate_additional_reports(all_findings)
    
    print("✓ All reports generated successfully!")


if __name__ == '__main__':
    main()
