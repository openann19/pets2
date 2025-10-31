/**
 * Adoption Application Types
 * Type definitions for adoption application form
 */
export interface ApplicationData {
  experience: string;
  livingSpace: string;
  hasYard: boolean;
  otherPets: string;
  workSchedule: string;
  references: { name: string; phone: string; relationship: string }[];
  veterinarian: { name: string; clinic: string; phone: string };
  reason: string;
  commitment: string;
}

export interface Reference {
  name: string;
  phone: string;
  relationship: string;
}

export interface Veterinarian {
  name: string;
  clinic: string;
  phone: string;
}

export const EXPERIENCE_OPTIONS = ['First-time owner', '1-5 years', '5-10 years', '10+ years'] as const;

export const LIVING_SPACE_OPTIONS = [
  'Apartment',
  'House with yard',
  'House without yard',
  'Farm/Rural',
] as const;

export const YARD_CHOICES: Array<{ label: string; value: boolean }> = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

export const PHONE_DIGIT_REGEX = /\D/g;

export const AGREEMENT_ITEMS = [
  'Provide a safe, loving home for the pet',
  'Cover all medical expenses and regular veterinary care',
  'Allow a home visit if requested',
  'Return the pet to the owner if unable to care for it',
  'Provide updates on the pet\'s wellbeing',
] as const;

