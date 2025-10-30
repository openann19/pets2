/**
 * Export app instance for testing
 * This file creates a simple app instance for tests
 */

import express from 'express';

// Create a simple Express app for testing
export const app = express();
app.use(express.json());
export default app;

