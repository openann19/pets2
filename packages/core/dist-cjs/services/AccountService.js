"use strict";
/**
 * Account Management Service
 * GDPR-compliant account operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
class AccountService {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    /**
     * Request account deletion with 30-day grace period (GDPR Article 17)
     */
    async requestAccountDeletion(request, token) {
        const response = await fetch(`${this.baseUrl}/api/account/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'Failed to request account deletion');
        }
        return await response.json();
    }
    /**
     * Cancel pending account deletion (within grace period)
     */
    async cancelAccountDeletion(request, token) {
        const response = await fetch(`${this.baseUrl}/api/account/cancel-deletion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'Failed to cancel account deletion');
        }
        return await response.json();
    }
    /**
     * Deactivate account (temporary suspension)
     */
    async deactivateAccount(request, token) {
        const response = await fetch(`${this.baseUrl}/api/account/deactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'Failed to deactivate account');
        }
        return await response.json();
    }
    /**
     * Reactivate deactivated account
     */
    async reactivateAccount(token) {
        const response = await fetch(`${this.baseUrl}/api/account/reactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'Failed to reactivate account');
        }
        return await response.json();
    }
    /**
     * Request data export (GDPR Article 20)
     */
    async requestDataExport(request, token) {
        const response = await fetch(`${this.baseUrl}/api/account/export-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'Failed to request data export');
        }
        return await response.json();
    }
    /**
     * Check data export status
     */
    async getDataExportStatus(exportId, token) {
        const response = await fetch(`${this.baseUrl}/api/account/export-data/${exportId}/status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'Failed to get export status');
        }
        return await response.json();
    }
    /**
     * Download data export
     */
    async downloadDataExport(exportId, token) {
        const response = await fetch(`${this.baseUrl}/api/account/export-data/${exportId}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'Failed to download data export');
        }
        return await response.blob();
    }
}
exports.AccountService = AccountService;
//# sourceMappingURL=AccountService.js.map