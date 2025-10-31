/**
 * Form Validation Utilities
 * Comprehensive validation functions for adoption applications and other forms
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  field: string;
  value: unknown;
  rules: ValidationRule[];
}

export interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      valid: false,
      error: 'Phone number must be between 7 and 15 digits',
    };
  }

  return { valid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: unknown,
  fieldName: string,
): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string,
): { valid: boolean; error?: string } {
  if (!value || value.trim().length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string,
): { valid: boolean; error?: string } {
  if (value && value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate adoption application form
 */
export interface AdoptionApplicationFormData {
  experience: string;
  livingSpace: string;
  hasYard?: boolean;
  otherPets?: string;
  workSchedule: string;
  reason: string;
  commitment: string;
  references: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  veterinarian?: {
    name: string;
    clinic: string;
    phone: string;
  };
}

export function validateAdoptionApplication(
  formData: AdoptionApplicationFormData,
): ValidationResult {
  const errors: Record<string, string> = {};

  // Step 0: Experience and Living Space
  const experienceValidation = validateRequired(formData.experience, 'Pet experience');
  if (!experienceValidation.valid) {
    errors['experience'] = experienceValidation.error || 'Pet experience is required';
  }

  const livingSpaceValidation = validateRequired(formData.livingSpace, 'Living space');
  if (!livingSpaceValidation.valid) {
    errors['livingSpace'] = livingSpaceValidation.error || 'Living space is required';
  }

  // Step 1: Work Schedule and Reason
  const workScheduleValidation = validateRequired(formData.workSchedule, 'Work schedule');
  if (!workScheduleValidation.valid) {
    errors['workSchedule'] = workScheduleValidation.error || 'Work schedule is required';
  } else {
    const minLengthValidation = validateMinLength(formData.workSchedule, 10, 'Work schedule');
    if (!minLengthValidation.valid) {
      errors['workSchedule'] = minLengthValidation.error || 'Work schedule is too short';
    }
  }

  const reasonValidation = validateRequired(formData.reason, 'Adoption reason');
  if (!reasonValidation.valid) {
    errors['reason'] = reasonValidation.error || 'Adoption reason is required';
  } else {
    const minLengthValidation = validateMinLength(formData.reason, 20, 'Adoption reason');
    if (!minLengthValidation.valid) {
      errors['reason'] = minLengthValidation.error || 'Please provide more details about why you want to adopt';
    }
  }

  // Step 2: References
  if (!formData.references || formData.references.length === 0) {
    errors['references'] = 'At least one reference is required';
  } else {
    const primaryReference = formData.references[0];
    if (primaryReference) {
      const nameValidation = validateRequired(primaryReference.name, 'Reference name');
      if (!nameValidation.valid) {
        errors['references.0.name'] = nameValidation.error || 'Reference name is required';
      }

      const phoneValidation = validatePhone(primaryReference.phone);
      if (!phoneValidation.valid) {
        errors['references.0.phone'] = phoneValidation.error || 'Valid phone number is required';
      }

      const relationshipValidation = validateRequired(
        primaryReference.relationship,
        'Relationship',
      );
      if (!relationshipValidation.valid) {
        errors['references.0.relationship'] =
          relationshipValidation.error || 'Relationship is required';
      }
    }
  }

  // Validate veterinarian if provided
  if (formData.veterinarian) {
    const vetName = formData.veterinarian.name.trim();
    const vetPhone = formData.veterinarian.phone.trim();
    const vetClinic = formData.veterinarian.clinic.trim();

    // If any veterinarian field is filled, all should be filled
    if (vetName || vetPhone || vetClinic) {
      if (!vetName) {
        errors['veterinarian.name'] = 'Veterinarian name is required if providing veterinarian info';
      }
      if (!vetClinic) {
        errors['veterinarian.clinic'] = 'Clinic name is required if providing veterinarian info';
      }
      if (!vetPhone) {
        errors['veterinarian.phone'] = 'Clinic phone is required if providing veterinarian info';
      } else {
        const vetPhoneValidation = validatePhone(vetPhone);
        if (!vetPhoneValidation.valid) {
          errors['veterinarian.phone'] = vetPhoneValidation.error || 'Valid phone number is required';
        }
      }
    }
  }

  // Step 3: Commitment
  const commitmentValidation = validateRequired(formData['commitment'], 'Commitment statement');
  if (!commitmentValidation.valid) {
    errors['commitment'] = commitmentValidation.error || 'Commitment statement is required';
  } else {
    const minLengthValidation = validateMinLength(formData['commitment'], 50, 'Commitment statement');
    if (!minLengthValidation.valid) {
      errors['commitment'] =
        minLengthValidation.error ||
        'Please provide a detailed commitment statement (at least 50 characters)';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate step by step for multi-step forms
 */
export function validateAdoptionApplicationStep(
  formData: AdoptionApplicationFormData,
  step: number,
): ValidationResult {
  const errors: Record<string, string> = {};

  switch (step) {
    case 0:
      // Experience and Living Space
      const experienceValidation = validateRequired(formData['experience'], 'Pet experience');
      if (!experienceValidation.valid) {
        errors['experience'] = experienceValidation.error || 'Please select your pet experience level';
      }

      const livingSpaceValidation = validateRequired(formData['livingSpace'], 'Living space');
      if (!livingSpaceValidation.valid) {
        errors['livingSpace'] = livingSpaceValidation.error || 'Please select your living space type';
      }
      break;

    case 1:
      // Work Schedule and Reason
      const workScheduleValidation = validateRequired(formData['workSchedule'], 'Work schedule');
      if (!workScheduleValidation.valid) {
        errors['workSchedule'] = workScheduleValidation.error || 'Please describe your work schedule';
      } else {
        const minLengthValidation = validateMinLength(formData['workSchedule'], 10, 'Work schedule');
        if (!minLengthValidation.valid) {
          errors['workSchedule'] = 'Please provide more details about your work schedule';
        }
      }

      const reasonValidation = validateRequired(formData['reason'], 'Adoption reason');
      if (!reasonValidation.valid) {
        errors['reason'] = reasonValidation.error || 'Please explain why you want to adopt this pet';
      } else {
        const minLengthValidation = validateMinLength(formData['reason'], 20, 'Adoption reason');
        if (!minLengthValidation.valid) {
          errors['reason'] = 'Please provide more details (at least 20 characters)';
        }
      }
      break;

    case 2:
      // References
      if (!formData['references'] || formData['references'].length === 0) {
        errors['references'] = 'At least one reference is required';
      } else {
        const primaryReference = formData.references[0];
        if (primaryReference) {
          const nameValidation = validateRequired(primaryReference.name, 'Reference name');
          if (!nameValidation.valid) {
            errors['references.0.name'] = 'Reference name is required';
          }

          const phoneValidation = validatePhone(primaryReference.phone);
          if (!phoneValidation.valid) {
            errors['references.0.phone'] = phoneValidation.error || 'Valid phone number is required';
          }

          const relationshipValidation = validateRequired(
            primaryReference.relationship,
            'Relationship',
          );
          if (!relationshipValidation.valid) {
            errors['references.0.relationship'] = 'Relationship is required';
          }
        }
      }

      // Validate veterinarian if provided
      if (formData.veterinarian) {
        const vetName = formData.veterinarian.name.trim();
        const vetPhone = formData.veterinarian.phone.trim();
        const vetClinic = formData.veterinarian.clinic.trim();

        if (vetName || vetPhone || vetClinic) {
          if (!vetName) {
            errors['veterinarian.name'] = 'Veterinarian name is required';
          }
          if (!vetClinic) {
            errors['veterinarian.clinic'] = 'Clinic name is required';
          }
          if (!vetPhone) {
            errors['veterinarian.phone'] = 'Clinic phone is required';
          } else {
            const vetPhoneValidation = validatePhone(vetPhone);
            if (!vetPhoneValidation.valid) {
              errors['veterinarian.phone'] = vetPhoneValidation.error || 'Valid phone number is required';
            }
          }
        }
      }
      break;

    case 3:
      // Commitment
      const commitmentValidation = validateRequired(formData['commitment'], 'Commitment statement');
      if (!commitmentValidation.valid) {
        errors['commitment'] = 'Commitment statement is required';
      } else {
        const minLengthValidation = validateMinLength(formData['commitment'], 50, 'Commitment');
        if (!minLengthValidation.valid) {
          errors['commitment'] = 'Please provide a more detailed commitment statement (at least 50 characters)';
        }
      }
      break;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

