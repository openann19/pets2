const { z } = require('zod');
const Report = require('../models/Report');
const UserBlock = require('../models/UserBlock');
const UserMute = require('../models/UserMute');
const logger = require('../utils/logger');
const { notifyNewReport } = require('../services/adminNotifications');

// Schemas
const reportSchema = z.object({
    type: z.enum([
        'inappropriate_content', 'harassment', 'spam', 'fake_profile', 'underage', 'animal_abuse', 'scam', 'inappropriate_behavior', 'copyright_violation', 'other'
    ]),
    category: z.enum(['user', 'pet', 'chat', 'message', 'other']),
    reason: z.string().min(3).max(1000),
    description: z.string().max(2000).optional(),
    targetId: z.string().min(1),
    evidence: z.array(z.object({
        type: z.enum(['screenshot', 'message', 'photo', 'video', 'other']),
        url: z.string().url().optional(),
        description: z.string().optional()
    })).optional(),
    isAnonymous: z.boolean().optional()
});

const blockSchema = z.object({
    blockedUserId: z.string().min(1),
    reason: z.string().max(1000).optional()
});

const muteSchema = z.object({
    mutedUserId: z.string().min(1),
    durationMinutes: z.number().int().min(1).max(60 * 24 * 30), // up to 30 days
    reason: z.string().max(1000).optional()
});

exports.createReport = async (req, res) => {
    try {
        const parsed = reportSchema.parse(req.body);
        const payload = {
            reporterId: req.user._id,
            reason: parsed.reason,
            description: parsed.description,
            type: parsed.type,
            category: parsed.category,
            evidence: parsed.evidence || [],
            isAnonymous: !!parsed.isAnonymous,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                reportSource: 'web'
            }
        };

        // Map targetId by category
        if (parsed.category === 'user') payload.reportedUserId = parsed.targetId;
        if (parsed.category === 'pet') payload.reportedPetId = parsed.targetId;
        if (parsed.category === 'chat') payload.reportedMatchId = parsed.targetId;
        if (parsed.category === 'message') payload.reportedMessageId = parsed.targetId;

        const report = await Report.create(payload);

        logger.info('Report created', { reportId: report._id, reporterId: req.user._id, category: parsed.category, type: parsed.type });

        // Send real-time notification to admins
        notifyNewReport(report);

        return res.status(201).json({ success: true, data: { id: report._id } });
    } catch (error) {
        logger.error('Failed to create report', { error: error.message });
        const status = error.name === 'ZodError' ? 400 : 500;
        return res.status(status).json({ success: false, message: 'Failed to submit report' });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const parsed = blockSchema.parse(req.body);
        const doc = await UserBlock.findOneAndUpdate(
            { blockerId: req.user._id, blockedUserId: parsed.blockedUserId },
            { $set: { reason: parsed.reason } },
            { upsert: true, new: true }
        );
        logger.info('User blocked', { blockerId: req.user._id, blockedUserId: parsed.blockedUserId });
        return res.json({ success: true, data: { id: doc._id } });
    } catch (error) {
        logger.error('Failed to block user', { error: error.message });
        const status = error.name === 'ZodError' ? 400 : 500;
        return res.status(status).json({ success: false, message: 'Failed to block user' });
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const { blockedUserId } = req.params;
        await UserBlock.findOneAndDelete({ blockerId: req.user._id, blockedUserId });
        logger.info('User unblocked', { blockerId: req.user._id, blockedUserId });
        return res.json({ success: true });
    } catch (error) {
        logger.error('Failed to unblock user', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to unblock user' });
    }
};

exports.muteUser = async (req, res) => {
    try {
        const parsed = muteSchema.parse(req.body);
        const expiresAt = new Date(Date.now() + parsed.durationMinutes * 60 * 1000);
        const doc = await UserMute.findOneAndUpdate(
            { userId: req.user._id, mutedUserId: parsed.mutedUserId },
            { $set: { durationMinutes: parsed.durationMinutes, expiresAt, reason: parsed.reason } },
            { upsert: true, new: true }
        );
        logger.info('User muted', { userId: req.user._id, mutedUserId: parsed.mutedUserId, duration: parsed.durationMinutes });
        return res.json({ success: true, data: { id: doc._id, expiresAt } });
    } catch (error) {
        logger.error('Failed to mute user', { error: error.message });
        const status = error.name === 'ZodError' ? 400 : 500;
        return res.status(status).json({ success: false, message: 'Failed to mute user' });
    }
};

exports.unmuteUser = async (req, res) => {
    try {
        const { mutedUserId } = req.params;
        await UserMute.findOneAndDelete({ userId: req.user._id, mutedUserId });
        logger.info('User unmuted', { userId: req.user._id, mutedUserId });
        return res.json({ success: true });
    } catch (error) {
        logger.error('Failed to unmute user', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to unmute user' });
    }
};

exports.getMyModerationState = async (req, res) => {
    try {
        const [blocks, mutes] = await Promise.all([
            UserBlock.find({ blockerId: req.user._id }).lean(),
            UserMute.find({ userId: req.user._id, $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] }).lean()
        ]);
        return res.json({ success: true, data: { blocks, mutes } });
    } catch (error) {
        logger.error('Failed to fetch moderation state', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to fetch moderation state' });
    }
};
