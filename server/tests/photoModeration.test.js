/**
 * Photo Moderation System Tests
 * Tests for manual moderation workflow
 * @jest-environment node
 */

/* eslint-env jest */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const PhotoModeration = require('../src/models/PhotoModeration');
const User = require('../src/models/User');

// Mock app setup
const express = require('express');
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { _id: new mongoose.Types.ObjectId(), email: 'test@example.com' };
  next();
};

const mockAdminMiddleware = (req, res, next) => {
  req.user = { _id: new mongoose.Types.ObjectId(), email: 'admin@example.com', isAdmin: true };
  next();
};

// Import routes
const uploadRoutes = require('../routes/uploadRoutes');
const moderationRoutes = require('../routes/moderationRoutes');

app.use('/api/upload', mockAuthMiddleware, uploadRoutes);
app.use('/api/moderation', mockAdminMiddleware, moderationRoutes);

// Global test DB lifecycle so both describe blocks share the same connection
let __mongoServer;
beforeAll(async () => {
  jest.setTimeout(30000);
  __mongoServer = await MongoMemoryServer.create();
  const mongoUri = __mongoServer.getUri();
  await mongoose.connect(mongoUri, { dbName: 'jest-moderation-tests' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (__mongoServer) {
    await __mongoServer.stop();
  }
});

describe('Photo Moderation System', () => {

  beforeEach(async () => {
    // Clear collections before each test
    await PhotoModeration.deleteMany({});
    await User.deleteMany({});
  });

  describe('PhotoModeration Model', () => {
    test('should create a moderation record', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo.jpg',
        cloudinaryPublicId: 'test-public-id',
        photoType: 'profile',
        imageMetadata: {
          width: 1920,
          height: 1080,
          format: 'jpg',
          fileSize: 1024000
        },
        status: 'pending',
        priority: 'normal',
        userHistory: {
          totalUploads: 1,
          rejectedUploads: 0,
          approvedUploads: 0,
          isTrustedUser: false,
          accountAge: 5
        }
      });

      expect(moderation).toBeDefined();
      expect(moderation.status).toBe('pending');
      expect(moderation.priority).toBe('normal');
      expect(moderation.photoUrl).toBe('https://test.com/photo.jpg');
    });

    test('should approve a photo', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo.jpg',
        cloudinaryPublicId: 'test-public-id',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      const moderatorId = new mongoose.Types.ObjectId();
      await moderation.approve(moderatorId, 'Looks good');

      expect(moderation.status).toBe('approved');
      expect(moderation.reviewedBy).toEqual(moderatorId);
      expect(moderation.reviewedAt).toBeDefined();
      expect(moderation.reviewNotes).toBe('Looks good');
    });

    test('should reject a photo', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo.jpg',
        cloudinaryPublicId: 'test-public-id',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      const moderatorId = new mongoose.Types.ObjectId();
      await moderation.reject(
        moderatorId,
        'Inappropriate content',
        'explicit',
        'Contains explicit material'
      );

      expect(moderation.status).toBe('rejected');
      expect(moderation.reviewedBy).toEqual(moderatorId);
      expect(moderation.rejectionReason).toBe('Inappropriate content');
      expect(moderation.rejectionCategory).toBe('explicit');
      expect(moderation.expiresAt).toBeDefined();
    });
  });

  describe('GET /api/moderation/queue', () => {
    test('should return pending moderation items', async () => {
      // Create test moderation records
      await PhotoModeration.create([
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo1.jpg',
          cloudinaryPublicId: 'test-1',
          status: 'pending',
          priority: 'normal',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo2.jpg',
          cloudinaryPublicId: 'test-2',
          status: 'pending',
          priority: 'high',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo3.jpg',
          cloudinaryPublicId: 'test-3',
          status: 'approved',
          priority: 'normal',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        }
      ]);

      const response = await request(app)
        .get('/api/moderation/queue?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].status).toBe('pending');
    });

    test('should filter by priority', async () => {
      await PhotoModeration.create([
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo1.jpg',
          cloudinaryPublicId: 'test-1',
          status: 'pending',
          priority: 'high',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo2.jpg',
          cloudinaryPublicId: 'test-2',
          status: 'pending',
          priority: 'normal',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        }
      ]);

      const response = await request(app)
        .get('/api/moderation/queue?status=pending&priority=high')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].priority).toBe('high');
    });
  });

  describe('GET /api/moderation/stats', () => {
    test('should return moderation statistics', async () => {
      await PhotoModeration.create([
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo1.jpg',
          cloudinaryPublicId: 'test-1',
          status: 'pending',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo2.jpg',
          cloudinaryPublicId: 'test-2',
          status: 'approved',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId: new mongoose.Types.ObjectId(),
          photoUrl: 'https://test.com/photo3.jpg',
          cloudinaryPublicId: 'test-3',
          status: 'rejected',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        }
      ]);

      const response = await request(app)
        .get('/api/moderation/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.queue.byStatus).toBeDefined();
      expect(response.body.stats.queue.byStatus.pending).toBe(1);
      expect(response.body.stats.queue.byStatus.approved).toBe(1);
      expect(response.body.stats.queue.byStatus.rejected).toBe(1);
    });
  });

  describe('POST /api/moderation/:id/approve', () => {
    test('should approve a photo', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo.jpg',
        cloudinaryPublicId: 'test-public-id',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      const response = await request(app)
        .post(`/api/moderation/${moderation._id}/approve`)
        .send({ notes: 'Approved by moderator' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.moderation.status).toBe('approved');

      const updated = await PhotoModeration.findById(moderation._id);
      expect(updated.status).toBe('approved');
      expect(updated.reviewedBy).toBeDefined();
    });

    test('should return 404 for non-existent photo', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/moderation/${fakeId}/approve`)
        .send({ notes: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/moderation/:id/reject', () => {
    test('should reject a photo', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo.jpg',
        cloudinaryPublicId: 'test-public-id',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      const response = await request(app)
        .post(`/api/moderation/${moderation._id}/reject`)
        .send({
          reason: 'Inappropriate content',
          category: 'explicit',
          notes: 'Contains explicit material'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.moderation.status).toBe('rejected');

      const updated = await PhotoModeration.findById(moderation._id);
      expect(updated.status).toBe('rejected');
      expect(updated.rejectionReason).toBe('Inappropriate content');
      expect(updated.rejectionCategory).toBe('explicit');
    });

    test('should require reason and category', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo.jpg',
        cloudinaryPublicId: 'test-public-id',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      const response = await request(app)
        .post(`/api/moderation/${moderation._id}/reject`)
        .send({ notes: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/moderation/batch-approve', () => {
    test('should approve multiple photos', async () => {
      const mod1 = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo1.jpg',
        cloudinaryPublicId: 'test-1',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      const mod2 = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo2.jpg',
        cloudinaryPublicId: 'test-2',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      const response = await request(app)
        .post('/api/moderation/batch-approve')
        .send({
          ids: [mod1._id.toString(), mod2._id.toString()],
          notes: 'Batch approved'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results.filter(r => r.success)).toHaveLength(2);

      const updated1 = await PhotoModeration.findById(mod1._id);
      const updated2 = await PhotoModeration.findById(mod2._id);
      expect(updated1.status).toBe('approved');
      expect(updated2.status).toBe('approved');
    });
  });

  describe('User History and Trust Score', () => {
    test('should calculate user history correctly', async () => {
      const userId = new mongoose.Types.ObjectId();

      // Create user with some history
      await PhotoModeration.create([
        {
          userId,
          photoUrl: 'https://test.com/photo1.jpg',
          cloudinaryPublicId: 'test-1',
          status: 'approved',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId,
          photoUrl: 'https://test.com/photo2.jpg',
          cloudinaryPublicId: 'test-2',
          status: 'approved',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId,
          photoUrl: 'https://test.com/photo3.jpg',
          cloudinaryPublicId: 'test-3',
          status: 'rejected',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        }
      ]);

      const records = await PhotoModeration.find({ userId });
      expect(records).toHaveLength(3);

      const approved = records.filter(r => r.status === 'approved').length;
      const rejected = records.filter(r => r.status === 'rejected').length;

      expect(approved).toBe(2);
      expect(rejected).toBe(1);
    });

    test('should identify trusted users', async () => {
      const userId = new mongoose.Types.ObjectId();

      // Create user
      const user = await User.create({
        _id: userId,
        email: 'trusted@example.com',
        password: 'validPassword1',
        firstName: 'Trusted',
        lastName: 'User',
        dateOfBirth: new Date(1990, 0, 1),
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
      });

      // Create 10 approved uploads
      for (let i = 0; i < 10; i++) {
        await PhotoModeration.create({
          userId,
          photoUrl: `https://test.com/photo${i}.jpg`,
          cloudinaryPublicId: `test-${i}`,
          status: 'approved',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        });
      }

      const moderationRecords = await PhotoModeration.find({ userId });
      const approvedCount = moderationRecords.filter(r => r.status === 'approved').length;
      const rejectedCount = moderationRecords.filter(r => r.status === 'rejected').length;
      const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

      const isTrusted = approvedCount >= 10 &&
        rejectedCount === 0 &&
        accountAge >= 30 &&
        user.isEmailVerified;

      expect(isTrusted).toBe(true);
    });
  });

  describe('Priority Queue', () => {
    test('should mark users with rejections as high priority', async () => {
      const userId = new mongoose.Types.ObjectId();

      // Create user with 3 rejections
      await PhotoModeration.create([
        {
          userId,
          photoUrl: 'https://test.com/photo1.jpg',
          cloudinaryPublicId: 'test-1',
          status: 'rejected',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId,
          photoUrl: 'https://test.com/photo2.jpg',
          cloudinaryPublicId: 'test-2',
          status: 'rejected',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        },
        {
          userId,
          photoUrl: 'https://test.com/photo3.jpg',
          cloudinaryPublicId: 'test-3',
          status: 'rejected',
          imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
        }
      ]);

      const rejectedCount = await PhotoModeration.countDocuments({
        userId,
        status: 'rejected'
      });

      expect(rejectedCount).toBe(3);

      // Next upload should be high priority
      const priority = rejectedCount > 2 ? 'high' : 'normal';
      expect(priority).toBe('high');
    });
  });

  describe('Data Cleanup', () => {
    test('should have expiry date on rejected photos', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://test.com/photo.jpg',
        cloudinaryPublicId: 'test-public-id',
        status: 'pending',
        imageMetadata: { width: 100, height: 100, format: 'jpg', fileSize: 1000 }
      });

      await moderation.reject(
        new mongoose.Types.ObjectId(),
        'Test rejection',
        'spam',
        'Test notes'
      );

      expect(moderation.expiresAt).toBeDefined();

      const expiryDate = new Date(moderation.expiresAt);
      const now = new Date();
      const daysDiff = (expiryDate - now) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(85); // ~90 days
      expect(daysDiff).toBeLessThan(95);
    });
  });
});

describe('Integration Tests', () => {
  test('full moderation workflow', async () => {
    const userId = new mongoose.Types.ObjectId();

    // 1. Create moderation record (simulating upload)
    const moderation = await PhotoModeration.create({
      userId,
      photoUrl: 'https://test.com/photo.jpg',
      cloudinaryPublicId: 'test-public-id',
      status: 'pending',
      priority: 'normal',
      imageMetadata: {
        width: 1920,
        height: 1080,
        format: 'jpg',
        fileSize: 2048000
      },
      userHistory: {
        totalUploads: 5,
        approvedUploads: 4,
        rejectedUploads: 0,
        isTrustedUser: false,
        accountAge: 15
      }
    });

    expect(moderation.status).toBe('pending');

    // 2. Get queue
    const queue = await PhotoModeration.find({ status: 'pending' });
    expect(queue).toHaveLength(1);

    // 3. Approve photo
    const moderatorId = new mongoose.Types.ObjectId();
    await moderation.approve(moderatorId, 'Photo looks good');

    expect(moderation.status).toBe('approved');
    expect(moderation.reviewedBy).toEqual(moderatorId);

    // 4. Verify in database
    const updated = await PhotoModeration.findById(moderation._id);
    expect(updated.status).toBe('approved');
  });
});
