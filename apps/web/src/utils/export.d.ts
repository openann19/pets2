/**
 * Export Utilities for Dashboard Data
 * Supports CSV, JSON, and PDF export formats
 */
export type ExportFormat = 'csv' | 'json' | 'pdf';
export interface ExportOptions {
    filename?: string;
    includeTimestamp?: boolean;
    delimiter?: string;
}
/**
 * Export dashboard data to various formats
 */
export declare class DataExporter {
    /**
     * Export data as CSV
     */
    static exportToCSV(data: Record<string, unknown>[], options?: ExportOptions): void;
    /**
     * Export data as JSON
     */
    static exportToJSON(data: unknown, options?: ExportOptions): void;
    /**
     * Export data as PDF (basic implementation)
     * Note: For production, consider using libraries like jsPDF or react-pdf
     */
    static exportToPDF(data: Record<string, unknown>, options?: ExportOptions): void;
    /**
     * Generate HTML content for PDF export
     */
    private static generateHTMLForPDF;
    /**
     * Generate HTML table from array data
     */
    private static generateTableFromArray;
    /**
     * Generate HTML table from object data
     */
    private static generateTableFromObject;
    /**
     * Format title for display
     */
    private static formatTitle;
    /**
     * Format value for display
     */
    private static formatValue;
    /**
     * Download file using browser APIs
     */
    private static downloadFile;
}
/**
 * Export dashboard analytics data
 */
export declare const exportDashboardData: (data: Record<string, unknown>, format: ExportFormat, options?: ExportOptions) => void;
//# sourceMappingURL=export.d.ts.map