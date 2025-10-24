/**
 * Web Tone Selector Component
 * Production-hardened component for selecting AI bio generation tone on web
 * Features: Visual selection, accessibility, responsive design
 */

import React from 'react';
import { TONE_OPTIONS } from '../../hooks/useWebAIBio';

interface ToneSelectorProps {
  selectedTone: string;
  onToneSelect: (toneId: string) => void;
}

interface ToneOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const TONE_DETAILS: ToneOption[] = TONE_OPTIONS.map(tone => ({
  ...tone,
  description: getToneDescription(tone.id),
}));

function getToneDescription(toneId: string): string {
  switch (toneId) {
    case 'playful':
      return 'Fun and energetic personality';
    case 'professional':
      return 'Polite and well-mannered';
    case 'casual':
      return 'Relaxed and friendly';
    case 'romantic':
      return 'Sweet and affectionate';
    case 'mysterious':
      return 'Intriguing and enigmatic';
    default:
      return 'Unique personality';
  }
}

export function ToneSelector({ selectedTone, onToneSelect }: ToneSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Bio Tone</h2>
        <p className="text-gray-600">Select the personality that best matches your pet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TONE_DETAILS.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onToneSelect(tone.id)}
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              selectedTone === tone.id
                ? `border-[${tone.color}] bg-blue-50 shadow-md`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            aria-label={`Select ${tone.label} tone`}
            aria-pressed={selectedTone === tone.id}
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${tone.color}20` }}
              >
                {tone.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {tone.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {tone.description}
                </p>
              </div>
              {selectedTone === tone.id && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: tone.color }}
                >
                  ✓
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
