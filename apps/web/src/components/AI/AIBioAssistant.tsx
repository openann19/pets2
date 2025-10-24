import React, { useState } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_CONFIG } from '../../constants/animations';
import { SparklesIcon, PencilIcon } from '@heroicons/react/24/outline';
import PremiumButton from '../UI/PremiumButton';
/**
 * AI Bio Assistant Component
 * Implements Phase 3 requirements for AI-driven personalization
 * Connects to backend AI service for creative bio generation
 */
const AIBioAssistant = ({ currentBio = '', onBioGenerated, petName = 'your pet', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keywords, setKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBio, setGeneratedBio] = useState('');
    // Using rules-compliant SPRING_CONFIG from constants
    const suggestedKeywords = [
        'playful', 'gentle', 'energetic', 'cuddly', 'smart',
        'loyal', 'friendly', 'adventurous', 'calm', 'social',
        'loves treats', 'loves walks', 'loves fetch', 'loves naps'
    ];
    const handleToggle = () => {
        setIsOpen(!isOpen);
    };
    const addKeyword = (keyword) => {
        if (keywords.length < 6 && !keywords.includes(keyword)) {
            setKeywords([...keywords, keyword]);
        }
    };
    const removeKeyword = (keyword) => {
        setKeywords(keywords.filter(k => k !== keyword));
    };
    const handleAddCustomKeyword = () => {
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
            addKeyword(newKeyword.trim());
            setNewKeyword('');
        }
    };
    const generateBio = async () => {
        if (keywords.length === 0)
            return;
        setIsGenerating(true);
        try {
            // Call AI service (implementing Phase 3 requirement)
            const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/generate-bio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    keywords,
                    petName,
                    currentBio
                })
            });
            if (!response.ok)
                throw new Error('Failed to generate bio');
            const data = await response.json();
            setGeneratedBio(data.bio);
        }
        catch (error) {
            logger.error('Bio generation failed:', { error });
        }
        finally {
            setIsGenerating(false);
        }
    };
    const acceptBio = () => {
        onBioGenerated(generatedBio);
        setIsOpen(false);
        setGeneratedBio('');
        setKeywords([]);
        // keep UX snappy without external feedback service
    };
    const regenerateBio = () => {
        setGeneratedBio('');
        generateBio();
    };
    return (<div className={className}>
      {/* AI Assist Trigger Button */}
      <motion.button onClick={handleToggle} className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors" whileHover={{ scale: 1.05, transition: SPRING_CONFIG }} whileTap={{ scale: 0.95, transition: SPRING_CONFIG }}>
        <SparklesIcon className="w-5 h-5"/>
        <span className="text-sm font-medium">AI Assist</span>
      </motion.button>

      {/* AI Bio Assistant Modal */}
      <AnimatePresence>
        {isOpen && (<>
            {/* Backdrop */}
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)}>
              {/* Modal */}
              <motion.div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={SPRING_CONFIG} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <SparklesIcon className="w-6 h-6 text-purple-600"/>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        AI Bio Assistant
                      </h3>
                      <p className="text-sm text-gray-600">
                        Help me write a creative bio for {petName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                  {!generatedBio ? (<>
                      {/* Keywords Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select personality traits (choose up to 6):
                        </label>
                        
                        {/* Selected Keywords */}
                        {keywords.length > 0 && (<div className="flex flex-wrap gap-2 mb-4">
                            {keywords.map((keyword) => (<motion.button key={keyword} onClick={() => removeKeyword(keyword)} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors" whileHover={{ scale: 1.05, transition: SPRING_CONFIG }} whileTap={{ scale: 0.95, transition: SPRING_CONFIG }} layout>
                                {keyword}
                                <span className="ml-1 text-xs">×</span>
                              </motion.button>))}
                          </div>)}

                        {/* Suggested Keywords */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {suggestedKeywords.map((keyword) => (<motion.button key={keyword} onClick={() => addKeyword(keyword)} disabled={keywords.includes(keyword) || keywords.length >= 6} className={`px-3 py-1 rounded-full text-sm transition-colors border ${keywords.includes(keyword)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : keywords.length >= 6
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:text-purple-600'}`} whileHover={!keywords.includes(keyword) && keywords.length < 6 ? {
                        scale: 1.05,
                        transition: SPRING_CONFIG
                    } : {}} whileTap={!keywords.includes(keyword) && keywords.length < 6 ? {
                        scale: 0.95,
                        transition: SPRING_CONFIG
                    } : {}} layout>
                              {keyword}
                            </motion.button>))}
                        </div>

                        {/* Custom Keyword Input */}
                        <div className="flex space-x-2">
                          <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddCustomKeyword()} placeholder="Add custom trait..." disabled={keywords.length >= 6} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-400"/>
                          <PremiumButton onClick={handleAddCustomKeyword} disabled={!newKeyword.trim() || keywords.length >= 6} variant="secondary" size="sm">
                            Add
                          </PremiumButton>
                        </div>
                      </div>
                    </>) : (
            /* Generated Bio Display */
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_CONFIG} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <PencilIcon className="w-5 h-5 text-green-600"/>
                        <span className="text-sm font-medium text-green-600">
                          Generated Bio:
                        </span>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-gray-800 leading-relaxed">
                          {generatedBio}
                        </p>
                      </div>
                    </motion.div>)}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  {!generatedBio ? (<div className="flex justify-end space-x-3">
                      <PremiumButton onClick={() => setIsOpen(false)} variant="ghost">
                        Cancel
                      </PremiumButton>
                      <PremiumButton onClick={generateBio} disabled={keywords.length === 0} loading={isGenerating} variant="primary">
                        {isGenerating ? 'Generating...' : 'Generate Bio'}
                      </PremiumButton>
                    </div>) : (<div className="flex justify-end space-x-3">
                      <PremiumButton onClick={regenerateBio} variant="secondary" disabled={isGenerating}>
                        Regenerate
                      </PremiumButton>
                      <PremiumButton onClick={acceptBio} variant="primary">
                        Use This Bio
                      </PremiumButton>
                    </div>)}
                </div>
              </motion.div>
            </motion.div>
          </>)}
      </AnimatePresence>
    </div>);
};
export default AIBioAssistant;
//# sourceMappingURL=AIBioAssistant.jsx.map
//# sourceMappingURL=AIBioAssistant.jsx.map