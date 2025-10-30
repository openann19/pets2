/**
 * Adoption API Endpoint Tests
 * Tests all 6 adoption workflow endpoints
 */

import request from 'supertest';
import app from '../../src/app';
import Pet from '../../src/models/Pet';
import { setupTestDB, teardownTestDB, clearTestDB, createMockUser, generateTestToken } from '../setup';

describe('Adoption API Endpoints', () => {
  let testUser: any;
  let testToken: string;
  let adoptionPet: any;
  let testApplication: any;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    testUser = await createMockUser();
    testToken = generateTestToken(testUser._id.toString());
    
    // Create adoption listing
    adoptionPet = await Pet.create({
      name: 'Adoption Pet',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 2,
      owner: testUser._id,
      forAdoption: true,
    });
  });

  describe('GET /api/adoption/pets/:petId', () => {
    it('should get pet details (public access)', async () => {
      const response = await request(app)
        .get(`/api/adoption/pets/${adoptionPet._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Adoption Pet');
      expect(response.body.data.forAdoption).toBe(true);
    });

    it('should include application status for authenticated users', async () => {
      // Submit application first
      await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          experience: 'I have experience',
          livingSituation: 'House with yard',
        });

      const response = await request(app)
        .get(`/api/adoption/pets/${adoptionPet._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data).toHaveProperty('applicationStatus');
      expect(response.body.data.applicationStatus).toBe('pending');
    });

    it('should return 404 for non-existent pet', async () => {
      const response = await request(app)
        .get('/api/adoption/pets/000000000000000000000000');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/adoption/pets/:petId/apply', () => {
    it('should submit adoption application', async () => {
      const applicationData = {
        experience: 'I have 10 years of dog ownership experience',
        livingSituation: 'House with large fenced yard',
        otherPets: 'One cat, very friendly',
        timeAlone: '4-6 hours per day',
        vetReference: 'Dr. Smith, (555) 123-4567',
        personalReference: 'John Doe, (555) 987-6543',
        additionalInfo: 'Very excited to adopt!',
      };

      const response = await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      expect(String(response.body.data.applicantId)).toBe(String(testUser._id));
    });

    it('should prevent duplicate applications', async () => {
      const applicationData = {
        experience: 'Experience',
        livingSituation: 'House',
      };

      // First application
      await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(applicationData);

      // Duplicate application
      const response = await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(applicationData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already submitted');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .send({ experience: 'No auth' });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({}); // Missing required fields

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/adoption/applications/my', () => {
    it('should get user submitted applications', async () => {
      // Submit an application
      await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          experience: 'Experience',
          livingSituation: 'House',
        });

      const response = await request(app)
        .get('/api/adoption/applications/my')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(String(response.body.data[0].petId)).toBe(String(adoptionPet._id));
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/adoption/applications/my');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/adoption/applications/received', () => {
    it('should get applications for user pets', async () => {
      const applicantUser = await createMockUser();
      const applicantToken = generateTestToken(applicantUser._id.toString());

      // Someone else applies to our pet
      await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          experience: 'Experience',
          livingSituation: 'House',
        });

      // Check received applications
      const response = await request(app)
        .get('/api/adoption/applications/received')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/adoption/applications/received');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/adoption/applications/:applicationId/review', () => {
    beforeEach(async () => {
      const applicantUser = await createMockUser();
      const applicantToken = generateTestToken(applicantUser._id.toString());

      // Create an application
      const appResponse = await request(app)
        .post(`/api/adoption/pets/${adoptionPet._id}/apply`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          experience: 'Experience',
          livingSituation: 'House',
        });

      testApplication = appResponse.body.data;
    });

    it('should approve application as pet owner', async () => {
      const response = await request(app)
        .post(`/api/adoption/applications/${testApplication._id}/review`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'approved',
          reviewNotes: 'Great applicant!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(String(response.body.data.reviewedBy)).toBe(String(testUser._id));
    });

    it('should reject application as pet owner', async () => {
      const response = await request(app)
        .post(`/api/adoption/applications/${testApplication._id}/review`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'rejected',
          reviewNotes: 'Not a good fit',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('rejected');
    });

    it('should prevent non-owner from reviewing', async () => {
      const otherUser = await createMockUser();
      const otherToken = generateTestToken(otherUser._id.toString());

      const response = await request(app)
        .post(`/api/adoption/applications/${testApplication._id}/review`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          status: 'approved',
        });

      expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/adoption/applications/${testApplication._id}/review`)
        .send({ status: 'approved' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/adoption/listings', () => {
    it('should create adoption listing', async () => {
      const newPet = await Pet.create({
        name: 'Listing Pet',
        species: 'cat',
        breed: 'Siamese',
        age: 1,
        owner: testUser._id,
      });

      const response = await request(app)
        .post('/api/adoption/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          petId: newPet._id,
          description: 'Looking for a loving home',
          requirements: 'Must have experience with cats',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(String(response.body.data.petId)).toBe(String(newPet._id));
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/adoption/listings')
        .send({ petId: adoptionPet._id });

      expect(response.status).toBe(401);
    });
  });
});
