export {};// Added to mark file as a module
const Report = require('../models/Report');
const UserBlock = require('../models/UserBlock');
const UserMute = require('../models/UserMute');
const logger = require('../utils/logger');

exports.getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const matchStage = Object.keys(dateFilter).length > 0
            ? { createdAt: dateFilter }
            : {};

        // Total reports by status
        const reportsByStatus = await Report.aggregate([
            { $match: matchStage },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Reports by type
        const reportsByType = await Report.aggregate([
            { $match: matchStage },
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ]);

        // Reports by priority
        const reportsByPriority = await Report.aggregate([
            { $match: matchStage },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);

        // Reports by category
        const reportsByCategory = await Report.aggregate([
            { $match: matchStage },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        // Reports over time
        const getDateGroupFormat = () => {
            switch (groupBy) {
                case 'hour': return { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' }, hour: { $hour: '$createdAt' } };
                case 'week': return { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
                case 'month': return { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
                default: return { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
            }
        };

        const reportsOverTime = await Report.aggregate([
            { $match: matchStage },
            { $group: { _id: getDateGroupFormat(), count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        ]);

        // User actions stats
        const totalBlocks = await UserBlock.countDocuments(matchStage);
        const totalMutes = await UserMute.countDocuments(matchStage);

        // Average resolution time
        const resolvedReports = await Report.aggregate([
            {
                $match: {
                    ...matchStage,
                    status: 'resolved',
                    resolvedAt: { $exists: true }
                }
            },
            {
                $project: {
                    resolutionTime: {
                        $subtract: ['$resolvedAt', '$createdAt']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgResolutionTime: { $avg: '$resolutionTime' },
                    minResolutionTime: { $min: '$resolutionTime' },
                    maxResolutionTime: { $max: '$resolutionTime' },
                }
            }
        ]);

        // Top reporters
        const topReporters = await Report.aggregate([
            { $match: matchStage },
            { $group: { _id: '$reporterId', reportCount: { $sum: 1 } } },
            { $sort: { reportCount: -1 } },
            { $limit: 10 },
        ]);

        // Most reported users
        const mostReportedUsers = await Report.aggregate([
            { $match: { ...matchStage, reportedUserId: { $exists: true } } },
            { $group: { _id: '$reportedUserId', reportCount: { $sum: 1 } } },
            { $sort: { reportCount: -1 } },
            { $limit: 10 },
        ]);

        const analytics = {
            summary: {
                totalReports: await Report.countDocuments(matchStage),
                totalBlocks,
                totalMutes,
                avgResolutionTime: resolvedReports[0]?.avgResolutionTime || 0,
            },
            reportsByStatus: reportsByStatus.map(r => ({ status: r._id, count: r.count })),
            reportsByType: reportsByType.map(r => ({ type: r._id, count: r.count })),
            reportsByPriority: reportsByPriority.map(r => ({ priority: r._id, count: r.count })),
            reportsByCategory: reportsByCategory.map(r => ({ category: r._id, count: r.count })),
            reportsOverTime,
            topReporters,
            mostReportedUsers,
            resolutionStats: resolvedReports[0] || {},
        };

        logger.info('Moderation analytics fetched', { adminId: req.user._id });
        return res.json({ success: true, data: analytics });
    } catch (error) {
        logger.error('Failed to fetch moderation analytics', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};
