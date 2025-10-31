/**
 * Web Bio Results Component
 * Production-hardened component for displaying AI-generated pet bios on web
 * Features: Rich display, copy functionality, save options, match scoring
 */

import React, { useState } from 'react';
import { GeneratedBio } from '../../hooks/useWebAIBio';
import { Button } from '@/components/UI/Button';
import { copyToClipboard } from '../../lib/utils';

interface BioResultsProps {
  generatedBio: GeneratedBio;
  onSave?: (bio: GeneratedBio) => void;
  onRegenerate?: () => void;
}

export function BioResults({ generatedBio, onSave, onRegenerate }: BioResultsProps) {
  // Type assertion to help the linter understand the type
  const bio = generatedBio;
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(bio.bio);
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    } catch (_error) {
      // Handle copy failure silently
    }
  };

  const handleSave = () => {
    if (onSave !== undefined) {
      onSave(bio);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your AI-Generated Bio</h2>
        <p className="text-gray-600">Here's what we created for your pet!</p>
      </div>

      {/* Bio Content Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="p-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {bio.bio}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex flex-wrap gap-3">
          <Button
            onClick={handleCopy}
            variant="ghost"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          >
            {copied ? 'Copied!' : 'Copy Bio'}
          </Button>

          {onSave !== undefined && (
            <Button
              onClick={handleSave}
              variant="ghost"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              }
            >
              Save Bio
            </Button>
          )}

          {onRegenerate !== undefined && (
            <Button
              onClick={onRegenerate}
              variant="ghost"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Generate New
            </Button>
          )}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Bio Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Match Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Match Score</span>
              <span className={`text-lg font-bold ${getMatchScoreColor(generatedBio.matchScore)}`}>
                {String(generatedBio.matchScore)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${String(generatedBio.matchScore)}%`,
                  backgroundColor: Number(generatedBio.matchScore) >= 80 ? '#16a34a' :
                                   Number(generatedBio.matchScore) >= 60 ? '#ca8a04' : '#dc2626'
                }}
              />
            </div>
          </div>

          {/* Sentiment Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Sentiment</span>
              <span className={`text-lg font-bold px-3 py-1 rounded-full ${getSentimentColor(Number(generatedBio.sentiment.score))}`}>
                {String(generatedBio.sentiment.label)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Score: {String(Math.round(Number(generatedBio.sentiment.score) * 100))}%
            </p>
          </div>
        </div>

        {/* Keywords */}
        {generatedBio.keywords.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Key Traits</h4>
            <div className="flex flex-wrap gap-2">
              {generatedBio.keywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
