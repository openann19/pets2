#!/bin/bash
# Server Deployment Script
# Automated server deployment with health checks

set -e

echo "🚀 Starting Server Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "server/.env" ]; then
  echo -e "${YELLOW}⚠️  Warning: server/.env not found${NC}"
  echo "Creating from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example server/.env
    echo -e "${YELLOW}⚠️  Please fill in server/.env with your configuration${NC}"
    exit 1
  fi
fi

cd server

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building server..."
pnpm build

echo "✅ Build complete"

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
  echo "🔄 Restarting server with PM2..."
  pm2 restart pawfectmatch-api || pm2 start dist/server.js --name pawfectmatch-api
  echo "✅ Server restarted with PM2"
else
  echo -e "${YELLOW}⚠️  PM2 not found. Install with: npm install -g pm2${NC}"
  echo "Starting server manually..."
  node dist/server.js &
fi

# Health check
echo "🏥 Running health check..."
sleep 5

if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Server is healthy${NC}"
else
  echo -e "${RED}❌ Server health check failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"

