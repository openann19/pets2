#!/bin/bash
# Cleanup old Cursor installation packages

echo "🧹 Cleaning up old Cursor .deb packages..."
echo ""

CURRENT_VERSION="cursor_1.7.54_amd64.deb"
KEEP=3  # Keep the 3 most recent

# List all cursor packages sorted by modification time
files=$(ls -t ~/Downloads/cursor_*.deb 2>/dev/null | tail -n +$((KEEP+1)))

if [ -z "$files" ]; then
    echo "✅ No old packages to clean up."
    exit 0
fi

echo "📦 Old packages to remove:"
echo "$files"
echo ""

read -p "Delete these files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$files" | while read -r file; do
        rm -v "$file"
    done
    echo ""
    echo "✅ Cleaned up old packages!"
    echo ""
    echo "Remaining packages:"
    ls -lh ~/Downloads/cursor_*.deb | tail -5
else
    echo "❌ Cleanup cancelled."
fi

