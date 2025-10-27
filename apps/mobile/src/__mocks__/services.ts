// Mock services for testing
export const authService = {
  getCurrentUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
};

export const uploadHygieneService = {
  processImageForUpload: jest.fn(),
  uploadWithRetry: jest.fn(),
};

export const communityAPI = {
  getFeed: jest.fn(),
  createPost: jest.fn(),
  likePost: jest.fn(),
  addComment: jest.fn(),
};

export const notificationService = {
  sendMatchNotification: jest.fn(),
  sendMessageNotification: jest.fn(),
  sendLikeNotification: jest.fn(),
  scheduleReminderNotification: jest.fn(),
  setBadgeCount: jest.fn(),
  clearBadge: jest.fn(),
  cleanup: jest.fn(),
};
