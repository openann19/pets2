#!/bin/bash
# Android SDK Environment Setup
# This script adds Android SDK paths to your shell profile

PROFILE_FILE="$HOME/.bashrc"
if [ -f "$HOME/.zshrc" ]; then
  PROFILE_FILE="$HOME/.zshrc"
fi

echo "Setting up Android SDK environment variables..."

# Check if Android SDK exists
if [ ! -d "$HOME/Android/Sdk" ]; then
  echo "❌ Android SDK not found at ~/Android/Sdk"
  echo "Please install Android Studio first:"
  echo "  snap install android-studio"
  exit 1
fi

# Add environment variables if not already present
if ! grep -q "ANDROID_HOME" "$PROFILE_FILE"; then
  cat >> "$PROFILE_FILE" << 'EOF'

# Android SDK Configuration
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"
EOF
  echo "✅ Android SDK environment variables added to $PROFILE_FILE"
else
  echo "✅ Android SDK environment variables already configured"
fi

# Source the profile file
source "$PROFILE_FILE"

echo ""
echo "📋 Configuration Summary:"
echo "  ANDROID_HOME: $ANDROID_HOME"
echo "  ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
echo ""
echo "✅ To apply changes, run: source $PROFILE_FILE"
echo "   Or open a new terminal window"
