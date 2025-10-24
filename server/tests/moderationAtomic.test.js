/**
 * Atomic Moderation Operations Tests
 * Tests for race condition prevention
 */

const mongoose = require('mongoose');
const PhotoModeration = require('../models/PhotoModeration');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Atomic Moderation Operations', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await PhotoModeration.deleteMany({});
  });

  describe('Atomic Approve', () => {
    it('should approve photo atomically', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'pending',
        priority: 'normal',
        imageMetadata: {
          width: 800,
          height: 600,
          format: 'jpg',
          fileSize: 100000
        }
      });

      const moderatorId = new mongoose.Types.ObjectId();
      
      const result = await PhotoModeration.findOneAndUpdate(
        {
          _id: moderation._id,
          status: { $in: ['pending', 'under-review'] }
        },
        {
          $set: {
            status: 'approved',
            reviewedBy: moderatorId,
            reviewedAt: new Date()
          }
        },
        { new: true }
      );

      expect(result).toBeTruthy();
      expect(result.status).toBe('approved');
      expect(result.reviewedBy.toString()).toBe(moderatorId.toString());
      expect(result.reviewedAt).toBeDefined();
    });

    it('should prevent double approval (race condition)', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'pending',
        priority: 'normal',
        imageMetadata: {
          width: 800,
          height: 600,
          format: 'jpg',
          fileSize: 100000
        }
      });

      const moderator1 = new mongoose.Types.ObjectId();
      const moderator2 = new mongoose.Types.ObjectId();

      // Simulate two moderators trying to approve simultaneously
      const [result1, result2] = await Promise.all([
        PhotoModeration.findOneAndUpdate(
          { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
          { $set: { status: 'approved', reviewedBy: moderator1, reviewedAt: new Date() } },
          { new: true }
        ),
        PhotoModeration.findOneAndUpdate(
          { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
          { $set: { status: 'approved', reviewedBy: moderator2, reviewedAt: new Date() } },
          { new: true }
        )
      ]);

      // Only one should succeed
      const successCount = [result1, result2].filter(r => r !== null).length;
      expect(successCount).toBe(1);

      // Verify final state
      const final = await PhotoModeration.findById(moderation._id);
      expect(final.status).toBe('approved');
      expect([moderator1.toString(), moderator2.toString()]).toContain(
        final.reviewedBy.toString()
      );
    });

    it('should return null if already moderated', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'approved', // Already approved
        reviewedBy: new mongoose.Types.ObjectId(),
        reviewedAt: new Date(),
        priority: 'normal',
        imageMetadata: {
          width: 800,
          height: 600,
          format: 'jpg',
          fileSize: 100000
        }
      });

      const result = await PhotoModeration.findOneAndUpdate(
        { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
        { $set: { status: 'approved', reviewedBy: new mongoose.Types.ObjectId() } },
        { new: true }
      );

      expect(result).toBeNull();
    });
  });

  describe('Atomic Reject', () => {
    it('should reject photo atomically', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'pending',
        priority: 'normal',
        imageMetadata: {
          width: 800,
          height: 600,
          format: 'jpg',
          fileSize: 100000
        }
      });

      const moderatorId = new mongoose.Types.ObjectId();
      
      const result = await PhotoModeration.findOneAndUpdate(
        { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
        {
          $set: {
            status: 'rejected',
            reviewedBy: moderatorId,
            reviewedAt: new Date(),
            rejectionReason: 'Inappropriate content',
            rejectionCategory: 'explicit'
          }
        },
        { new: true }
      );

      expect(result).toBeTruthy();
      expect(result.status).toBe('rejected');
      expect(result.rejectionReason).toBe('Inappropriate content');
      expect(result.rejectionCategory).toBe('explicit');
    });

    it('should prevent approve after reject (race condition)', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'pending',
        priority: 'normal',
        imageMetadata: {
          width: 800,
          height: 600,
          format: 'jpg',
          fileSize: 100000
        }
      });

      const moderator1 = new mongoose.Types.ObjectId();
      const moderator2 = new mongoose.Types.ObjectId();

      // Simulate approve and reject happening simultaneously
      const [approveResult, rejectResult] = await Promise.all([
        PhotoModeration.findOneAndUpdate(
          { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
          { $set: { status: 'approved', reviewedBy: moderator1, reviewedAt: new Date() } },
          { new: true }
        ),
        PhotoModeration.findOneAndUpdate(
          { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
          { $set: { status: 'rejected', reviewedBy: moderator2, reviewedAt: new Date() } },
          { new: true }
        )
      ]);

      // Only one should succeed
      const successCount = [approveResult, rejectResult].filter(r => r !== null).length;
      expect(successCount).toBe(1);

      // Verify final state is consistent
      const final = await PhotoModeration.findById(moderation._id);
      expect(['approved', 'rejected']).toContain(final.status);
    });
  });

  describe('Status Transitions', () => {
    it('should allow pending -> approved', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'pending',
        priority: 'normal',
        imageMetadata: { width: 800, height: 600, format: 'jpg', fileSize: 100000 }
      });

      const result = await PhotoModeration.findOneAndUpdate(
        { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
        { $set: { status: 'approved' } },
        { new: true }
      );

      expect(result).toBeTruthy();
      expect(result.status).toBe('approved');
    });

    it('should allow under-review -> approved', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'under-review',
        priority: 'normal',
        imageMetadata: { width: 800, height: 600, format: 'jpg', fileSize: 100000 }
      });

      const result = await PhotoModeration.findOneAndUpdate(
        { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
        { $set: { status: 'approved' } },
        { new: true }
      );

      expect(result).toBeTruthy();
      expect(result.status).toBe('approved');
    });

    it('should not allow approved -> rejected', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'approved',
        reviewedBy: new mongoose.Types.ObjectId(),
        reviewedAt: new Date(),
        priority: 'normal',
        imageMetadata: { width: 800, height: 600, format: 'jpg', fileSize: 100000 }
      });

      const result = await PhotoModeration.findOneAndUpdate(
        { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
        { $set: { status: 'rejected' } },
        { new: true }
      );

      expect(result).toBeNull();
    });

    it('should not allow rejected -> approved', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'rejected',
        reviewedBy: new mongoose.Types.ObjectId(),
        reviewedAt: new Date(),
        rejectionReason: 'Test',
        rejectionCategory: 'spam',
        priority: 'normal',
        imageMetadata: { width: 800, height: 600, format: 'jpg', fileSize: 100000 }
      });

      const result = await PhotoModeration.findOneAndUpdate(
        { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
        { $set: { status: 'approved' } },
        { new: true }
      );

      expect(result).toBeNull();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle 10 concurrent approval attempts', async () => {
      const moderation = await PhotoModeration.create({
        userId: new mongoose.Types.ObjectId(),
        photoUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'test/photo',
        status: 'pending',
        priority: 'normal',
        imageMetadata: { width: 800, height: 600, format: 'jpg', fileSize: 100000 }
      });

      const attempts = Array.from({ length: 10 }, () =>
        PhotoModeration.findOneAndUpdate(
          { _id: moderation._id, status: { $in: ['pending', 'under-review'] } },
          { $set: { status: 'approved', reviewedBy: new mongoose.Types.ObjectId(), reviewedAt: new Date() } },
          { new: true }
        )
      );

      const results = await Promise.all(attempts);
      const successCount = results.filter(r => r !== null).length;

      expect(successCount).toBe(1);
    });
  });
});
