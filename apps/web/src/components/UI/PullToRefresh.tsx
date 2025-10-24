/**
 * 🔄 PULL TO REFRESH COMPONENT
 * Smooth pull-to-refresh with rotating lever icon and paw scratch animation
 */
'use client';
import React, { useState, useRef, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
export default function PullToRefresh({ onRefresh, threshold = 80, resistance = 2.5, children, className = '', disabled = false, showPawAnimation = true }) {
    const [state, setState] = useState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        canRefresh: false
    });
    const containerRef = useRef(null);
    const startY = useRef(0);
    const currentY = useRef(0);
    const isAtTop = useRef(true);
    // Motion values for smooth animations
    const pullY = useMotionValue(0);
    const rotate = useTransform(pullY, [0, threshold], [0, 180]);
    const scale = useTransform(pullY, [0, threshold], [1, 1.2]);
    const opacity = useTransform(pullY, [0, threshold * 0.5, threshold], [0, 0.5, 1]);
    const handleTouchStart = (e) => {
        if (disabled || state.isRefreshing)
            return;
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
        // Check if we're at the top of the scrollable area
        isAtTop.current = containerRef.current?.scrollTop === 0;
    };
    const handleTouchMove = (e) => {
        if (disabled || state.isRefreshing || !isAtTop.current)
            return;
        currentY.current = e.touches[0].clientY;
        const deltaY = currentY.current - startY.current;
        if (deltaY > 0) {
            e.preventDefault();
            const pullDistance = Math.min(deltaY / resistance, threshold * 1.5);
            const canRefresh = pullDistance >= threshold;
            setState(prev => ({
                ...prev,
                isPulling: true,
                pullDistance,
                canRefresh
            }));
            pullY.set(pullDistance);
        }
    };
    const handleTouchEnd = async () => {
        if (disabled || state.isRefreshing)
            return;
        if (state.canRefresh && state.isPulling) {
            setState(prev => ({
                ...prev,
                isRefreshing: true,
                isPulling: false
            }));
            try {
                await onRefresh();
            }
            catch (error) {
                logger.error('Pull to refresh failed:', { error });
            }
            finally {
                setState(prev => ({
                    ...prev,
                    isRefreshing: false,
                    pullDistance: 0
                }));
                pullY.set(0);
            }
        }
        else {
            // Reset to initial state
            setState(prev => ({
                ...prev,
                isPulling: false,
                pullDistance: 0,
                canRefresh: false
            }));
            pullY.set(0);
        }
    };
    // Handle mouse events for desktop
    const handleMouseDown = (e) => {
        if (disabled || state.isRefreshing)
            return;
        startY.current = e.clientY;
        currentY.current = startY.current;
        isAtTop.current = containerRef.current?.scrollTop === 0;
    };
    const handleMouseMove = (e) => {
        if (disabled || state.isRefreshing || !isAtTop.current)
            return;
        currentY.current = e.clientY;
        const deltaY = currentY.current - startY.current;
        if (deltaY > 0) {
            const pullDistance = Math.min(deltaY / resistance, threshold * 1.5);
            const canRefresh = pullDistance >= threshold;
            setState(prev => ({
                ...prev,
                isPulling: true,
                pullDistance,
                canRefresh
            }));
            pullY.set(pullDistance);
        }
    };
    const handleMouseUp = handleTouchEnd;
    // Add global mouse event listeners
    useEffect(() => {
        if (state.isPulling) {
            const handleGlobalMouseMove = (e) => {
                currentY.current = e.clientY;
                const deltaY = currentY.current - startY.current;
                if (deltaY > 0) {
                    const pullDistance = Math.min(deltaY / resistance, threshold * 1.5);
                    const canRefresh = pullDistance >= threshold;
                    setState(prev => ({
                        ...prev,
                        pullDistance,
                        canRefresh
                    }));
                    pullY.set(pullDistance);
                }
            };
            const handleGlobalMouseUp = () => {
                handleTouchEnd();
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [state.isPulling, onRefresh, threshold, resistance]);
    return (<div ref={containerRef} className={`relative overflow-hidden ${className}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(state.isPulling || state.isRefreshing) && (<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4" style={{ y: pullY }}>
            <div className="flex flex-col items-center space-y-2">
              {/* Rotating lever icon */}
              <motion.div style={{ rotate, scale }} className="flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-primary-500"/>
              </motion.div>

              {/* Paw scratch animation */}
              {showPawAnimation && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: state.canRefresh ? 1 : 0.5 }} className="flex items-center space-x-1">
                  <motion.span animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                }} transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }} className="text-2xl">
                    🐾
                  </motion.span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {state.canRefresh ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </motion.div>)}

              {/* Progress indicator */}
              <motion.div className="w-32 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden" style={{ opacity }}>
                <motion.div className="h-full bg-primary-500 rounded-full" style={{
                width: useTransform(pullY, [0, threshold], ['0%', '100%'])
            }}/>
              </motion.div>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Refreshing indicator */}
      <AnimatePresence>
        {state.isRefreshing && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4 bg-primary-50 dark:bg-primary-900/20">
            <div className="flex items-center space-x-3">
              <motion.div animate={{ rotate: 360 }} transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}>
                <ArrowPathIcon className="w-5 h-5 text-primary-500"/>
              </motion.div>
              <span className="text-sm text-primary-600 dark:text-primary-400">
                Refreshing...
              </span>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Content */}
      <motion.div style={{ y: pullY }} className="min-h-full">
        {children}
      </motion.div>
    </div>);
}
// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);
    const handleRefresh = async () => {
        if (isRefreshing)
            return;
        setIsRefreshing(true);
        setLastRefresh(new Date());
        try {
            await onRefresh();
        }
        catch (error) {
            logger.error('Refresh failed:', { error });
        }
        finally {
            setIsRefreshing(false);
        }
    };
    const timeSinceLastRefresh = lastRefresh
        ? Date.now() - lastRefresh.getTime()
        : null;
    return {
        isRefreshing,
        lastRefresh,
        timeSinceLastRefresh,
        handleRefresh,
        canRefresh: !isRefreshing
    };
}
//# sourceMappingURL=PullToRefresh.jsx.map