import { logger } from '@pawfectmatch/core';
import { Db, MongoClient } from 'mongodb';
// Use bracket access to satisfy exactOptionalPropertyTypes and index signature rules
const MONGO_URI = process.env['MONGO_URI'];
const DB_NAME = process.env['DB_NAME'];
let client = null;
let dbInstance = null;
export async function connectToDB() {
    if (client && dbInstance) {
        return {
            client,
            db: dbInstance,
            users: dbInstance.collection('users'),
            pets: dbInstance.collection('pets'),
            matches: dbInstance.collection('matches'),
            messages: dbInstance.collection('messages'),
            accountActions: dbInstance.collection('accountActions'),
            dataExports: dbInstance.collection('dataExports'),
        };
    }
    try {
        client = new MongoClient(MONGO_URI, { monitorCommands: true });
        await client.connect();
        logger.info('Connected to MongoDB');
        dbInstance = client.db(DB_NAME);
        return {
            client,
            db: dbInstance,
            users: dbInstance.collection('users'),
            pets: dbInstance.collection('pets'),
            matches: dbInstance.collection('matches'),
            messages: dbInstance.collection('messages'),
            accountActions: dbInstance.collection('accountActions'),
            dataExports: dbInstance.collection('dataExports'),
        };
    }
    catch (error) {
        logger.error('MongoDB connection error:', { error });
        throw new Error('Failed to connect to database');
    }
}
export async function closeDbConnection() {
    if (client) {
        await client.close();
        logger.info('MongoDB connection closed');
        client = null;
        dbInstance = null;
    }
}
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${prefix}${timestamp}${random}`;
}
//# sourceMappingURL=db.js.map