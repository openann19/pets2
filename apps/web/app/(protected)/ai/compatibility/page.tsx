/**
 * AICompatibilityScreen - Web Version
 * Identical to mobile AICompatibilityScreen structure
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { logger } from '@pawfectmatch/core';

export default function AICompatibilityPage() {
  const router = useRouter();
  const { t } = useTranslation('ai');

  const [selectedPet1, setSelectedPet1] = useState<any | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<any | null>(null);
  const [availablePets, setAvailablePets] = useState<any[]>([]);

  React.useEffect(() => {
    // Load available pets
    const loadPets = async () => {
      try {
        const response = await fetch('/api/pets');
        const data = await response.json();
        setAvailablePets(data);
      } catch (error) {
        logger.error('Failed to load pets:', error);
      }
    };
    void loadPets();
  }, []);

  const analyzeCompatibility = async () => {
    if (!selectedPet1 || !selectedPet2) {
      alert('Please select two pets to analyze compatibility');
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet1Id: selectedPet1.id,
          pet2Id: selectedPet2.id,
        }),
      });
      const data = await response.json();
      setCompatibilityResult(data);
    } catch (error) {
      logger.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
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
                  {t('ai_compatibility.title', 'AI Compatibility Analyzer')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Pet Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Pets</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pet 1</label>
              <select
                value={selectedPet1?.id || ''}
                onChange={(e) => {
                  const pet = availablePets.find((p) => p.id === e.target.value);
                  setSelectedPet1(pet || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a pet</option>
                {availablePets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pet 2</label>
              <select
                value={selectedPet2?.id || ''}
                onChange={(e) => {
                  const pet = availablePets.find((p) => p.id === e.target.value);
                  setSelectedPet2(pet || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a pet</option>
                {availablePets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeCompatibility}
          disabled={!selectedPet1 || !selectedPet2 || isAnalyzing}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Analyze Compatibility
            </>
          )}
        </button>

        {/* Results */}
        {compatibilityResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-900">Compatibility Results</h2>
            {compatibilityResult.score && (
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {compatibilityResult.score}%
                </div>
                <p className="text-gray-600">Compatibility Score</p>
              </div>
            )}
            {compatibilityResult.insights && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Insights</h3>
                <p className="text-gray-900">{compatibilityResult.insights}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </ScreenShell>
  );
}
