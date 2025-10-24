"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._server = void 0;
const msw_1 = require("msw");
const node_1 = require("msw/node");
const handlers = [
    // Auth endpoints
    msw_1.rest.post('/api/auth/login', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            data: {
                user: {
                    id: 'user-1',
                    email: 'test@example.com',
                    name: 'Test User'
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            }
        }));
    }),
    msw_1.rest.post('/api/auth/register', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            data: {
                user: {
                    id: 'user-2',
                    email: 'newuser@example.com',
                    name: 'New User'
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            }
        }));
    }),
    msw_1.rest.post('/api/auth/logout', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            message: 'Logged out successfully'
        }));
    }),
    // Pet endpoints
    msw_1.rest.get('/api/pets', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            data: [
                {
                    id: 'pet-1',
                    name: 'Buddy',
                    species: 'dog',
                    breed: 'Golden Retriever',
                    age: 3,
                    size: 'large'
                }
            ]
        }));
    }),
    msw_1.rest.post('/api/pets', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            data: {
                id: 'pet-new',
                name: 'New Pet',
                species: 'dog',
                breed: 'Mixed',
                age: 2,
                size: 'medium'
            }
        }));
    }),
    // AI endpoints
    msw_1.rest.post('/api/ai/generate-bio', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            bio: 'Buddy is a friendly Golden Retriever who loves playing fetch and going for long walks in the park.'
        }));
    }),
    msw_1.rest.post('/api/ai/analyze-photos', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            results: [
                {
                    url: 'https://example.com/photo1.jpg',
                    scores: {
                        clarity: 8,
                        composition: 7,
                        isSinglePet: true,
                        faceVisible: true
                    },
                    suggestion: 'Great photo! Clear and well-composed.'
                }
            ],
            bestPhoto: {
                url: 'https://example.com/photo1.jpg',
                scores: { clarity: 8, composition: 7, isSinglePet: true, faceVisible: true },
                suggestion: 'This appears to be your best photo!'
            }
        }));
    }),
    msw_1.rest.post('/api/ai/compatibility', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            score: 85,
            analysis: 'These two pets would make excellent companions with similar energy levels and friendly personalities.',
            tips: [
                'Consider their energy levels and play styles',
                'Size differences might affect play dynamics'
            ]
        }));
    }),
    msw_1.rest.post('/api/ai/assist-application', (req, res, ctx) => {
        void req;
        return res(ctx.json({
            success: true,
            content: 'I am excited to provide a loving home for this wonderful pet. With my experience and stable home environment...'
        }));
    }),
    // Default handler for unhandled requests
    msw_1.rest.get('*', (req, res, ctx) => {
        void req;
        console.error(`Unhandled ${req.method} ${req.url}`);
        return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    }),
    msw_1.rest.post('*', (req, res, ctx) => {
        void req;
        console.error(`Unhandled ${req.method} ${req.url}`);
        return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    })
];
exports._server = (0, node_1.setupServer)(...handlers);
//# sourceMappingURL=server.js.map