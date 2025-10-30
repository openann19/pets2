/**
 * Tour Launcher Component
 * Provides UI for starting guided tours and tooltips
 */
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, QuestionMarkCircleIcon, XMarkIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useCoachTooltips } from '@/services/coach-tooltips';
import { InteractiveButton } from '@/components/ui/Interactive';
export function TourLauncher({ className = '', showOnFirstVisit = true, autoStartTour }) {
    const { startTour, stopTour, isTourActive, hasCompletedTour, getPredefinedTours } = useCoachTooltips();
    const [showMenu, setShowMenu] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const tours = getPredefinedTours();
    // Check if this is first visit
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasVisited = localStorage.getItem('pawfectmatch_visited');
            if (!hasVisited && showOnFirstVisit) {
                setIsFirstVisit(true);
                localStorage.setItem('pawfectmatch_visited', 'true');
            }
        }
    }, [showOnFirstVisit]);
    // Auto-start tour if specified
    useEffect(() => {
        if (autoStartTour && !hasCompletedTour(autoStartTour) && !isTourActive) {
            setTimeout(() => {
                startTour(autoStartTour);
            }, 1000);
        }
    }, [autoStartTour, hasCompletedTour, isTourActive, startTour]);
    const handleStartTour = (tourId) => {
        startTour(tourId);
        setShowMenu(false);
    };
    const handleStopTour = () => {
        stopTour();
    };
    return (<>
      {/* Tour Menu Button */}
      <div className={`relative ${className}`}>
        <InteractiveButton onClick={() => { setShowMenu(!showMenu); }} variant="outline" size="sm" className="text-gray-600 hover:text-gray-800" icon={<QuestionMarkCircleIcon className="w-4 h-4"/>}>
          Help & Tours
        </InteractiveButton>

        {/* Tour Menu */}
        <AnimatePresence>
          {showMenu && (<motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Guided Tours
                </h3>
                <button onClick={() => { setShowMenu(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <XMarkIcon className="w-5 h-5"/>
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(tours).map(([tourId, tour]) => (<div key={tourId} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {tour.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {tour.description}
                      </p>
                      {hasCompletedTour(tourId) && (<div className="flex items-center mt-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1"/>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Completed
                          </span>
                        </div>)}
                    </div>
                    <InteractiveButton onClick={() => { handleStartTour(tourId); }} disabled={isTourActive} size="sm" className="ml-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white" icon={<PlayIcon className="w-4 h-4"/>}>
                      Start
                    </InteractiveButton>
                  </div>))}
              </div>

              {/* Quick Tips */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Quick Tips
                </h4>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <SparklesIcon className="w-3 h-3 mr-2"/>
                    <span>Swipe right to like, left to pass</span>
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="w-3 h-3 mr-2"/>
                    <span>Tap cards to see more details</span>
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="w-3 h-3 mr-2"/>
                    <span>Use filters to find perfect matches</span>
                  </div>
                </div>
              </div>
            </motion.div>)}
        </AnimatePresence>
      </div>

      {/* First Visit Welcome */}
      <AnimatePresence>
        {isFirstVisit && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <SparklesIcon className="w-8 h-8 text-white"/>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to PawfectMatch! 🐾
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Let's take a quick tour to help you get started with finding the perfect match for your furry friend.
                </p>
                <div className="flex space-x-3">
                  <InteractiveButton onClick={() => {
                setIsFirstVisit(false);
                handleStartTour('onboarding');
            }} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white" icon={<PlayIcon className="w-5 h-5"/>}>
                    Take Tour
                  </InteractiveButton>
                  <InteractiveButton onClick={() => { setIsFirstVisit(false); }} variant="outline" className="flex-1">
                    Skip
                  </InteractiveButton>
                </div>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>

      {/* Active Tour Indicator */}
      <AnimatePresence>
        {isTourActive && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed bottom-6 right-6 z-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tour in Progress
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Follow the highlighted steps
                  </p>
                </div>
                <InteractiveButton onClick={handleStopTour} variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                  Exit
                </InteractiveButton>
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </>);
}
// Compact tour launcher for specific pages
export function CompactTourLauncher({ tourId, className = '' }) {
    const { startTour, hasCompletedTour } = useCoachTooltips();
    const tours = getPredefinedTours();
    const tour = tours[tourId];
    if (!tour)
        return null;
    return (<InteractiveButton onClick={() => startTour(tourId)} variant="outline" size="sm" className={`text-gray-600 hover:text-gray-800 ${className}`} icon={<QuestionMarkCircleIcon className="w-4 h-4"/>}>
      {hasCompletedTour(tourId) ? 'Replay Tour' : 'Take Tour'}
    </InteractiveButton>);
}
// Floating help button
export function FloatingHelpButton({ className = '' }) {
    const [showMenu, setShowMenu] = useState(false);
    const { startTour, isTourActive } = useCoachTooltips();
    return (<div className={`fixed bottom-6 left-6 z-40 ${className}`}>
      <InteractiveButton onClick={() => { setShowMenu(!showMenu); }} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200" icon={<QuestionMarkCircleIcon className="w-6 h-6"/>}/>

      <AnimatePresence>
        {showMenu && (<motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Need Help?
            </h4>
            <div className="space-y-2">
              <button onClick={() => {
                startTour('onboarding');
                setShowMenu(false);
            }} disabled={isTourActive} className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Take Welcome Tour
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Learn the basics
                </div>
              </button>
              <button onClick={() => {
                startTour('swipeTutorial');
                setShowMenu(false);
            }} disabled={isTourActive} className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Swipe Tutorial
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Master the swipe interface
                </div>
              </button>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
//# sourceMappingURL=TourLauncher.jsx.map