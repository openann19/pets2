const User = require('../models/User');
const logger = require('../utils/logger');

// POST /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new password are required' });
        }

        const user = await User.findById(req.userId).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const ok = await user.comparePassword(currentPassword);
        if (!ok) {
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }

        user.password = newPassword;
        user.refreshTokens = []; // revoke all refresh tokens
        user.tokensInvalidatedAt = new Date(); // any existing access tokens become invalid
        await user.save();

        return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        logger.error('Change password error', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

// POST /api/auth/logout-all
const logoutAll = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            $set: { refreshTokens: [], tokensInvalidatedAt: new Date() }
        });
        return res.json({ success: true, message: 'Logged out from all devices' });
    } catch (error) {
        logger.error('Logout all error', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to logout from all devices' });
    }
};

module.exports = { changePassword, logoutAll };
