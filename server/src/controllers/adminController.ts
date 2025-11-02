// Legacy adminController has been reduced to re-export specialized controllers only.
// All handler implementations now live in dedicated files under ./admin.

// Import specialized admin controllers
const AdminUserController = require('./admin/AdminUserController');
const AdminChatController = require('./admin/AdminChatController');

// Re-export all admin functions from specialized controllers
module.exports = {
  // User Management
  ...AdminUserController,

  // Chat Moderation
  ...AdminChatController,
};
