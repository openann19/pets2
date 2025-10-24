const request = require('supertest');
const express = require('express');

const { storyDailyLimiter } = require('../src/middleware/storyDailyLimiter');

describe('storyDailyLimiter middleware', () => {
    test('skips when Redis not available (fail-open)', async () => {
        const app = express();
        app.use((req, _res, next) => { req.user = { _id: '507f1f77bcf86cd799439011' }; next(); });
        app.post('/api/stories', storyDailyLimiter, (_req, res) => res.status(201).json({ ok: true }));

        const res = await request(app).post('/api/stories');
        expect(res.statusCode).toBe(201);
    });
});
