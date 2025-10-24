'use client';
import React, { useState, useEffect, useRef } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { breedsAPI } from '../../services/breeds';
export default function BreedSearchInput({ value, onChange, onSelect, species, placeholder = "Search breeds (e.g., 'shiba inu')", className = '', showPopularity = true, showPetCount = true, variant = 'elegant' }) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const debounceRef = useRef();
    const searchBreeds = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await breedsAPI.searchBreeds(query, { species });
            if (response.data?.suggestions) {
                setSuggestions(response.data.suggestions);
            }
        }
        catch (error) {
            logger.error('Breed search error:', { error });
            setSuggestions([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            searchBreeds(value);
        }, 300);
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [value, species]);
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
        setIsOpen(true);
        setSelectedIndex(-1);
    };
    const handleSuggestionClick = (breed) => {
        onChange(breed.name, breed);
        setIsOpen(false);
        onSelect?.(breed);
        inputRef.current?.blur();
    };
    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0)
            return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };
    const clearInput = () => {
        onChange('');
        setIsOpen(false);
        inputRef.current?.focus();
    };
    const getSizeColor = (size) => {
        switch (size.toLowerCase()) {
            case 'tiny': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'small': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'large': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'extra-large': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getEnergyIcon = (energy) => {
        switch (energy.toLowerCase()) {
            case 'low': return '😴';
            case 'moderate': return '🏃‍♂️';
            case 'high': return '⚡';
            case 'very-high': return '🔥';
            default: return '❓';
        }
    };
    const getVariantStyles = () => {
        switch (variant) {
            case 'elegant':
                return {
                    input: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-2xl shadow-lg',
                    suggestions: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-2xl shadow-2xl'
                };
            case 'modern':
                return {
                    input: 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm',
                    suggestions: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl'
                };
            default:
                return {
                    input: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg',
                    suggestions: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg'
                };
        }
    };
    const styles = getVariantStyles();
    return (<div className={`relative ${className}`}>
      {/* Search Input */}
      <motion.div initial={variant === 'elegant' ? { opacity: 0, scale: 0.95 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className={`relative ${styles.input}`}>
        <div className="flex items-center px-4 py-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3"/>
          
          <input ref={inputRef} type="text" value={value} onChange={handleInputChange} onKeyDown={handleKeyDown} onFocus={() => setIsOpen(true)} placeholder={placeholder} className="flex-1 bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"/>
          
          {value && (<motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={clearInput} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="w-4 h-4"/>
            </motion.button>)}
          
          {isLoading && (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full ml-3"/>)}
        </div>
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (<motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className={`absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto ${styles.suggestions}`}>
            <div className="p-2">
              {suggestions.map((breed, index) => (<motion.button key={breed.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} onClick={() => handleSuggestionClick(breed)} className={`w-full p-3 rounded-xl transition-all duration-200 text-left ${index === selectedIndex
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {breed.name}
                        </h3>
                        {breed.isVerified && (<CheckCircleIcon className="w-4 h-4 text-green-500"/>)}
                        <span className="text-xs px-2 py-0.5 rounded-full border">
                          {breed.species}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getSizeColor(breed.size)}`}>
                          {breed.size}
                        </span>
                        <span className="flex items-center gap-1">
                          {getEnergyIcon(breed.energyLevel)}
                          {breed.energyLevel}
                        </span>
                        
                        {showPetCount && breed.availablePets !== undefined && (<span className="text-xs">
                            {breed.availablePets} pets
                          </span>)}
                      </div>
                    </div>
                    
                    {showPopularity && breed.popularity > 0 && (<div className="flex items-center gap-1 text-xs text-gray-500">
                        <StarIcon className="w-3 h-3"/>
                        <span>{breed.popularity}</span>
                      </div>)}
                  </div>
                </motion.button>))}
              
              {suggestions.length === 0 && !isLoading && (<div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                  <p>No breeds found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>)}
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (<div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}/>)}
    </div>);
}
//# sourceMappingURL=BreedSearchInput.jsx.map