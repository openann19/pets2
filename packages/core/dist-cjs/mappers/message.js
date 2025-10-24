"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCoreMessage = toCoreMessage;
exports.toCoreMessages = toCoreMessages;
function toCoreMessage(legacy) {
    const messageId = legacy._id ?? legacy.id;
    const contentCandidate = [legacy.content, legacy.text, legacy.message].find((value) => typeof value === 'string' && value.trim().length > 0);
    const content = contentCandidate ?? '';
    // Handle sender - could be string ID or object
    let sender;
    if (typeof legacy.sender === 'string' || legacy.sender === undefined) {
        // Create minimal user object
        const senderId = typeof legacy.sender === 'string' && legacy.sender.length > 0
            ? legacy.sender
            : legacy.senderId ?? messageId;
        sender = {
            _id: senderId,
            id: senderId, // Alias for _id
            email: '',
            firstName: 'User',
            lastName: '',
            dateOfBirth: '',
            age: 0,
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
                isActive: false,
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
                lastActive: new Date().toISOString(),
            },
            isEmailVerified: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    else {
        const senderObj = legacy.sender;
        const senderName = senderObj.name ?? 'User';
        const nameParts = senderName.split(' ');
        const firstName = nameParts[0] != null && nameParts[0].trim() !== '' ? nameParts[0] : 'User';
        const lastName = nameParts.slice(1).join(' ').trim();
        sender = {
            _id: senderObj._id ?? senderObj.id,
            id: senderObj.id,
            email: senderObj.email ?? '',
            firstName,
            lastName,
            dateOfBirth: '',
            age: 0,
            ...(senderObj.avatar != null && senderObj.avatar.trim() !== '' ? { avatar: senderObj.avatar } : {}),
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
                isActive: false,
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
                lastActive: new Date().toISOString(),
            },
            isEmailVerified: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    // Normalize message type
    const rawType = legacy.messageType ?? legacy.type ?? 'text';
    const isMessageType = (value) => {
        return value === 'text' || value === 'image' || value === 'location' || value === 'system';
    };
    const normalizedType = rawType.toLowerCase();
    const messageType = isMessageType(normalizedType) ? normalizedType : 'text';
    // Convert attachments
    const attachments = (legacy.attachments ?? []).map(att => {
        const fileName = att.fileName?.trim();
        const fileNameObj = fileName != null && fileName.length > 0 ? { fileName } : {};
        const resolvedFileType = att.fileType ?? att.type;
        return {
            type: att.type ?? att.fileType ?? 'file',
            url: att.url,
            ...fileNameObj,
            ...(resolvedFileType != null ? { fileType: resolvedFileType } : {}),
        };
    });
    // Get timestamp
    const sentAt = legacy.sentAt ?? legacy.timestamp ?? legacy.createdAt ?? new Date().toISOString();
    return {
        _id: messageId,
        sender,
        content,
        messageType,
        ...(attachments.length > 0 ? { attachments } : {}),
        readBy: legacy.readBy ?? [],
        sentAt,
        ...(legacy.editedAt != null ? { editedAt: legacy.editedAt } : {}),
        isEdited: legacy.isEdited ?? false,
        isDeleted: legacy.isDeleted ?? false,
    };
}
/**
 * Convert array of legacy messages to core Message types
 */
function toCoreMessages(legacyMessages) {
    return legacyMessages.map(toCoreMessage);
}
//# sourceMappingURL=message.js.map