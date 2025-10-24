const mongoose = require('mongoose');
const { createDMFromStoryReply } = require('../src/services/chatService');
const User = require('../src/models/User');
const Conversation = require('../src/models/Conversation');

describe('chatService.createDMFromStoryReply', () => {
    beforeAll(async () => {
        const uri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/pawfectmatch_test';
        try {
            await mongoose.connect(uri, { maxPoolSize: 1 });
        } catch {
            // skip tests gracefully when no DB
        }
    });

    afterAll(async () => {
        if (mongoose.connection.readyState) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    });

    test('creates conversation and message for valid users', async () => {
        if (!mongoose.connection.readyState) return;

        const replier = await User.create({ email: 'a@test.dev', password: 'x', firstName: 'A' });
        const owner = await User.create({ email: 'b@test.dev', password: 'x', firstName: 'B' });

        const out = await createDMFromStoryReply(replier._id, owner._id, 'hello there', new mongoose.Types.ObjectId(), null);
        expect(out.conversationId).toBeDefined();

        const conv = await Conversation.findById(out.conversationId);
        expect(conv).toBeTruthy();
        expect(conv.messages.length).toBe(1);
        expect(conv.messages[0].content).toBe('hello there');
    });
});
