#!/bin/bash

# PawfectMatch Premium - Simple Startup Script
echo "🚀 Starting PawfectMatch Premium Services"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Start backend server
print_status "Starting backend server..."
cd server
if [ -f "server.js" ]; then
    NODE_ENV=production nohup node server.js > ../server.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    print_success "Backend server started (PID: $BACKEND_PID)"
    cd ..
else
    print_error "Backend server.js not found"
    cd ..
fi

# Start web application
print_status "Starting Next.js application..."
cd apps/web
if [ -f "package.json" ]; then
    NODE_ENV=production nohup npm run start > ../../web.log 2>&1 &
    WEB_PID=$!
    echo $WEB_PID > ../../.web.pid
    print_success "Web application started (PID: $WEB_PID)"
    cd ../..
else
    print_error "Web app package.json not found"
    cd ../..
fi

# Start AI service
print_status "Starting AI service..."
cd ai-service
if [ -f "app.py" ]; then
    nohup python app.py > ../ai-service.log 2>&1 &
    AI_PID=$!
    echo $AI_PID > ../.ai-service.pid
    print_success "AI service started (PID: $AI_PID)"
    cd ..
else
    print_error "AI service app.py not found"
    cd ..
fi

print_success "🎉 PawfectMatch Premium services started!"
echo ""
echo "🌐 Services running:"
echo "   Backend API: http://localhost:5000"
echo "   Web App: http://localhost:3000"
echo "   AI Service: http://localhost:8000"
echo ""
echo "📊 Check logs:"
echo "   Backend: tail -f server.log"
echo "   Web: tail -f web.log"
echo "   AI: tail -f ai-service.log"
echo ""
echo "🛑 To stop: kill \$(cat .backend.pid) \$(cat .web.pid) \$(cat .ai-service.pid)"
