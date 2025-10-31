/**
 * Lost Pet Alert Form Hook
 * Manages form state for alert creation
 */
import { useState, useCallback } from 'react';
import type { AlertFormData, SightingFormData } from '../types';

const DEFAULT_ALERT_FORM: AlertFormData = {
  lastSeenLocation: '',
  description: '',
  reward: '',
  broadcastRadius: 5,
  contactMethod: 'inapp',
  contactValue: '',
};

const DEFAULT_SIGHTING_FORM: SightingFormData = {
  location: '',
  description: '',
  contactInfo: '',
};

export function useLostPetAlertForm() {
  const [alertForm, setAlertForm] = useState<AlertFormData>(DEFAULT_ALERT_FORM);
  const [sightingForm, setSightingForm] = useState<SightingFormData>(DEFAULT_SIGHTING_FORM);

  const updateAlertForm = useCallback((field: keyof AlertFormData, value: any) => {
    setAlertForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateSightingForm = useCallback((field: keyof SightingFormData, value: string) => {
    setSightingForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetAlertForm = useCallback(() => {
    setAlertForm(DEFAULT_ALERT_FORM);
  }, []);

  const resetSightingForm = useCallback(() => {
    setSightingForm(DEFAULT_SIGHTING_FORM);
  }, []);

  return {
    alertForm,
    sightingForm,
    updateAlertForm,
    updateSightingForm,
    resetAlertForm,
    resetSightingForm,
  };
}

