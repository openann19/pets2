/**
 * Export app instance for testing
 * This file creates a simple app instance for tests
 */

import express from 'express';

// Create a simple Express app for testing
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register community routes for testing (if in test environment)
if (process.env.NODE_ENV === 'test' || process.env['JEST_WORKER_ID']) {
  // Dynamically import routes to avoid loading issues in non-test environments
  import('./routes/community').then((communityRoutesModule) => {
    const communityRouter = communityRoutesModule.default || communityRoutesModule;
    app.use('/api/community', communityRouter);
  }).catch((err) => {
    // Routes may not be available in all test scenarios, fail silently
    console.warn('Could not register community routes:', err.message);
  });
}

export default app;

