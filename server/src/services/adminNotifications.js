const logger = require('../utils/logger');

/**
 * Admin notification emitter for Socket.IO real-time updates
 * Broadcasts moderation events to all connected admin users
 */

let io = null;

/**
 * Initialize the Socket.IO instance
 * @param {SocketIO.Server} socketIO - The Socket.IO server instance
 */
exports.setSocketIO = (socketIO) => {
    io = socketIO;
    logger.info('Admin notification service initialized with Socket.IO');
};

/**
 * Broadcast a new report notification to all admins
 * @param {Object} report - The report document
 */
exports.notifyNewReport = (report) => {
    if (!io) {
        logger.warn('Socket.IO not initialized, cannot send admin notification');
        return;
    }

    try {
        io.to('admin-notifications').emit('new-report', {
            id: report._id,
            type: report.type,
            category: report.category,
            reportedUserId: report.reportedUserId,
            reportedPetId: report.reportedPetId,
            reporterId: report.reporterId,
            reason: report.reason,
            status: report.status,
            priority: report.priority,
            createdAt: report.createdAt,
        });

        logger.info('Admin notification sent: new-report', { reportId: report._id });
    } catch (error) {
        logger.error('Failed to send admin notification', { error: error.message });
    }
};

/**
 * Broadcast a content flagged notification to all admins
 * @param {Object} data - Flagged content data
 * @param {string} data.contentType - Type of content (text/image)
 * @param {string} data.contentId - ID of the flagged content
 * @param {string} data.userId - User who posted the content
 * @param {Object} data.scores - AI moderation scores
 * @param {Array} data.violatedCategories - Categories that exceeded thresholds
 * @param {string} data.provider - AI provider used
 */
exports.notifyContentFlagged = (data) => {
    if (!io) {
        logger.warn('Socket.IO not initialized, cannot send admin notification');
        return;
    }

    try {
        io.to('admin-notifications').emit('content-flagged', {
            contentType: data.contentType,
            contentId: data.contentId,
            userId: data.userId,
            scores: data.scores,
            violatedCategories: data.violatedCategories,
            provider: data.provider,
            timestamp: new Date().toISOString(),
        });

        logger.info('Admin notification sent: content-flagged', { contentId: data.contentId });
    } catch (error) {
        logger.error('Failed to send admin notification', { error: error.message });
    }
};

/**
 * Broadcast a user action notification to all admins
 * @param {Object} data - User action data
 * @param {string} data.action - Action type (block/ban/suspend)
 * @param {string} data.targetUserId - User being acted upon
 * @param {string} data.adminId - Admin performing the action
 * @param {string} data.reason - Reason for action
 */
exports.notifyUserAction = (data) => {
    if (!io) {
        logger.warn('Socket.IO not initialized, cannot send admin notification');
        return;
    }

    try {
        io.to('admin-notifications').emit('user-action', {
            action: data.action,
            targetUserId: data.targetUserId,
            adminId: data.adminId,
            reason: data.reason,
            timestamp: new Date().toISOString(),
        });

        logger.info('Admin notification sent: user-action', { action: data.action, targetUserId: data.targetUserId });
    } catch (error) {
        logger.error('Failed to send admin notification', { error: error.message });
    }
};

/**
 * Set up Socket.IO admin room join/leave handlers
 * Call this from the main socket initialization
 * @param {SocketIO.Server} socketIO - The Socket.IO server instance
 */
exports.setupAdminRoom = (socketIO) => {
    socketIO.on('connection', (socket) => {
        // Check if user is admin (you'll need to pass user data via socket.handshake.auth)
        const userId = socket.handshake.auth?.userId;
        const isAdmin = socket.handshake.auth?.isAdmin;

        if (isAdmin) {
            socket.join('admin-notifications');
            logger.info('Admin joined notification room', { userId, socketId: socket.id });

            socket.on('disconnect', () => {
                logger.info('Admin left notification room', { userId, socketId: socket.id });
            });
        }
    });
};
