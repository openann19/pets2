"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCoreUser = toCoreUser;
function splitName(name) {
    const trimmed = name.trim();
    if (trimmed.length === 0)
        return { firstName: '', lastName: '' };
    const parts = trimmed.split(/\s+/);
    const firstName = parts[0] != null ? parts[0] : '';
    const lastName = parts.slice(1).join(' ').length > 0 ? parts.slice(1).join(' ') : '';
    return { firstName, lastName };
}
function toCoreUser(legacy) {
    const { firstName, lastName } = splitName(legacy.name);
    const now = new Date().toISOString();
    return {
        _id: legacy.id,
        id: legacy.id, // Alias for _id
        email: legacy.email,
        firstName,
        lastName,
        dateOfBirth: '', // unknown from legacy; keep empty string
        age: 0, // unknown from legacy
        ...(legacy.avatar != null && legacy.avatar.length > 0 ? { avatar: legacy.avatar } : {}),
        bio: '',
        phone: '',
        location: {
            type: 'Point',
            coordinates: [0, 0],
        },
        preferences: {
            maxDistance: 50,
            ageRange: { min: 18, max: 100 },
            species: [],
            intents: [],
            notifications: {
                email: true,
                push: true,
                matches: true,
                messages: true,
            },
        },
        premium: {
            isActive: legacy.isPremium ?? false,
            plan: 'basic',
            features: {
                unlimitedLikes: false,
                boostProfile: false,
                seeWhoLiked: false,
                advancedFilters: false,
            },
        },
        pets: [],
        analytics: {
            totalSwipes: 0,
            totalLikes: 0,
            totalMatches: 0,
            profileViews: 0,
            lastActive: now,
        },
        isEmailVerified: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
}
//# sourceMappingURL=user.js.map