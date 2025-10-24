/**
 * Web Pet Information Form Component
 * Production-hardened component for collecting pet details on web
 * Features: Form validation, accessibility, responsive design
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface PetInfoFormProps {
  petName: string;
  onPetNameChange: (name: string) => void;
  petBreed: string;
  onPetBreedChange: (breed: string) => void;
  petAge: string;
  onPetAgeChange: (age: string) => void;
  petPersonality: string;
  onPetPersonalityChange: (personality: string) => void;
  validationErrors: Record<string, string>;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function PetInfoForm({
  petName,
  onPetNameChange,
  petBreed,
  onPetBreedChange,
  petAge,
  onPetAgeChange,
  petPersonality,
  onPetPersonalityChange,
  validationErrors,
  onSubmit,
  isSubmitting = false,
}: PetInfoFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Pet Information</h2>
        <p className="text-gray-600">Tell us about your furry friend</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pet Name */}
        <div>
          <Input
            label="Pet Name"
            value={petName}
            onChange={(e) => onPetNameChange(e.target.value)}
            placeholder="Enter your pet's name"
            error={validationErrors.petName}
            required
            maxLength={50}
          />
        </div>

        {/* Pet Breed */}
        <div>
          <Input
            label="Pet Breed"
            value={petBreed}
            onChange={(e) => onPetBreedChange(e.target.value)}
            placeholder="e.g., Golden Retriever, Mixed Breed"
            error={validationErrors.petBreed}
            required
            maxLength={100}
          />
        </div>

        {/* Pet Age */}
        <div>
          <Input
            label="Pet Age"
            value={petAge}
            onChange={(e) => onPetAgeChange(e.target.value)}
            placeholder="e.g., 2 years old, 6 months"
            error={validationErrors.petAge}
            required
            maxLength={50}
          />
        </div>

        {/* Pet Personality */}
        <div>
          <Textarea
            label="Pet Personality"
            value={petPersonality}
            onChange={(e) => onPetPersonalityChange(e.target.value)}
            placeholder="Describe your pet's personality, habits, and quirks (e.g., energetic, loves belly rubs, afraid of thunderstorms)"
            error={validationErrors.petPersonality}
            required
            maxLength={500}
            rows={4}
            helperText={`${petPersonality.length}/500 characters`}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Processing...' : 'Continue to Tone Selection'}
          </Button>
        </div>
      </form>
    </div>
  );
}
