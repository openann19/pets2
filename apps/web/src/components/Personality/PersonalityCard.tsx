'use client';
import { ArrowPathIcon, LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
;
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { personalityService } from '../../services/PersonalityService';
export function PersonalityCard({ petId, petName, breed, age, personalityTags = [], description = '', onPersonalityGenerated, }) {
    const [personality, setPersonality] = useState(null);
    const [archetype, setArchetype] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadPersonality();
    }, [petId]);
    const loadPersonality = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Try to get existing personality data
            // In a real implementation, this would fetch from the database
            const existingPersonality = await getExistingPersonality(petId);
            if (existingPersonality) {
                setPersonality(existingPersonality);
                const archetypeData = await personalityService.getArchetype(existingPersonality.primaryArchetype);
                setArchetype(archetypeData);
            }
        }
        catch (err) {
            logger.error('Failed to load personality:', { error });
            setError('Failed to load personality data');
        }
        finally {
            setIsLoading(false);
        }
    };
    const generatePersonality = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            const personalityData = await personalityService.generatePersonality({
                petId,
                breed,
                age,
                personalityTags,
                description,
            });
            setPersonality(personalityData);
            const archetypeData = await personalityService.getArchetype(personalityData.primaryArchetype);
            setArchetype(archetypeData);
            onPersonalityGenerated?.(personalityData);
        }
        catch (err) {
            logger.error('Failed to generate personality:', { error });
            setError('Failed to generate personality. Please try again.');
        }
        finally {
            setIsGenerating(false);
        }
    };
    // Mock implementation - in real app, fetch from database
    const getExistingPersonality = async (_) => {
        return null;
    };
    if (isLoading) {
        return (<div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>);
    }
    if (error) {
        return (<div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <SparklesIcon className="h-12 w-12 mx-auto"/>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personality Analysis</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={generatePersonality} disabled={isGenerating} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? 'Generating...' : 'Generate Personality'}
          </button>
        </div>
      </div>);
    }
    if (!personality || !archetype) {
        return (<div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-blue-500 mb-4">
            <SparklesIcon className="h-12 w-12 mx-auto"/>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Discover {petName}'s Personality
          </h3>
          <p className="text-gray-600 mb-4">
            Generate an AI-powered personality analysis to understand {petName}'s unique traits and
            compatibility.
          </p>
          <button onClick={generatePersonality} disabled={isGenerating} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto">
            {isGenerating ? (<>
                <ArrowPathIcon className="h-4 w-4 animate-spin"/>
                Generating...
              </>) : (<>
                <SparklesIcon className="h-4 w-4"/>
                Generate Personality
              </>)}
          </button>
        </div>
      </div>);
    }
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{archetype.icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{archetype.name}</h3>
          <p className="text-sm text-gray-600">Primary Personality Archetype</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{personality.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {personality.personalityScore.energy}
          </div>
          <div className="text-xs text-gray-600">Energy</div>
          <div className="text-xs text-gray-500">
            {personalityService.getEnergyLevelDescription(personality.personalityScore.energy)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {personality.personalityScore.independence}
          </div>
          <div className="text-xs text-gray-600">Independence</div>
          <div className="text-xs text-gray-500">
            {personalityService.getIndependenceLevelDescription(personality.personalityScore.independence)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {personality.personalityScore.sociability}
          </div>
          <div className="text-xs text-gray-600">Sociability</div>
          <div className="text-xs text-gray-500">
            {personalityService.getSociabilityLevelDescription(personality.personalityScore.sociability)}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <LightBulbIcon className="h-5 w-5 text-blue-600 mt-0.5"/>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Compatibility Tips</h4>
            <p className="text-sm text-blue-800">{personality.compatibilityTips}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {personality.traits.map((trait, index) => (<span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {trait}
          </span>))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button onClick={generatePersonality} disabled={isGenerating} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
          <ArrowPathIcon className="h-4 w-4"/>
          Regenerate Analysis
        </button>
      </div>
    </motion.div>);
}
//# sourceMappingURL=PersonalityCard.jsx.map