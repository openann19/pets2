'use client';

import React from 'react';
import { PhotoAnalyzer } from '@/components/AI/PhotoAnalyzer';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AiPhotoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
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
              <div className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                <CameraIcon className="h-4 w-4 mr-2" />
                AI Photo Lab
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="py-8">
        <PhotoAnalyzer />
      </div>

      {/* Technology Section */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6">Powered by Advanced AI</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">🧬 Deep Learning Models</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• ResNet-152 for breed classification</li>
                <li>• YOLO v5 for pet detection</li>
                <li>• Vision Transformer for emotion analysis</li>
                <li>• Custom CNN for health assessment</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3">📊 Real-time Analysis</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Process photos in under 2 seconds</li>
                <li>• 98.5% breed identification accuracy</li>
                <li>• Analyze up to 10 photos simultaneously</li>
                <li>• Privacy-first: photos processed locally</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">15M+</div>
              <p className="text-sm mt-1 opacity-90">Photos Analyzed</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">183</div>
              <p className="text-sm mt-1 opacity-90">Breeds Recognized</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">99.2%</div>
              <p className="text-sm mt-1 opacity-90">Uptime</p>
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="font-bold text-lg mb-2">Perfect Photo Tips</h3>
            <p className="text-gray-600 text-sm">
              Use natural lighting, capture your pet at eye level, and ensure their full body is visible for best results.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2">Boost Match Rates</h3>
            <p className="text-gray-600 text-sm">
              Photos with high quality scores get 3x more likes. Follow our AI recommendations to improve.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold text-lg mb-2">Privacy Protected</h3>
            <p className="text-gray-600 text-sm">
              Your photos are encrypted and never shared. AI processing happens securely with bank-level encryption.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
