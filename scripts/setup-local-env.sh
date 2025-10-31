#!/usr/bin/env bash
set -euo pipefail

# Local setup script for deterministic development environment
# Run this exactly once per machine

echo "🔧 Setting up local development environment..."

# Node & package manager
if command -v nvm &> /dev/null || [ -s "$HOME/.nvm/nvm.sh" ]; then
  echo "📦 Setting up Node.js 20 with nvm..."
  source "$HOME/.nvm/nvm.sh" 2>/dev/null || true
  nvm use 20 || nvm install 20
  nvm alias default 20
else
  echo "⚠️  nvm not found. Please install nvm first: https://github.com/nvm-sh/nvm"
  exit 1
fi

# Enable corepack and prepare pnpm
echo "📦 Setting up pnpm 9.0.0..."
corepack enable || echo "⚠️  corepack enable failed, but continuing..."
corepack prepare pnpm@9.0.0 --activate

# Lock to UTC + stable RNG for tests
if ! grep -q "export TZ=UTC" ~/.bashrc 2>/dev/null; then
  echo "🌍 Setting timezone to UTC for deterministic tests..."
  echo 'export TZ=UTC' >> ~/.bashrc
fi

if ! grep -q "export TEST_SEED=1337" ~/.bashrc 2>/dev/null; then
  echo "🎲 Setting deterministic test seed..."
  echo 'export TEST_SEED=1337' >> ~/.bashrc
fi

echo ""
echo "✅ Local setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: source ~/.bashrc (or restart your terminal)"
echo "   2. Run: pnpm install --frozen-lockfile"
echo "   3. Run: pnpm verify"
echo ""
echo "📱 For mobile E2E:"
echo "   iOS: Xcode + iOS 18 sim; brew install applesimutils"
echo "   Android: SDK API 35, emulator x86_64; adb devices must show at least one emulator"
echo ""

