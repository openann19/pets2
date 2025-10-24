/**
 * Legacy message shape from web API responses
 */
export interface LegacyWebMessage {
    id: string;
    _id?: string;
    senderId?: string;
    sender?: {
        id: string;
        _id?: string;
        name?: string;
        email?: string;
        avatar?: string;
        [key: string]: unknown;
    } | string;
    content: string;
    text?: string;
    message?: string;
    type?: string;
    messageType?: string;
    attachments?: Array<{
        type?: string;
        url: string;
        fileName?: string;
        fileType?: string;
    }>;
    readBy?: Array<{
        user: string;
        readAt: string;
    }>;
    timestamp?: string;
    sentAt?: string;
    createdAt?: string;
    editedAt?: string;
    isEdited?: boolean;
    isDeleted?: boolean;
    [key: string]: unknown;
}
/**
 * Convert legacy web message to core Message type
 */
import type { Message } from '../types';
export declare function toCoreMessage(legacy: LegacyWebMessage): Message;
/**
 * Convert array of legacy messages to core Message types
 */
export declare function toCoreMessages(legacyMessages: LegacyWebMessage[]): Message[];
//# sourceMappingURL=message.d.ts.map