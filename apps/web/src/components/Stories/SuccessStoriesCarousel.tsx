/**
 * Success Stories Carousel Component
 * Displays user testimonials and success stories
 */
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon, CalendarIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useSuccessStories, SuccessStory } from '@/services/success-stories';
import { InteractiveButton } from '@/components/ui/Interactive';
export function SuccessStoriesCarousel({ className = '', autoPlay = true, autoPlayInterval = 5000, showFeatured = true, maxStories = 5 }) {
    const { stories, isLoading, error, fetchFeaturedStories } = useSuccessStories();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
    // Fetch stories on mount
    useEffect(() => {
        if (showFeatured) {
            fetchFeaturedStories(maxStories);
        }
    }, [showFeatured, maxStories]);
    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || stories.length <= 1)
            return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % stories.length);
        }, autoPlayInterval);
        return () => { clearInterval(interval); };
    }, [isAutoPlaying, stories.length, autoPlayInterval]);
    const nextStory = () => {
        setCurrentIndex((prev) => (prev + 1) % stories.length);
    };
    const prevStory = () => {
        setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };
    const goToStory = (index) => {
        setCurrentIndex(index);
    };
    if (isLoading) {
        return (<div className={`bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-gray-600">Loading success stories...</span>
        </div>
      </div>);
    }
    if (error || stories.length === 0) {
        return (<div className={`bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <HeartIcon className="w-12 h-12 text-pink-400 mx-auto mb-4"/>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Success Stories Yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your PawfectMatch success story!
          </p>
        </div>
      </div>);
    }
    const currentStory = stories[currentIndex];
    return (<div className={`bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-white"/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Success Stories
            </h2>
            <p className="text-gray-600">
              Real matches, real happiness
            </p>
          </div>
        </div>

        {/* Auto-play toggle */}
        <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isAutoPlaying
            ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {isAutoPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Story Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div key={currentStory.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="bg-white rounded-xl p-6 shadow-lg">
            {/* Story Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentStory.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1"/>
                    <span>{currentStory.author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1"/>
                    <span>{currentStory.author.location}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1"/>
                    <span>{new Date(currentStory.match.matchDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (<StarIcon key={i} className={`w-5 h-5 ${i < currentStory.rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'}`}/>))}
              </div>
            </div>

            {/* Story Content */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              "{currentStory.content}"
            </p>

            {/* Pet Match Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                {/* Author's Pet */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    {currentStory.author.petPhoto ? (<img src={currentStory.author.petPhoto} alt={currentStory.author.petName} className="w-12 h-12 rounded-full object-cover"/>) : (<span className="text-white font-semibold text-sm">
                        {currentStory.author.petName.charAt(0)}
                      </span>)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {currentStory.author.petName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentStory.author.petBreed}
                    </p>
                  </div>
                </div>

                {/* Heart Icon */}
                <div className="flex items-center">
                  <HeartIcon className="w-6 h-6 text-pink-500"/>
                </div>

                {/* Matched Pet */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    {currentStory.match.petPhoto ? (<img src={currentStory.match.petPhoto} alt={currentStory.match.petName} className="w-12 h-12 rounded-full object-cover"/>) : (<span className="text-white font-semibold text-sm">
                        {currentStory.match.petName.charAt(0)}
                      </span>)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {currentStory.match.petName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentStory.match.petBreed}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {currentStory.tags.slice(0, 3).map((tag) => (<span key={tag} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                    {tag}
                  </span>))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <InteractiveButton onClick={prevStory} variant="outline" size="sm" className="text-gray-600 hover:text-gray-800" icon={<ChevronLeftIcon className="w-4 h-4"/>}>
            Previous
          </InteractiveButton>

          {/* Dots Indicator */}
          <div className="flex space-x-2">
            {stories.map((_, index) => (<button key={index} onClick={() => { goToStory(index); }} className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex
                ? 'bg-pink-500'
                : 'bg-gray-300 hover:bg-gray-400'}`}/>))}
          </div>

          <InteractiveButton onClick={nextStory} variant="outline" size="sm" className="text-gray-600 hover:text-gray-800" icon={<ChevronRightIcon className="w-4 h-4"/>}>
            Next
          </InteractiveButton>
        </div>
      </div>

      {/* Story Counter */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {currentIndex + 1} of {stories.length} stories
      </div>
    </div>);
}
// Compact version for smaller spaces
export function CompactSuccessStories({ className = '', maxStories = 3 }) {
    const { stories, isLoading, fetchFeaturedStories } = useSuccessStories();
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        fetchFeaturedStories(maxStories);
    }, [maxStories]);
    if (isLoading || stories.length === 0) {
        return (<div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>);
    }
    const currentStory = stories[currentIndex];
    return (<div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Success Story</h4>
        <div className="flex space-x-1">
          {stories.map((_, index) => (<button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-pink-500' : 'bg-gray-300'}`}/>))}
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
        "{currentStory.content}"
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{currentStory.author.name}</span>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (<StarIcon key={i} className={`w-3 h-3 ${i < currentStory.rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'}`}/>))}
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=SuccessStoriesCarousel.jsx.map