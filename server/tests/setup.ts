/**
 * Test Setup and Configuration
 * Sets up test database, mock services, and utilities
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import logger from '../src/utils/logger';

let mongoServer: MongoMemoryServer;

// Setup before all tests
export const setupTestDB = async (): Promise<void> => {
  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);
    
    logger.info('Test database connected', { uri: mongoUri });
  } catch (error) {
    logger.error('Test database setup failed', { error });
    throw error;
  }
};

// Cleanup after all tests
export const teardownTestDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    await mongoServer.stop();
    
    logger.info('Test database disconnected');
  } catch (error) {
    logger.error('Test database teardown failed', { error });
    throw error;
  }
};

// Clear all collections between tests
export const clearTestDB = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Mock user for testing
export const createMockUser = async () => {
  const User = mongoose.model('User');
  
  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'hashed_password',
    isActive: true,
    role: 'user',
  });

  return user;
};

// Generate valid JWT token for testing
export const generateTestToken = (userId: string): string =>
  jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

// Mock request helpers
export const mockAuthRequest = (userId: string) => ({
  user: { id: userId },
  headers: {
    authorization: `Bearer ${generateTestToken(userId)}`,
  },
});
