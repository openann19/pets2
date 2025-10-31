export const request = jest.fn();

// Subscription API mocks
const subscriptionAPIMock = {
  getCurrentSubscription: jest.fn(),
  getPlans: jest.fn(),
  createCheckoutSession: jest.fn(),
  cancelSubscription: jest.fn(),
  reactivateSubscription: jest.fn(),
  updateSubscription: jest.fn(),
  handleWebhook: jest.fn(),
  getUsageStats: jest.fn(),
  updatePaymentMethod: jest.fn(),
};

// Matching API mocks
const matchingAPIMock = {
  getRecommendations: jest.fn(),
  getCompatibilityAnalysis: jest.fn(),
  calculateCompatibilityScore: jest.fn(),
};

// Pets API mocks
const petsAPIMock = {
  getPetById: jest.fn(),
  updatePet: jest.fn(),
  createPet: jest.fn(),
  deletePet: jest.fn(),
  uploadPetPhoto: jest.fn(),
  deletePetPhoto: jest.fn(),
  getPetsByOwner: jest.fn(),
  getPetMatches: jest.fn(),
  getPetRecommendations: jest.fn(),
  getPetStats: jest.fn(),
};

// Matches API mocks
const matchesAPIMock = {
  getMatches: jest.fn(),
  getMatchById: jest.fn(),
  createMatch: jest.fn(),
  deleteMatch: jest.fn(),
  getActiveMatches: jest.fn(),
  getArchivedMatches: jest.fn(),
  archiveMatch: jest.fn(),
  blockMatch: jest.fn(),
  getMatchStats: jest.fn(),
  reportMatch: jest.fn(),
};

// Chat API mocks
const chatAPIMock = {
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  deleteMessage: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
  sendAttachment: jest.fn(),
  getMessageById: jest.fn(),
  getRecentChats: jest.fn(),
  getChatStats: jest.fn(),
  typingIndicator: jest.fn(),
  searchMessages: jest.fn(),
};

// AI API mocks
const aiAPIMock = {
  generateBio: jest.fn(),
  analyzePetCompatibility: jest.fn(),
  getPetInsights: jest.fn(),
  getRecommendations: jest.fn(),
  getMoodAnalysis: jest.fn(),
  analyzePhoto: jest.fn(),
};

// Analytics API mocks
const analyticsAPIMock = {
  trackUserEvent: jest.fn(),
  trackPetEvent: jest.fn(),
  trackMatchEvent: jest.fn(),
  getUserAnalytics: jest.fn(),
  getPetAnalytics: jest.fn(),
  getMatchAnalytics: jest.fn(),
};

// Video Call API mocks
const videoCallAPIMock = {
  createCall: jest.fn(),
  joinCall: jest.fn(),
  endCall: jest.fn(),
  sendOffer: jest.fn(),
  getAnswer: jest.fn(),
  sendIceCandidate: jest.fn(),
  startRecording: jest.fn(),
  stopRecording: jest.fn(),
};

export const api = {
  request,
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  presignPhoto: jest.fn(),
  presignVoice: jest.fn(),
  // Auth methods
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  getCurrentUser: jest.fn(),
  // Service APIs
  subscription: subscriptionAPIMock,
  matching: matchingAPIMock,
  pets: petsAPIMock,
  matches: matchesAPIMock,
  chat: chatAPIMock,
  ai: aiAPIMock,
  analytics: analyticsAPIMock,
  videoCall: videoCallAPIMock,
};

export default { api, request };
