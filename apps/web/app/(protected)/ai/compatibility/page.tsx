'use client';

import { ArrowLeftIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CompatibilityAnalyzer } from '../../../../src/components/AI/CompatibilityAnalyzer';

export default function AiCompatibilityPage() {
  const searchParams = useSearchParams();
  const targetPetId = searchParams.get('petId');
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  useEffect(() => {
    // Load recent analyses from localStorage
    const saved = localStorage.getItem('compatibility_analyses');
    if (saved) {
      setRecentAnalyses(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/matches"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Matches
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                <HeartIcon className="h-4 w-4 mr-2" />
                AI Love Analyst
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="py-8">
        <CompatibilityAnalyzer targetPetId={targetPetId ?? ''} />
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <SparklesIcon className="h-7 w-7 mr-3 text-purple-600" />
            Compatibility Science
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">94%</div>
              <p className="text-gray-600 mt-1">Accuracy Rate</p>
              <p className="text-xs text-gray-500 mt-2">Based on 50K+ successful matches</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">2.5M</div>
              <p className="text-gray-600 mt-1">Analyses Run</p>
              <p className="text-xs text-gray-500 mt-2">Helping pets find love daily</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">73%</div>
              <p className="text-gray-600 mt-1">Success Rate</p>
              <p className="text-xs text-gray-500 mt-2">Matches that lead to meetups</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">4.8/5</div>
              <p className="text-gray-600 mt-1">User Rating</p>
              <p className="text-xs text-gray-500 mt-2">From verified pet parents</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Analyses</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {recentAnalyses.slice(-3).reverse().map((analysis, index) => (
                <div key={index} className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysis.score}%
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(analysis.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{analysis.petNames}</p>
                  <div className="mt-2 flex gap-2">
                    {analysis.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
