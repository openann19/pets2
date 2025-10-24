/**
 * Photo Enhancement Component
 * Automatically enhances pet photos with Cloudinary transformations
 */
'use client';
import { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, PhotoIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { usePhotoEnhancement, PhotoEnhancementOptions } from '@/services/photo-enhancement';
import { InteractiveButton } from '@/components/ui/Interactive';
export function PhotoEnhancement({ imageUrl, onEnhanced, className = '', autoEnhance = true, showComparison = false, useCase = 'gallery' }) {
    const { enhancePhoto, getOptimizedUrl, isEnhancing, error } = usePhotoEnhancement();
    const [enhancedUrl, setEnhancedUrl] = useState(null);
    const [showEnhancement, setShowEnhancement] = useState(false);
    const [enhancementOptions, setEnhancementOptions] = useState({
        autoColor: true,
        autoContrast: true,
        autoBrightness: true,
        autoSaturation: true,
        quality: 'auto',
        format: 'auto'
    });
    // Auto-enhance on mount if enabled
    useEffect(() => {
        if (autoEnhance && imageUrl) {
            handleEnhance();
        }
    }, [imageUrl, autoEnhance]);
    const handleEnhance = async () => {
        try {
            const result = await enhancePhoto(imageUrl, enhancementOptions);
            if (result) {
                setEnhancedUrl(result.enhancedUrl);
                onEnhanced?.(result.enhancedUrl);
            }
        }
        catch (error) {
            logger.error('Enhancement failed:', { error });
        }
    };
    const handleUseOptimized = () => {
        const optimizedUrl = getOptimizedUrl(imageUrl, useCase);
        setEnhancedUrl(optimizedUrl);
        onEnhanced?.(optimizedUrl);
    };
    const displayUrl = enhancedUrl || imageUrl;
    return (<div className={`relative ${className}`}>
      {/* Enhanced Photo */}
      <div className="relative group">
        <img src={displayUrl} alt="Enhanced pet photo" className="w-full h-full object-cover rounded-lg" loading="lazy"/>

        {/* Enhancement Overlay */}
        {enhancedUrl && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <SparklesIcon className="w-3 h-3"/>
            <span>Enhanced</span>
          </motion.div>)}

        {/* Enhancement Controls */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
          <div className="flex space-x-2">
            {!enhancedUrl && (<InteractiveButton onClick={handleEnhance} disabled={isEnhancing} size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30" icon={isEnhancing ? (<ArrowPathIcon className="w-4 h-4 animate-spin"/>) : (<SparklesIcon className="w-4 h-4"/>)}>
                {isEnhancing ? 'Enhancing...' : 'Enhance'}
              </InteractiveButton>)}

            <InteractiveButton onClick={handleUseOptimized} size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30" icon={<PhotoIcon className="w-4 h-4"/>}>
              Optimize
            </InteractiveButton>

            <InteractiveButton onClick={() => setShowEnhancement(!showEnhancement)} size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30" icon={<ArrowPathIcon className="w-4 h-4"/>}>
              Settings
            </InteractiveButton>
          </div>
        </div>
      </div>

      {/* Enhancement Settings Panel */}
      <AnimatePresence>
        {showEnhancement && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Enhancement Settings
            </h4>

            <div className="space-y-3">
              {/* Auto Enhancements */}
              <div className="grid grid-cols-2 gap-3">
                {[
                { key: 'autoColor', label: 'Auto Color' },
                { key: 'autoContrast', label: 'Auto Contrast' },
                { key: 'autoBrightness', label: 'Auto Brightness' },
                { key: 'autoSaturation', label: 'Auto Saturation' }
            ].map(({ key, label }) => (<label key={key} className="flex items-center space-x-2">
                    <input type="checkbox" checked={enhancementOptions[key]} onChange={(e) => setEnhancementOptions(prev => ({
                    ...prev,
                    [key]: e.target.checked
                }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>))}
              </div>

              {/* Quality Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quality
                </label>
                <select value={enhancementOptions.quality} onChange={(e) => setEnhancementOptions(prev => ({
                ...prev,
                quality: e.target.value
            }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="auto">Auto</option>
                  <option value="best">Best</option>
                  <option value="good">Good</option>
                  <option value="eco">Eco</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Apply Button */}
              <InteractiveButton onClick={handleEnhance} disabled={isEnhancing} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white" icon={isEnhancing ? (<ArrowPathIcon className="w-4 h-4 animate-spin"/>) : (<SparklesIcon className="w-4 h-4"/>)}>
                {isEnhancing ? 'Enhancing...' : 'Apply Enhancements'}
              </InteractiveButton>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Error Display */}
      {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mr-2"/>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </motion.div>)}

      {/* Comparison View */}
      {showComparison && enhancedUrl && (<PhotoComparison originalUrl={imageUrl} enhancedUrl={enhancedUrl} className="mt-4"/>)}
    </div>);
}
function PhotoComparison({ originalUrl, enhancedUrl, className = '' }) {
    const [activeTab, setActiveTab] = useState('enhanced');
    return (<div className={`${className}`}>
      <div className="flex space-x-1 mb-4">
        <button onClick={() => setActiveTab('original')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'original'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Original
        </button>
        <button onClick={() => setActiveTab('enhanced')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'enhanced'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Enhanced
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: activeTab === 'enhanced' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: activeTab === 'enhanced' ? -20 : 20 }} transition={{ duration: 0.2 }}>
            <img src={activeTab === 'enhanced' ? enhancedUrl : originalUrl} alt={`${activeTab} photo`} className="w-full h-64 object-cover rounded-lg"/>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>);
}
export function AutoEnhancePetPhoto({ imageUrl, petId, className = '', onEnhanced }) {
    return (<PhotoEnhancement imageUrl={imageUrl} onEnhanced={onEnhanced} className={className} autoEnhance={true} useCase="gallery" showComparison={false}/>);
}
//# sourceMappingURL=PhotoEnhancement.jsx.map