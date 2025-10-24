/**
 * Export Utilities for Dashboard Data
 * Supports CSV, JSON, and PDF export formats
 */
import { logger } from '../services/logger';
/**
 * Export dashboard data to various formats
 */
export class DataExporter {
    /**
     * Export data as CSV
     */
    static exportToCSV(data, options = {}) {
        try {
            if (!data.length) {
                throw new Error('No data to export');
            }
            const { filename = 'export', includeTimestamp = true, delimiter = ',' } = options;
            // Get all unique keys from the data
            const headers = Array.from(new Set(data.flatMap(item => Object.keys(item))));
            // Create CSV content
            const csvContent = [
                headers.join(delimiter),
                ...data.map(row => headers.map(header => {
                    const value = row[header];
                    // Escape values containing delimiter, quotes, or newlines
                    const stringValue = String(value ?? '');
                    if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                }).join(delimiter))
            ].join('\n');
            this.downloadFile(csvContent, `${filename}${includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''}.csv`, 'text/csv');
            logger.info('CSV export completed', { filename, recordCount: data.length });
        }
        catch (error) {
            logger.error('CSV export failed', { error });
            throw error;
        }
    }
    /**
     * Export data as JSON
     */
    static exportToJSON(data, options = {}) {
        try {
            const { filename = 'export', includeTimestamp = true } = options;
            const jsonContent = JSON.stringify(data, null, 2);
            this.downloadFile(jsonContent, `${filename}${includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''}.json`, 'application/json');
            logger.info('JSON export completed', { filename });
        }
        catch (error) {
            logger.error('JSON export failed', { error });
            throw error;
        }
    }
    /**
     * Export data as PDF (basic implementation)
     * Note: For production, consider using libraries like jsPDF or react-pdf
     */
    static exportToPDF(data, options = {}) {
        try {
            const { filename = 'export', includeTimestamp = true } = options;
            // Create a simple HTML representation for PDF generation
            const htmlContent = this.generateHTMLForPDF(data);
            // For now, we'll create a downloadable HTML file
            // In production, this would use a PDF library
            this.downloadFile(htmlContent, `${filename}${includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''}.html`, 'text/html');
            logger.info('PDF export completed (HTML format)', { filename });
        }
        catch (error) {
            logger.error('PDF export failed', { error });
            throw error;
        }
    }
    /**
     * Generate HTML content for PDF export
     */
    static generateHTMLForPDF(data) {
        const timestamp = new Date().toLocaleString();
        let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PawfectMatch Dashboard Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; font-weight: bold; }
          .timestamp { color: #6b7280; font-size: 0.875rem; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>PawfectMatch Dashboard Export</h1>
        <p class="timestamp">Generated on: ${timestamp}</p>
    `;
        // Generate sections for different data types
        Object.entries(data).forEach(([section, sectionData]) => {
            html += `<h2>${this.formatTitle(section)}</h2>`;
            if (Array.isArray(sectionData)) {
                html += this.generateTableFromArray(sectionData);
            }
            else if (typeof sectionData === 'object' && sectionData !== null) {
                html += this.generateTableFromObject(sectionData);
            }
            else {
                html += `<p>${String(sectionData)}</p>`;
            }
        });
        html += `
      </body>
      </html>
    `;
        return html;
    }
    /**
     * Generate HTML table from array data
     */
    static generateTableFromArray(data) {
        if (!data.length)
            return '<p>No data available</p>';
        const headers = Array.from(new Set(data.flatMap(item => typeof item === 'object' && item !== null ? Object.keys(item) : [])));
        let table = '<table><thead><tr>';
        headers.forEach(header => {
            table += `<th>${this.formatTitle(header)}</th>`;
        });
        table += '</tr></thead><tbody>';
        data.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                table += '<tr>';
                headers.forEach(header => {
                    const value = item[header];
                    table += `<td>${this.formatValue(value)}</td>`;
                });
                table += '</tr>';
            }
        });
        table += '</tbody></table>';
        return table;
    }
    /**
     * Generate HTML table from object data
     */
    static generateTableFromObject(data) {
        let table = '<table><tbody>';
        Object.entries(data).forEach(([key, value]) => {
            table += `<tr><td><strong>${this.formatTitle(key)}</strong></td><td>${this.formatValue(value)}</td></tr>`;
        });
        table += '</tbody></table>';
        return table;
    }
    /**
     * Format title for display
     */
    static formatTitle(str) {
        return str
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }
    /**
     * Format value for display
     */
    static formatValue(value) {
        if (value === null || value === undefined)
            return '-';
        if (typeof value === 'boolean')
            return value ? 'Yes' : 'No';
        if (typeof value === 'object')
            return JSON.stringify(value);
        return String(value);
    }
    /**
     * Download file using browser APIs
     */
    static downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            logger.error('File download failed', { error, filename });
            throw new Error('Failed to download file');
        }
    }
}
/**
 * Export dashboard analytics data
 */
export const exportDashboardData = (data, format, options = {}) => {
    const { filename = 'dashboard-export' } = options;
    try {
        switch (format) {
            case 'csv': {
                // Convert nested object to flat array for CSV
                const flattenedData = flattenDashboardData(data);
                DataExporter.exportToCSV(flattenedData, { ...options, filename });
                break;
            }
            case 'json':
                DataExporter.exportToJSON(data, { ...options, filename });
                break;
            case 'pdf':
                DataExporter.exportToPDF(data, { ...options, filename });
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
        logger.info('Dashboard export completed', { format, filename });
    }
    catch (error) {
        logger.error('Dashboard export failed', { error, format, filename });
        throw error;
    }
};
/**
 * Flatten nested dashboard data for CSV export
 */
function flattenDashboardData(data) {
    const result = [];
    Object.entries(data).forEach(([section, sectionData]) => {
        if (Array.isArray(sectionData)) {
            sectionData.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    result.push({
                        section,
                        index,
                        ...flattenObject(item)
                    });
                }
            });
        }
        else if (typeof sectionData === 'object' && sectionData !== null) {
            result.push({
                section,
                ...flattenObject(sectionData)
            });
        }
        else {
            result.push({
                section,
                value: sectionData
            });
        }
    });
    return result;
}
/**
 * Flatten nested object for CSV export
 */
function flattenObject(obj, prefix = '') {
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, newKey));
        }
        else if (Array.isArray(value)) {
            result[newKey] = value.join('; '); // Join arrays for CSV
        }
        else {
            result[newKey] = value;
        }
    });
    return result;
}
//# sourceMappingURL=export.js.map