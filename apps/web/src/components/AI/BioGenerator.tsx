'use client';
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, PhotoIcon, HeartIcon, BoltIcon, FireIcon, StarIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../lib/auth-store';
import { api } from '../../services/api';
import { logger } from '../../services/logger';
const bioSchema = z.object({
    petName: z.string().min(1, 'Pet name is required'),
    species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
    breed: z.string().min(1, 'Breed is required'),
    age: z.number().min(0).max(30),
    personality: z.array(z.string()).min(1, 'Select at least one personality trait'),
    interests: z.array(z.string()).min(1, 'Select at least one interest'),
    lookingFor: z.string().min(10, 'Tell us what you\'re looking for'),
    tone: z.enum(['playful', 'serious', 'romantic', 'funny', 'mysterious'])
});
export function BioGenerator() {
    const { user } = useAuthStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBio, setGeneratedBio] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(0);
    const [bioHistory, setBioHistory] = useState([]);
    const [photoAnalysis, setPhotoAnalysis] = useState(null);
    const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({
        resolver: zodResolver(bioSchema),
        mode: 'onChange',
        defaultValues: {
            personality: [],
            interests: [],
            tone: 'playful'
        }
    });
    const personalityTraits = [
        { value: 'adventurous', label: 'Adventurous', icon: '🏔️' },
        { value: 'playful', label: 'Playful', icon: '🎾' },
        { value: 'cuddly', label: 'Cuddly', icon: '🤗' },
        { value: 'energetic', label: 'Energetic', icon: '⚡' },
        { value: 'calm', label: 'Calm', icon: '😌' },
        { value: 'intelligent', label: 'Intelligent', icon: '🧠' },
        { value: 'loyal', label: 'Loyal', icon: '💙' },
        { value: 'protective', label: 'Protective', icon: '🛡️' },
        { value: 'social', label: 'Social', icon: '👥' },
        { value: 'independent', label: 'Independent', icon: '🦁' }
    ];
    const interests = [
        { value: 'walks', label: 'Long Walks', icon: '🚶' },
        { value: 'swimming', label: 'Swimming', icon: '🏊' },
        { value: 'fetch', label: 'Playing Fetch', icon: '🎾' },
        { value: 'napping', label: 'Napping', icon: '😴' },
        { value: 'treats', label: 'Treats', icon: '🍖' },
        { value: 'toys', label: 'Toys', icon: '🧸' },
        { value: 'training', label: 'Training', icon: '🎯' },
        { value: 'hiking', label: 'Hiking', icon: '🥾' },
        { value: 'socializing', label: 'Socializing', icon: '🐕' },
        { value: 'cuddles', label: 'Cuddles', icon: '💕' }
    ];
    const handlePhotoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const formData = new FormData();
        formData.append('photo', file);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-photo`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                }
            });
            if (response.ok) {
                const analysis = await response.json();
                setPhotoAnalysis(analysis);
                // Auto-fill form based on photo analysis
                if (analysis.breed)
                    setValue('breed', analysis.breed);
                if (analysis.estimatedAge)
                    setValue('age', analysis.estimatedAge);
                if (analysis.suggestedTraits) {
                    const traits = analysis.suggestedTraits.filter((t) => personalityTraits.some(pt => pt.value === t));
                    setValue('personality', traits);
                }
                logger.info('Photo analysis completed', analysis);
            }
        }
        catch (error) {
            logger.error('Photo analysis failed', error);
        }
    };
    const generateBio = async (data) => {
        setIsGenerating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-bio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify({
                    ...data,
                    photoAnalysis,
                    userId: user?.id,
                    previousBios: bioHistory.map(b => b.content)
                })
            });
            if (response.ok) {
                const result = await response.json();
                const newBio = {
                    content: result.bio,
                    matchScore: result.matchScore || 85,
                    keywords: result.keywords || [],
                    sentiment: result.sentiment || { positive: 0.8, neutral: 0.15, negative: 0.05 },
                    suggestions: result.suggestions || []
                };
                setGeneratedBio(newBio);
                setBioHistory(prev => [...prev, newBio]);
                logger.info('Bio generated successfully', { matchScore: newBio.matchScore });
            }
        }
        catch (error) {
            logger.error('Bio generation failed', error);
        }
        finally {
            setIsGenerating(false);
        }
    };
    const regenerateBio = () => {
        handleSubmit(generateBio)();
    };
    const saveBio = async () => {
        if (!generatedBio)
            return;
        try {
            await api.updatePetProfile({
                bio: generatedBio.content,
                bioMetadata: {
                    generatedAt: new Date().toISOString(),
                    matchScore: generatedBio.matchScore,
                    keywords: generatedBio.keywords
                }
            });
            logger.info('Bio saved successfully');
        }
        catch (error) {
            logger.error('Failed to save bio', error);
        }
    };
    return (<div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center mb-8">
          <SparklesIcon className="h-10 w-10 text-purple-600 mr-4"/>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Bio Generator
            </h2>
            <p className="text-gray-600 mt-1">Create the perfect bio for your furry friend</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(generateBio)} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <label className="block mb-4">
              <span className="text-gray-700 font-semibold flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2"/>
                Upload Pet Photo (Optional)
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
            </label>
            
            {photoAnalysis && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-purple-50 rounded-xl">
                <p className="text-sm font-semibold text-purple-700">Photo Analysis Complete!</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {photoAnalysis.detectedFeatures?.map((feature) => (<span key={feature} className="px-3 py-1 bg-white rounded-full text-xs">
                      {feature}
                    </span>))}
                </div>
              </motion.div>)}
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Pet Name</label>
              <input {...register('petName')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors" placeholder="e.g., Max"/>
              {errors.petName && <p className="text-red-500 text-sm mt-1">{errors.petName.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Species</label>
              <select {...register('species')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors">
                <option value="">Select species</option>
                <option value="dog">Dog 🐕</option>
                <option value="cat">Cat 🐱</option>
                <option value="bird">Bird 🦜</option>
                <option value="rabbit">Rabbit 🐰</option>
                <option value="other">Other 🐾</option>
              </select>
              {errors.species && <p className="text-red-500 text-sm mt-1">{errors.species.message}</p>}
            </div>
          </div>

          {/* Personality Traits */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">Personality Traits</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {personalityTraits.map(trait => {
            const isSelected = watch('personality')?.includes(trait.value);
            return (<motion.label key={trait.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'}`}>
                    <input type="checkbox" value={trait.value} {...register('personality')} className="hidden"/>
                    <div className="text-center">
                      <span className="text-2xl">{trait.icon}</span>
                      <p className="text-sm mt-1">{trait.label}</p>
                    </div>
                  </motion.label>);
        })}
            </div>
            {errors.personality && <p className="text-red-500 text-sm mt-2">{errors.personality.message}</p>}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">Interests</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {interests.map(interest => {
            const isSelected = watch('interests')?.includes(interest.value);
            return (<motion.label key={interest.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${isSelected
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'}`}>
                    <input type="checkbox" value={interest.value} {...register('interests')} className="hidden"/>
                    <div className="text-center">
                      <span className="text-2xl">{interest.icon}</span>
                      <p className="text-sm mt-1">{interest.label}</p>
                    </div>
                  </motion.label>);
        })}
            </div>
            {errors.interests && <p className="text-red-500 text-sm mt-2">{errors.interests.message}</p>}
          </div>

          {/* Bio Tone */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">Bio Tone</label>
            <div className="flex gap-3 flex-wrap">
              {['playful', 'serious', 'romantic', 'funny', 'mysterious'].map(tone => (<motion.label key={tone} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`cursor-pointer px-6 py-3 rounded-full border-2 transition-all capitalize ${watch('tone') === tone
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'}`}>
                  <input type="radio" value={tone} {...register('tone')} className="hidden"/>
                  {tone}
                </motion.label>))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">What are you looking for?</label>
            <textarea {...register('lookingFor')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors h-24 resize-none" placeholder="e.g., Looking for a playmate who loves adventures and belly rubs..."/>
            {errors.lookingFor && <p className="text-red-500 text-sm mt-1">{errors.lookingFor.message}</p>}
          </div>

          {/* Generate Button */}
          <motion.button type="submit" disabled={!isValid || isGenerating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center ${isValid
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            : 'bg-gray-400 cursor-not-allowed'}`}>
            {isGenerating ? (<>
                <span className="mr-2">🐾</span>
                Generating Magic Bio...
              </>) : (<>
                <SparklesIcon className="h-5 w-5 mr-2"/>
                Generate AI Bio
              </>)}
          </motion.button>
        </form>

        {/* Generated Bio Display */}
        <AnimatePresence>
          {generatedBio && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Generated Bio</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                    <FireIcon className="h-4 w-4 text-green-600 mr-1"/>
                    <span className="text-sm font-semibold text-green-600">
                      {generatedBio.matchScore}% Match Score
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {generatedBio.content}
                </p>
              </div>

              {/* Keywords */}
              {generatedBio.keywords.length > 0 && (<div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Keywords for Better Matches:</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedBio.keywords.map(keyword => (<span key={keyword} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {keyword}
                      </span>))}
                  </div>
                </div>)}

              {/* Sentiment Analysis */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Sentiment Analysis:</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Positive: {(generatedBio.sentiment.positive * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                    <span className="text-sm">Neutral: {(generatedBio.sentiment.neutral * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {generatedBio.suggestions.length > 0 && (<div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">AI Suggestions:</p>
                  <ul className="space-y-1">
                    {generatedBio.suggestions.map((suggestion, index) => (<li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"/>
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>))}
                  </ul>
                </div>)}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button onClick={regenerateBio} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors flex items-center justify-center">
                  <ArrowPathIcon className="h-5 w-5 mr-2"/>
                  Regenerate
                </motion.button>
                <motion.button onClick={saveBio} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2"/>
                  Save Bio
                </motion.button>
              </div>
            </motion.div>)}
        </AnimatePresence>

        {/* Bio History */}
        {bioHistory.length > 1 && (<div className="mt-6">
            <p className="text-sm font-semibold text-gray-600 mb-2">Previous Generations ({bioHistory.length})</p>
            <div className="flex gap-2 overflow-x-auto">
              {bioHistory.map((bio, index) => (<button key={index} onClick={() => {
                    setGeneratedBio(bio);
                    setSelectedVersion(index);
                }} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedVersion === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  Version {index + 1}
                </button>))}
            </div>
          </div>)}
      </motion.div>
    </div>);
}
//# sourceMappingURL=BioGenerator.jsx.map