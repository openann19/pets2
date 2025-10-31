/**
 * Seed Admin Accounts
 * Creates superadmin and other admin roles for testing
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS } from '../../packages/api/src/types/admin';

dotenv.config();

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'support', 'moderator', 'finance', 'analyst'], required: true },
  permissions: [{ type: String }],
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const admins = [
  {
    email: 'admin@pawfectmatch.com',
    password: 'Admin123!',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'superadmin' as const,
    permissions: ROLE_PERMISSIONS.superadmin,
  },
  {
    email: 'support@pawfectmatch.com',
    password: 'Support123!',
    firstName: 'Support',
    lastName: 'Agent',
    role: 'support' as const,
    permissions: ROLE_PERMISSIONS.support,
  },
  {
    email: 'moderator@pawfectmatch.com',
    password: 'Moderator123!',
    firstName: 'Content',
    lastName: 'Moderator',
    role: 'moderator' as const,
    permissions: ROLE_PERMISSIONS.moderator,
  },
  {
    email: 'finance@pawfectmatch.com',
    password: 'Finance123!',
    firstName: 'Finance',
    lastName: 'Manager',
    role: 'finance' as const,
    permissions: ROLE_PERMISSIONS.finance,
  },
  {
    email: 'analyst@pawfectmatch.com',
    password: 'Analyst123!',
    firstName: 'Data',
    lastName: 'Analyst',
    role: 'analyst' as const,
    permissions: ROLE_PERMISSIONS.analyst,
  },
];

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
    logger.info('✅ Connected to MongoDB');

    // Create admin accounts
    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        logger.info(`⚠️  Admin ${adminData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      const admin = new Admin({
        ...adminData,
        password: hashedPassword,
      });

      await admin.save();
      logger.info(`✅ Created admin: ${adminData.email} (role: ${adminData.role})`);
    }

    logger.info('\n🎉 Admin seeding completed!');
    logger.info('\n📋 Login Credentials:');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    admins.forEach(admin => {
      logger.info(`Email: ${admin.email} / Password: ${admin.password}`);
    });
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding admins:', { error });
    process.exit(1);
  }
}

seedAdmin();
