/**
 * Mock API service for testing
 */
export declare const api: {
    setToken: jest.Mock<any, any, any>;
    clearToken: jest.Mock<any, any, any>;
    getToken: jest.Mock<any, any, any>;
    login: jest.Mock<any, any, any>;
    register: jest.Mock<any, any, any>;
    logout: jest.Mock<any, any, any>;
    forgotPassword: jest.Mock<any, any, any>;
    resetPassword: jest.Mock<any, any, any>;
    getCurrentUser: jest.Mock<any, any, any>;
    getPets: jest.Mock<any, any, any>;
    getPet: jest.Mock<any, any, any>;
    createPet: jest.Mock<any, any, any>;
    updatePet: jest.Mock<any, any, any>;
    deletePet: jest.Mock<any, any, any>;
    updatePetProfile: jest.Mock<any, any, any>;
    getMatches: jest.Mock<any, any, any>;
    swipe: jest.Mock<any, any, any>;
    getMessages: jest.Mock<any, any, any>;
    sendMessage: jest.Mock<any, any, any>;
    getWeather: jest.Mock<any, any, any>;
    updateLocation: jest.Mock<any, any, any>;
    syncPreferences: jest.Mock<any, any, any>;
    pets: {
        getPetById: jest.Mock<any, any, any>;
        updatePet: jest.Mock<any, any, any>;
        createPet: jest.Mock<any, any, any>;
        deletePet: jest.Mock<any, any, any>;
        uploadPetPhoto: jest.Mock<any, any, any>;
        deletePetPhoto: jest.Mock<any, any, any>;
        getPetsByOwner: jest.Mock<any, any, any>;
        getPetMatches: jest.Mock<any, any, any>;
        getPetRecommendations: jest.Mock<any, any, any>;
        getPetStats: jest.Mock<any, any, any>;
    };
    matches: {
        getMatches: jest.Mock<any, any, any>;
        getMatchById: jest.Mock<any, any, any>;
        createMatch: jest.Mock<any, any, any>;
        deleteMatch: jest.Mock<any, any, any>;
        getActiveMatches: jest.Mock<any, any, any>;
        getArchivedMatches: jest.Mock<any, any, any>;
        archiveMatch: jest.Mock<any, any, any>;
        blockMatch: jest.Mock<any, any, any>;
        getMatchStats: jest.Mock<any, any, any>;
        reportMatch: jest.Mock<any, any, any>;
    };
    chat: {
        getMessages: jest.Mock<any, any, any>;
        sendMessage: jest.Mock<any, any, any>;
        deleteMessage: jest.Mock<any, any, any>;
        getUnreadCount: jest.Mock<any, any, any>;
        markAsRead: jest.Mock<any, any, any>;
        sendAttachment: jest.Mock<any, any, any>;
        getMessageById: jest.Mock<any, any, any>;
        getRecentChats: jest.Mock<any, any, any>;
        getChatStats: jest.Mock<any, any, any>;
        typingIndicator: jest.Mock<any, any, any>;
        searchMessages: jest.Mock<any, any, any>;
    };
    ai: {
        generateBio: jest.Mock<any, any, any>;
        analyzePetCompatibility: jest.Mock<any, any, any>;
        getPetInsights: jest.Mock<any, any, any>;
        getRecommendations: jest.Mock<any, any, any>;
        generateChatSuggestions: jest.Mock<any, any, any>;
        getMoodAnalysis: jest.Mock<any, any, any>;
    };
    subscription: {
        getCurrentSubscription: jest.Mock<any, any, any>;
        getPlans: jest.Mock<any, any, any>;
        createCheckoutSession: jest.Mock<any, any, any>;
        cancelSubscription: jest.Mock<any, any, any>;
        reactivateSubscription: jest.Mock<any, any, any>;
        updateSubscription: jest.Mock<any, any, any>;
        handleWebhook: jest.Mock<any, any, any>;
        getUsageStats: jest.Mock<any, any, any>;
        updatePaymentMethod: jest.Mock<any, any, any>;
    };
    analytics: {
        trackUserEvent: jest.Mock<any, any, any>;
        trackPetEvent: jest.Mock<any, any, any>;
        trackMatchEvent: jest.Mock<any, any, any>;
        getUserAnalytics: jest.Mock<any, any, any>;
        getPetAnalytics: jest.Mock<any, any, any>;
        getMatchAnalytics: jest.Mock<any, any, any>;
    };
    matching: {
        getRecommendations: jest.Mock<any, any, any>;
        getCompatibilityAnalysis: jest.Mock<any, any, any>;
    };
    videoCall: {
        createCall: jest.Mock<any, any, any>;
        joinCall: jest.Mock<any, any, any>;
        endCall: jest.Mock<any, any, any>;
        sendOffer: jest.Mock<any, any, any>;
        getAnswer: jest.Mock<any, any, any>;
        sendIceCandidate: jest.Mock<any, any, any>;
        startRecording: jest.Mock<any, any, any>;
        stopRecording: jest.Mock<any, any, any>;
    };
    request: jest.Mock<any, any, any>;
};
export default api;
//# sourceMappingURL=api.d.ts.map