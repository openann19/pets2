export declare const _createMockPet: (overrides?: {}) => {
    _id: string;
    name: string;
    owner: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    size: string;
    weight: number;
    description: string;
    temperament: string[];
    energy: string;
    training: string;
    goodWithKids: boolean;
    goodWithPets: boolean;
    houseTrained: boolean;
    photos: string[];
    location: {
        latitude: number;
        longitude: number;
    };
};
export declare const _createMockUser: (overrides?: {}) => {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    premium: {
        isActive: boolean;
        plan: null;
        currentPeriodEnd: null;
        cancelAtPeriodEnd: boolean;
    };
    preferences: {
        maxDistance: number;
        ageRange: {
            min: number;
            max: number;
        };
        sizePreference: string[];
        breedPreference: never[];
        temperamentPreference: never[];
        notificationsEnabled: boolean;
        emailNotifications: boolean;
        pushNotifications: boolean;
    };
};
export declare const _createMockMatch: (overrides?: {}) => {
    _id: string;
    petId1: string;
    petId2: string;
    petName1: string;
    petName2: string;
    petPhoto1: string;
    petPhoto2: string;
    owner1: string;
    owner2: string;
    ownerName1: string;
    ownerName2: string;
    matchedAt: string;
    lastActivity: string;
    isActive: boolean;
    isArchived: boolean;
    lastMessage: {
        content: string;
        senderId: string;
        timestamp: string;
    };
    unreadCount: number;
};
export declare const _createMockMessage: (overrides?: {}) => {
    _id: string;
    matchId: string;
    senderId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    attachments: never[];
};
export declare const _createMockSubscription: (overrides?: {}) => {
    _id: string;
    userId: string;
    isActive: boolean;
    plan: {
        id: string;
        name: string;
        price: number;
        interval: string;
        features: string[];
        stripePriceId: string;
    };
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
};
export declare const AllProvidersWrapper: () => void;
export declare const _customRender: (ui: any, options?: {}) => any;
//# sourceMappingURL=test-helpers.d.ts.map