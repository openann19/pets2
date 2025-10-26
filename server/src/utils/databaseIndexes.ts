/**
 * Database Indexes for Optimized Performance
 * Creates indexes for all frequently queried fields to eliminate N+1 queries
 */

import { Model } from 'mongoose';
import logger from './logger';

// Import models (these will be properly typed in Phase 2)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let User: Model<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Pet: Model<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Match: Model<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Message: Model<any> | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AuditLog: Model<any> | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  User = require('../models/User');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Pet = require('../models/Pet');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Match = require('../models/Match');
} catch (error) {
  logger.warn('Models not available for index management', {
    error: (error as Error).message
  });
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Message = require('../models/Message');
} catch (error) {
  logger.warn('Optional Message model not available for index management', {
    error: (error as Error).message
  });
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AuditLog = require('../models/AdminActivityLog');
} catch (error) {
  logger.warn('Optional AdminActivityLog model not available for index management', {
    error: (error as Error).message
  });
}

export const createIndexes = async (): Promise<void> => {
  try {
    logger.info('Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ status: 1 });
    await User.collection.createIndex({ isVerified: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ 'firstName': 'text', 'lastName': 'text', 'email': 'text' });
    await User.collection.createIndex({ 'location.coordinates': '2dsphere' });

    // Pet indexes
    await Pet.collection.createIndex({ owner: 1 });
    await Pet.collection.createIndex({ species: 1 });
    await Pet.collection.createIndex({ createdAt: -1 });

    // Match indexes
    await Match.collection.createIndex({ user1: 1 });
    await Match.collection.createIndex({ user2: 1 });
    await Match.collection.createIndex({ pet1: 1 });
    await Match.collection.createIndex({ pet2: 1 });
    await Match.collection.createIndex({ status: 1 });
    await Match.collection.createIndex({ isBlocked: 1 });
    await Match.collection.createIndex({ createdAt: -1 });
    await Match.collection.createIndex({ user1: 1, user2: 1 });
    await Match.collection.createIndex({ pet1: 1, pet2: 1 });

    // Message indexes (critical for chat performance)
    if (Message && Message.collection) {
      await Message.collection.createIndex({ matchId: 1 });
      await Message.collection.createIndex({ sender: 1 });
      await Message.collection.createIndex({ receiver: 1 });
      await Message.collection.createIndex({ createdAt: -1 });
      await Message.collection.createIndex({ matchId: 1, createdAt: -1 });
    }

    // AuditLog indexes
    if (AuditLog && AuditLog.collection) {
      await AuditLog.collection.createIndex({ adminId: 1 });
      await AuditLog.collection.createIndex({ userId: 1 });
      await AuditLog.collection.createIndex({ action: 1 });
      await AuditLog.collection.createIndex({ resourceType: 1 });
      await AuditLog.collection.createIndex({ createdAt: -1 });
      await AuditLog.collection.createIndex({ adminId: 1, createdAt: -1 });
      await AuditLog.collection.createIndex({ userId: 1, createdAt: -1 });
    }

    // Compound indexes for complex queries
    await User.collection.createIndex({ role: 1, status: 1 });
    await User.collection.createIndex({ isVerified: 1, createdAt: -1 });
    await Match.collection.createIndex({ status: 1, createdAt: -1 });
    if (Message && Message.collection) {
      await Message.collection.createIndex({ matchId: 1, read: 1, createdAt: -1 });
    }

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Error creating database indexes:', error);
    throw error;
  }
};

export const dropIndexes = async (): Promise<void> => {
  try {
    logger.info('Dropping database indexes...');

    const collections = [User, Pet, Match, Message, AuditLog].filter((m): m is NonNullable<typeof m> => Boolean(m));

    for (const Model of collections) {
      const indexes = await Model.collection.indexes();
      for (const index of indexes) {
        if (index.name && index.name !== '_id_') { // Keep the default _id index
          await Model.collection.dropIndex(index.name);
        }
      }
    }

    logger.info('Database indexes dropped successfully');
  } catch (error) {
    logger.error('Error dropping database indexes:', error);
    throw error;
  }
};

export const getIndexStats = async (): Promise<Record<string, number>> => {
  try {
    const stats: Record<string, number> = {};

    const collections = [
      { model: User, name: 'users' },
      { model: Pet, name: 'pets' },
      { model: Match, name: 'matches' },
      Message && { model: Message, name: 'messages' },
      AuditLog && { model: AuditLog, name: 'auditlogs' }
    ].filter(Boolean) as Array<{ model: Model<unknown>; name: string }>;

    for (const { model, name } of collections) {
      const indexes = await model.collection.indexes();
      stats[name] = indexes.length;
    }

    return stats;
  } catch (error) {
    logger.error('Error getting index stats:', error);
    throw error;
  }
};

