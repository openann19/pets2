// Database connection with optimized indexes
import mongoose from 'mongoose';
import { logger } from './src/utils/logger.js';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL ||
      'mongodb://localhost:27017/pawfectmatch';

    const conn = await mongoose.connect(mongoURI, {
      // Modern MongoDB connection options (Mongoose 8 defaults used)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Create optimized database indexes
    const { createIndexes } = await import('./src/utils/databaseIndexes.js');
    await createIndexes();
    logger.info('📊 Database indexes created successfully');

  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export { connectDB };
