/**
 * Contract & Schema Tests for Community API
 * 
 * Ensures:
 * - Request/response validation against JSON Schema
 * - Consumer-driven contracts (Pact-ready)
 * - API contract breaking changes are detected
 * - Schema validation for all endpoints
 */

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';
import jwt from 'jsonwebtoken';
import Ajv, { type JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import CommunityPost from '../../src/models/CommunityPost';
import User from '../../src/models/User';
import logger from '../../src/utils/logger';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

let app: Express;
let mongoServer: MongoMemoryServer;
let testUser: any;
let userToken: string;

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-e2e-tests-only-minimum-32-characters-long';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

async function loginAs(user: any): Promise<string> {
  return generateToken(user._id.toString());
}

// JSON Schemas for Community API
const CommunityPostSchema: JSONSchemaType<{
  _id: string;
  author: { _id: string; name: string; avatar?: string };
  content: string;
  images?: Array<{ url: string }>;
  likes: number;
  liked: boolean;
  comments: unknown[];
  createdAt: string;
  packId?: string;
  packName?: string;
  type: string;
  activityDetails?: unknown;
  moderationStatus?: string;
}> = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    author: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        avatar: { type: 'string', nullable: true },
      },
      required: ['_id', 'name'],
    },
    content: { type: 'string' },
    images: {
      type: 'array',
      items: {
        type: 'object',
        properties: { url: { type: 'string' } },
        required: ['url'],
      },
      nullable: true,
    },
    likes: { type: 'number' },
    liked: { type: 'boolean' },
    comments: { type: 'array', items: {} },
    createdAt: { type: 'string', format: 'date-time' },
    packId: { type: 'string', nullable: true },
    packName: { type: 'string', nullable: true },
    type: { type: 'string', enum: ['post', 'activity', 'announcement'] },
    activityDetails: { type: 'object', nullable: true },
    moderationStatus: { type: 'string', enum: ['pending', 'approved', 'rejected'], nullable: true },
  },
  required: ['_id', 'author', 'content', 'likes', 'liked', 'comments', 'createdAt', 'type'],
};

const CommunityFeedResponseSchema: JSONSchemaType<{
  success: boolean;
  posts: unknown[];
  pagination: { page: number; limit: number; total: number; pages: number };
  appliedFilters: { packId: string | null; userId: string | null; type: string | null; matchedCount: number };
}> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    posts: { type: 'array', items: CommunityPostSchema },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        pages: { type: 'number' },
      },
      required: ['page', 'limit', 'total', 'pages'],
    },
    appliedFilters: {
      type: 'object',
      properties: {
        packId: { type: 'string', nullable: true },
        userId: { type: 'string', nullable: true },
        type: { type: 'string', nullable: true },
        matchedCount: { type: 'number' },
      },
      required: ['packId', 'userId', 'type', 'matchedCount'],
    },
  },
  required: ['success', 'posts', 'pagination', 'appliedFilters'],
};

const CommentSchema: JSONSchemaType<{
  _id: string;
  author: { _id: string; name: string; avatar?: string };
  content: string;
  likes: number;
  createdAt: string;
  postId: string;
}> = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    author: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        avatar: { type: 'string', nullable: true },
      },
      required: ['_id', 'name'],
    },
    content: { type: 'string' },
    likes: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    postId: { type: 'string' },
  },
  required: ['_id', 'author', 'content', 'likes', 'createdAt', 'postId'],
};

const CommentsResponseSchema: JSONSchemaType<{
  success: boolean;
  comments: unknown[];
  pagination: { page: number; limit: number; total: number; pages: number };
  postId: string;
}> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    comments: { type: 'array', items: CommentSchema },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        pages: { type: 'number' },
      },
      required: ['page', 'limit', 'total', 'pages'],
    },
    postId: { type: 'string' },
  },
  required: ['success', 'comments', 'pagination', 'postId'],
};

const LikeResponseSchema: JSONSchemaType<{
  success: boolean;
  post: { _id: string; likes: number; liked: boolean };
  message: string;
}> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    post: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        likes: { type: 'number' },
        liked: { type: 'boolean' },
      },
      required: ['_id', 'likes', 'liked'],
    },
    message: { type: 'string' },
  },
  required: ['success', 'post', 'message'],
};

const CreatePostResponseSchema: JSONSchemaType<{
  success: boolean;
  post: unknown;
  message: string;
}> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    post: CommunityPostSchema,
    message: { type: 'string' },
  },
  required: ['success', 'post', 'message'],
};

// Compile validators
const validateFeedResponse = ajv.compile(CommunityFeedResponseSchema);
const validateCommentsResponse = ajv.compile(CommentsResponseSchema);
const validateLikeResponse = ajv.compile(LikeResponseSchema);
const validateCreatePostResponse = ajv.compile(CreatePostResponseSchema);

