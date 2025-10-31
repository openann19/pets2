/**
 * Admin Panel Setup Script
 * Run this to set up admin users and test the admin panel
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const User = require('../server/src/models/User');

    // 1. Add role field to all existing users
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    console.log(`✅ Updated ${result.modifiedCount} users with default 'user' role`);

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
      // Check if user already exists
      const existing = await User.findOne({ email: adminData.email });
      
      if (existing) {
        // Update existing user
        await User.updateOne(
          { email: adminData.email },
          { $set: { role: adminData.role, status: 'active' } }
        );
        console.log(`✅ Updated existing admin: ${adminData.email} (${adminData.role})`);
      } else {
        // Create new admin user
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await User.create({
          ...adminData,
          password: hashedPassword,
          isEmailVerified: true
        });
        console.log(`✅ Created new admin: ${adminData.email} (${adminData.role})`);
      }
    }

    console.log('\n🎉 Admin setup complete!\n');
    console.log('📋 Admin Accounts Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Role            | Email                        | Password');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Administrator   | admin@pawfectmatch.com       | Admin123!');
    console.log('Moderator       | moderator@pawfectmatch.com   | Moderator123!');
    console.log('Support         | support@pawfectmatch.com     | Support123!');
    console.log('Analyst         | analyst@pawfectmatch.com     | Analyst123!');
    console.log('Billing Admin   | billing@pawfectmatch.com     | Billing123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🚀 Next Steps:');
    console.log('1. Start the backend: cd server && npm start');
    console.log('2. Start the frontend: cd apps/web && npm run dev');
    console.log('3. Login with any admin account above');
    console.log('4. Navigate to /admin to access the admin panel\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
