'use client';

import React from 'react';
import { BioGenerator } from '../../../../src/components/AI/BioGenerator';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AiBioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Premium Feature
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="py-8">
        <BioGenerator />
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2">Match Optimization</h3>
            <p className="text-gray-600 text-sm">
              AI-generated bios increase match rates by up to 73% based on our analysis of successful profiles.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="font-bold text-lg mb-2">Smart Suggestions</h3>
            <p className="text-gray-600 text-sm">
              Our AI learns from millions of pet profiles to suggest the perfect words for your furry friend.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">📸</div>
            <h3 className="font-bold text-lg mb-2">Photo Intelligence</h3>
            <p className="text-gray-600 text-sm">
              Upload a photo and let AI analyze breed, age, and personality traits automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
