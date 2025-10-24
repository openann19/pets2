/**
 * Account Management Types
 * GDPR-compliant account deletion and data export types
 */
export interface AccountDeletionRequest {
    userId: string;
    reason?: 'privacy' | 'not_useful' | 'too_expensive' | 'found_match' | 'other';
    feedback?: string;
    confirmEmail: string;
    twoFactorCode?: string;
}
export interface AccountDeletionResponse {
    success: boolean;
    deletionScheduledDate: string;
    gracePeriodEndsAt: string;
    confirmationId: string;
    message: string;
}
export interface AccountReactivationRequest {
    confirmationId: string;
    email: string;
    twoFactorCode?: string;
}
export interface DataExportRequest {
    userId: string;
    includeMessages: boolean;
    includePhotos: boolean;
    includeMatches: boolean;
    includeAnalytics: boolean;
    format: 'json' | 'csv';
}
export interface DataExportResponse {
    exportId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    estimatedCompletionTime: string;
    downloadUrl?: string;
    expiresAt?: string;
    fileSize?: number;
}
export interface DataExportStatus {
    exportId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    expiresAt?: string;
    errorMessage?: string;
}
export interface AccountDeactivationRequest {
    userId: string;
    reason?: string;
    reactivationDate?: string;
}
export interface AccountDeactivationResponse {
    success: boolean;
    deactivatedAt: string;
    reactivationDate?: string;
    message: string;
}
export interface BlockedUser {
    userId: string;
    blockedUserId: string;
    blockedAt: string;
    reason?: string;
}
export interface ReportedUser {
    reportId: string;
    reportedUserId: string;
    reportedBy: string;
    reason: 'spam' | 'harassment' | 'fake_profile' | 'inappropriate_content' | 'scam' | 'underage' | 'other';
    description?: string;
    evidence?: string[];
    reportedAt: string;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
}
export interface PrivacySettings {
    profileVisibility: 'everyone' | 'matches' | 'nobody';
    showOnlineStatus: boolean;
    showDistance: boolean;
    showLastActive: boolean;
    allowMessages: 'everyone' | 'matches' | 'nobody';
    showReadReceipts: boolean;
    incognitoMode: boolean;
    shareLocation: boolean;
}
export interface NotificationPreferences {
    enabled: boolean;
    matches: boolean;
    messages: boolean;
    likes: boolean;
    reminders: boolean;
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
    frequency: 'instant' | 'batched' | 'daily';
    sound: boolean;
    vibration: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
}
//# sourceMappingURL=account.d.ts.map