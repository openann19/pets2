// Type-safe request function mock
export const request = jest.fn<
  Promise<{ data?: unknown; error?: unknown }>,
  [string, { method?: string; body?: unknown; headers?: Record<string, string> }?]
>();

// Default implementation
request.mockResolvedValue({ data: {} });

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

// Moderation API mocks
export const moderationAPI = {
  getStats: jest.fn<Promise<{ pendingReports: number; activeModerators: number; resolutionRate: number }>, []>()
    .mockResolvedValue({ pendingReports: 0, activeModerators: 0, resolutionRate: 0 }),
  getQueue: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
};

// Type-safe API method mocks
const createApiMethodMock = <TResponse = unknown>() =>
  jest.fn<Promise<{ data: TResponse }>, [string, Record<string, unknown>?]>().mockResolvedValue({ data: {} as TResponse });

export const api = {
  request,
  get: createApiMethodMock(),
  post: createApiMethodMock(),
  put: createApiMethodMock(),
  patch: createApiMethodMock(),
  delete: createApiMethodMock(),
  presignPhoto: jest.fn<Promise<{ url: string; fields: Record<string, string> }>, [string]>()
    .mockResolvedValue({ url: 'https://example.com/photo.jpg', fields: {} }),
  presignVoice: jest.fn<Promise<{ url: string; fields: Record<string, string> }>, [string]>()
    .mockResolvedValue({ url: 'https://example.com/voice.mp3', fields: {} }),
  // Auth methods
  login: jest.fn<Promise<{ data: { user: unknown; token: string } }>, [string, string]>()
    .mockResolvedValue({ data: { user: {}, token: 'mock-token' } }),
  register: jest.fn<Promise<{ data: { user: unknown; token: string } }>, [Record<string, unknown>]>()
    .mockResolvedValue({ data: { user: {}, token: 'mock-token' } }),
  logout: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
  forgotPassword: jest.fn<Promise<{ success: boolean }>, [string]>()
    .mockResolvedValue({ success: true }),
  resetPassword: jest.fn<Promise<{ success: boolean }>, [string, string]>()
    .mockResolvedValue({ success: true }),
  getCurrentUser: jest.fn<Promise<{ data: unknown }>, []>()
    .mockResolvedValue({ data: {} }),
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
