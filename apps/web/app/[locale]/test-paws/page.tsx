'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import PremiumButton from '@/components/UI/PremiumButton';

export default function TestPawsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          🐾 Paw Loading Animations 🐾
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Testing the new paw-themed loading spinners
        </p>

        {/* Different sizes */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Loading Spinner Sizes</h2>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Small</h3>
              <div className="bg-gray-50 rounded-xl p-6 min-h-[150px] flex items-center justify-center">
                <LoadingSpinner size="sm" color="#EC4899" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Medium</h3>
              <div className="bg-gray-50 rounded-xl p-6 min-h-[150px] flex items-center justify-center">
                <LoadingSpinner size="md" color="#9333EA" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Large</h3>
              <div className="bg-gray-50 rounded-xl p-6 min-h-[150px] flex items-center justify-center">
                <LoadingSpinner size="lg" color="#3B82F6" />
              </div>
            </div>
          </div>
        </div>

        {/* Different colors */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Color Variations</h2>
          
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-pink-50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                <LoadingSpinner size="md" color="#EC4899" />
              </div>
              <p className="mt-2 text-sm text-gray-600">Pink</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                <LoadingSpinner size="md" color="#9333EA" />
              </div>
              <p className="mt-2 text-sm text-gray-600">Purple</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                <LoadingSpinner size="md" color="#3B82F6" />
              </div>
              <p className="mt-2 text-sm text-gray-600">Blue</p>
            </div>

            <div className="text-center">
              <div className="bg-green-50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                <LoadingSpinner size="md" color="#10B981" />
              </div>
              <p className="mt-2 text-sm text-gray-600">Green</p>
            </div>
          </div>
        </div>

        {/* Premium Button with Paw Loading */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Premium Button Loading State</h2>
          
          <div className="flex flex-col items-center gap-6">
            <p className="text-gray-600 text-center">
              Click the button to see the paw loading animation in action!
            </p>
            
            <PremiumButton
              size="lg"
              loading={isLoading}
              onClick={handleButtonClick}
              className="w-64"
            >
              {isLoading ? 'Loading...' : 'Test Loading State'}
            </PremiumButton>

            {isLoading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500"
              >
                Loading for 3 seconds...
              </motion.p>
            )}
          </div>
        </div>

        {/* Dark background test */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-white">On Dark Background</h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 min-h-[120px] flex items-center justify-center">
              <LoadingSpinner size="md" color="#ffffff" />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 min-h-[120px] flex items-center justify-center">
              <LoadingSpinner size="md" color="#FCD34D" />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 min-h-[120px] flex items-center justify-center">
              <LoadingSpinner size="md" color="#34D399" />
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            ← Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
