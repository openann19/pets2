import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import gdprService from '../../../services/gdprService';
import { logger } from '@pawfectmatch/core';

export interface UseDataExportReturn {
  isExporting: boolean;
  exportData: () => Promise<boolean>;
  error: string | null;
}

/**
 * Hook for exporting user data (GDPR)
 */
export function useDataExport(): UseDataExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (): Promise<boolean> => {
    setIsExporting(true);
    setError(null);

    try {
      const result = await gdprService.exportUserData();

      if (result.success) {
        Alert.alert(
          'Data Export Started',
          "Your data export has been initiated. You'll receive an email when it's ready.",
        );
        logger.info('Data export requested', { exportId: result.exportId });
        return true;
      }

      Alert.alert('Error', result.message || 'Failed to export data');
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      logger.error('Data export failed:', { error: errorMessage });
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportData,
    error,
  };
}
