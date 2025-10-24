/**
 * Pet Compatibility Heat-Map Component
 * D3.js visualization showing compatibility factors
 */
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, SparklesIcon, ChartBarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
export function CompatibilityHeatMap({ pet1Id, pet2Id, compatibilityData, className = '' }) {
    const [selectedFactor, setSelectedFactor] = useState(null);
    const svgRef = useRef(null);
    const factors = [
        { key: 'personality', label: 'Personality', color: '#ec4899' },
        { key: 'lifestyle', label: 'Lifestyle', color: '#8b5cf6' },
        { key: 'activity', label: 'Activity Level', color: '#06b6d4' },
        { key: 'social', label: 'Social Behavior', color: '#10b981' },
        { key: 'environment', label: 'Environment', color: '#f59e0b' }
    ];
    const getScoreColor = (score) => {
        if (score >= 80)
            return '#10b981'; // Green
        if (score >= 60)
            return '#f59e0b'; // Yellow
        if (score >= 40)
            return '#f97316'; // Orange
        return '#ef4444'; // Red
    };
    const getScoreLabel = (score) => {
        if (score >= 80)
            return 'Excellent';
        if (score >= 60)
            return 'Good';
        if (score >= 40)
            return 'Fair';
        return 'Poor';
    };
    const overallScore = Math.round(Object.values(compatibilityData).reduce((sum, score) => sum + score, 0) / 5);
    return (<div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
            <HeartIcon className="w-6 h-6 text-white"/>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Compatibility Analysis</h3>
            <p className="text-sm text-gray-600">AI-powered match factors</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{overallScore}%</div>
          <div className="text-sm text-gray-600">Overall Match</div>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {factors.map((factor) => {
            const score = compatibilityData[factor.key];
            const color = getScoreColor(score);
            return (<motion.div key={factor.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative cursor-pointer" onClick={() => setSelectedFactor(selectedFactor === factor.key ? null : factor.key)}>
              <div className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-200" style={{ backgroundColor: color }}>
                {score}%
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs font-medium text-gray-900">{factor.label}</div>
                <div className="text-xs text-gray-600">{getScoreLabel(score)}</div>
              </div>
              
              {/* Selected indicator */}
              {selectedFactor === factor.key && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white"/>
                </motion.div>)}
            </motion.div>);
        })}
      </div>

      {/* Factor Details */}
      {selectedFactor && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <InformationCircleIcon className="w-5 h-5 text-gray-600"/>
            <h4 className="font-semibold text-gray-900">
              {factors.find(f => f.key === selectedFactor)?.label} Compatibility
            </h4>
          </div>
          <p className="text-sm text-gray-700">
            {getFactorDescription(selectedFactor, compatibilityData[selectedFactor])}
          </p>
        </motion.div>)}

      {/* Compatibility Insights */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Match Insights</h4>
        {getCompatibilityInsights(compatibilityData).map((insight, index) => (<motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <ChartBarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
            <p className="text-sm text-blue-800">{insight}</p>
          </motion.div>))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {getRecommendations(compatibilityData).map((recommendation, index) => (<li key={index} className="flex items-start space-x-2">
              <span className="text-pink-500 mt-1">•</span>
              <span>{recommendation}</span>
            </li>))}
        </ul>
      </div>
    </div>);
}
function getFactorDescription(factor, score) {
    const descriptions = {
        personality: {
            high: "These pets have complementary personalities that will get along well. They share similar energy levels and temperaments.",
            medium: "The pets have some personality differences but can still form a good bond with proper introduction.",
            low: "The pets have very different personalities and may need careful supervision during initial meetings."
        },
        lifestyle: {
            high: "Both pets have similar daily routines and living situations, making them ideal companions.",
            medium: "The pets have some lifestyle differences but can adapt to each other's needs.",
            low: "Significant lifestyle differences may require adjustments for both pets to coexist happily."
        },
        activity: {
            high: "Perfect activity level match! Both pets enjoy similar levels of exercise and play.",
            medium: "The pets have different activity preferences but can find common ground.",
            low: "Very different activity levels may require separate exercise routines and play times."
        },
        social: {
            high: "Both pets are social and will enjoy each other's company and interaction.",
            medium: "One pet may be more social than the other, but they can still form a bond.",
            low: "Social behavior differences may require gradual introduction and supervision."
        },
        environment: {
            high: "Both pets thrive in similar environments and living conditions.",
            medium: "Some environmental preferences differ but can be accommodated.",
            low: "Different environmental needs may require separate spaces or careful management."
        }
    };
    const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
    return descriptions[factor]?.[level] || 'Compatibility analysis available.';
}
function getCompatibilityInsights(data) {
    const insights = [];
    if (data.personality >= 80) {
        insights.push("Excellent personality match - these pets will likely get along immediately");
    }
    if (data.activity >= 80) {
        insights.push("Perfect activity level compatibility - they'll enjoy playing together");
    }
    if (data.social >= 80) {
        insights.push("Both pets are social and will enjoy each other's company");
    }
    if (data.lifestyle < 50) {
        insights.push("Consider lifestyle adjustments for optimal compatibility");
    }
    if (data.environment < 50) {
        insights.push("Environmental preferences may need accommodation");
    }
    return insights.length > 0 ? insights : ["Good overall compatibility with room for growth"];
}
function getRecommendations(data) {
    const recommendations = [];
    if (data.personality < 60) {
        recommendations.push("Introduce pets gradually in neutral territory");
    }
    if (data.activity < 60) {
        recommendations.push("Plan separate exercise routines to meet both pets' needs");
    }
    if (data.social < 60) {
        recommendations.push("Allow the less social pet to set the pace for interactions");
    }
    if (data.lifestyle < 60) {
        recommendations.push("Create a routine that accommodates both pets' schedules");
    }
    if (data.environment < 60) {
        recommendations.push("Provide separate spaces for each pet to retreat to");
    }
    if (recommendations.length === 0) {
        recommendations.push("These pets are highly compatible - enjoy your new match!");
    }
    return recommendations;
}
// Compact version for smaller spaces
export function CompactCompatibilityHeatMap({ compatibilityData, className = '' }) {
    const overallScore = Math.round(Object.values(compatibilityData).reduce((sum, score) => sum + score, 0) / 5);
    return (<div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Compatibility</h4>
        <div className="text-2xl font-bold text-gray-900">{overallScore}%</div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(compatibilityData).map(([key, score]) => (<div key={key} className="text-center">
            <div className="w-full h-8 rounded text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: getScoreColor(score) }}>
              {score}%
            </div>
            <div className="text-xs text-gray-600 mt-1 capitalize">
              {key.slice(0, 4)}
            </div>
          </div>))}
      </div>
    </div>);
}
function getScoreColor(score) {
    if (score >= 80)
        return '#10b981';
    if (score >= 60)
        return '#f59e0b';
    if (score >= 40)
        return '#f97316';
    return '#ef4444';
}
//# sourceMappingURL=CompatibilityHeatMap.jsx.map