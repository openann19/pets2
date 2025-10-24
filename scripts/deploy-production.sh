#!/bin/bash

# PawfectMatch Premium - Production Deployment Script
echo "🚀 Deploying PawfectMatch Premium to Production"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "turbo.json" ]; then
    print_error "Please run this script from the PawfectMatch Premium root directory"
    exit 1
fi

print_status "Setting up production environment..."

# Create production .env files if they don't exist
if [ ! -f "server/.env.production" ]; then
    cp server/.env server/.env.production
    print_status "Created server/.env.production (please update with production values)"
fi

if [ ! -f "apps/web/.env.production" ]; then
    cp apps/web/.env.local apps/web/.env.production 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > apps/web/.env.production
    print_status "Created apps/web/.env.production"
fi

# Install dependencies
print_status "Installing dependencies..."
pnpm install --frozen-lockfile

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Build all packages
print_status "Building all packages..."
pnpm build

if [ $? -ne 0 ]; then
    print_error "Failed to build packages"
    exit 1
fi

print_success "Build completed successfully"

# Start services
print_status "Starting production services..."

# Start backend server
print_status "Starting backend server on port 5000..."
NODE_ENV=production nohup node server/server.js > server.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid
print_success "Backend server started (PID: $BACKEND_PID)"

# Start web application
print_status "Starting Next.js application..."
cd apps/web
NODE_ENV=production nohup npm run start > ../../web.log 2>&1 &
WEB_PID=$!
echo $WEB_PID > ../../.web.pid
cd ../..
print_success "Web application started (PID: $WEB_PID)"

# Start AI service
print_status "Starting AI service..."
cd ai-service
NODE_ENV=production nohup python app.py > ../ai-service.log 2>&1 &
AI_PID=$!
echo $AI_PID > ../.ai-service.pid
cd ..
print_success "AI service started (PID: $AI_PID)"

print_success "🎉 PawfectMatch Premium is now running in production!"
echo ""
echo "🌐 Web Application: http://localhost:3000"
echo "🔗 API Server: http://localhost:5000"
echo "🤖 AI Service: http://localhost:8000"
echo ""
echo "📊 Monitoring:"
echo "   Backend logs: tail -f server.log"
echo "   Web logs: tail -f web.log"
echo "   AI logs: tail -f ai-service.log"
echo ""
echo "🛑 To stop services:"
echo "   kill \$(cat .backend.pid) \$(cat .web.pid) \$(cat .ai-service.pid)"
echo ""
echo "✅ Production deployment complete!"
