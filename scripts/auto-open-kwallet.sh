#!/bin/bash

# Script to automatically open KDE wallet for Windsurf/VS Code
# This helps prevent the need to login everytime after reboot

echo "🔧 Auto-opening KDE wallet for Windsurf..."

# Check if we're in a KDE environment
if [[ $XDG_CURRENT_DESKTOP != *"KDE"* ]]; then
    echo "⚠️  Warning: Not running in a KDE desktop environment"
fi

# Check if kwalletd is running
if ! pgrep -x "kwalletd5" > /dev/null; then
    echo "❌ Error: KDE wallet daemon is not running"
    echo "Please start KDE wallet service or restart your session"
    exit 1
fi

# Open the KDE wallet for Windsurf
handle=$(qdbus org.kde.kwalletd5 /modules/kwalletd5 org.kde.KWallet.open kdewallet 0 Windsurf)
if [ $? -eq 0 ]; then
    echo "✅ KDE wallet opened successfully with handle: $handle"
else
    echo "❌ Failed to open KDE wallet"
    exit 1
fi

# Check if the wallet is now open
is_open=$(qdbus org.kde.kwalletd5 /modules/kwalletd5 org.kde.KWallet.isOpen kdewallet)
if [ "$is_open" = "true" ]; then
    echo "✅ KDE wallet is now open and ready for Windsurf"
else
    echo "⚠️  KDE wallet may still be locked. You might need to unlock it manually in KWalletManager"
fi
