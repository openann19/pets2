// Database connection with optimized indexes
const _connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL ||
      'mongodb://localhost:27017/pawfectmatch';

    const conn = await mongoose.connect(mongoURI, {
      // Modern MongoDB connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });

    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Create optimized database indexes
    const { createIndexes } = require('./src/utils/databaseIndexes');
    await createIndexes();
    logger.info('📊 Database indexes created successfully');

  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
