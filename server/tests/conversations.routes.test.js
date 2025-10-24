const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let server;
let io;

// Models
let User;
let Conversation;

describe('Conversations API', () => {
    let mongo;
    let tokenA;
    let tokenB;
    let userA;
    let userB;
    let conv;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // Spin up in-memory Mongo
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();

        // Inject env early
        process.env.MONGODB_URI = uri;
        process.env.JWT_SECRET = 'test-secret';

        // Import app after env and before DB connect inside server.js
        const express = require('express');
        const { createServer } = require('http');
        const { Server } = require('socket.io');
        const cors = require('cors');

        // Minimal app that matches server/server.js behavior for our routes
        app = express();
        app.use(express.json());
        app.use(cors());

        // DB
        await mongoose.connect(uri);

        // io
        server = createServer(app);
        io = new Server(server, { cors: { origin: '*' } });
        app.use((req, _res, next) => { req.io = io; next(); });
        // Ensure server is actually listening for any socket internals
        await new Promise((resolve) => server.listen(0, resolve));

        // Note: Route file uses real authenticateToken; we rely on signed JWTs below

        // Models
        User = require('../src/models/User');
        Conversation = require('../src/models/Conversation');

        // Routes
        const convRoutes = require('../src/routes/conversations');
        app.use('/api/conversations', convRoutes);

        // Seed users and a conversation
        userA = await User.create({
            email: 'a@example.com', password: 'secret123', firstName: 'A', lastName: 'One', dateOfBirth: new Date('1990-01-01')
        });
        userB = await User.create({
            email: 'b@example.com', password: 'secret123', firstName: 'B', lastName: 'Two', dateOfBirth: new Date('1990-01-01')
        });
        const jwtLib = require('jsonwebtoken');
        tokenA = jwtLib.sign({ userId: String(userA._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
        tokenB = jwtLib.sign({ userId: String(userB._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });

        conv = await Conversation.findOrCreateOneToOne(userA._id, userB._id);
    });

    afterAll(async () => {
        if (io) io.close();
        if (server) await new Promise((r) => server.close(r));
        await mongoose.disconnect();
        if (mongo) await mongo.stop();
    });

    test('happy path: send message, get messages, mark read', async () => {
        // Send message as A
        const sendRes = await request(app)
            .post(`/api/conversations/${conv._id}/messages`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ content: 'Hello there' });
        expect(sendRes.status).toBe(201);
        expect(sendRes.body.success).toBe(true);
        expect(sendRes.body.data || sendRes.body).toBeDefined();
        const message = (sendRes.body.data?.message) || sendRes.body.message;
        expect(message.content).toBe('Hello there');

        // Get messages as B
        const listRes = await request(app)
            .get(`/api/conversations/${conv._id}/messages`)
            .set('Authorization', `Bearer ${tokenB}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.success).toBe(true);
        const msgs = (listRes.body.data?.messages) || listRes.body.messages;
        expect(Array.isArray(msgs)).toBe(true);
        expect(msgs.length).toBeGreaterThanOrEqual(1);

        // Mark read as B
        const readRes = await request(app)
            .post(`/api/conversations/${conv._id}/read`)
            .set('Authorization', `Bearer ${tokenB}`);
        expect(readRes.status).toBe(200);
        expect(readRes.body.success).toBe(true);
    });

    test('access control: non-participant cannot access', async () => {
        const UserModel = require('../src/models/User');
        const outsider = await UserModel.create({
            email: 'c@example.com', password: 'secret123', firstName: 'C', lastName: 'Three', dateOfBirth: new Date('1990-01-01')
        });
        const jwtLib = require('jsonwebtoken');
        const tokenC = jwtLib.sign({ userId: String(outsider._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get(`/api/conversations/${conv._id}/messages`)
            .set('Authorization', `Bearer ${tokenC}`);
        expect([403, 404]).toContain(res.status);
        expect(res.body.success).toBe(false);
    });

    test('pagination: verify cursor behavior (before)', async () => {
        // add several messages
        for (let i = 0; i < 5; i++) {
            // alternate senders
            const token = i % 2 === 0 ? tokenA : tokenB;
            await request(app)
                .post(`/api/conversations/${conv._id}/messages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: `m${i}` });
        }

        // First page (limit=3)
        const page1 = await request(app)
            .get(`/api/conversations/${conv._id}/messages?limit=3`)
            .set('Authorization', `Bearer ${tokenA}`);
        expect(page1.status).toBe(200);
        const msgs1 = (page1.body.data?.messages) || page1.body.messages;
        expect(msgs1.length).toBeLessThanOrEqual(3);
        const cursor = (page1.body.data?.nextCursor) || page1.body.nextCursor;

        if (cursor) {
            const page2 = await request(app)
                .get(`/api/conversations/${conv._id}/messages?limit=3&before=${cursor}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(page2.status).toBe(200);
            const msgs2 = (page2.body.data?.messages) || page2.body.messages;
            // no duplication between the two pages
            const ids1 = new Set(msgs1.map(m => String(m._id)));
            const anyDup = (msgs2 || []).some(m => ids1.has(String(m._id)));
            expect(anyDup).toBe(false);
        }
    });
});
