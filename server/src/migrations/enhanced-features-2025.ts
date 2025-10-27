/**
 * Enhanced Features 2025 Database Migration
 * Creates tables for biometric auth, leaderboard, and smart notifications
 */

import mongoose from 'mongoose';
const logger = require('../utils/logger');

interface MigrationResult {
  success: boolean;
  message: string;
  error?: string;
}

const migration = {
  name: 'enhanced-features-2025',
  version: '1.0.0',
  description: 'Add biometric auth, leaderboard, and smart notifications support',

  async up(): Promise<MigrationResult> {
    logger.info('🚀 Running Enhanced Features 2025 migration...');

    try {
      // Create indexes for new collections
      await createIndexes();

      // Update existing User model to include notification preferences
      await updateUserModel();

      logger.info('✅ Enhanced Features 2025 migration completed successfully');

      return {
        success: true,
        message: 'Enhanced Features 2025 migration completed successfully'
      };

    } catch (error) {
      logger.error('❌ Migration failed:', { error: (error as Error).message });
      throw error;
    }
  },

  async down(): Promise<MigrationResult> {
    logger.info('🔄 Rolling back Enhanced Features 2025 migration...');

    try {
      // Drop the new collections
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      await db.dropCollection('biometriccredentials').catch(() => {}); // Ignore if collection doesn't exist
      await db.dropCollection('leaderboardscores').catch(() => {});
      await db.dropCollection('notificationpreferences').catch(() => {});

      logger.info('✅ Rollback completed successfully');

      return {
        success: true,
        message: 'Rollback completed successfully'
      };

    } catch (error) {
      logger.error('❌ Rollback failed:', { error: (error as Error).message });
      throw error;
    }
  }
};

async function createIndexes(): Promise<void> {
  logger.info('Creating database indexes...');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  // Biometric credentials indexes
  await db.collection('biometriccredentials').createIndex(
    { userId: 1 },
    { name: 'biometric_user_idx', unique: true }
  );

  await db.collection('biometriccredentials').createIndex(
    { credentialId: 1 },
    { name: 'biometric_credential_idx', unique: true }
  );

  // Leaderboard scores indexes
  await db.collection('leaderboardscores').createIndex(
    { userId: 1, category: 1 },
    { name: 'leaderboard_user_category_idx', unique: true }
  );

  await db.collection('leaderboardscores').createIndex(
    { category: 1, score: -1 },
    { name: 'leaderboard_category_score_idx' }
  );

  await db.collection('leaderboardscores').createIndex(
    { lastUpdated: -1 },
    { name: 'leaderboard_last_updated_idx' }
  );

  // Notification preferences indexes
  await db.collection('notificationpreferences').createIndex(
    { userId: 1 },
    { name: 'notification_user_idx', unique: true }
  );

  // Enhanced user model indexes
  await db.collection('users').createIndex(
    { 'premium.boostUntil': 1 },
    { name: 'user_boost_until_idx', sparse: true }
  );

  await db.collection('users').createIndex(
    { 'premium.expiresAt': 1 },
    { name: 'user_premium_expires_idx', sparse: true }
  );

  logger.info('Database indexes created successfully');
}

async function updateUserModel(): Promise<void> {
  logger.info('Updating User model schema...');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  const collection = db.collection('users');

  // Add new fields to existing users if they don't exist
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: unknown };
      update: { $set?: Record<string, unknown> };
    };
  }> = [];

  // Find users that need updating
  const users = await collection.find({
    $or: [
      { notificationPreferences: { $exists: false } },
      { privacySettings: { $exists: false } },
      { biometricEnabled: { $exists: false } }
    ]
  }).toArray();

  for (const user of users) {
    const update: { $set?: Record<string, unknown> } = {};

    // Add default notification preferences
    if (!user.notificationPreferences) {
      update.$set = update.$set || {};
      update.$set.notificationPreferences = {
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
        vibration: true,
        lastUpdated: new Date()
      };
    }

    // Add default privacy settings
    if (!user.privacySettings) {
      update.$set = update.$set || {};
      update.$set.privacySettings = {
        profileVisibility: 'public',
        showOnlineStatus: true,
        showLastActive: true,
        allowMessaging: 'all',
        showPets: true,
        showLocation: true,
        allowPetDiscovery: true,
        dataSharing: false
      };
    }

    // Add biometric enabled flag
    if (user.biometricEnabled === undefined) {
      update.$set = update.$set || {};
      update.$set.biometricEnabled = false;
    }

    if (Object.keys(update).length > 0) {
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update
        }
      });
    }
  }

  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps);
    logger.info(`Updated ${bulkOps.length} user documents with new fields`);
  }

  logger.info('User model schema updated successfully');
}

export default migration;
