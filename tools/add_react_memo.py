#!/usr/bin/env python3
"""
Add React.memo to large components automatically
"""

import re
from pathlib import Path

def add_memo_to_component(filepath: Path) -> bool:
    """Add React.memo to a component if it's missing."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has React.memo
        if 'React.memo(' in content or 'export default React.memo' in content:
            return False
        
        # Find default export function
        # Pattern: export default function ComponentName
        pattern = r'export default function (\w+)'
        match = re.search(pattern, content)
        
        if not match:
            return False
        
        component_name = match.group(1)
        
        # Replace: export default function ComponentName
        # With: const ComponentName = React.memo(...); export default ComponentName;
        
        # Get the function body
        func_pattern = r'export default function (\w+)\((.+?)\):\s*React\.ReactElement\s*{'
        
        # More comprehensive pattern
        lines = content.split('\n')
        new_lines = []
        in_function = False
        function_indent = 0
        start_idx = -1
        end_idx = -1
        brace_count = 0
        
        for i, line in enumerate(lines):
            if 'export default function' in line and not in_function:
                in_function = True
                start_idx = i
                function_indent = len(line) - len(line.lstrip())
                brace_count = line.count('{') - line.count('}')
            elif in_function:
                brace_count += line.count('{') - line.count('}')
                if brace_count == 0 and start_idx != i:
                    end_idx = i + 1
                    break
        
        if start_idx == -1 or end_idx == -1:
            return False
        
        # Extract function
        function_lines = lines[start_idx:end_idx]
        func_decl = function_lines[0]
        
        # Convert to memoized component
        component_decl = func_decl.replace('export default ', 'const ').replace(': React.ReactElement', '')
        export_decl = f'export default React.memo({component_name});'
        
        # Reconstruct
        new_lines = lines[:start_idx]
        new_lines.append(component_decl)
        new_lines.extend(function_lines[1:])
        new_lines.append(export_decl)
        new_lines.extend(lines[end_idx:])
        
        # Ensure React import
        has_react_import = any('import React' in line for line in new_lines[:10])
        if not has_react_import:
            # Add import after other imports
            for i, line in enumerate(new_lines[:20]):
                if line.startswith('import ') and i < 19:
                    new_lines.insert(i + 1, "import React from 'react';")
                    break
        
        new_content = '\n'.join(new_lines)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process key files."""
    print("Adding React.memo to large components")
    print("=" * 50)
    
    mobile_src = Path(__file__).parent.parent / "apps" / "mobile" / "src"
    
    # Based on FILE_RANKINGS.md, these components need React.memo
    target_files = [
        "src/components/HolographicEffects.tsx",
        "src/screens/MyPetsScreen.tsx",
        "src/screens/admin/AdminBillingScreen.tsx",
        "src/screens/admin/AdminSecurityScreen.tsx",
        "src/components/PremiumTypography.tsx",
    ]
    
    for file_rel in target_files:
        filepath = mobile_src.parent.parent / file_rel
        if filepath.exists():
            if add_memo_to_component(filepath):
                print(f"✓ Added React.memo to {file_rel}")
            else:
                print(f"- Skipped {file_rel} (already memoized or invalid)")
    
    print("\n✓ React.memo optimization complete!")

if __name__ == '__main__':
    main()


