#!/bin/bash

# PawfectMatch Development Script
# This script runs all services concurrently for development

echo "🚀 Starting PawfectMatch Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi

    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. AI service will not run."
    fi

    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Using npm instead."
        PACKAGE_MANAGER="npm"
    else
        PACKAGE_MANAGER="pnpm"
    fi

    print_success "Dependencies check completed"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."

    # Copy .env.example to .env if .env doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please update .env file with your actual configuration values"
        else
            print_warning ".env.example not found. Creating basic .env file..."
            cat > .env << EOL
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/pawfectmatch
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
AI_SERVICE_URL=http://localhost:8000
EOL
            print_success "Created basic .env file"
        fi
    fi

    # Create client .env if it doesn't exist
    if [ ! -f "client/.env" ]; then
        if [ -f "client/.env.example" ]; then
            cp client/.env.example client/.env
            print_success "Created client/.env file"
        else
            cat > client/.env << EOL
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:8000
EOL
            print_success "Created basic client/.env file"
        fi
    fi

    print_success "Environment setup completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    # Install root dependencies
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi

    # Install client dependencies
    cd client
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi
    cd ..

    # Install server dependencies
    cd server
    npm install
    cd ..

    # Install AI service dependencies
    if [ -d "ai-service" ]; then
        cd ai-service
        pip install -r requirements.txt
        cd ..
    fi

    print_success "Dependencies installed"
}

# Start services
start_services() {
    print_status "Starting services..."

    # Function to handle service startup
    start_service() {
        local service_name=$1
        local command=$2
        local directory=${3:-.}

        print_status "Starting $service_name..."

        if [ "$directory" != "." ]; then
            cd "$directory"
        fi

        # Start service in background
        eval "$command" > /dev/null 2>&1 &
        local pid=$!

        if [ "$directory" != "." ]; then
            cd ..
        fi

        echo $pid
        print_success "$service_name started (PID: $pid)"
    }

    # Start MongoDB if not already running
    if ! pgrep -x "mongod" > /dev/null; then
        print_status "Starting MongoDB..."
        mongod --dbpath ./data/db --logpath ./data/mongodb.log --fork
        print_success "MongoDB started"
    else
        print_status "MongoDB already running"
    fi

    # Start Redis if not already running
    if ! pgrep -x "redis-server" > /dev/null; then
        print_status "Starting Redis..."
        redis-server --daemonize yes
        print_success "Redis started"
    else
        print_status "Redis already running"
    fi

    # Start AI service (Python)
    if [ -d "ai-service" ] && command -v python3 &> /dev/null; then
        start_service "AI Service" "python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload" "ai-service"
    else
        print_warning "AI service not available - Python or ai-service directory not found"
    fi

    # Start server
    start_service "Backend Server" "npm run dev" "server"

    # Start client
    start_service "Frontend Client" "npm start" "client"

    print_success "All services started!"
}

# Show service URLs
show_urls() {
    echo ""
    print_success "🌟 PawfectMatch Development Environment Ready!"
    echo ""
    echo "📱 Frontend:     http://localhost:3000"
    echo "🔧 Backend API:  http://localhost:5000"
    echo "🤖 AI Service:   http://localhost:8000"
    echo "📊 MongoDB:      mongodb://localhost:27017"
    echo "💾 Redis:        redis://localhost:6379"
    echo ""
    echo "📚 Useful commands:"
    echo "   • Stop all services:  Ctrl+C"
    echo "   • View logs:         tail -f logs/*.log"
    echo "   • Restart services:  ./dev.sh"
    echo "   • Bundle analysis:   ANALYZE_BUNDLE=true npm run build"
    echo ""
    print_status "Press Ctrl+C to stop all services"
}

# Cleanup function
cleanup() {
    print_status "Shutting down services..."

    # Kill all background processes
    pkill -f "node.*server"
    pkill -f "npm.*start"
    pkill -f "python.*uvicorn"
    pkill -f "mongod"
    pkill -f "redis-server"

    print_success "All services stopped"
    exit 0
}

# Main execution
main() {
    # Trap SIGINT (Ctrl+C) to cleanup
    trap cleanup SIGINT SIGTERM

    check_dependencies
    setup_env
    install_dependencies
    start_services
    show_urls

    # Wait for user input
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"
