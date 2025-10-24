#!/bin/bash

# 📱 PAWFECTMATCH PREMIUM MOBILE BUILD SCRIPT
# Automated APK/IPA building with premium configuration

set -e  # Exit on any error

echo "🚀 PAWFECTMATCH PREMIUM MOBILE BUILD"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
MOBILE_DIR="apps/mobile"
BUILD_TYPE=""
PLATFORM=""

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

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Check if we're in the right directory
if [ ! -d "$MOBILE_DIR" ]; then
    print_error "Mobile app directory not found. Please run from project root."
    exit 1
fi

cd $MOBILE_DIR

# Check if required tools are installed
check_dependencies() {
    print_header "🔧 Checking Dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm"
        exit 1
    fi
    
    print_success "Node.js and npm found"
    
    # Check for EAS CLI
    if ! command -v eas &> /dev/null; then
        print_warning "EAS CLI not found. Installing..."
        npm install -g @expo/eas-cli
        print_success "EAS CLI installed"
    else
        print_success "EAS CLI found"
    fi
    
    # Check for Expo CLI
    if ! command -v expo &> /dev/null; then
        print_warning "Expo CLI not found. Installing..."
        npm install -g expo-cli
        print_success "Expo CLI installed"
    else
        print_success "Expo CLI found"
    fi
}

# Install dependencies
install_dependencies() {
    print_header "📦 Installing Dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Check authentication
check_auth() {
    print_header "🔐 Checking Authentication..."
    
    if ! eas whoami &> /dev/null; then
        print_warning "Not logged in to Expo. Please login..."
        eas login
        print_success "Logged in to Expo"
    else
        EXPO_USER=$(eas whoami)
        print_success "Logged in as: $EXPO_USER"
    fi
}

# Configure build if needed
configure_build() {
    print_header "⚙️ Configuring Build..."
    
    if [ ! -f "eas.json" ]; then
        print_status "Initializing EAS build configuration..."
        eas build:configure
        print_success "Build configuration created"
    else
        print_success "Build configuration already exists"
    fi
}

# Build selection menu
select_build_type() {
    print_header "🎯 Select Build Type:"
    echo ""
    echo "1) Development APK (fastest, for testing)"
    echo "2) Preview APK (internal testing)"
    echo "3) Production APK (direct distribution)"
    echo "4) Production AAB (Google Play Store)"
    echo "5) iOS IPA (App Store)"
    echo "6) Build All Platforms"
    echo ""
    
    while true; do
        read -p "Enter your choice (1-6): " choice
        case $choice in
            1)
                BUILD_TYPE="development"
                PLATFORM="android"
                break
                ;;
            2)
                BUILD_TYPE="preview"
                PLATFORM="android"
                break
                ;;
            3)
                BUILD_TYPE="production-apk"
                PLATFORM="android"
                break
                ;;
            4)
                BUILD_TYPE="production"
                PLATFORM="android"
                break
                ;;
            5)
                BUILD_TYPE="production"
                PLATFORM="ios"
                break
                ;;
            6)
                BUILD_TYPE="production"
                PLATFORM="all"
                break
                ;;
            *)
                print_warning "Invalid choice. Please enter 1-6."
                ;;
        esac
    done
}

# Execute build
execute_build() {
    print_header "🏗️ Building PawfectMatch Premium Mobile App..."
    print_status "Build Type: $BUILD_TYPE"
    print_status "Platform: $PLATFORM"
    echo ""
    
    # Start build timer
    start_time=$(date +%s)
    
    # Execute build command
    if [ "$PLATFORM" = "all" ]; then
        print_status "Building for all platforms..."
        eas build --platform all --profile $BUILD_TYPE
    else
        print_status "Building for $PLATFORM..."
        eas build --platform $PLATFORM --profile $BUILD_TYPE
    fi
    
    # Calculate build time
    end_time=$(date +%s)
    build_time=$((end_time - start_time))
    minutes=$((build_time / 60))
    seconds=$((build_time % 60))
    
    print_success "Build completed in ${minutes}m ${seconds}s"
}

# Display build results
show_results() {
    print_header "🎊 Build Complete!"
    echo ""
    print_success "Your premium PawfectMatch mobile app has been built!"
    echo ""
    print_status "Next steps:"
    echo "1. Check your Expo dashboard for download links"
    echo "2. Download the APK/IPA file"
    echo "3. Test on your device"
    echo "4. Share with your team or submit to app stores"
    echo ""
    print_status "Features included in your premium mobile app:"
    echo "✅ Premium UI with glass morphism and 3D effects"
    echo "✅ Advanced haptic feedback system"
    echo "✅ AI-powered pet matching and photo analysis"
    echo "✅ Real-time chat with premium interface"
    echo "✅ Video calling with WebRTC"
    echo "✅ Push notifications"
    echo "✅ Offline support with smart sync"
    echo "✅ Premium animations throughout"
    echo ""
    print_success "Dashboard: https://expo.dev/accounts/$(eas whoami)/projects"
}

# Main execution
main() {
    echo ""
    print_header "🐾 Building PawfectMatch Premium Mobile App"
    echo ""
    
    check_dependencies
    echo ""
    
    install_dependencies
    echo ""
    
    check_auth
    echo ""
    
    configure_build
    echo ""
    
    select_build_type
    echo ""
    
    execute_build
    echo ""
    
    show_results
}

# Error handling
trap 'print_error "Build failed! Check the logs above for details."; exit 1' ERR

# Run main function
main "$@"
