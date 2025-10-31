/**
 * Adoption Application Form Hook
 * Manages form state and validation for adoption application
 */
import { useState, useCallback } from 'react';
import type { ApplicationData } from '../types';

const DEFAULT_FORM_DATA: ApplicationData = {
  experience: '',
  livingSpace: '',
  hasYard: false,
  otherPets: '',
  workSchedule: '',
  references: [
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
  ],
  veterinarian: { name: '', clinic: '', phone: '' },
  reason: '',
  commitment: '',
};

export function useAdoptionApplicationForm() {
  const [formData, setFormData] = useState<ApplicationData>(DEFAULT_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateFormData = useCallback(<K extends keyof ApplicationData>(
    field: K,
    value: ApplicationData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateReference = useCallback((index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)),
    }));
  }, []);

  const updateVeterinarian = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      veterinarian: { ...prev.veterinarian, [field]: value },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setFieldErrors({});
  }, []);

  return {
    formData,
    fieldErrors,
    setFieldErrors,
    updateFormData,
    updateReference,
    updateVeterinarian,
    resetForm,
  };
}

