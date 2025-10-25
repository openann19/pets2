/**
 * Enhanced Features 2025 Database Migration
 * Creates tables for biometric auth, leaderboard, and smart notifications
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const migration = {
  name: 'enhanced-features-2025',
  version: '1.0.0',
  description: 'Add biometric auth, leaderboard, and smart notifications support',
  
  async up() {
    logger.info('🚀 Running Enhanced Features 2025 migration...');
    
    try {
      // Create indexes for new collections
      await createIndexes();
      
      // Update existing User model to include notification preferences
      await updateUserModel();
      
      logger.info('✅ Enhanced Features 2025 migration completed successfully');
      
    } catch (error) {
      logger.error('❌ Migration failed:', { error: error.message });
      throw error;
    }
  },
  
  async down() {
    logger.info('🔄 Rolling back Enhanced Features 2025 migration...');
    
    try {
      // Drop the new collections
      await mongoose.connection.db.dropCollection('biometriccredentials');
      await mongoose.connection.db.dropCollection('leaderboardscores');
      await mongoose.connection.db.dropCollection('notificationpreferences');
      
      logger.info('✅ Rollback completed successfully');
      
    } catch (error) {
      logger.error('❌ Rollback failed:', { error: error.message });
      throw error;
    }
  }
};

async function createIndexes() {
  logger.info('📊 Creating indexes for enhanced features...');
  
  const db = mongoose.connection.db;
  
  // Biometric credentials indexes
  await db.collection('biometriccredentials').createIndexes([
    { key: { userId: 1 }, unique: true },
    { key: { credentialId: 1 }, unique: true },
    { key: { userId: 1, credentialId: 1 } },
    { key: { createdAt: -1 } }
  ]);
  
  // Leaderboard scores indexes
  await db.collection('leaderboardscores').createIndexes([
    { key: { userId: 1, category: 1, timeframe: 1 }, unique: true },
    { key: { category: 1, timeframe: 1, score: -1 } },
    { key: { category: 1, timeframe: 1, rank: 1 } },
    { key: { updatedAt: -1 } }
  ]);
  
  // Notification preferences indexes
  await db.collection('notificationpreferences').createIndexes([
    { key: { userId: 1 }, unique: true },
    { key: { enabled: 1 } },
    { key: { updatedAt: -1 } }
  ]);
  
  logger.info('✅ Indexes created successfully');
}

async function updateUserModel() {
  logger.info('👤 Updating User model for notification preferences...');
  
  const db = mongoose.connection.db;
  
  // Add notification preferences field to existing users
  await db.collection('users').updateMany(
    { notificationPreferences: { $exists: false } },
    {
      $set: {
        notificationPreferences: {
          enabled: true,
          matches: true,
          messages: true,
          likes: true,
          reminders: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          },
          frequency: 'instant',
          sound: true,
          vibration: true
        }
      }
    }
  );
  
  logger.info('✅ User model updated successfully');
}

module.exports = migration;
