/**
 * AI-Powered Name Suggestion Widget
 * Generates cute pet names using DeepSeek AI
 */
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, HeartIcon, StarIcon, LightBulbIcon, ArrowPathIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNameSuggestions, PetInfo, NameSuggestion } from '@/services/ai-name-suggestions';
import { InteractiveButton } from '@/components/ui/Interactive';
export function NameSuggestionWidget({ petInfo, onNameSelect, className = '', showCategories = true, maxSuggestions = 12 }) {
    const { suggestions, isLoading, error, generateSuggestions } = useNameSuggestions();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedName, setSelectedName] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    // Generate suggestions on mount
    useEffect(() => {
        generateSuggestions(petInfo, maxSuggestions);
    }, [petInfo, maxSuggestions]);
    const categories = [
        { id: 'all', label: 'All Names', icon: SparklesIcon },
        { id: 'classic', label: 'Classic', icon: HeartIcon },
        { id: 'trendy', label: 'Trendy', icon: StarIcon },
        { id: 'unique', label: 'Unique', icon: LightBulbIcon },
        { id: 'cute', label: 'Cute', icon: HeartIcon }
    ];
    const filteredSuggestions = selectedCategory === 'all'
        ? suggestions
        : suggestions.filter(s => s.category === selectedCategory);
    const handleNameSelect = (name) => {
        setSelectedName(name);
        onNameSelect?.(name);
    };
    const handleRegenerate = () => {
        generateSuggestions(petInfo, maxSuggestions);
    };
    const getCategoryColor = (category) => {
        const colors = {
            classic: 'bg-blue-100 text-blue-800',
            trendy: 'bg-purple-100 text-purple-800',
            unique: 'bg-green-100 text-green-800',
            cute: 'bg-pink-100 text-pink-800',
            strong: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.classic;
    };
    const getPopularityColor = (popularity) => {
        const colors = {
            rare: 'bg-red-100 text-red-800',
            uncommon: 'bg-yellow-100 text-yellow-800',
            common: 'bg-blue-100 text-blue-800',
            popular: 'bg-green-100 text-green-800'
        };
        return colors[popularity] || colors.common;
    };
    return (<div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-white"/>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Name Suggestions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Perfect names for your {petInfo.species}
            </p>
          </div>
        </div>

        <InteractiveButton onClick={handleRegenerate} disabled={isLoading} variant="outline" size="sm" className="text-gray-600 hover:text-gray-800" icon={isLoading ? (<ArrowPathIcon className="w-4 h-4 animate-spin"/>) : (<ArrowPathIcon className="w-4 h-4"/>)}>
          {isLoading ? 'Generating...' : 'Regenerate'}
        </InteractiveButton>
      </div>

      {/* Category Filters */}
      {showCategories && (<div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
                const Icon = category.icon;
                return (<button key={category.id} onClick={() => { setSelectedCategory(category.id); }} className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
                `}>
                <Icon className="w-4 h-4"/>
                <span>{category.label}</span>
              </button>);
            })}
        </div>)}

      {/* Loading State */}
      {isLoading && (<div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-3"/>
            <p className="text-gray-600 dark:text-gray-400">
              Generating perfect names for your {petInfo.species}...
            </p>
          </div>
        </div>)}

      {/* Error State */}
      {error && (<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-600 flex-shrink-0 mr-2"/>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>)}

      {/* Name Suggestions Grid */}
      {!isLoading && !error && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredSuggestions.map((suggestion, index) => (<motion.div key={suggestion.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.1 }} className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${selectedName === suggestion.name
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                `} onClick={() => { handleNameSelect(suggestion.name); }}>
                {/* Selected Indicator */}
                {selectedName === suggestion.name && (<div className="absolute top-2 right-2">
                    <CheckCircleIcon className="w-5 h-5 text-pink-500"/>
                  </div>)}

                {/* Name */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {suggestion.name}
                  </h4>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(showDetails === suggestion.name ? null : suggestion.name);
                }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <LightBulbIcon className="w-4 h-4"/>
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(suggestion.category)}`}>
                    {suggestion.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPopularityColor(suggestion.popularity)}`}>
                    {suggestion.popularity}
                  </span>
                </div>

                {/* Meaning */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {suggestion.meaning}
                </p>

                {/* Details Panel */}
                <AnimatePresence>
                  {showDetails === suggestion.name && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {suggestion.pronunciation && (<div className="mb-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Pronunciation:
                          </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300 ml-1">
                            {suggestion.pronunciation}
                          </span>
                        </div>)}
                      {suggestion.origin && (<div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Origin:
                          </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300 ml-1">
                            {suggestion.origin}
                          </span>
                        </div>)}
                    </motion.div>)}
                </AnimatePresence>
              </motion.div>))}
          </AnimatePresence>
        </div>)}

      {/* Selected Name Display */}
      {selectedName && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selected: {selectedName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Great choice! This name perfectly suits your {petInfo.species}.
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-pink-500"/>
          </div>
        </motion.div>)}

      {/* Empty State */}
      {!isLoading && !error && filteredSuggestions.length === 0 && (<div className="text-center py-8">
          <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
          <p className="text-gray-600 dark:text-gray-400">
            No suggestions found for this category. Try a different category or regenerate.
          </p>
        </div>)}
    </div>);
}
// Compact version for inline use
export function CompactNameSuggestion({ petInfo, onNameSelect, className = '' }) {
    const { suggestions, isLoading, generateSuggestions } = useNameSuggestions();
    const [showSuggestions, setShowSuggestions] = useState(false);
    useEffect(() => {
        if (showSuggestions && suggestions.length === 0) {
            generateSuggestions(petInfo, 6);
        }
    }, [showSuggestions, petInfo, suggestions.length, generateSuggestions]);
    return (<div className={`relative ${className}`}>
      <InteractiveButton onClick={() => { setShowSuggestions(!showSuggestions); }} variant="outline" size="sm" className="text-gray-600 hover:text-gray-800" icon={<SparklesIcon className="w-4 h-4"/>}>
        {isLoading ? 'Generating...' : 'Get AI Names'}
      </InteractiveButton>

      <AnimatePresence>
        {showSuggestions && (<motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
            {isLoading ? (<div className="flex items-center justify-center py-4">
                <ArrowPathIcon className="w-5 h-5 animate-spin text-pink-500 mr-2"/>
                <span className="text-sm text-gray-600">Generating names...</span>
              </div>) : (<div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  AI Name Suggestions
                </h4>
                {suggestions.slice(0, 6).map((suggestion) => (<button key={suggestion.name} onClick={() => {
                        onNameSelect?.(suggestion.name);
                        setShowSuggestions(false);
                    }} className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {suggestion.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(suggestion.category)}`}>
                        {suggestion.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {suggestion.meaning}
                    </p>
                  </button>))}
              </div>)}
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
function getCategoryColor(category) {
    const colors = {
        classic: 'bg-blue-100 text-blue-800',
        trendy: 'bg-purple-100 text-purple-800',
        unique: 'bg-green-100 text-green-800',
        cute: 'bg-pink-100 text-pink-800',
        strong: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.classic;
}
//# sourceMappingURL=NameSuggestionWidget.jsx.map