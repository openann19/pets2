/**
 * Form Type Definitions
 * Replaces any types used in form field updates
 */

export type FormFieldValue = string | number | boolean | string[] | null;

export type FormUpdateHandler<T> = <K extends keyof T>(
  field: K,
  value: T[K],
) => void;

/**
 * Pet form creation payload type
 */
export interface PetFormData {
  name?: string;
  species?: "dog" | "cat" | "bird" | "rabbit" | "other";
  breed?: string;
  age?: number;
  gender?: "male" | "female";
  size?: "tiny" | "small" | "medium" | "large" | "extra-large";
  weight?: number;
  bio?: string;
  intent?: "adoption" | "mating" | "playdate" | "all";
  personality?: string[];
  health?: string[];
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}
