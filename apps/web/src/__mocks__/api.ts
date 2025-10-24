/**
 * Mock API service for testing
 */
// Base API mock
const apiInstanceMock = {
    setToken: jest.fn(),
    clearToken: jest.fn(),
    getToken: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getCurrentUser: jest.fn(),
    getPets: jest.fn(),
    getPet: jest.fn(),
    createPet: jest.fn(),
    updatePet: jest.fn(),
    deletePet: jest.fn(),
    updatePetProfile: jest.fn(),
    getMatches: jest.fn(),
    swipe: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    getWeather: jest.fn(),
    updateLocation: jest.fn(),
    syncPreferences: jest.fn(),
    request: jest.fn(),
};
// Pets API mock
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
// Matches API mock
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
// Chat API mock
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
// AI API mock
const aiAPIMock = {
    generateBio: jest.fn(),
    analyzePetCompatibility: jest.fn(),
    getPetInsights: jest.fn(),
    getRecommendations: jest.fn(),
    generateChatSuggestions: jest.fn(),
    getMoodAnalysis: jest.fn(),
};
// Subscription API mock
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
// Analytics API mock
const analyticsAPIMock = {
    trackUserEvent: jest.fn(),
    trackPetEvent: jest.fn(),
    trackMatchEvent: jest.fn(),
    getUserAnalytics: jest.fn(),
    getPetAnalytics: jest.fn(),
    getMatchAnalytics: jest.fn(),
};
// Matching API mock
const matchingAPIMock = {
    getRecommendations: jest.fn(),
    getCompatibilityAnalysis: jest.fn(),
};
// Video Call API mock
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
// Export the mock API
export const api = {
    ...apiInstanceMock,
    setToken: apiInstanceMock.setToken,
    clearToken: apiInstanceMock.clearToken,
    getToken: apiInstanceMock.getToken,
    login: apiInstanceMock.login,
    register: apiInstanceMock.register,
    logout: apiInstanceMock.logout,
    forgotPassword: apiInstanceMock.forgotPassword,
    resetPassword: apiInstanceMock.resetPassword,
    getCurrentUser: apiInstanceMock.getCurrentUser,
    getPets: apiInstanceMock.getPets,
    getPet: apiInstanceMock.getPet,
    createPet: apiInstanceMock.createPet,
    updatePet: apiInstanceMock.updatePet,
    deletePet: apiInstanceMock.deletePet,
    updatePetProfile: apiInstanceMock.updatePetProfile,
    getMatches: apiInstanceMock.getMatches,
    swipe: apiInstanceMock.swipe,
    getMessages: apiInstanceMock.getMessages,
    sendMessage: apiInstanceMock.sendMessage,
    getWeather: apiInstanceMock.getWeather,
    updateLocation: apiInstanceMock.updateLocation,
    syncPreferences: apiInstanceMock.syncPreferences,
    pets: petsAPIMock,
    matches: matchesAPIMock,
    chat: chatAPIMock,
    ai: aiAPIMock,
    subscription: subscriptionAPIMock,
    analytics: analyticsAPIMock,
    matching: matchingAPIMock,
    videoCall: videoCallAPIMock,
};
export default api;
//# sourceMappingURL=api.js.map