/**
 * Playwright Global Setup
 * Prepares test environment with database seeding and authentication
 */
import { chromium, FullConfig } from '@playwright/test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...');
  
  // Start MongoDB Memory Server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri);
  
  // Seed test data
  await seedTestData();
  
  // Create authenticated user session
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Register test user
  await page.goto('http://localhost:3000/register');
  await page.fill('[data-testid="email-input"]', 'test@playwright.com');
  await page.fill('[data-testid="password-input"]', 'TestPassword123!');
  await page.fill('[data-testid="name-input"]', 'Playwright Test User');
  await page.check('[data-testid="agree-terms"]');
  await page.click('[data-testid="register-button"]');
  
  // Wait for registration to complete
  await page.waitForURL('**/dashboard');
  
  // Save authentication state
  await context.storageState({ path: 'tests/playwright/auth-state.json' });
  
  await browser.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  
  console.log('✅ Playwright global setup completed');
}

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  const db = mongoose.connection.db;
  
  // Create test users
  await db.collection('users').insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'test@playwright.com',
      name: 'Playwright Test User',
      hashedPassword: '$2b$10$example',
      isPremium: false,
      createdAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'premium@playwright.com',
      name: 'Premium Test User',
      hashedPassword: '$2b$10$example',
      isPremium: true,
      createdAt: new Date(),
    },
  ]);
  
  // Create test pets
  await db.collection('pets').insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'male',
      size: 'large',
      bio: 'Friendly and energetic golden retriever',
      photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
      ownerId: new mongoose.Types.ObjectId(),
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
      },
      createdAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Luna',
      species: 'cat',
      breed: 'Persian',
      age: 2,
      gender: 'female',
      size: 'medium',
      bio: 'Elegant Persian cat',
      photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
      ownerId: new mongoose.Types.ObjectId(),
      location: {
        type: 'Point',
        coordinates: [-122.4094, 37.7849],
      },
      createdAt: new Date(),
    },
  ]);
  
  console.log('✅ Test data seeded successfully');
}

export default globalSetup;
