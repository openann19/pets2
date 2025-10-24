const mongoose = require('mongoose');
const UserAuditLog = require('../src/models/UserAuditLog');

describe('UserAuditLog model', () => {
    beforeAll(async () => {
        const uri = 'mongodb://127.0.0.1:27017/pawfectmatch_test';
        try {
            await mongoose.connect(uri, { maxPoolSize: 1 });
        } catch {
            // If no Mongo available locally, skip tests gracefully
            jest.spyOn(console, 'error').mockImplementation(() => { });
            return;
        }
    });

    afterAll(async () => {
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
        }
    });

    test('creates a basic audit log doc', async () => {
        if (!mongoose.connection.readyState) {
            return; // skip when no DB
        }
        const doc = await UserAuditLog.create({
            userId: new mongoose.Types.ObjectId(),
            action: 'story_create',
            resourceType: 'story',
            resourceId: new mongoose.Types.ObjectId(),
            details: { captionLength: 0 },
        });
        expect(doc._id).toBeDefined();
    });
});
