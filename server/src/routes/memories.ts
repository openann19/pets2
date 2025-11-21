export {};// Added to mark file as a module
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getMemories } = require('../controllers/memoriesController');

const router: Router = express.Router();

// All memory routes require authentication
router.use(authenticateToken);

// Routes
router.get('/:matchId', getMemories);

export default router;
