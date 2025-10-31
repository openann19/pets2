/**
 * Safety Welfare Form Hook
 * Manages form state for incident reporting
 */
import { useState, useCallback } from 'react';
import type { IncidentReport } from '../types';

const DEFAULT_REPORT_FORM: Partial<IncidentReport> = {
  type: undefined,
  severity: 'medium',
  description: '',
  contactInfo: { name: '' },
};

export function useSafetyWelfareForm() {
  const [reportForm, setReportForm] = useState<Partial<IncidentReport>>(DEFAULT_REPORT_FORM);

  const updateReportForm = useCallback((field: keyof IncidentReport, value: any) => {
    setReportForm((prev) => {
      if (field === 'contactInfo') {
        return { ...prev, contactInfo: { ...prev.contactInfo, ...value } };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const resetForm = useCallback(() => {
    setReportForm(DEFAULT_REPORT_FORM);
  }, []);

  return {
    reportForm,
    updateReportForm,
    resetForm,
  };
}

