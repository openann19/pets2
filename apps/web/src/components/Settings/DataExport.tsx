'use client';
/**
 * Data Export Component
 * GDPR Article 20 - Right to Data Portability
 * Allows users to download their personal data in machine-readable format
 */
import { logger } from '@pawfectmatch/core';
import { AlertCircle, CheckCircle, Clock, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../ui/toast';
;
export default function DataExport() {
    const toast = useToast();
    const [isRequesting, setIsRequesting] = useState(false);
    const [exportStatus, setExportStatus] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('json');
    const [includeOptions, setIncludeOptions] = useState({
        profile: true,
        pets: true,
        matches: true,
        messages: true,
        photos: true,
        activityLog: true,
        settings: true,
    });
    // Request data export
    const handleRequestExport = async () => {
        setIsRequesting(true);
        try {
            const response = await fetch('/api/account/export-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format: selectedFormat,
                    include: includeOptions,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to request data export');
            }
            const data = await response.json();
            setExportStatus(data);
            // Poll for completion if processing
            if (data.status === 'processing') {
                pollExportStatus(data.id);
            }
        }
        catch (error) {
            logger.error('Export request failed:', { error });
            toast.error('Export Request Failed', 'Unable to request data export. Please try again later.');
        }
        finally {
            setIsRequesting(false);
        }
    };
    // Poll export status
    const pollExportStatus = async (exportId) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/account/export-data/${exportId}/status`);
                const data = await response.json();
                setExportStatus(data);
                // Stop polling if completed or failed
                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(interval);
                }
            }
            catch (error) {
                logger.error('Failed to check export status:', { error });
                clearInterval(interval);
            }
        }, 3000); // Check every 3 seconds
    };
    // Download export file
    const handleDownload = () => {
        if (exportStatus?.downloadUrl) {
            window.location.href = exportStatus.downloadUrl;
        }
    };
    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes)
            return 'Unknown size';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };
    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    return (<div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Download Your Data
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Export a copy of your personal data in machine-readable format. This includes your profile,
                    pets, matches, messages, and activity history.
                </p>
            </div>

            {/* Data Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Select Data to Include
                </h3>

                <div className="space-y-3">
                    {Object.entries(includeOptions).map(([key, value]) => (<label key={key} className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={value} onChange={(e) => setIncludeOptions((prev) => ({
                ...prev,
                [key]: e.target.checked,
            }))} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"/>
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </label>))}
                </div>
            </div>

            {/* Format Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Export Format
                </h3>

                <div className="flex space-x-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" name="format" value="json" checked={selectedFormat === 'json'} onChange={() => setSelectedFormat('json')} className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"/>
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                JSON
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Machine-readable, preserves data structure
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" name="format" value="csv" checked={selectedFormat === 'csv'} onChange={() => setSelectedFormat('csv')} className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"/>
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                CSV
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Spreadsheet-friendly, tabular format
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Export Status */}
            {exportStatus && (<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start space-x-4">
                        {exportStatus.status === 'pending' && (<Clock className="w-6 h-6 text-yellow-500 flex-shrink-0"/>)}
                        {exportStatus.status === 'processing' && (<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 flex-shrink-0"/>)}
                        {exportStatus.status === 'completed' && (<CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0"/>)}
                        {exportStatus.status === 'failed' && (<AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0"/>)}

                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Export Status: {exportStatus.status.charAt(0).toUpperCase() + exportStatus.status.slice(1)}
                            </h4>

                            <dl className="mt-2 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Requested:</dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {formatDate(exportStatus.requestedAt)}
                                    </dd>
                                </div>

                                {exportStatus.completedAt && (<div className="flex justify-between">
                                        <dt className="text-gray-500 dark:text-gray-400">Completed:</dt>
                                        <dd className="text-gray-900 dark:text-white">
                                            {formatDate(exportStatus.completedAt)}
                                        </dd>
                                    </div>)}

                                {exportStatus.fileSize && (<div className="flex justify-between">
                                        <dt className="text-gray-500 dark:text-gray-400">File Size:</dt>
                                        <dd className="text-gray-900 dark:text-white">
                                            {formatFileSize(exportStatus.fileSize)}
                                        </dd>
                                    </div>)}

                                {exportStatus.expiresAt && (<div className="flex justify-between">
                                        <dt className="text-gray-500 dark:text-gray-400">Expires:</dt>
                                        <dd className="text-gray-900 dark:text-white">
                                            {formatDate(exportStatus.expiresAt)}
                                        </dd>
                                    </div>)}

                                {exportStatus.error && (<div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                        <p className="text-sm text-red-800 dark:text-red-300">
                                            {exportStatus.error}
                                        </p>
                                    </div>)}
                            </dl>

                            {exportStatus.status === 'completed' && exportStatus.downloadUrl && (<button onClick={handleDownload} className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                    <Download className="w-4 h-4 mr-2"/>
                                    Download Export
                                </button>)}
                        </div>
                    </div>
                </div>)}

            {/* Request Export Button */}
            {!exportStatus || exportStatus.status === 'completed' || exportStatus.status === 'failed' ? (<button onClick={handleRequestExport} disabled={isRequesting || !Object.values(includeOptions).some((v) => v)} className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isRequesting ? (<>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"/>
                            Requesting Export...
                        </>) : (<>
                            <FileText className="w-5 h-5 mr-2"/>
                            Request Data Export
                        </>)}
                </button>) : null}

            {/* Information Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Important Information
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                    <li>Export generation typically takes 5-15 minutes depending on data volume</li>
                    <li>Download links are valid for 7 days after generation</li>
                    <li>Exports contain all your personal data in compliance with GDPR Article 20</li>
                    <li>You can request a new export at any time</li>
                    <li>All data is encrypted during storage and transfer</li>
                </ul>
            </div>
        </div>);
}
//# sourceMappingURL=DataExport.jsx.map