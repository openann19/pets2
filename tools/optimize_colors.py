#!/usr/bin/env python3
"""
Color Token Replacement Tool
Automatically replaces hardcoded colors with theme tokens
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Tuple

# Color mapping: hardcoded hex -> theme token path
COLOR_MAPPINGS = {
    # Primary colors
    "#ec4899": "Theme.colors.primary[500]",
    "#f472b6": "Theme.colors.primary[400]",
    "#db2777": "Theme.colors.primary[600]",
    "#be185d": "Theme.colors.primary[700]",
    "#9d174d": "Theme.colors.primary[800]",
    "#831843": "Theme.colors.primary[900]",
    
    # Neutral grays
    "#ffffff": "Theme.colors.neutral[0]",
    "#FFFFFF": "Theme.colors.neutral[0]",
    "#f9fafb": "Theme.colors.background.secondary",
    "#f3f4f6": "Theme.colors.neutral[100]",
    "#F3F4F6": "Theme.colors.neutral[100]",
    "#e5e7eb": "Theme.colors.neutral[200]",
    "#d1d5db": "Theme.colors.neutral[300]",
    "#9ca3af": "Theme.colors.neutral[400]",
    "#6b7280": "Theme.colors.neutral[500]",
    "#6B7280": "Theme.colors.neutral[500]",
    "#4b5563": "Theme.colors.neutral[600]",
    "#374151": "Theme.colors.neutral[700]",
    "#1f2937": "Theme.colors.neutral[800]",
    "#111827": "Theme.colors.neutral[900]",
    
    # Status colors
    "#10b981": "Theme.colors.status.success",
    "#10B981": "Theme.colors.status.success",
    "#f59e0b": "Theme.colors.status.warning",
    "#F59E0B": "Theme.colors.status.warning",
    "#ef4444": "Theme.colors.status.error",
    "#EF4444": "Theme.colors.status.error",
    "#3b82f6": "Theme.colors.status.info",
    "#3B82F6": "Theme.colors.status.info",
    
    # Secondary colors
    "#0ea5e9": "Theme.colors.secondary[500]",
    "#0284c7": "Theme.colors.secondary[600]",
    "#8B5CF6": "Theme.colors.secondary[500]",
    "#a855f7": "Theme.colors.secondary[500]",
    
    # Common colors
    "#000000": "Theme.colors.neutral[950]",
    "#000": "Theme.colors.neutral[950]",
    "#fff": "Theme.colors.neutral[0]",
}

def replace_colors_in_file(filepath: Path) -> int:
    """Replace hardcoded colors with theme tokens in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Track if we need to add Theme import
        needs_theme_import = False
        replacements_count = 0
        original_content = content
        
        # Replace hex colors
        for hex_color, theme_path in COLOR_MAPPINGS.items():
            if hex_color in content:
                # Replace in string values
                pattern = f'[{hex_color}]'
                content = content.replace(hex_color, theme_path)
                needs_theme_import = True
                replacements_count += content.count(theme_path) - original_content.count(theme_path)
        
        # Replace hex colors in quotes
        hex_pattern = r'"#([0-9a-fA-F]{6})"'
        def replace_in_quotes(match):
            hex_color = '#' + match.group(1)
            if hex_color.lower() in COLOR_MAPPINGS:
                return f'"{COLOR_MAPPINGS[hex_color.lower()]}"'
            return match.group(0)
        
        content = re.sub(hex_pattern, replace_in_quotes, content)
        
        # Add Theme import if needed
        if needs_theme_import and 'import { Theme }' not in content and 'import Theme' not in content:
            # Find the last import statement
            lines = content.split('\n')
            last_import = 0
            for i, line in enumerate(lines):
                if line.strip().startswith('import '):
                    last_import = i
            
            # Add Theme import after the last import
            if last_import > 0:
                lines.insert(last_import + 1, "import { Theme } from '../theme/unified-theme';")
                content = '\n'.join(lines)
        
        # Write back if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return replacements_count
        
        return 0
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0

def process_directory(directory: Path, extension: str = '.tsx') -> Tuple[int, int]:
    """Process all files in a directory."""
    total_files = 0
    total_replacements = 0
    
    for filepath in directory.rglob(f'*{extension}'):
        if 'node_modules' in str(filepath):
            continue
        
        total_files += 1
        replacements = replace_colors_in_file(filepath)
        total_replacements += replacements
        
        if replacements > 0:
            print(f"✓ Processed {filepath.relative_to(directory.parent)}: {replacements} replacements")
    
    return total_files, total_replacements

def main():
    """Main execution."""
    print("Color Token Replacement Tool")
    print("=" * 50)
    
    # Process apps/mobile/src directory
    mobile_src = Path(__file__).parent.parent / "apps" / "mobile" / "src"
    
    if not mobile_src.exists():
        print(f"Error: Directory {mobile_src} not found")
        return
    
    print(f"\nProcessing directory: {mobile_src}")
    print("Searching for .tsx files...\n")
    
    total_files, total_replacements = process_directory(mobile_src)
    
    print("\n" + "=" * 50)
    print(f"Total files processed: {total_files}")
    print(f"Total color replacements: {total_replacements}")
    print("\n✓ Color optimization complete!")

if __name__ == '__main__':
    main()
