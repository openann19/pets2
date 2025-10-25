const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/adminAuth');
const Report = require('../models/Report');
const logger = require('../utils/logger');

const router = express.Router();
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/moderation/reports
router.get('/reports', async (req, res) => {
    try {
        const {
            status = 'pending',
            priority,
            category,
            type,
            search,
            limit = 50,
            skip = 0,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        if (status !== 'all') query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { reason: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            Report.find(query)
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .populate('reporterId', 'firstName lastName email')
                .populate('reportedUserId', 'firstName lastName email')
                .populate('reportedPetId', 'name species')
                .lean(),
            Report.countDocuments(query),
        ]);

        return res.json({ success: true, data: { items, total } });
    } catch (error) {
        logger.error('Failed to list reports', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to list reports' });
    }
});

// PATCH /api/admin/moderation/reports/:id
router.patch('/reports/:id', async (req, res) => {
    try {
        const { status, resolution, resolutionNotes, priority } = req.body || {};
        const updates = {};
        if (status) updates.status = status;
        if (resolution) updates.resolution = resolution;
        if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
        if (priority) updates.priority = priority;
        if (status === 'resolved') {
            updates.resolvedAt = new Date();
            updates.resolvedBy = req.user._id;
        }

        const doc = await Report.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Report not found' });
        logger.info('Report updated', { reportId: doc._id, updates: Object.keys(updates) });
        return res.json({ success: true, data: doc });
    } catch (error) {
        logger.error('Failed to update report', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to update report' });
    }
});

module.exports = router;
