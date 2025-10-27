'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, AdjustmentsHorizontalIcon, XMarkIcon, SparklesIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import BreedSearchInput from './BreedSearchInput';
const defaultFilters = {
    species: [],
    breeds: [],
    ageRange: [0, 20],
    sizes: [],
    gender: [],
    energyLevels: [],
    temperaments: [],
    familyFriendly: [],
    apartmentFriendly: null,
    trainability: [],
    groomingNeeds: [],
    exerciseNeeds: [],
    healthConcerns: [],
    intent: [],
    maxDistance: 50,
    sortBy: 'relevance'
};
const speciesOptions = [
    { value: 'dog', label: 'Dogs', icon: '🐕', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'cat', label: 'Cats', icon: '🐱', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'bird', label: 'Birds', icon: '🐦', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: ' rabbit', label: 'Rabbits', icon: '🐰', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { value: 'other', label: 'Other', icon: '🐾', color: 'bg-gray-100 text-gray-800 border-gray-200' }
];
const sizeOptions = [
    { value: 'tiny', label: 'Tiny', weight: 'Under 5 lbs' },
    { value: 'small', label: 'Small', weight: '5-25 lbs' },
    { value: 'medium', label: 'Medium', weight: '25-55 lbs' },
    { value: 'large', label: 'Large', weight: '55-85 lbs' },
    { value: 'extra-large', label: 'Extra Large', weight: '85+ lbs' }
];
const energyLevelOptions = [
    { value: 'low', label: 'Low Energy', icon: '😴', description: 'Calm, relaxed' },
    { value: 'moderate', label: 'Moderate', icon: '🏃‍♂️', description: 'Regular walks' },
    { value: 'high', label: 'High Energy', icon: '⚡', description: 'Very active' },
    { value: 'very-high', label: 'Very High', icon: '🔥', description: 'Athletic & energetic' }
];
const temperamentOptions = [
    'friendly', 'calm', 'playful', 'loyal', 'intelligent', 'gentle',
    'social', 'independent', 'protective', 'shy', 'energetic', 'docile'
];
const intentOptions = [
    { value: 'adoption', label: 'Adoption', icon: '🏠' },
    { value: 'playdate', label: 'Playdates', icon: '🎾' },
    { value: 'mating', label: 'Breeding', icon: '💕' },
    { value: 'all', label: 'All', icon: '🌈' }
];
const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'breed_match', label: 'Best Breed Match' }
];
export default function AdvancedFilterPanel({ filters, onFiltersChange, onApply, onReset, isOpen, onClose, className = '' }) {
    const [activeTab, setActiveTab] = useState('species');
    const [localFilters, setLocalFilters] = useState(filters);
    const updateFilter = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };
    const toggleArrayFilter = (key, value) => {
        const currentArray = Array.isArray(localFilters[key]) ? localFilters[key] : [];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        updateFilter(key, newArray);
    };
    const handleApply = () => {
        onFiltersChange(localFilters);
        onApply(localFilters);
        onClose();
    };
    const handleReset = () => {
        setLocalFilters(defaultFilters);
        onFiltersChange(defaultFilters);
        onReset();
    };
    const getActiveTabCount = (tab) => {
        switch (tab) {
            case 'species':
                return filters.species.length + filters.breeds.length;
            case 'characteristics':
                return filters.sizes.length + filters.ageRange[0] !== defaultFilters.ageRange[0] || filters.ageRange[1] !== defaultFilters.ageRange[1] ? 1 : 0;
            case 'preferences':
                return filters.energyLevels.length + filters.temperaments.length + filters.familyFriendly.length;
            case 'advanced':
                return filters.trainability.length + filters.groomingNeeds.length + filters.exerciseNeeds.length;
            default:
                return 0;
        }
    };
    const tabs = [
        { id: 'species', label: 'Species & Breeds', icon: '🐾' },
        { id: 'characteristics', label: 'Characteristics', icon: '📏' },
        { id: 'preferences', label: 'Preferences', icon: '❤️' },
        { id: 'advanced', label: 'Advanced', icon: '⚙️' }
    ];
    return (<AnimatePresence>
      {isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

          {/* Filter Panel */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
                  <FunnelIcon className="w-6 h-6 text-white"/>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Advanced Filters
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Find your perfect pet match
                  </p>
                </div>
              </div>
              
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <XMarkIcon className="w-5 h-5"/>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (<button key={tab.id} onClick={() => { setActiveTab(tab.id); }} className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                  <div className="flex items-center justify-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {getActiveTabCount(tab.id) > 0 && (<span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {getActiveTabCount(tab.id)}
                      </span>)}
                  </div>
                </button>))}
            </div>

            {/* Tab Content */}
            <div className="max-h-96 overflow-y-auto">
              <div className="p-6">
                {/* Species & Breeds Tab */}
                {activeTab === 'species' && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {/* Species Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Species
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {speciesOptions.map((species) => (<button key={species.value} onClick={() => { toggleArrayFilter('species', species.value); }} className={`p-4 rounded-xl border-2 transition-all ${localFilters.species.includes(species.value)
                        ? `${species.color} scale-105`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{species.icon}</span>
                              <span className="font-medium">{species.label}</span>
                            </div>
                          </button>))}
                      </div>
                    </div>

                    {/* Breed Search */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Specific Breeds
                      </h3>
                      <BreedSearchInput value={localFilters.breeds.join(', ')} onChange={(value, breed) => {
                    if (breed && !localFilters.breeds.includes(breed.name)) {
                        updateFilter('breeds', [...localFilters.breeds, breed.name]);
                    }
                }} species={localFilters.species[0]} placeholder="Search for specific breeds..." variant="elegant" showPopularity={true} showPetCount={true}/>
                      
                      {/* Selected Breeds */}
                      {localFilters.breeds.length > 0 && (<div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {localFilters.breeds.map((breed, index) => (<span key={index} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-800 dark:text-pink-200 rounded-full text-sm border border-pink-200 dark:border-pink-800">
                                {breed}
                                <button onClick={() => {
                            updateFilter('breeds', localFilters.breeds.filter((_, i) => i !== index));
                        }} className="text-pink-600 hover:text-pink-800">
                                  <XMarkIcon className="w-4 h-4"/>
                                </button>
                              </span>))}
                          </div>
                        </div>)}
                    </div>

                    {/* Intent */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Looking For
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        {intentOptions.map((intent) => (<button key={intent.value} onClick={() => { updateFilter('intent', [intent.value]); }} className={`p-4 rounded-xl border-2 transition-all text-center ${localFilters.intent.includes(intent.value)
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                            <div className="text-2xl mb-2">{intent.icon}</div>
                            <div className="text-sm font-medium">{intent.label}</div>
                          </button>))}
                      </div>
                    </div>
                  </motion.div>)}

                {/* Characteristics Tab */}
                {activeTab === 'characteristics' && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {/* Size Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Size
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {sizeOptions.map((size) => (<button key={size.value} onClick={() => { toggleArrayFilter('sizes', size.value); }} className={`p-4 rounded-xl border-2 transition-all ${localFilters.sizes.includes(size.value)
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {size.label}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {size.weight}
                            </div>
                          </button>))}
                      </div>
                    </div>

                    {/* Age Range */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Age Range (years)
                      </h3>
                      <div className="flex items-center gap-4">
                        <input type="number" min="0" max="20" value={localFilters.ageRange[0]} onChange={(e) => { updateFilter('ageRange', [parseInt(e.target.value) || 0, localFilters.ageRange[1]]); }} className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"/>
                        <span className="text-gray-500 dark:text-gray-400">to</span>
                        <input type="number" min="0" max="20" value={localFilters.ageRange[1]} onChange={(e) => { updateFilter('ageRange', [localFilters.ageRange[0], parseInt(e.target.value) || 20]); }} className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"/>
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Gender
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { toggleArrayFilter('gender', 'male'); }} className={`p-4 rounded-xl border-2 transition-all ${localFilters.gender.includes('male')
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                          <div className="text-center">
                            <div className="text-2xl mb-2">♂️</div>
                            <div className="font-medium text-gray-900 dark:text-white">Male</div>
                          </div>
                        </button>
                        
                        <button onClick={() => { toggleArrayFilter('gender', 'female'); }} className={`p-4 rounded-xl border-2 transition-all ${localFilters.gender.includes('female')
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                          <div className="text-center">
                            <div className="text-2xl mb-2">♀️</div>
                            <div className="font-medium text-gray-900 dark:text-white">Female</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>)}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {/* Energy Level */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Energy Level
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {energyLevelOptions.map((energy) => (<button key={energy.value} onClick={() => { toggleArrayFilter('energyLevels', energy.value); }} className={`p-4 rounded-xl border-2 transition-all ${localFilters.energyLevels.includes(energy.value)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                            <div className="text-center">
                              <div className="text-3xl mb-2">{energy.icon}</div>
                              <div className="font-medium text-gray-900 dark:text-white mb-1">
                                {energy.label}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {energy.description}
                              </div>
                            </div>
                          </button>))}
                      </div>
                    </div>

                    {/* Temperament */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Temperament
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {temperamentOptions.map((temperament) => (<button key={temperament} onClick={() => { toggleArrayFilter('temperaments', temperament); }} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${localFilters.temperaments.includes(temperament)
                        ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {temperament.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </button>))}
                      </div>
                    </div>

                    {/* Living Situation */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Living Situation
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 transition-colors">
                          <input type="checkbox" checked={localFilters.apartmentFriendly === true} onChange={(e) => { updateFilter('apartmentFriendly', e.target.checked ? true : null); }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Apartment Friendly
                          </span>
                        </label>
                      </div>
                    </div>
                  </motion.div>)}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="text-center py-8">
                      <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Advanced Filters
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        More detailed filters coming soon!
                      </p>
                    </div>
                  </motion.div>)}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button onClick={handleReset} className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                Reset All Filters
              </button>
              
              <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button onClick={handleApply} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
//# sourceMappingURL=AdvancedFilterPanel.jsx.map