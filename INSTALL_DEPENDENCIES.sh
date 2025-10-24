#!/bin/bash

# PawfectMatch Dependency Installation Script
# Phase 2: Modernization - 2025

set -e

echo "🚀 PawfectMatch Dependency Installation"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${RED}❌ Node.js 22+ required. Current: $(node -v)${NC}"
    echo "Please upgrade Node.js to version 22 or higher"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check pnpm version
echo "📦 Checking pnpm version..."
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm not found${NC}"
    echo "Installing pnpm..."
    npm install -g pnpm@9.15.0
fi

PNPM_VERSION=$(pnpm -v | cut -d'.' -f1)
if [ "$PNPM_VERSION" -lt 9 ]; then
    echo -e "${YELLOW}⚠️  Upgrading pnpm to 9.15.0...${NC}"
    npm install -g pnpm@9.15.0
fi
echo -e "${GREEN}✅ pnpm version: $(pnpm -v)${NC}"

# Clean previous installations
echo ""
echo "🧹 Cleaning previous installations..."
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm -rf .turbo
rm -rf apps/*/.turbo
rm -rf apps/*/.next
rm -rf apps/*/dist
echo -e "${GREEN}✅ Cleanup complete${NC}"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pnpm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Dependency installation failed${NC}"
    exit 1
fi

# Verify installations
echo ""
echo "🔍 Verifying installations..."

# Check web app
echo "  - Checking web app..."
cd apps/web
if [ -d "node_modules/react" ]; then
    REACT_VERSION=$(node -p "require('./node_modules/react/package.json').version")
    echo -e "    ${GREEN}✅ React: $REACT_VERSION${NC}"
else
    echo -e "    ${RED}❌ React not found${NC}"
fi

if [ -d "node_modules/next" ]; then
    NEXT_VERSION=$(node -p "require('./node_modules/next/package.json').version")
    echo -e "    ${GREEN}✅ Next.js: $NEXT_VERSION${NC}"
else
    echo -e "    ${RED}❌ Next.js not found${NC}"
fi
cd ../..

# Check mobile app
echo "  - Checking mobile app..."
cd apps/mobile
if [ -d "node_modules/react-native" ]; then
    RN_VERSION=$(node -p "require('./node_modules/react-native/package.json').version")
    echo -e "    ${GREEN}✅ React Native: $RN_VERSION${NC}"
else
    echo -e "    ${RED}❌ React Native not found${NC}"
fi

if [ -d "node_modules/expo" ]; then
    EXPO_VERSION=$(node -p "require('./node_modules/expo/package.json').version")
    echo -e "    ${GREEN}✅ Expo: $EXPO_VERSION${NC}"
else
    echo -e "    ${RED}❌ Expo not found${NC}"
fi
cd ../..

echo ""
echo "✨ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Run type check: pnpm run type-check"
echo "2. Run linter: pnpm run lint:check"
echo "3. Run tests: pnpm run test"
echo "4. Build apps: pnpm run build"
echo ""
