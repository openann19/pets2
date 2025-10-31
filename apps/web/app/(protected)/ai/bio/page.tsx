/**
 * AIBioScreen - Web Version
 * Identical to mobile AIBioScreen structure
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { logger } from '@pawfectmatch/core';

export default function AIBioPage() {
  const router = useRouter();
  const { t } = useTranslation('ai');

  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petPersonality, setPetPersonality] = useState('');
  const [selectedTone, setSelectedTone] = useState('friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBio, setGeneratedBio] = useState<string | null>(null);

  const tones = [
    { id: 'friendly', label: 'Friendly', emoji: '😊' },
    { id: 'playful', label: 'Playful', emoji: '🎾' },
    { id: 'calm', label: 'Calm', emoji: '🧘' },
    { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Call AI bio generation API
      const response = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName,
          petBreed,
          petAge,
          petPersonality,
          tone: selectedTone,
        }),
      });
      const data = await response.json();
      setGeneratedBio(data.bio);
    } catch (error) {
      logger.error('Failed to generate bio:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('ai_bio.title', 'AI Bio Generator')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Pet Info Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pet Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter pet name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter breed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="text"
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter age"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
            <textarea
              value={petPersonality}
              onChange={(e) => setPetPersonality(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your pet's personality..."
            />
          </div>
        </div>

        {/* Tone Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Writing Tone</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tones.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTone === tone.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="text-2xl mb-2 block">{tone.emoji}</span>
                <span className="text-sm font-medium text-gray-900">{tone.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !petName || !petBreed}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Generate Bio
            </>
          )}
        </button>

        {/* Generated Bio */}
        {generatedBio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Bio</h2>
            <p className="text-gray-700 leading-relaxed">{generatedBio}</p>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Save Bio
              </button>
              <button
                onClick={() => setGeneratedBio(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </ScreenShell>
  );
}
