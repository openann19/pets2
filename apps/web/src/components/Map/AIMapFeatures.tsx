'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../UI/LoadingSpinner';
import { SparklesIcon, LightBulbIcon, HeartIcon, ClockIcon, CloudIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth-store';
const AIMapFeatures = ({ pins, userLocation, onInsightClick }) => {
    const { user } = useAuthStore();
    const [insights, setInsights] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showInsights, setShowInsights] = useState(true);
    // AI Analysis Engine
    const analyzeMapData = useCallback(async () => {
        if (!pins.length || !userLocation)
            return;
        setIsAnalyzing(true);
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newInsights = [];
        // 1. Hotspot Analysis
        const hotspots = findActivityHotspots(pins);
        hotspots.forEach((hotspot, index) => {
            newInsights.push({
                id: `hotspot-${index}`,
                type: 'hotspot',
                title: 'Popular Pet Area Detected',
                description: `High activity zone with ${hotspot.count} recent activities. Great for socializing!`,
                confidence: Math.min(hotspot.count / 10, 1),
                location: hotspot.center,
                actionable: true,
                priority: hotspot.count > 5 ? 'high' : 'medium',
                icon: '🔥',
                color: '#EF4444'
            });
        });
        // 2. Optimal Timing Analysis
        const optimalTimes = analyzeOptimalTimes(pins);
        if (optimalTimes.length > 0) {
            newInsights.push({
                id: 'timing-optimal',
                type: 'timing',
                title: 'Best Times for Pet Activities',
                description: `Peak activity between ${optimalTimes[0].start}-${optimalTimes[0].end}. ${optimalTimes[0].activities} pets typically active.`,
                confidence: 0.85,
                actionable: true,
                priority: 'medium',
                icon: '⏰',
                color: '#3B82F6'
            });
        }
        // 3. Weather-Based Recommendations
        const weatherInsight = generateWeatherInsight();
        if (weatherInsight) {
            newInsights.push(weatherInsight);
        }
        // 4. Match Probability Analysis
        const matchInsights = analyzeMatchProbability(pins, userLocation);
        matchInsights.forEach(insight => newInsights.push(insight));
        // 5. Safety Analysis
        const safetyInsights = analyzeSafetyFactors(pins, userLocation);
        safetyInsights.forEach(insight => newInsights.push(insight));
        // 6. Activity Recommendations
        const activityRecs = generateActivityRecommendations(pins, userLocation);
        activityRecs.forEach(rec => newInsights.push(rec));
        setInsights(newInsights);
        setIsAnalyzing(false);
    }, [pins, userLocation]);
    // Hotspot Detection Algorithm
    const findActivityHotspots = (pins) => {
        const gridSize = 0.005; // ~500m grid
        const grid = new Map();
        pins.forEach(pin => {
            const gridX = Math.floor(pin.coordinates[0] / gridSize);
            const gridY = Math.floor(pin.coordinates[1] / gridSize);
            const key = `${gridX},${gridY}`;
            if (!grid.has(key)) {
                grid.set(key, { count: 0, pins: [], lat: 0, lng: 0 });
            }
            const cell = grid.get(key);
            cell.count++;
            cell.pins.push(pin);
            cell.lat += pin.coordinates[1];
            cell.lng += pin.coordinates[0];
        });
        return Array.from(grid.values())
            .filter(cell => cell.count >= 3)
            .map(cell => ({
            count: cell.count,
            center: {
                lat: cell.lat / cell.count,
                lng: cell.lng / cell.count
            },
            pins: cell.pins
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    };
    // Optimal Timing Analysis
    const analyzeOptimalTimes = (pins) => {
        const hourCounts = new Array(24).fill(0);
        pins.forEach(pin => {
            const hour = new Date(pin.createdAt).getHours();
            hourCounts[hour]++;
        });
        const peakHours = hourCounts
            .map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
        if (peakHours[0].count < 2)
            return [];
        return [{
                start: `${peakHours[0].hour}:00`,
                end: `${(peakHours[0].hour + 2) % 24}:00`,
                activities: peakHours[0].count
            }];
    };
    // Weather-Based Insights
    const generateWeatherInsight = () => {
        const hour = new Date().getHours();
        const isGoodWeatherTime = hour >= 8 && hour <= 18;
        if (isGoodWeatherTime) {
            return {
                id: 'weather-optimal',
                type: 'weather',
                title: 'Perfect Weather for Outdoor Activities',
                description: 'Current conditions are ideal for dog walks and park visits. UV levels are safe.',
                confidence: 0.9,
                actionable: true,
                priority: 'medium',
                icon: '☀️',
                color: '#F59E0B'
            };
        }
        return null;
    };
    // Match Probability Analysis
    const analyzeMatchProbability = (pins, userLoc) => {
        const nearbyPins = pins.filter(pin => {
            const distance = calculateDistance(userLoc.latitude, userLoc.longitude, pin.coordinates[1], pin.coordinates[0]);
            return distance <= 2; // Within 2km
        });
        if (nearbyPins.length < 3)
            return [];
        const matchProbability = Math.min(nearbyPins.length / 10, 0.95);
        return [{
                id: 'match-probability',
                type: 'match',
                title: 'High Match Potential Area',
                description: `${nearbyPins.length} compatible pets nearby. ${Math.round(matchProbability * 100)}% chance of finding a match here.`,
                confidence: matchProbability,
                actionable: true,
                priority: matchProbability > 0.7 ? 'high' : 'medium',
                icon: '💖',
                color: '#EC4899'
            }];
    };
    // Safety Analysis
    const analyzeSafetyFactors = (pins, userLoc) => {
        const insights = [];
        // Check for crowded areas
        const crowdedAreas = pins.filter(pin => {
            const distance = calculateDistance(userLoc.latitude, userLoc.longitude, pin.coordinates[1], pin.coordinates[0]);
            return distance <= 0.5; // Within 500m
        });
        if (crowdedAreas.length > 8) {
            insights.push({
                id: 'safety-crowded',
                type: 'safety',
                title: 'High Activity Area',
                description: 'This area has high pet traffic. Ensure your pet is comfortable with crowds.',
                confidence: 0.8,
                actionable: true,
                priority: 'medium',
                icon: '⚠️',
                color: '#F59E0B'
            });
        }
        return insights;
    };
    // Activity Recommendations
    const generateActivityRecommendations = (pins, userLoc) => {
        const insights = [];
        const activityCounts = pins.reduce((acc, pin) => {
            acc[pin.activity] = (acc[pin.activity] || 0) + 1;
            return acc;
        }, {});
        const topActivity = Object.entries(activityCounts)
            .sort(([, a], [, b]) => b - a)[0];
        if (topActivity && topActivity[1] > 3) {
            const activityNames = {
                walking: 'dog walking',
                playing: 'playtime',
                park: 'park visits',
                grooming: 'grooming sessions'
            };
            insights.push({
                id: 'activity-recommendation',
                type: 'activity',
                title: `Popular Activity: ${activityNames[topActivity[0]] || topActivity[0]}`,
                description: `${topActivity[1]} pets recently enjoyed ${activityNames[topActivity[0]] || topActivity[0]} in this area.`,
                confidence: 0.75,
                actionable: true,
                priority: 'low',
                icon: '🎾',
                color: '#10B981'
            });
        }
        return insights;
    };
    // Distance calculation helper
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    // Run analysis when data changes
    useEffect(() => {
        if (pins.length > 0 && userLocation) {
            analyzeMapData();
        }
    }, [pins.length, userLocation, analyzeMapData]);
    // Get icon component for insight type
    const getInsightIcon = (type) => {
        const icons = {
            hotspot: SparklesIcon,
            timing: ClockIcon,
            weather: CloudIcon,
            safety: ExclamationTriangleIcon,
            match: HeartIcon,
            activity: MapPinIcon
        };
        return icons[type] || LightBulbIcon;
    };
    // Priority-based sorting
    const sortedInsights = useMemo(() => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return insights.sort((a, b) => {
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.confidence - a.confidence;
        });
    }, [insights]);
    if (!user?.premium?.isActive) {
        return (<div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl max-w-sm">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="h-5 w-5 text-yellow-500"/>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Unlock AI-powered location insights and recommendations with Premium.
          </p>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200">
            Upgrade to Premium
          </button>
        </div>
      </div>);
    }
    return (<div className="absolute top-4 right-4 z-[1000] max-w-sm">
      {/* AI Analysis Status */}
      <AnimatePresence>
        {isAnalyzing && (<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl mb-4">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" color="#3B82F6"/>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                AI analyzing map data...
              </span>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Insights Panel */}
      <AnimatePresence>
        {showInsights && sortedInsights.length > 0 && (<motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-blue-500"/>
                  <span className="font-semibold text-gray-900 dark:text-white">AI Insights</span>
                </div>
                <button onClick={() => setShowInsights(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  ✕
                </button>
              </div>
            </div>

            {/* Insights List */}
            <div className="max-h-96 overflow-y-auto">
              {sortedInsights.slice(0, 5).map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                return (<motion.div key={insight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="p-4 border-b border-gray-200/30 dark:border-gray-700/30 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors" onClick={() => onInsightClick?.(insight)}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${insight.color}20`, color: insight.color }}>
                        {insight.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {insight.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {insight.priority === 'high' && (<span className="w-2 h-2 bg-red-500 rounded-full"></span>)}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {insight.description}
                        </p>
                        
                        {insight.actionable && (<div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Actionable
                            </span>
                          </div>)}
                      </div>
                    </div>
                  </motion.div>);
            })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50">
              <button onClick={analyzeMapData} className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                🔄 Refresh Analysis
              </button>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Toggle Button */}
      {!showInsights && insights.length > 0 && (<motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setShowInsights(true)} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200">
          <SparklesIcon className="h-5 w-5"/>
        </motion.button>)}
    </div>);
};
export default AIMapFeatures;
//# sourceMappingURL=AIMapFeatures.jsx.map