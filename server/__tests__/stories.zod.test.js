const request = require('supertest');
const express = require('express');
const multer = require('multer');
const { zodValidate } = require('../src/middleware/zodValidator');
const { createStorySchema, replySchema } = require('../src/schemas/storySchemas');

const app = express();
app.use(express.json());

// Simulate endpoints with zod validation
app.post('/create', multer().single('media'), zodValidate({ body: createStorySchema }), (req, res) => res.json({ ok: true }));
app.post('/reply', zodValidate({ body: replySchema }), (req, res) => res.json({ ok: true }));

describe('Zod validator', () => {
    test('rejects invalid reply payload', async () => {
        const res = await request(app).post('/reply').send({ message: '' });
        expect(res.status).toBe(400);
        expect(res.body?.success).toBe(false);
    });

    test('accepts valid reply payload', async () => {
        const res = await request(app).post('/reply').send({ message: 'Hi' });
        expect(res.status).toBe(200);
    });

    test('accepts create story payload without optional fields', async () => {
        const res = await request(app).post('/create');
        expect(res.status).toBe(200);
    });
});
