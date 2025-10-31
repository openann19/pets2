/**
 * Form Validation Utilities
 * Phone number validation and normalization
 */
import { PHONE_DIGIT_REGEX } from '../types';

export const normalizeDigits = (phone: string): string => phone.replace(PHONE_DIGIT_REGEX, '');

export const validatePhoneNumber = (phone: string): boolean => {
  const digitsOnly = normalizeDigits(phone);
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

export const isPrimaryReferenceComplete = (references: Array<{ name: string; phone: string; relationship: string }>): boolean => {
  const primary = references[0];
  if (!primary) {
    return false;
  }

  return (
    [primary.name, primary.phone, primary.relationship].every(
      (value) => value.trim().length > 0 && !value.match(/^\s*$/),
    ) && validatePhoneNumber(primary.phone)
  );
};

