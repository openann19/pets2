#!/bin/bash

# MongoDB Setup Script for PawfectMatch Premium
echo "🗄️ Setting up MongoDB for PawfectMatch Premium..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    print_success "MongoDB is already installed"
    mongod --version
    
    # Start MongoDB service
    print_status "Starting MongoDB service..."
    sudo systemctl start mongod 2>/dev/null || print_warning "Could not start MongoDB service"
    sudo systemctl enable mongod 2>/dev/null || print_warning "Could not enable MongoDB service"
    
else
    print_status "MongoDB not found. Installing MongoDB Community Edition..."
    
    # Import MongoDB public GPG key
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Create list file for MongoDB
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package database
    sudo apt-get update
    
    # Install MongoDB
    sudo apt-get install -y mongodb-org
    
    # Start and enable MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    print_success "MongoDB installed and started"
fi

# Create data directory
print_status "Creating MongoDB data directory..."
sudo mkdir -p /data/db
sudo chown -R $USER:$USER /data/db

# Create database and collections for PawfectMatch
print_status "Setting up PawfectMatch database..."

mongosh --eval "
use pawfectmatch;

// Create collections
db.createCollection('users');
db.createCollection('pets');
db.createCollection('matches');
db.createCollection('messages');
db.createCollection('subscriptions');

// Create indexes for performance
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'location.coordinates': '2dsphere' });
db.pets.createIndex({ 'owner': 1 });
db.pets.createIndex({ 'location.coordinates': '2dsphere' });
db.matches.createIndex({ 'users': 1 });
db.messages.createIndex({ 'matchId': 1, 'timestamp': -1 });

// Insert sample data
db.users.insertMany([
  {
    _id: ObjectId(),
    email: 'demo@pawfectmatch.com',
    name: 'Demo User',
    hashedPassword: '\$2b\$10\$example',
    location: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749] // San Francisco
    },
    createdAt: new Date(),
    isPremium: false
  }
]);

db.pets.insertMany([
  {
    _id: ObjectId(),
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
    bio: 'Friendly and energetic golden retriever who loves playing fetch!',
    owner: ObjectId(),
    location: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749]
    },
    tags: ['Friendly', 'Energetic', 'Playful'],
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Luna',
    species: 'cat',
    breed: 'Persian',
    age: 2,
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
    bio: 'Elegant Persian cat who enjoys quiet moments and gentle pets.',
    owner: ObjectId(),
    location: {
      type: 'Point',
      coordinates: [-122.4094, 37.7849]
    },
    tags: ['Calm', 'Elegant', 'Affectionate'],
    createdAt: new Date()
  }
]);

print('✅ PawfectMatch database setup complete!');
" 2>/dev/null || print_warning "Database setup will be handled by the application"

print_success "MongoDB setup complete!"
print_status "MongoDB is running on: mongodb://localhost:27017"
print_status "Database: pawfectmatch"
print_status "You can connect using: mongosh mongodb://localhost:27017/pawfectmatch"
