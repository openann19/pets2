/**
 * Database Indexes for Optimized Performance
 * Creates indexes for all frequently queried fields to eliminate N+1 queries
 */

import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import Reel from '../models/Reel';
import Template from '../models/Template';
import Track from '../models/Track';
import Clip from '../models/Clip';
import ShareEvent from '../models/ShareEvent';
import ModerationFlag from '../models/ModerationFlag';
import logger from './logger';

let Message: any;
try {
  Message = require('../models/Message');
} catch (error: any) {
  logger.warn('Optional Message model not available for index management', {
    error: error.message
  });
}

let AuditLog: any;
try {
  AuditLog = require('../models/AdminActivityLog');
} catch (error: any) {
  logger.warn('Optional AdminActivityLog model not available for index management', {
    error: error.message
  });
}

export const createIndexes = async (): Promise<void> => {
  try {
    logger.info('Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ status: 1 });
    await User.collection.createIndex({ isEmailVerified: 1 });
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

    // Reel indexes
    await Reel.collection.createIndex({ ownerId: 1, createdAt: -1 });
    await Reel.collection.createIndex({ status: 1, createdAt: -1 });
    await Reel.collection.createIndex({ remixOfId: 1 });
    await Reel.collection.createIndex({ templateId: 1 });

    // Template indexes
    await Template.collection.createIndex({ isActive: 1, theme: 1 });
    await Template.collection.createIndex({ name: 1 });

    // Track indexes
    await Track.collection.createIndex({ isActive: 1, genre: 1, mood: 1 });
    await Track.collection.createIndex({ licenseExpiry: 1 });
    await Track.collection.createIndex({ title: 1 });
    await Track.collection.createIndex({ licenseId: 1 }, { unique: true });

    // Clip indexes
    await Clip.collection.createIndex({ reelId: 1, order: 1 });

    // ShareEvent indexes
    await ShareEvent.collection.createIndex({ reelId: 1, createdAt: -1 });
    await ShareEvent.collection.createIndex({ channel: 1, createdAt: -1 });
    await ShareEvent.collection.createIndex({ referrerUserId: 1 });

    // ModerationFlag indexes
    await ModerationFlag.collection.createIndex({ reelId: 1, status: 1 });
    await ModerationFlag.collection.createIndex({ kind: 1, status: 1 });
    await ModerationFlag.collection.createIndex({ status: 1, createdAt: -1 });

    // Compound indexes for complex queries
    await User.collection.createIndex({ role: 1, status: 1 });
    await User.collection.createIndex({ isEmailVerified: 1, createdAt: -1 });
    await Match.collection.createIndex({ status: 1, createdAt: -1 });
    if (Message && Message.collection) {
      await Message.collection.createIndex({ matchId: 1, read: 1, createdAt: -1 });
    }

    logger.info('Database indexes created successfully');
  } catch (error: any) {
    logger.error('Error creating database indexes:', error);
    throw error;
  }
};

export const dropIndexes = async (): Promise<void> => {
  try {
    logger.info('Dropping database indexes...');

    const collections = [User, Pet, Match, Message, AuditLog, Reel, Template, Track, Clip, ShareEvent, ModerationFlag].filter(Boolean);

    for (const Model of collections) {
      const indexes = await Model.collection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_') { // Keep the default _id index
          await Model.collection.dropIndex(index.name);
        }
      }
    }

    logger.info('Database indexes dropped successfully');
  } catch (error: any) {
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
      AuditLog && { model: AuditLog, name: 'auditlogs' },
      { model: Reel, name: 'reels' },
      { model: Template, name: 'templates' },
      { model: Track, name: 'tracks' },
      { model: Clip, name: 'clips' },
      { model: ShareEvent, name: 'shareevents' },
      { model: ModerationFlag, name: 'moderationflags' }
    ].filter(Boolean) as Array<{ model: any; name: string }>;

    for (const { model, name } of collections) {
      const indexes = await model.collection.indexes();
      stats[name] = indexes.length;
    }

    return stats;
  } catch (error: any) {
    logger.error('Error getting index stats:', error);
    throw error;
  }
};
