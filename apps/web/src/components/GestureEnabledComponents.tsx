'use client';
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeGesture, usePullToRefresh, useLongPress, usePinchGesture, usePanGesture, gestureUtils, SwipeGesture, PullToRefreshState, PinchGesture, PanGesture } from '@/utils/mobile-gestures';
import { ArrowPathIcon, HandRaisedIcon, MagnifyingGlassIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
export function PullToRefresh({ children, onRefresh, threshold = 100, resistance = 0.5, maxPullDistance = 200, className = '', }) {
    const containerRef = useRef(null);
    const { state, attachGestures, detachGestures } = usePullToRefresh(onRefresh, {
        threshold,
        resistance,
        maxPullDistance,
    });
    useEffect(() => {
        if (containerRef.current) {
            attachGestures(containerRef.current);
        }
        return () => {
            detachGestures();
        };
    }, [attachGestures, detachGestures]);
    const pullProgress = Math.min(state.pullDistance / threshold, 1);
    const rotation = pullProgress * 180;
    return (<div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Pull Indicator */}
      <AnimatePresence>
        {state.isPulling && (<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-gradient-to-b from-pink-500 to-purple-600 text-white" style={{ height: state.pullDistance }}>
            <div className="flex items-center space-x-3">
              <motion.div animate={{ rotate: rotation }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <ArrowPathIcon className="h-6 w-6"/>
              </motion.div>
              <div className="text-sm font-medium">
                {state.canRefresh ? 'Release to refresh' : 'Pull to refresh'}
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {state.isRefreshing && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-gradient-to-b from-pink-500 to-purple-600 text-white h-16">
            <div className="flex items-center space-x-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <ArrowPathIcon className="h-6 w-6"/>
              </motion.div>
              <div className="text-sm font-medium">Refreshing...</div>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Content */}
      <motion.div animate={{
            y: state.isPulling ? state.pullDistance * 0.3 : 0,
            scale: state.isPulling ? 1 - pullProgress * 0.05 : 1,
        }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        {children}
      </motion.div>
    </div>);
}
export function SwipeableCard({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50, velocity = 0.3, className = '', hapticFeedback = true, }) {
    const cardRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const handleSwipe = (gesture) => {
        if (hapticFeedback) {
            gestureUtils.hapticFeedback('light');
        }
        switch (gesture.direction) {
            case 'left':
                onSwipeLeft?.();
                break;
            case 'right':
                onSwipeRight?.();
                break;
            case 'up':
                onSwipeUp?.();
                break;
            case 'down':
                onSwipeDown?.();
                break;
        }
    };
    const { attachGestures, detachGestures } = useSwipeGesture(handleSwipe, {
        threshold,
        velocity,
        direction: 'both',
    });
    useEffect(() => {
        if (cardRef.current) {
            attachGestures(cardRef.current);
        }
        return () => {
            detachGestures();
        };
    }, [attachGestures, detachGestures]);
    return (<motion.div ref={cardRef} className={`relative ${className}`} drag={false} // Disable framer-motion drag to use custom gesture handling
     animate={{
            x: dragOffset.x,
            y: dragOffset.y,
            scale: isDragging ? 0.95 : 1,
        }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onDragStart={() => setIsDragging(true)} onDragEnd={() => {
            setIsDragging(false);
            setDragOffset({ x: 0, y: 0 });
        }}>
      {children}
    </motion.div>);
}
export function LongPress({ children, onLongPress, delay = 500, className = '', hapticFeedback = true, }) {
    const elementRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);
    const handleLongPress = () => {
        if (hapticFeedback) {
            gestureUtils.hapticFeedback('medium');
        }
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
        onLongPress();
    };
    const { attachGestures, detachGestures } = useLongPress(handleLongPress, { delay });
    useEffect(() => {
        if (elementRef.current) {
            attachGestures(elementRef.current);
        }
        return () => {
            detachGestures();
        };
    }, [attachGestures, detachGestures]);
    return (<motion.div ref={elementRef} className={`relative ${className}`} animate={{
            scale: isPressed ? 0.95 : 1,
        }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      {children}
    </motion.div>);
}
export function PinchToZoom({ children, minScale = 0.5, maxScale = 3, className = '', hapticFeedback = true, }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [isZooming, setIsZooming] = useState(false);
    const handlePinch = (gesture) => {
        if (hapticFeedback) {
            gestureUtils.hapticFeedback('light');
        }
        const newScale = Math.max(minScale, Math.min(maxScale, scale * gesture.scale));
        setScale(newScale);
        setIsZooming(true);
        setTimeout(() => setIsZooming(false), 200);
    };
    const { attachGestures, detachGestures } = usePinchGesture(handlePinch);
    useEffect(() => {
        if (containerRef.current) {
            attachGestures(containerRef.current);
        }
        return () => {
            detachGestures();
        };
    }, [attachGestures, detachGestures]);
    const resetZoom = () => {
        setScale(1);
        if (hapticFeedback) {
            gestureUtils.hapticFeedback('light');
        }
    };
    return (<div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <motion.div animate={{
            scale,
        }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="origin-center">
        {children}
      </motion.div>

      {/* Zoom Controls */}
      <AnimatePresence>
        {scale !== 1 && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute top-4 right-4 z-10">
            <button onClick={resetZoom} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors" aria-label="Reset zoom">
              {scale > 1 ? (<ArrowsPointingInIcon className="h-5 w-5"/>) : (<ArrowsPointingOutIcon className="h-5 w-5"/>)}
            </button>
          </motion.div>)}
      </AnimatePresence>

      {/* Zoom Indicator */}
      <AnimatePresence>
        {isZooming && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full backdrop-blur-sm text-sm">
              {Math.round(scale * 100)}%
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
export function PanGesture({ children, onPan, threshold = 10, className = '', hapticFeedback = true, }) {
    const elementRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const handlePan = (gesture) => {
        if (hapticFeedback && !isPanning) {
            gestureUtils.hapticFeedback('light');
        }
        setIsPanning(true);
        setPanOffset({ x: gesture.deltaX, y: gesture.deltaY });
        onPan?.(gesture);
        setTimeout(() => {
            setIsPanning(false);
            setPanOffset({ x: 0, y: 0 });
        }, 100);
    };
    const { attachGestures, detachGestures } = usePanGesture(handlePan, { threshold });
    useEffect(() => {
        if (elementRef.current) {
            attachGestures(elementRef.current);
        }
        return () => {
            detachGestures();
        };
    }, [attachGestures, detachGestures]);
    return (<motion.div ref={elementRef} className={`relative ${className}`} animate={{
            x: panOffset.x,
            y: panOffset.y,
            scale: isPanning ? 0.98 : 1,
        }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      {children}
    </motion.div>);
}
/**
 * Gesture Demo Component
 */
export function GestureDemo() {
    const [gestureLog, setGestureLog] = useState([]);
    const addToLog = (message) => {
        setGestureLog(prev => [message, ...prev.slice(0, 9)]);
    };
    const handleRefresh = async () => {
        addToLog('Pull to refresh triggered');
        await new Promise(resolve => setTimeout(resolve, 2000));
        addToLog('Refresh completed');
    };
    const handleSwipe = (direction) => {
        addToLog(`Swiped ${direction}`);
    };
    const handleLongPress = () => {
        addToLog('Long press detected');
    };
    const handlePinch = (gesture) => {
        addToLog(`Pinch: scale ${gesture.scale.toFixed(2)}`);
    };
    const handlePan = (gesture) => {
        addToLog(`Pan: ${gesture.direction} (${gesture.deltaX.toFixed(0)}, ${gesture.deltaY.toFixed(0)})`);
    };
    return (<div className="max-w-md mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        Gesture Demo
      </h2>

      {/* Pull to Refresh */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
          Pull to Refresh
        </h3>
        <PullToRefresh onRefresh={handleRefresh} className="h-32">
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Pull down to refresh this content
          </div>
        </PullToRefresh>
      </div>

      {/* Swipeable Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
          Swipeable Card
        </h3>
        <SwipeableCard onSwipeLeft={() => handleSwipe('left')} onSwipeRight={() => handleSwipe('right')} onSwipeUp={() => handleSwipe('up')} onSwipeDown={() => handleSwipe('down')} className="h-32">
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Swipe in any direction
          </div>
        </SwipeableCard>
      </div>

      {/* Long Press */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
          Long Press
        </h3>
        <LongPress onLongPress={handleLongPress} className="h-32">
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Long press this area
          </div>
        </LongPress>
      </div>

      {/* Pinch to Zoom */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
          Pinch to Zoom
        </h3>
        <PinchToZoom className="h-32">
          <div className="p-4 text-center text-gray-600 dark:text-gray-400 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg m-2">
            Pinch to zoom this content
          </div>
        </PinchToZoom>
      </div>

      {/* Pan Gesture */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
          Pan Gesture
        </h3>
        <PanGesture onPan={handlePan} className="h-32">
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Pan around this area
          </div>
        </PanGesture>
      </div>

      {/* Gesture Log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
          Gesture Log
        </h3>
        <div className="p-4 max-h-48 overflow-y-auto">
          {gestureLog.length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center">
              No gestures detected yet
            </p>) : (<div className="space-y-1">
              {gestureLog.map((log, index) => (<div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  {log}
                </div>))}
            </div>)}
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=GestureEnabledComponents.jsx.map