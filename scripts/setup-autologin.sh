#!/bin/bash

# Script to set up automatic login for KDE desktop environment

echo "🔧 Setting up automatic login for KDE..."

# Check if we're in a KDE environment
if [[ $XDG_CURRENT_DESKTOP != *"KDE"* ]]; then
    echo "⚠️  Warning: Not running in a KDE desktop environment"
    echo "This script is designed for KDE systems only."
fi

# Check if SDDM is being used
if [ -f "/etc/sddm.conf" ]; then
    echo "✅ SDDM configuration file already exists"
else
    echo "🔧 Creating SDDM configuration file..."
    sudo touch /etc/sddm.conf
fi

# Configure autologin
echo "[Autologin]" | sudo tee -a /etc/sddm.conf > /dev/null
echo "User=ben" | sudo tee -a /etc/sddm.conf > /dev/null
echo "Session=plasma" | sudo tee -a /etc/sddm.conf > /dev/null

echo "✅ Automatic login configured for user 'ben'"
echo "Please restart your system for changes to take effect"

# Also set up KDE wallet to auto-open
echo "🔧 Configuring KDE wallet to auto-open..."

# Create kwalletrc if it doesn't exist
mkdir -p ~/.config
touch ~/.config/kwalletrc

# Enable wallet
kwriteconfig5 --file kwalletrc --group Wallet --key Enabled --type bool true

# Set default wallet
kwriteconfig5 --file kwalletrc --group Wallet --key DefaultWallet kdewallet

echo "✅ KDE wallet configured to auto-open"
echo "If you continue to have issues, please open KWalletManager and ensure your wallet is unlocked"
