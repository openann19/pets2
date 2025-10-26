import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import React, { useCallback, useRef, useEffect } from 'react';
export const AdvancedPetFilters = ({ value, onChange, onReset, onApply }) => {
    const formRef = useRef(null);
    // Enhanced keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onReset) {
                onReset();
            }
            if (e.key === 'Enter' && e.ctrlKey && onApply) {
                e.preventDefault();
                onApply();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => { document.removeEventListener('keydown', handleKeyDown); };
    }, [onReset, onApply]);
    // Handler helpers with better type safety
    const handleChange = useCallback((field, val) => {
        onChange({ ...value, [field]: val });
    }, [value, onChange]);
    const handleTagToggle = useCallback((tag) => {
        const currentTags = value.personalityTags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        handleChange('personalityTags', newTags);
    }, [value.personalityTags, handleChange]);
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                staggerChildren: 0.05,
                ease: [0.23, 1, 0.32, 1]
            }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
        }
    };
    const personalityTags = [
        'Friendly', 'Energetic', 'Calm', 'Playful', 'Affectionate',
        'Independent', 'Social', 'Gentle', 'Protective', 'Curious'
    ];
    return (<motion.form ref={formRef} variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-lg max-w-md mx-auto" role="search" aria-label="Advanced pet filters">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Advanced Filters
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Find your perfect match
                </p>
            </motion.div>

            {/* Species Filter */}
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="species" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Species
                </Label>
                <select id="species" value={value.species || ''} onChange={e => { handleChange('species', e.target.value); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:border-pink-300" aria-describedby="species-help">
                    <option value="">Any species</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="other">Other</option>
                </select>
                <p id="species-help" className="text-xs text-gray-500 dark:text-gray-400">
                    Choose the type of pet you're looking for
                </p>
            </motion.div>

            {/* Age Range */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="minAge" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Min Age
                    </Label>
                    <input id="minAge" type="number" min={0} max={20} value={value.minAge ?? ''} onChange={e => { handleChange('minAge', e.target.value ? Number(e.target.value) : undefined); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200" aria-describedby="min-age-help"/>
                </div>
                <div>
                    <Label htmlFor="maxAge" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Max Age
                    </Label>
                    <input id="maxAge" type="number" min={0} max={20} value={value.maxAge ?? ''} onChange={e => { handleChange('maxAge', e.target.value ? Number(e.target.value) : undefined); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200" aria-describedby="max-age-help"/>
                </div>
                <p id="min-age-help" className="text-xs text-gray-500 dark:text-gray-400 col-span-2">
                    Age range in years (0-20)
                </p>
            </motion.div>

            {/* Size Filter */}
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="size" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Size
                </Label>
                <select id="size" value={value.size || ''} onChange={e => { handleChange('size', e.target.value); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:border-pink-300" aria-describedby="size-help">
                    <option value="">Any size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                </select>
                <p id="size-help" className="text-xs text-gray-500 dark:text-gray-400">
                    Pet size preference
                </p>
            </motion.div>

            {/* Intent Filter */}
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="intent" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Intent
                </Label>
                <select id="intent" value={value.intent || ''} onChange={e => { handleChange('intent', e.target.value); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:border-pink-300" aria-describedby="intent-help">
                    <option value="">Any intent</option>
                    <option value="adoption">Adoption</option>
                    <option value="mating">Mating</option>
                    <option value="playdate">Playdate</option>
                    <option value="all">All</option>
                </select>
                <p id="intent-help" className="text-xs text-gray-500 dark:text-gray-400">
                    What are you looking for?
                </p>
            </motion.div>

            {/* Distance Filter */}
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="maxDistance" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Max Distance: {value.maxDistance || 50} km
                </Label>
                <input id="maxDistance" type="range" min={1} max={100} step={1} value={value.maxDistance || 50} onChange={e => { handleChange('maxDistance', Number(e.target.value)); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider" aria-describedby="distance-help"/>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>1 km</span>
                    <span>100 km</span>
                </div>
                <p id="distance-help" className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum distance from your location
                </p>
            </motion.div>

            {/* Personality Tags */}
            <motion.div variants={itemVariants} className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Personality Tags
                </Label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Personality preferences">
                    {personalityTags.map((tag) => {
            const isSelected = value.personalityTags?.includes(tag);
            return (<motion.button key={tag} type="button" onClick={() => { handleTagToggle(tag); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 focus:ring-2 focus:ring-pink-500 focus:outline-none ${isSelected
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-gray-700'}`} aria-pressed={isSelected} aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag} personality tag`}>
                                {tag}
                            </motion.button>);
        })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select personality traits you prefer ({value.personalityTags?.length || 0} selected)
                </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {onReset && (<Button type="button" variant="outline" onClick={onReset} className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200" aria-label="Reset all filters to default">
                        Reset
                    </Button>)}
                {onApply && (<Button type="button" onClick={onApply} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30 transition-all duration-200 transform hover:scale-105" aria-label="Apply selected filters">
                        Apply Filters
                    </Button>)}
            </motion.div>

            {/* Keyboard Shortcuts Help */}
            <motion.div variants={itemVariants} className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">Esc</kbd> to reset • 
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border mx-1">Ctrl+Enter</kbd> to apply
                </p>
            </motion.div>
        </motion.form>);
};
// Custom CSS for the slider (add to global styles)
const sliderStyles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ec4899;
  cursor: pointer;
  box-shadow: 0 0 2px 0 #555;
  transition: background .15s ease-in-out;
}

.slider::-webkit-slider-thumb:hover {
  background: #db2777;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ec4899;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 2px 0 #555;
}
`;
// Inject styles (in a real app, this would be in a CSS file)
if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('slider-styles');
    if (!styleElement) {
        const style = document.createElement('style');
        style.id = 'slider-styles';
        style.textContent = sliderStyles;
        document.head.appendChild(style);
    }
}
//# sourceMappingURL=AdvancedPetFilters.jsx.map
//# sourceMappingURL=AdvancedPetFilters.jsx.map