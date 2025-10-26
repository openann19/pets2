/**
 * Account Management Service
 * GDPR-compliant account operations
 */
import type { AccountDeletionRequest, AccountDeletionResponse, AccountReactivationRequest, AccountDeactivationRequest, AccountDeactivationResponse, DataExportRequest, DataExportResponse, DataExportStatus } from '../types/account';
export declare class AccountService {
    private baseUrl;
    constructor(baseUrl: string);
    /**
     * Request account deletion with 30-day grace period (GDPR Article 17)
     */
    requestAccountDeletion(request: AccountDeletionRequest, token: string): Promise<AccountDeletionResponse>;
    /**
     * Cancel pending account deletion (within grace period)
     */
    cancelAccountDeletion(request: AccountReactivationRequest, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Deactivate account (temporary suspension)
     */
    deactivateAccount(request: AccountDeactivationRequest, token: string): Promise<AccountDeactivationResponse>;
    /**
     * Reactivate deactivated account
     */
    reactivateAccount(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Request data export (GDPR Article 20)
     */
    requestDataExport(request: DataExportRequest, token: string): Promise<DataExportResponse>;
    /**
     * Check data export status
     */
    getDataExportStatus(exportId: string, token: string): Promise<DataExportStatus>;
    /**
     * Download data export
     */
    downloadDataExport(exportId: string, token: string): Promise<Blob>;
}
