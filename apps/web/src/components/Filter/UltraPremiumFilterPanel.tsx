'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, AdjustmentsHorizontalIcon, XMarkIcon, SparklesIcon, MagnifyingGlassIcon, HeartIcon, StarIcon, CheckCircleIcon, LightBulbIcon, ShieldCheckIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import BreedSearchInput from './BreedSearchInput';
const speciesOptions = [
    { value: 'dog', label: 'Dogs 🐕', count: 250, subcategories: ['Sporting', 'Working', 'Herding', 'Hound', 'Terrier', 'Toy', 'Non-Sporting', 'Hybrid'] },
    { value: 'cat', label: 'Cats 🐱', count: 180, subcategories: ['Shorthair', 'Longhair', 'Hairless', 'Semi-Longhair'] },
    { value: 'bird', label: 'Birds 🐦', count: 45, subcategories: ['Parakeets', 'Cockatoos', 'Finches', 'Canaries'] },
    { value: 'rabbit', label: 'Rabbits 🐰', count: 30, subcategories: ['Lop', 'Dwarf', 'Large', 'Giant'] },
    { value: 'reptile', label: 'Reptiles 🦎', count: 15, subcategories: ['Lizards', 'Snakes', 'Turtles'] },
    { value: 'small_mammal', label: 'Small Pets 🐹', count: 20, subcategories: ['Hamsters', 'Guinea Pigs', 'Chinchillas'] },
    { value: 'fish', label: 'Fish 🐠', count: 12, subcategories: ['Freshwater', 'Saltwater', 'Marine'] }
];
const temperamentOptions = [
    { value: 'friendly', label: 'Friendly', icon: '😊', category: 'social' },
    { value: 'playful', label: 'Playful', icon: '🎾', category: 'energy' },
    { value: 'calm', label: 'Calm', icon: '😌', category: 'energy' },
    { value: 'energetic', label: 'Energetic', icon: '⚡', category: 'energy' },
    { value: 'loyal', label: 'Loyal', icon: '💙', category: 'bonding' },
    { value: 'independent', label: 'Independent', icon: '🦁', category: 'behavior' },
    { value: 'intelligent', label: 'Intelligent', icon: '🧠', category: 'cognitive' },
    { value: 'gentle', label: 'Gentle', icon: '🤗', category: 'social' },
    { value: 'protective', label: 'Protective', icon: '🛡️', category: 'behavior' },
    { value: 'social', label: 'Social', icon: '👥', category: 'social' },
    { value: 'affectionate', label: 'Affectionate', icon: '💕', category: 'bonding' },
    { value: 'curious', label: 'Curious', icon: '🔍', category: 'behavior' }
];
const energyLevelOptions = [
    { value: 'very-low', label: 'Very Low Energy', icon: '😴', description: 'Minimal activity, prefers rest', exercise: 'light walks' },
    { value: 'low', label: 'Low Energy', icon: '😌', description: 'Calm, occasional activity', exercise: 'regular walks' },
    { value: 'moderate', label: 'Moderate Energy', icon: '🏃‍♂️', description: 'Regular activity needs', exercise: 'daily walks + play' },
    { value: 'high', label: 'High Energy', icon: '⚡', description: 'Very active, needs stimulation', exercise: 'vigorous daily exercise' },
    { value: 'very-high', label: 'Very High Energy', icon: '🔥', description: 'Extremely active, athletic', exercise: 'intensive daily training' }
];
const availabilityOptions = [
    { value: 'now', label: 'Available Now', icon: '📍', description: 'Currently available for interaction' },
    { value: 'today', label: 'Available Today', icon: '⏰', description: 'Available sometime today' },
    { value: 'this_week', label: 'This Week', icon: '📅', description: 'Available within 7 days' },
    { value: 'flexible', label: 'Flexible Schedule', icon: '🔄', description: 'Open to arranging convenient times' }
];
export default function UltraPremiumFilterPanel({ isOpen, onClose, onApply, defaultFilters = {}, className = '' }) {
    const [activeTab, setActiveTab] = useState('species');
    const [filters, setFilters] = useState({
        species: [],
        breeds: [],
        ages: { min: 0, max: 20 },
        sizes: [],
        genders: [],
        colors: [],
        temperaments: [],
        energyLevels: [],
        trainability: [],
        familyFriendly: [],
        petFriendly: [],
        strangerFriendly: [],
        apartmentFriendly: null,
        houseSafe: null,
        yardRequired: null,
        groomingNeeds: [],
        exerciseNeeds: [],
        barkiness: [],
        healthStatus: [],
        vaccinationStatus: [],
        availability: [],
        locationRadius: 25,
        sortBy: 'relevance',
        sortDirection: 'desc',
        resultLimit: 20,
        premiumFeatures: {
            trending: false,
            verified: false,
            featured: false,
            aiRecommended: false
        },
        ...defaultFilters
    });
    const tabs = [
        { id: 'species', label: 'Species & Breeds', icon: '🐾', count: filters.species.length + filters.breeds.length },
        { id: 'basic', label: 'Basic Info', icon: '📋', count: filters.sizes.length + filters.genders.length },
        { id: 'personality', label: 'Personality', icon: '❤️', count: filters.temperaments.length + filters.energyLevels.length },
        { id: 'lifestyle', label: 'Lifestyle', icon: '🏠', count: Object.values(filters).filter(v => Array.isArray(v)).reduce((sum, arr) => sum + arr.length, 0) },
        { id: 'premium', label: 'Premium', icon: '✨', count: 0 }
    ];
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    const toggleArrayFilter = (key, value) => {
        const currentArray = Array.isArray(filters[key]) ? filters[key] : [];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        updateFilter(key, newArray);
    };
    const resetFilters = () => {
        setFilters({
            species: [],
            breeds: [],
            ages: { min: 0, max: 20 },
            sizes: [],
            genders: [],
            colors: [],
            temperaments: [],
            energyLevels: [],
            trainability: [],
            familyFriendly: [],
            petFriendly: [],
            strangerFriendly: [],
            apartmentFriendly: null,
            houseSafe: null,
            yardRequired: null,
            groomingNeeds: [],
            exerciseNeeds: [],
            barkiness: [],
            healthStatus: [],
            vaccinationStatus: [],
            availability: [],
            locationRadius: 25,
            sortBy: 'relevance',
            sortDirection: 'desc',
            resultLimit: 20,
            premiumFeatures: {
                trending: false,
                verified: false,
                featured: false,
                aiRecommended: false
            }
        });
    };
    const getFilterCount = () => {
        let count = 0;
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                count += value.length;
            }
            else if (typeof value === 'boolean' && value) {
                count += 1;
            }
            else if (typeof value === 'object' && value !== null && 'length' in value) {
                count += Object.values(value).filter(Boolean).length;
            }
        });
        return count;
    };
    return (<AnimatePresence>
      {isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}/>

          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-6xl w-full max-h-[95vh] overflow-hidden ${className}`}>
            {/* Ultra-Premium Header */}
            <div className="relative p-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-t-3xl"/>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg">
                    <FunnelIcon className="w-8 h-8 text-white"/>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Ultra-Premium Filters
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Advanced pet discovery with AI-powered matching
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Filters</div>
                    <div className="text-xl font-bold text-pink-600 dark:text-pink-400">
                      {getFilterCount()}
                    </div>
                  </div>
                  
                  <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <XMarkIcon className="w-6 h-6"/>
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {tabs.map((tab, index) => (<motion.button key={tab.id} onClick={() => { setActiveTab(tab.id); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab.id
                    ? 'border-gradient-to-r from-pink-500 to-purple-500 text-pink-600 dark:text-pink-400 bg-gradient-to-t from-pink-50 to-transparent dark:from-pink-900/20'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count > 0 && (<span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {tab.count}
                      </span>)}
                  </div>
                </motion.button>))}
            </div>

            {/* Ultra-Premium Content */}
            <div className="max-h-[60vh] overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'species' && (<motion.div key="species" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      {/* Species Selection with Counts */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <span>🐾</span>
                          Choose Pet Species
                          <span className="text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full">
                            {speciesOptions.reduce((sum, s) => sum + s.count, 0)} breeds available
                          </span>
                        </h3>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                          {speciesOptions.map((species) => (<motion.button key={species.value} onClick={() => { toggleArrayFilter('species', species.value); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`p-6 rounded-2xl border-2 transition-all duration-300 ${filters.species.includes(species.value)
                        ? 'border-gradient-to-r border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'}`}>
                              <div className="text-center">
                                <div className="text-4xl mb-3">{species.label.split(' ')[1]}</div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{species.label}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {species.count} breeds
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {species.subcategories.slice(0, 3).join(', ')}...
                                </div>
                              </div>
                            </motion.button>))}
                        </div>
                      </div>

                      {/* Enhanced Breed Search */}
                      {filters.species.length > 0 && (<div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span>🔍</span>
                            Search Specific Breeds
                            <SparklesIcon className="w-5 h-5 text-yellow-500"/>
                          </h3>
                          
                          <BreedSearchInput value={filters.breeds.join(', ')} onChange={(value, breed) => {
                        if (breed && !filters.breeds.includes(breed.name)) {
                            updateFilter('breeds', [...filters.breeds, breed.name]);
                        }
                    }} species={filters.species[0]} placeholder="Search breeds (e.g., 'golden retriever', 'persian cat')" variant="elegant" showPopularity={true} showPetCount={true} className="w-full"/>
                          
                          {/* Selected Breeds */}
                          {filters.breeds.length > 0 && (<div className="mt-6">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Selected Breeds</h4>
                              <div className="flex flex-wrap gap-3">
                                {filters.breeds.map((breed, index) => (<motion.span key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-800 dark:text-pink-200 rounded-full text-sm font-medium border border-pink-200 dark:border-pink-800 shadow-sm">
                                    <span>{breed}</span>
                                    <button onClick={() => { updateFilter('breeds', filters.breeds.filter((_, i) => i !== index)); }} className="text-pink-600 hover:text-pink-800 transition-colors">
                                      <XMarkIcon className="w-4 h-4"/>
                                    </button>
                                  </motion.span>))}
                              </div>
                            </div>)}
                        </div>)}
                    </motion.div>)}
                  
                  {activeTab === 'personality' && (<motion.div key="personality" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      {/* Temperament Selection */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <span>❤️</span>
                          Personality Traits
                          <LightBulbIcon className="w-5 h-5 text-yellow-500"/>
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {temperamentOptions.map((trait) => (<motion.button key={trait.value} onClick={() => { toggleArrayFilter('temperaments', trait.value); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-4 rounded-xl border-2 transition-all duration-200 ${filters.temperaments.includes(trait.value)
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                              <div className="text-center">
                                <div className="text-2xl mb-2">{trait.icon}</div>
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                  {trait.label}
                                </div>
                              </div>
                            </motion.button>))}
                        </div>
                      </div>

                      {/* Energy Level Selection */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <span>⚡</span>
                          Energy Level Preferences
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {energyLevelOptions.map((energy) => (<motion.button key={energy.value} onClick={() => { toggleArrayFilter('energyLevels', energy.value); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${filters.energyLevels.includes(energy.value)
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{energy.icon}</div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {energy.label}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {energy.description}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Exercise: {energy.exercise}
                                  </p>
                                </div>
                              </div>
                            </motion.button>))}
                        </div>
                      </div>
                    </motion.div>)}

                  {activeTab === 'premium' && (<motion.div key="premium" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      {/* Premium Features */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <span>✨</span>
                          Premium Features
                          <SparklesIcon className="w-5 h-5 text-yellow-500"/>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(filters.premiumFeatures).map(([key, value]) => (<motion.div key={key} whileHover={{ scale: 1.02 }} className={`p-6 rounded-2xl border-2 transition-all duration-300 ${value
                        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                              <label className="flex items-center gap-4 cursor-pointer">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${value ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                  {key === 'trending' && <SparklesIcon className={`w-6 h-6 ${value ? 'text-white' : 'text-gray-400'}`}/>}
                                  {key === 'verified' && <ShieldCheckIcon className={`w-6 h-6 ${value ? 'text-white' : 'text-gray-400'}`}/>}
                                  {key === 'featured' && <StarIcon className={`w-6 h-6 ${value ? 'text-white' : 'text-gray-400'}`}/>}
                                  {key === 'aiRecommended' && <LightBulbIcon className={`w-6 h-6 ${value ? 'text-white' : 'text-gray-400'}`}/>}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {key === 'trending' && 'Show currently popular pets'}
                                    {key === 'verified' && 'Only verified and trusted pets'}
                                    {key === 'featured' && 'Premium featured listings'}
                                    {key === 'aiRecommended' && 'AI-powered personalized matches'}
                                  </p>
                                </div>
                                <input type="checkbox" checked={value} onChange={(e) => { updateFilter('premiumFeatures', {
                        ...filters.premiumFeatures,
                        [key]: e.target.checked
                    }); }} className="w-5 h-5 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                              </label>
                            </motion.div>))}
                        </div>
                      </div>

                      {/* Advanced Sorting */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <span>📊</span>
                          Advanced Sorting Options
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Sort By
                            </label>
                            <select value={filters.sortBy} onChange={(e) => { updateFilter('sortBy', e.target.value); }} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                              <option value="relevance">Most Relevant</option>
                              <option value="newest">Newest First</option>
                              <option value="popularity">Most Popular</option>
                              <option value="distance">Nearest First</option>
                              <option value="breed_match">Best Breed Match</option>
                              <option value="featured">Featured First</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Results Per Page
                            </label>
                            <select value={filters.resultLimit} onChange={(e) => { updateFilter('resultLimit', parseInt(e.target.value)); }} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                              <option value="10">10 per page</option>
                              <option value="20">20 per page</option>
                              <option value="50">50 per page</option>
                              <option value="100">100 per page</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>)}
                </AnimatePresence>
              </div>
            </div>

            {/* Ultra-Premium Footer */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <motion.button onClick={resetFilters} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium">
                  Reset All Filters
                </motion.button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getFilterCount()} active filters
                </div>
              </div>
              
              <div className="flex gap-3">
                <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                  Cancel
                </motion.button>
                
                <motion.button onClick={() => onApply(filters)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4"/>
                  Apply Ultra-Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
//# sourceMappingURL=UltraPremiumFilterPanel.jsx.map