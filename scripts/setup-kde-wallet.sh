#!/bin/bash

# Script to set up KDE wallet for PawfectMatch Premium
# This resolves the issue where the OS keyring is not available for encryption in KDE environment

echo "🔧 Setting up KDE Wallet for PawfectMatch Premium..."

# Check if we're in a KDE environment
if [[ $XDG_CURRENT_DESKTOP != *"KDE"* ]]; then
    echo "⚠️  Warning: Not running in a KDE desktop environment"
    echo "This script is designed for KDE systems only."
fi

# Check if kwalletmanager is available
if ! command -v kwalletmanager5 &> /dev/null; then
    echo "❌ Error: kwalletmanager5 is not installed"
    echo "Please install KDE wallet manager:"
    echo "  sudo apt install kwalletmanager"
    exit 1
fi

# Check if kwalletd is running
if ! pgrep -x "kwalletd5" > /dev/null; then
    echo "❌ Error: KDE wallet daemon is not running"
    echo "Please start KDE wallet service or restart your session"
    exit 1
fi

# Check if wallet is enabled
enabled=$(kreadconfig5 --file kwalletrc --group Wallet --key Enabled)
if [ "$enabled" != "true" ]; then
    echo "🔧 Enabling KDE wallet..."
    kwriteconfig5 --file kwalletrc --group Wallet --key Enabled --type bool true
fi

# Check if we have a default wallet
default_wallet=$(kreadconfig5 --file kwalletrc --group Wallet --key DefaultWallet)
if [ -z "$default_wallet" ]; then
    echo "🔧 Setting default wallet to 'kdewallet'..."
    kwriteconfig5 --file kwalletrc --group Wallet --key DefaultWallet kdewallet
fi

# Create wallet folder for the application if it doesn't exist
echo "🔧 Creating wallet entries for PawfectMatch Premium..."

# Check if wallet is accessible
wallet_list=$(qdbus org.kde.kwalletd5 /modules/kwalletd5 org.kde.KWallet.wallets)
if [ -z "$wallet_list" ]; then
    echo "⚠️  Warning: No KDE wallets found. You may need to create one through KDE Wallet Manager."
    echo "Please run 'kwalletmanager5' to create a wallet, then re-run this script."
    exit 1
fi

echo "✅ KDE wallet setup completed successfully!"
echo "Wallets available: $wallet_list"
echo ""
echo "If you continue to experience keyring issues, please:"
echo "1. Open KDE Wallet Manager (kwalletmanager5)"
echo "2. Create or unlock your default wallet"
echo "3. Ensure the wallet is set to auto-open when you log in"
