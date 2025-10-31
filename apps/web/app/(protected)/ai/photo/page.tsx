/**
 * AIPhotoAnalyzerScreen - Web Version
 * Identical to mobile AIPhotoAnalyzerScreen structure
 */

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/src/components/layout/ScreenShell';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { logger } from '@pawfectmatch/core';

export default function AIPhotoPage() {
  const router = useRouter();
  const { t } = useTranslation('ai');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handlePhotoSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoUrl(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const pickPhoto = () => {
    fileInputRef.current?.click();
  };

  const onAnalyze = async () => {
    if (!photoUrl) return;
    setLoading(true);
    try {
      // Convert data URL to blob
      const response = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: photoUrl }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      logger.error('Analysis failed:', error);
    } finally {
      setLoading(false);
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
                  {t('ai_photo.title', 'AI Photo Analyzer')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get insights on your pet's photos</h2>
          <p className="text-gray-600">Upload a photo to get AI-powered analysis</p>
        </div>

        {/* Photo Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoSelect(file);
            }}
            className="hidden"
          />
          <div className="flex gap-4">
            <button
              onClick={pickPhoto}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors"
            >
              <PhotoIcon className="w-6 h-6 text-gray-600" />
              <span className="font-medium text-gray-700">Pick from Library</span>
            </button>
          </div>
          {photoUrl && (
            <div className="mt-4">
              <img
                src={photoUrl}
                alt="Pet photo"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={onAnalyze}
          disabled={!photoUrl || loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <CameraIcon className="w-5 h-5" />
              Analyze Photo
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
            {result.breed && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Breed</h3>
                <p className="text-gray-900">{result.breed}</p>
              </div>
            )}
            {result.emotions && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Emotions</h3>
                <p className="text-gray-900">{result.emotions.join(', ')}</p>
              </div>
            )}
            {result.health && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Health Observations</h3>
                <p className="text-gray-900">{result.health}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </ScreenShell>
  );
}
