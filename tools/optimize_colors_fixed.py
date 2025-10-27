#!/usr/bin/env python3
"""
Color Token Replacement Tool (Fixed)
Automatically replaces hardcoded colors with theme tokens
This version is smarter about context
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
    
    # Secondary colors
    "#0ea5e9": "Theme.colors.secondary[500]",
    "#0284c7": "Theme.colors.secondary[600]",
    "#8B5CF6": "Theme.colors.secondary[500]",
    "#a855f7": "Theme.colors.secondary[500]",
}

def fix_color_string(match):
    """Fix color strings that were incorrectly replaced."""
    hex_color = '#' + match.group(1)
    upper_hex = match.group(1).upper()
    lower_hex = match.group(1).lower()
    
    # Try to find mapping
    for color, theme_path in COLOR_MAPPINGS.items():
        if color.upper() == f'#{upper_hex}' or color.lower() == f'#{lower_hex}':
            # Return with curly braces for JSX props
            return f'{{{{{theme_path}}}}}'
    
    return match.group(0)

def replace_colors_in_file(filepath: Path, dry_run: bool = False) -> int:
    """Replace hardcoded colors with theme tokens in StyleSheet.create blocks."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        replacements_count = 0
        
        # Find and replace colors in StyleSheet.create blocks
        # Pattern: StyleSheet.create({ ... color: "#hexvalue" ... })
        
        # Replace hex colors in style object properties
        pattern = r'(\w+\s*:\s*)"(#[\da-fA-F]{6})"'
        
        def replace_color(m):
            prop_name = m.group(1)
            hex_color = m.group(2)
            
            # Look up in mapping
            for mapped_hex, theme_path in COLOR_MAPPINGS.items():
                if mapped_hex.lower() == hex_color.lower():
                    replacements_count += 1
                    return f'{prop_name}{theme_path}'
            
            return m.group(0)
        
        content = re.sub(pattern, replace_color, content)
        
        # Add Theme import if needed and not already present
        needs_theme_import = ('Theme.' in content) and ('import { Theme }' not in content and 'import Theme' not in content)
        
        if needs_theme_import:
            # Find the last import statement
            lines = content.split('\n')
            last_import_idx = -1
            for i, line in enumerate(lines):
                if line.strip().startswith('import '):
                    last_import_idx = i
            
            # Add Theme import
            if last_import_idx >= 0:
                import_line = "import { Theme } from '../theme/unified-theme';"
                # Check if this is a screen (needs one more '../')
                if 'screens/' in str(filepath):
                    import_line = "import { Theme } from '../../theme/unified-theme';"
                elif 'components/' in str(filepath) and 'hooks/' not in str(filepath):
                    import_line = "import { Theme } from '../../theme/unified-theme';"
                
                lines.insert(last_import_idx + 1, import_line)
                content = '\n'.join(lines)
        
        # Write back if changes were made
        if content != original_content and not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return replacements_count
        
        return 0
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0

def main():
    """Main execution - process files."""
    print("Color Token Replacement Tool (Fixed)")
    print("=" * 50)
    
    # Process a few key high-impact files
    mobile_src = Path(__file__).parent.parent / "apps" / "mobile" / "src"
    
    # Target high-impact files from inventory
    target_files = [
        "src/components/HolographicEffects.tsx",
        "src/screens/MyPetsScreen.tsx", 
        "src/screens/admin/AdminBillingScreen.tsx",
        "src/components/PremiumTypography.tsx",
        "src/screens/admin/AdminSecurityScreen.tsx",
    ]
    
    print(f"\nProcessing high-impact files...\n")
    
    total_replacements = 0
    for file_rel in target_files:
        filepath = mobile_src.parent.parent / file_rel
        if filepath.exists():
            count = replace_colors_in_file(filepath, dry_run=False)
            if count > 0:
                print(f"✓ {file_rel}: {count} replacements")
                total_replacements += count
    
    print(f"\nTotal replacements: {total_replacements}")
    print("✓ Color optimization phase 1 complete!")

if __name__ == '__main__':
    main()


