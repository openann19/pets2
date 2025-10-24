#!/bin/bash

# PawfectMatch Premium - Health Check Script
echo "🏥 PawfectMatch Premium Health Check"
echo "====================================="

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

# Check backend server
print_status "Checking backend server (port 5000)..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_success "Backend server is healthy"
else
    print_error "Backend server is not responding"
    print_warning "Make sure the backend server is running on port 5000"
fi

# Check web application
print_status "Checking web application (port 3000)..."
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    print_success "Web application is healthy"
else
    print_error "Web application is not responding"
    print_warning "Make sure Next.js is running on port 3000"
fi

# Check AI service
print_status "Checking AI service (port 8000)..."
if curl -s http://localhost:8000/health > /dev/null; then
    print_success "AI service is healthy"
else
    print_error "AI service is not responding"
    print_warning "Make sure the AI service is running on port 8000"
fi

# Check database connection
print_status "Checking database connectivity..."
if curl -s http://localhost:5000/api/health | grep -q '"database": "connected"'; then
    print_success "Database is connected"
else
    print_warning "Database connection may have issues"
fi

# Check API endpoints
print_status "Testing API endpoints..."

# Test auth endpoint
if curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' > /dev/null; then
    print_success "Auth endpoint is accessible"
else
    print_warning "Auth endpoint may have issues"
fi

# Test AI endpoint
if curl -s -X POST http://localhost:5000/api/ai/generate-bio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{"keywords":["friendly","playful"]}' > /dev/null; then
    print_success "AI endpoint is accessible"
else
    print_warning "AI endpoint may have issues"
fi

print_status "Health check complete!"
echo ""
echo "🔍 For detailed logs:"
echo "   Backend: tail -f server.log"
echo "   Web: tail -f web.log"
echo "   AI: tail -f ai-service.log"