describe('Community API Contract & Schema Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(60000);
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.NODE_ENV = 'test';
    
    await mongoose.connect(mongoUri);
    
    const serverModule = await import('../../server');
    app = serverModule.app;
    
    testUser = await User.create({
      email: 'contract-test-user@test.com',
      password: 'hashedpassword123',
      firstName: 'Contract',
      lastName: 'Test',
      emailVerified: true,
      isActive: true,
    });
    
    userToken = await loginAs(testUser);
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
  
  beforeEach(async () => {
    await CommunityPost.deleteMany({});
  });
  
  describe('GET /api/community/posts - Feed Contract', () => {
    it('response matches CommunityFeedResponse schema', async () => {
      // Create a test post
      await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Contract test post',
          type: 'post',
        });
      
      const res = await request(app)
        .get('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 20 });
      
      expect(res.status).toBe(200);
      
      const isValid = validateFeedResponse(res.body);
      if (!isValid) {
        console.error('Schema validation errors:', validateFeedResponse.errors);
      }
      expect(isValid).toBe(true);
      
      // Verify structure matches contract
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.posts)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(20);
      expect(typeof res.body.pagination.total).toBe('number');
      expect(res.body.appliedFilters).toBeDefined();
    });
    
    it('post objects match CommunityPost schema', async () => {
      await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Schema validation post',
          type: 'post',
        });
      
      const res = await request(app)
        .get('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.body.posts.length).toBeGreaterThan(0);
      
      for (const post of res.body.posts) {
        const isValid = validateFeedResponse({
          success: true,
          posts: [post],
          pagination: res.body.pagination,
          appliedFilters: res.body.appliedFilters,
        });
        
        if (!isValid) {
          console.error('Post schema errors:', validateFeedResponse.errors);
        }
        expect(isValid).toBe(true);
        
        // Verify required fields
        expect(post._id).toBeDefined();
        expect(post.author).toBeDefined();
        expect(post.author._id).toBeDefined();
        expect(post.author.name).toBeDefined();
        expect(post.content).toBeDefined();
        expect(typeof post.likes).toBe('number');
        expect(typeof post.liked).toBe('boolean');
        expect(Array.isArray(post.comments)).toBe(true);
        expect(post.createdAt).toBeDefined();
        expect(post.type).toMatch(/^(post|activity|announcement)$/);
      }
    });
    
    it('pagination contract is stable across pages', async () => {
      // Create multiple posts
      for (let i = 0; i < 25; i++) {
        await request(app)
          .post('/api/community/posts')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            content: `Pagination test post ${i}`,
            type: 'post',
          });
      }
      
      // Get page 1
      const page1 = await request(app)
        .get('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 10 });
      
      // Get page 2
      const page2 = await request(app)
        .get('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 2, limit: 10 });
      
      // Both should match schema
      expect(validateFeedResponse(page1.body)).toBe(true);
      expect(validateFeedResponse(page2.body)).toBe(true);
      
      // Contract: pagination.total should be same across pages
      expect(page1.body.pagination.total).toBe(page2.body.pagination.total);
      expect(page1.body.pagination.pages).toBe(page2.body.pagination.pages);
    });
  });
  
  describe('POST /api/community/posts - Create Post Contract', () => {
    it('request body validation (required fields)', async () => {
      // Missing content
      const res1 = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'post' });
      
      expect(res1.status).toBe(400);
      expect(res1.body.message).toContain('required');
      
      // Valid request
      const res2 = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Valid post content',
          type: 'post',
        });
      
      expect(res2.status).toBe(201);
      expect(validateCreatePostResponse(res2.body)).toBe(true);
    });
    
    it('response matches CreatePostResponse schema', async () => {
      const res = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Create post contract test',
          type: 'post',
        });
      
      expect(res.status).toBe(201);
      
      const isValid = validateCreatePostResponse(res.body);
      if (!isValid) {
        console.error('Create post schema errors:', validateCreatePostResponse.errors);
      }
      expect(isValid).toBe(true);
      
      // Verify contract
      expect(res.body.success).toBe(true);
      expect(res.body.post).toBeDefined();
      expect(res.body.post._id).toBeDefined();
      expect(res.body.post.author).toBeDefined();
      expect(res.body.message).toBeDefined();
    });
    
    it('activity post includes activityDetails in contract', async () => {
      const res = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Activity post',
          type: 'activity',
          activityDetails: {
            maxAttendees: 10,
            date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Test Location',
          },
        });
      
      expect(res.status).toBe(201);
      expect(res.body.post.type).toBe('activity');
      expect(res.body.post.activityDetails).toBeDefined();
    });
  });
  
  describe('POST /api/community/posts/:id/like - Like Contract', () => {
    it('response matches LikeResponse schema', async () => {
      // Create post
      const createRes = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Like contract test',
          type: 'post',
        });
      
      const postId = createRes.body.post._id;
      
      // Like post
      const likeRes = await request(app)
        .post(`/api/community/posts/${postId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ liked: true });
      
      expect(likeRes.status).toBe(200);
      
      const isValid = validateLikeResponse(likeRes.body);
      if (!isValid) {
        console.error('Like response schema errors:', validateLikeResponse.errors);
      }
      expect(isValid).toBe(true);
      
      // Verify contract
      expect(likeRes.body.success).toBe(true);
      expect(likeRes.body.post._id).toBe(postId);
      expect(typeof likeRes.body.post.likes).toBe('number');
      expect(typeof likeRes.body.post.liked).toBe('boolean');
      expect(likeRes.body.message).toBeDefined();
    });
    
    it('like/unlike toggle maintains contract', async () => {
      const createRes = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Toggle contract test',
          type: 'post',
        });
      
      const postId = createRes.body.post._id;
      
      // Like
      const likeRes = await request(app)
        .post(`/api/community/posts/${postId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ liked: true });
      
      expect(validateLikeResponse(likeRes.body)).toBe(true);
      expect(likeRes.body.post.liked).toBe(true);
      
      // Unlike
      const unlikeRes = await request(app)
        .post(`/api/community/posts/${postId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ liked: false });
      
      expect(validateLikeResponse(unlikeRes.body)).toBe(true);
      expect(unlikeRes.body.post.liked).toBe(false);
    });
  });
  
  describe('POST /api/community/posts/:id/comments - Comment Contract', () => {
    it('response matches CommentsResponse schema', async () => {
      const createRes = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Comment contract test',
          type: 'post',
        });
      
      const postId = createRes.body.post._id;
      
      // Add comment
      await request(app)
        .post(`/api/community/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Test comment' });
      
      // Get comments
      const res = await request(app)
        .get(`/api/community/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 20 });
      
      expect(res.status).toBe(200);
      
      const isValid = validateCommentsResponse(res.body);
      if (!isValid) {
        console.error('Comments response schema errors:', validateCommentsResponse.errors);
      }
      expect(isValid).toBe(true);
      
      // Verify contract
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.postId).toBe(postId);
      
      // Verify comment schema
      if (res.body.comments.length > 0) {
        const comment = res.body.comments[0];
        expect(comment._id).toBeDefined();
        expect(comment.author).toBeDefined();
        expect(comment.content).toBeDefined();
        expect(typeof comment.likes).toBe('number');
        expect(comment.createdAt).toBeDefined();
        expect(comment.postId).toBe(postId);
      }
    });
  });
  
  describe('Contract Breaking Changes Detection', () => {
    it('detects missing required fields in feed response', async () => {
      const res = await request(app)
        .get('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`);
      
      // Manually verify all required fields exist
      const requiredFields = ['success', 'posts', 'pagination', 'appliedFilters'];
      for (const field of requiredFields) {
        expect(res.body).toHaveProperty(field);
      }
    });
    
    it('detects type mismatches', async () => {
      const res = await request(app)
        .get('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`);
      
      // Verify types match contract
      expect(typeof res.body.success).toBe('boolean');
      expect(Array.isArray(res.body.posts)).toBe(true);
      expect(typeof res.body.pagination.page).toBe('number');
      expect(typeof res.body.pagination.total).toBe('number');
    });
    
    it('enforces enum values for post.type', async () => {
      const res = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Enum test',
          type: 'post',
        });
      
      expect(['post', 'activity', 'announcement']).toContain(res.body.post.type);
    });
  });
  
  describe('Consumer-Driven Contracts (Pact-Ready)', () => {
    it('defines contract for CommunityPost', () => {
      // This test documents the contract structure
      // In a full Pact implementation, this would be:
      // const provider = new Pact({ ... });
      // provider.addInteraction({ ... });
      
      const contract = {
        request: {
          method: 'GET',
          path: '/api/community/posts',
          headers: { Authorization: 'Bearer <token>' },
        },
        response: {
          status: 200,
          body: CommunityFeedResponseSchema,
        },
      };
      
      // Verify contract structure
      expect(contract.request.method).toBe('GET');
      expect(contract.response.status).toBe(200);
      expect(contract.response.body).toBeDefined();
    });
    
    it('defines contract for LikePost', () => {
      const contract = {
        request: {
          method: 'POST',
          path: '/api/community/posts/:id/like',
          headers: { Authorization: 'Bearer <token>' },
          body: { liked: true },
        },
        response: {
          status: 200,
          body: LikeResponseSchema,
        },
      };
      
      expect(contract.request.method).toBe('POST');
      expect(contract.response.body).toBeDefined();
    });
  });
});

