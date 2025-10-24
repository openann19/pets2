#!/usr/bin/env node

/**
 * Test Data Seeder for E2E Tests
 * Creates comprehensive test data for all E2E test scenarios
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import models (assuming they exist)
const User = require('../server/src/models/User');
const Pet = require('../server/src/models/Pet');
const Match = require('../server/src/models/Match');
const Message = require('../server/src/models/Message');
const Subscription = require('../server/src/models/Subscription');
const PremiumUsage = require('../server/src/models/PremiumUsage');

class TestDataSeeder {
  constructor() {
    this.testUsers = [];
    this.testPets = [];
    this.testMatches = [];
    this.testMessages = [];
    this.testSubscriptions = [];
  }

  async connect() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch_test';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing test data...');
    await Promise.all([
      User.deleteMany({}),
      Pet.deleteMany({}),
      Match.deleteMany({}),
      Message.deleteMany({}),
      Subscription.deleteMany({}),
      PremiumUsage.deleteMany({})
    ]);
    console.log('✅ Database cleared');
  }

  async seedUsers() {
    console.log('👥 Seeding test users...');
    
    const users = [
      {
        email: 'testuser1@pawfectmatch.com',
        password: await bcrypt.hash('TestPassword123!', 12),
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        isEmailVerified: true,
        profile: {
          bio: 'Love animals and outdoor activities',
          location: {
            city: 'San Francisco',
            state: 'CA',
            coordinates: { latitude: 37.7749, longitude: -122.4194 }
          },
          preferences: {
            species: ['dog', 'cat'],
            ageRange: { min: 1, max: 10 },
            gender: ['male', 'female'],
            size: ['small', 'medium', 'large']
          }
        }
      },
      {
        email: 'testuser2@pawfectmatch.com',
        password: await bcrypt.hash('TestPassword123!', 12),
        firstName: 'Match',
        lastName: 'User',
        dateOfBirth: new Date('1985-05-15'),
        isEmailVerified: true,
        profile: {
          bio: 'Dog lover and fitness enthusiast',
          location: {
            city: 'San Francisco',
            state: 'CA',
            coordinates: { latitude: 37.7849, longitude: -122.4094 }
          },
          preferences: {
            species: ['dog'],
            ageRange: { min: 2, max: 8 },
            gender: ['male'],
            size: ['medium', 'large']
          }
        }
      },
      {
        email: 'premiumuser@pawfectmatch.com',
        password: await bcrypt.hash('PremiumPassword123!', 12),
        firstName: 'Premium',
        lastName: 'User',
        dateOfBirth: new Date('1988-03-20'),
        isEmailVerified: true,
        isPremium: true,
        profile: {
          bio: 'Premium member with advanced features',
          location: {
            city: 'San Francisco',
            state: 'CA',
            coordinates: { latitude: 37.7649, longitude: -122.4294 }
          },
          preferences: {
            species: ['dog', 'cat', 'bird'],
            ageRange: { min: 1, max: 15 },
            gender: ['male', 'female'],
            size: ['small', 'medium', 'large']
          }
        }
      },
      {
        email: 'chatuser@pawfectmatch.com',
        password: await bcrypt.hash('ChatPassword123!', 12),
        firstName: 'Chat',
        lastName: 'User',
        dateOfBirth: new Date('1992-07-10'),
        isEmailVerified: true,
        profile: {
          bio: 'Active in pet community',
          location: {
            city: 'San Francisco',
            state: 'CA',
            coordinates: { latitude: 37.7549, longitude: -122.4394 }
          },
          preferences: {
            species: ['cat'],
            ageRange: { min: 1, max: 5 },
            gender: ['female'],
            size: ['small', 'medium']
          }
        }
      },
      {
        email: 'videouser@pawfectmatch.com',
        password: await bcrypt.hash('VideoPassword123!', 12),
        firstName: 'Video',
        lastName: 'User',
        dateOfBirth: new Date('1995-11-25'),
        isEmailVerified: true,
        isPremium: true,
        profile: {
          bio: 'Pet photographer and video enthusiast',
          location: {
            city: 'San Francisco',
            state: 'CA',
            coordinates: { latitude: 37.7449, longitude: -122.4494 }
          },
          preferences: {
            species: ['dog', 'cat'],
            ageRange: { min: 1, max: 12 },
            gender: ['male', 'female'],
            size: ['small', 'medium', 'large']
          }
        }
      }
    ];

    this.testUsers = await User.insertMany(users);
    console.log(`✅ Created ${this.testUsers.length} test users`);
  }

  async seedPets() {
    console.log('🐕 Seeding test pets...');
    
    const pets = [
      {
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        size: 'large',
        description: 'Friendly and energetic dog who loves playing fetch',
        temperament: ['friendly', 'energetic', 'playful'],
        vaccinated: true,
        neutered: true,
        ownerId: this.testUsers[0]._id,
        location: {
          city: 'San Francisco',
          state: 'CA',
          coordinates: { latitude: 37.7749, longitude: -122.4194 }
        },
        photos: [
          { url: 'https://example.com/buddy1.jpg', isPrimary: true },
          { url: 'https://example.com/buddy2.jpg', isPrimary: false }
        ],
        preferences: {
          species: ['dog', 'cat'],
          ageRange: { min: 1, max: 8 },
          gender: ['male', 'female'],
          size: ['medium', 'large']
        }
      },
      {
        name: 'Max',
        species: 'dog',
        breed: 'Labrador',
        age: 2,
        gender: 'male',
        size: 'medium',
        description: 'Playful and loyal companion',
        temperament: ['playful', 'loyal', 'intelligent'],
        vaccinated: true,
        neutered: false,
        ownerId: this.testUsers[1]._id,
        location: {
          city: 'San Francisco',
          state: 'CA',
          coordinates: { latitude: 37.7849, longitude: -122.4094 }
        },
        photos: [
          { url: 'https://example.com/max1.jpg', isPrimary: true },
          { url: 'https://example.com/max2.jpg', isPrimary: false }
        ],
        preferences: {
          species: ['dog'],
          ageRange: { min: 2, max: 6 },
          gender: ['male'],
          size: ['medium', 'large']
        }
      },
      {
        name: 'Luna',
        species: 'cat',
        breed: 'Persian',
        age: 1,
        gender: 'female',
        size: 'small',
        description: 'Calm and cuddly cat who loves attention',
        temperament: ['calm', 'affectionate', 'gentle'],
        vaccinated: true,
        neutered: true,
        ownerId: this.testUsers[0]._id,
        location: {
          city: 'San Francisco',
          state: 'CA',
          coordinates: { latitude: 37.7749, longitude: -122.4194 }
        },
        photos: [
          { url: 'https://example.com/luna1.jpg', isPrimary: true },
          { url: 'https://example.com/luna2.jpg', isPrimary: false }
        ],
        preferences: {
          species: ['cat'],
          ageRange: { min: 1, max: 4 },
          gender: ['male', 'female'],
          size: ['small', 'medium']
        }
      },
      {
        name: 'Rocky',
        species: 'dog',
        breed: 'German Shepherd',
        age: 4,
        gender: 'male',
        size: 'large',
        description: 'Protective and intelligent working dog',
        temperament: ['protective', 'intelligent', 'loyal'],
        vaccinated: true,
        neutered: true,
        ownerId: this.testUsers[2]._id,
        location: {
          city: 'San Francisco',
          state: 'CA',
          coordinates: { latitude: 37.7649, longitude: -122.4294 }
        },
        photos: [
          { url: 'https://example.com/rocky1.jpg', isPrimary: true },
          { url: 'https://example.com/rocky2.jpg', isPrimary: false }
        ],
        preferences: {
          species: ['dog'],
          ageRange: { min: 2, max: 8 },
          gender: ['male', 'female'],
          size: ['large']
        }
      },
      {
        name: 'Whiskers',
        species: 'cat',
        breed: 'Siamese',
        age: 2,
        gender: 'female',
        size: 'small',
        description: 'Vocal and social cat who loves company',
        temperament: ['vocal', 'social', 'curious'],
        vaccinated: true,
        neutered: true,
        ownerId: this.testUsers[3]._id,
        location: {
          city: 'San Francisco',
          state: 'CA',
          coordinates: { latitude: 37.7549, longitude: -122.4394 }
        },
        photos: [
          { url: 'https://example.com/whiskers1.jpg', isPrimary: true },
          { url: 'https://example.com/whiskers2.jpg', isPrimary: false }
        ],
        preferences: {
          species: ['cat'],
          ageRange: { min: 1, max: 5 },
          gender: ['male', 'female'],
          size: ['small', 'medium']
        }
      },
      {
        name: 'Charlie',
        species: 'dog',
        breed: 'Beagle',
        age: 5,
        gender: 'male',
        size: 'medium',
        description: 'Curious and friendly scent hound',
        temperament: ['curious', 'friendly', 'energetic'],
        vaccinated: true,
        neutered: true,
        ownerId: this.testUsers[4]._id,
        location: {
          city: 'San Francisco',
          state: 'CA',
          coordinates: { latitude: 37.7449, longitude: -122.4494 }
        },
        photos: [
          { url: 'https://example.com/charlie1.jpg', isPrimary: true },
          { url: 'https://example.com/charlie2.jpg', isPrimary: false }
        ],
        preferences: {
          species: ['dog'],
          ageRange: { min: 2, max: 10 },
          gender: ['male', 'female'],
          size: ['medium', 'large']
        }
      }
    ];

    this.testPets = await Pet.insertMany(pets);
    console.log(`✅ Created ${this.testPets.length} test pets`);
  }

  async seedMatches() {
    console.log('💕 Seeding test matches...');
    
    const matches = [
      {
        users: [this.testUsers[0]._id, this.testUsers[1]._id],
        pets: [this.testPets[0]._id, this.testPets[1]._id],
        createdAt: new Date('2024-01-01T12:00:00Z'),
        status: 'active',
        lastMessageAt: new Date('2024-01-01T12:30:00Z')
      },
      {
        users: [this.testUsers[2]._id, this.testUsers[3]._id],
        pets: [this.testPets[3]._id, this.testPets[4]._id],
        createdAt: new Date('2024-01-02T14:00:00Z'),
        status: 'active',
        lastMessageAt: new Date('2024-01-02T15:00:00Z')
      },
      {
        users: [this.testUsers[0]._id, this.testUsers[3]._id],
        pets: [this.testPets[2]._id, this.testPets[4]._id],
        createdAt: new Date('2024-01-03T10:00:00Z'),
        status: 'active',
        lastMessageAt: new Date('2024-01-03T11:00:00Z')
      }
    ];

    this.testMatches = await Match.insertMany(matches);
    console.log(`✅ Created ${this.testMatches.length} test matches`);
  }

  async seedMessages() {
    console.log('💬 Seeding test messages...');
    
    const messages = [
      {
        matchId: this.testMatches[0]._id,
        senderId: this.testUsers[1]._id,
        content: 'Hi there! Your dog Buddy looks amazing!',
        timestamp: new Date('2024-01-01T12:30:00Z'),
        type: 'text',
        status: 'delivered'
      },
      {
        matchId: this.testMatches[0]._id,
        senderId: this.testUsers[0]._id,
        content: 'Thank you! Max looks wonderful too!',
        timestamp: new Date('2024-01-01T12:35:00Z'),
        type: 'text',
        status: 'delivered'
      },
      {
        matchId: this.testMatches[0]._id,
        senderId: this.testUsers[1]._id,
        content: 'Would you like to arrange a playdate?',
        timestamp: new Date('2024-01-01T12:40:00Z'),
        type: 'text',
        status: 'delivered'
      },
      {
        matchId: this.testMatches[1]._id,
        senderId: this.testUsers[2]._id,
        content: 'Hello! Rocky is such a handsome dog!',
        timestamp: new Date('2024-01-02T15:00:00Z'),
        type: 'text',
        status: 'delivered'
      },
      {
        matchId: this.testMatches[1]._id,
        senderId: this.testUsers[3]._id,
        content: 'Thanks! Whiskers is quite the character!',
        timestamp: new Date('2024-01-02T15:05:00Z'),
        type: 'text',
        status: 'delivered'
      },
      {
        matchId: this.testMatches[2]._id,
        senderId: this.testUsers[0]._id,
        content: 'Luna is adorable!',
        timestamp: new Date('2024-01-03T11:00:00Z'),
        type: 'text',
        status: 'delivered'
      }
    ];

    this.testMessages = await Message.insertMany(messages);
    console.log(`✅ Created ${this.testMessages.length} test messages`);
  }

  async seedSubscriptions() {
    console.log('💎 Seeding test subscriptions...');
    
    const subscriptions = [
      {
        userId: this.testUsers[2]._id,
        stripeSubscriptionId: 'sub_test_premium',
        status: 'active',
        plan: 'premium',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: this.testUsers[4]._id,
        stripeSubscriptionId: 'sub_test_video',
        status: 'active',
        plan: 'elite',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.testSubscriptions = await Subscription.insertMany(subscriptions);
    console.log(`✅ Created ${this.testSubscriptions.length} test subscriptions`);
  }

  async seedPremiumUsage() {
    console.log('📊 Seeding test premium usage...');
    
    const premiumUsage = [
      {
        userId: this.testUsers[2]._id,
        superLikesUsed: 2,
        superLikesRemaining: 3,
        boostsUsed: 1,
        boostsRemaining: 4,
        lastReset: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: this.testUsers[4]._id,
        superLikesUsed: 0,
        superLikesRemaining: 5,
        boostsUsed: 0,
        boostsRemaining: 5,
        lastReset: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await PremiumUsage.insertMany(premiumUsage);
    console.log(`✅ Created ${premiumUsage.length} test premium usage records`);
  }

  async generateTestTokens() {
    console.log('🔑 Generating test tokens...');
    
    const tokens = {};
    
    for (const user of this.testUsers) {
      const accessToken = jwt.sign(
        { userId: user._id, type: 'access' },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '1h' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id, type: 'refresh' },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '7d' }
      );
      
      tokens[user.email] = {
        accessToken,
        refreshToken,
        userId: user._id
      };
    }
    
    // Save tokens to file for E2E tests to use
    const fs = require('fs');
    fs.writeFileSync(
      'test-tokens.json',
      JSON.stringify(tokens, null, 2)
    );
    
    console.log('✅ Test tokens generated and saved to test-tokens.json');
  }

  async seedAll() {
    try {
      await this.connect();
      await this.clearDatabase();
      
      await this.seedUsers();
      await this.seedPets();
      await this.seedMatches();
      await this.seedMessages();
      await this.seedSubscriptions();
      await this.seedPremiumUsage();
      await this.generateTestTokens();
      
      console.log('\n🎉 Test data seeding completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   Users: ${this.testUsers.length}`);
      console.log(`   Pets: ${this.testPets.length}`);
      console.log(`   Matches: ${this.testMatches.length}`);
      console.log(`   Messages: ${this.testMessages.length}`);
      console.log(`   Subscriptions: ${this.testSubscriptions.length}`);
      
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new TestDataSeeder();
  seeder.seedAll().catch(console.error);
}

module.exports = TestDataSeeder;
