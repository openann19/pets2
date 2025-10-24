'use client';
import { BoltIcon, HeartIcon, InformationCircleIcon, ShieldCheckIcon, UserGroupIcon, XMarkIcon, } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { logger } from '@pawfectmatch/core';
;
import { useEffect, useState } from 'react';
import { personalityService } from '../../services/PersonalityService';
export function CompatibilityMatrix({ pet1, pet2, interactionType = 'playdate', isOpen, onClose, }) {
    const [compatibility, setCompatibility] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (isOpen && pet1.personality && pet2.personality) {
            loadCompatibility();
        }
    }, [isOpen, pet1.personality, pet2.personality, interactionType]);
    const loadCompatibility = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const compatibilityData = await personalityService.getCompatibility({
                pet1Id: pet1.id,
                pet2Id: pet2.id,
                interactionType,
            });
            setCompatibility(compatibilityData);
        }
        catch (err) {
            logger.error('Failed to load compatibility:', { error });
            setError('Failed to load compatibility analysis');
        }
        finally {
            setIsLoading(false);
        }
    };
    const getScoreColor = (score) => {
        if (score >= 80)
            return 'text-green-600';
        if (score >= 60)
            return 'text-blue-600';
        if (score >= 40)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getScoreBgColor = (score) => {
        if (score >= 80)
            return 'bg-green-100';
        if (score >= 60)
            return 'bg-blue-100';
        if (score >= 40)
            return 'bg-yellow-100';
        return 'bg-red-100';
    };
    const renderRadarChart = () => {
        if (!pet1.personality || !pet2.personality)
            return null;
        const pet1Scores = pet1.personality.personalityScore;
        const pet2Scores = pet2.personality.personalityScore;
        return (<div className="relative w-64 h-64 mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Grid circles */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          <circle cx="100" cy="100" r="20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>

          {/* Axis lines */}
          <line x1="100" y1="20" x2="100" y2="180" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="20" y1="100" x2="180" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="35" y1="35" x2="165" y2="165" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="165" y1="35" x2="35" y2="165" stroke="#e5e7eb" strokeWidth="1"/>

          {/* Pet 1 polygon */}
          <polygon points={`${100 + (pet1Scores.energy - 5) * 8},${100 - (pet1Scores.sociability - 5) * 8} ${100 + (pet1Scores.independence - 5) * 8},${100 + (pet1Scores.independence - 5) * 8} ${100 - (pet1Scores.energy - 5) * 8},${100 + (pet1Scores.sociability - 5) * 8} ${100 - (pet1Scores.independence - 5) * 8},${100 - (pet1Scores.independence - 5) * 8}`} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2"/>

          {/* Pet 2 polygon */}
          <polygon points={`${100 + (pet2Scores.energy - 5) * 8},${100 - (pet2Scores.sociability - 5) * 8} ${100 + (pet2Scores.independence - 5) * 8},${100 + (pet2Scores.independence - 5) * 8} ${100 - (pet2Scores.energy - 5) * 8},${100 + (pet2Scores.sociability - 5) * 8} ${100 - (pet2Scores.independence - 5) * 8},${100 - (pet2Scores.independence - 5) * 8}`} fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2"/>

          {/* Labels */}
          <text x="100" y="15" textAnchor="middle" className="text-xs fill-gray-600">
            Energy
          </text>
          <text x="185" y="105" textAnchor="middle" className="text-xs fill-gray-600">
            Independence
          </text>
          <text x="100" y="195" textAnchor="middle" className="text-xs fill-gray-600">
            Sociability
          </text>
          <text x="15" y="105" textAnchor="middle" className="text-xs fill-gray-600">
            Calm
          </text>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>{pet1.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>{pet2.name}</span>
          </div>
        </div>
      </div>);
    };
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Compatibility Analysis</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="h-6 w-6"/>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{pet1.name}</h3>
                {pet1.personality && (<div className="text-sm text-gray-600">
                    {pet1.personality.primaryArchetype
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>)}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{pet2.name}</h3>
                {pet2.personality && (<div className="text-sm text-gray-600">
                    {pet2.personality.primaryArchetype
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>)}
              </div>
            </div>

            {isLoading ? (<div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing compatibility...</p>
              </div>) : error ? (<div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <InformationCircleIcon className="h-12 w-12 mx-auto"/>
                </div>
                <p className="text-gray-600">{error}</p>
              </div>) : compatibility ? (<>
                {/* Overall Compatibility Score */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(compatibility.compatibilityScore)} mb-4`}>
                    <span className={`text-3xl font-bold ${getScoreColor(compatibility.compatibilityScore)}`}>
                      {compatibility.compatibilityScore}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {personalityService.getCompatibilityLevel(compatibility.compatibilityScore)
                .level}{' '}
                    Match
                  </h3>
                  <p className="text-gray-600">
                    {personalityService.getCompatibilityLevel(compatibility.compatibilityScore)
                .description}
                  </p>
                </div>

                {/* Radar Chart */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Personality Comparison
                  </h4>
                  {renderRadarChart()}
                </div>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BoltIcon className="h-5 w-5 text-blue-600"/>
                      <h5 className="font-medium text-gray-900">Energy Compatibility</h5>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(compatibility.analysis.energyCompatibility.score)} mb-1`}>
                      {compatibility.analysis.energyCompatibility.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {compatibility.analysis.energyCompatibility.description}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserGroupIcon className="h-5 w-5 text-green-600"/>
                      <h5 className="font-medium text-gray-900">Social Compatibility</h5>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(compatibility.analysis.socialCompatibility.score)} mb-1`}>
                      {compatibility.analysis.socialCompatibility.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {compatibility.analysis.socialCompatibility.description}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheckIcon className="h-5 w-5 text-purple-600"/>
                      <h5 className="font-medium text-gray-900">Independence Compatibility</h5>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(compatibility.analysis.independenceCompatibility.score)} mb-1`}>
                      {compatibility.analysis.independenceCompatibility.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {compatibility.analysis.independenceCompatibility.description}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {compatibility.recommendations.map((recommendation, index) => (<li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                        <HeartIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0"/>
                        {recommendation}
                      </li>))}
                  </ul>
                </div>
              </>) : (<div className="text-center py-8">
                <p className="text-gray-600">Personality data not available for both pets.</p>
              </div>)}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);
}
//# sourceMappingURL=CompatibilityMatrix.jsx.map