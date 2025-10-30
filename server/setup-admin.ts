/**
 * Admin Panel Setup Script
 * Run from server directory: node setup-admin.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import logger from './src/utils/logger.js';

async function setupAdmin(): Promise<void> {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch';
    await mongoose.connect(mongoUri);
    logger.info('✅ Connected to MongoDB');

    const User = (await import('./src/models/User.js')).default;

    // 1. Add role field to all existing users
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    logger.info(`✅ Updated ${result.modifiedCount} users with default 'user' role`);

    // 2. Create admin users for testing
    const adminUsers = [
      {
        email: 'admin@pawfectmatch.com',
        password: 'Admin123!',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'administrator',
        dateOfBirth: new Date('1990-01-01'),
        status: 'active'
      },
      {
        email: 'moderator@pawfectmatch.com',
        password: 'Moderator123!',
        firstName: 'Mod',
        lastName: 'User',
        role: 'moderator',
        dateOfBirth: new Date('1992-01-01'),
        status: 'active'
      },
      {
        email: 'support@pawfectmatch.com',
        password: 'Support123!',
        firstName: 'Support',
        lastName: 'Agent',
        role: 'support',
        dateOfBirth: new Date('1993-01-01'),
        status: 'active'
      },
      {
        email: 'analyst@pawfectmatch.com',
        password: 'Analyst123!',
        firstName: 'Data',
        lastName: 'Analyst',
        role: 'analyst',
        dateOfBirth: new Date('1994-01-01'),
        status: 'active'
      },
      {
        email: 'billing@pawfectmatch.com',
        password: 'Billing123!',
        firstName: 'Billing',
        lastName: 'Admin',
        role: 'billing_admin',
        dateOfBirth: new Date('1995-01-01'),
        status: 'active'
      }
    ];

    for (const adminData of adminUsers) {
      const existing = await User.findOne({ email: adminData.email });

      if (existing) {
        await User.updateOne(
          { email: adminData.email },
          { $set: { role: adminData.role, status: 'active' } }
        );
        logger.info(`✅ Updated: ${adminData.email} → ${adminData.role}`);
      } else {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await User.create({
          ...adminData,
          password: hashedPassword,
          isEmailVerified: true
        });
        logger.info(`✅ Created: ${adminData.email} → ${adminData.role}`);
      }
    }

    logger.info('\n🎉 Admin setup complete!\n');
    logger.info('📋 Admin Accounts:');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('Role            │ Email                        │ Password');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('Administrator   │ admin@pawfectmatch.com       │ Admin123!');
    logger.info('Moderator       │ moderator@pawfectmatch.com   │ Moderator123!');
    logger.info('Support         │ support@pawfectmatch.com     │ Support123!');
    logger.info('Analyst         │ analyst@pawfectmatch.com     │ Analyst123!');
    logger.info('Billing Admin   │ billing@pawfectmatch.com     │ Billing123!');
    logger.info('═══════════════════════════════════════════════════════════\n');

    logger.info('🚀 Next Steps:');
    logger.info('1. npm start                    (Start backend)');
    logger.info('2. cd ../apps/web && npm run dev (Start frontend)');
    logger.info('3. Login with any account above');
    logger.info('4. Go to http://localhost:3000/admin\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    logger.error('❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

setupAdmin();
