#!/bin/bash
set -e

echo "🔧 Fixing Ubuntu Performance Issues"
echo "===================================="

# Backup the problematic file
echo "📝 Backing up /etc/grub.d/06_custom_safe..."
sudo cp /etc/grub.d/06_custom_safe /etc/grub.d/06_custom_safe.backup 2>/dev/null || echo "File already moved or doesn't exist"

# Remove or comment out acpi=off line
echo "🔍 Checking for acpi=off in GRUB files..."

# Check if 06_custom_safe exists and has acpi=off
if [ -f /etc/grub.d/06_custom_safe ]; then
    if grep -q "acpi=off" /etc/grub.d/06_custom_safe; then
        echo "❌ Found acpi=off in /etc/grub.d/06_custom_safe"
        echo "📝 Removing the file (it's causing single-core mode)..."
        sudo rm /etc/grub.d/06_custom_safe
    fi
fi

# Check /etc/default/grub for acpi=off
if grep -q "acpi=off" /etc/default/grub; then
    echo "❌ Found acpi=off in /etc/default/grub"
    echo "📝 Removing acpi=off parameter..."
    sudo sed -i.bak 's/\bacpi=off\b//g' /etc/default/grub
fi

# Check current /proc/cmdline
echo ""
echo "📊 Current kernel parameters:"
cat /proc/cmdline | grep -o "acpi=off" || echo "✅ No acpi=off found in current boot"

# Update GRUB
echo ""
echo "🔄 Updating GRUB configuration..."
sudo update-grub

echo ""
echo "✅ Fix applied! You need to REBOOT for changes to take effect."
echo ""
echo "📋 Expected result after reboot:"
echo "   - All 24 CPU cores should be detected"
echo "   - System should be much faster"
echo "   - Reboot should work properly"
echo ""
echo "⚠️  To reboot now, run: sudo reboot"
echo "   Or manually reboot via GUI/button"

