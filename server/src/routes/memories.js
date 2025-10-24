const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getMemories } = require('../controllers/memoriesController');

const router = express.Router();

// All memory routes require authentication
router.use(authenticateToken);

// Routes
router.get('/:matchId', getMemories);

module.exports = router;
