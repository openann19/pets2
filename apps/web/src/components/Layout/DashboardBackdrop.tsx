import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
// Import from local copy for now
// import { useWeather } from '../../services/WeatherService';
import { SPRING_CONFIG } from '../../constants/animations';
/**
 * Maps weather.main → gradient css classes.
 * Extend as desired. Gradients use TailwindCSS utilities.
 */
const WEATHER_GRADIENTS = {
    Clear: 'from-blue-300 via-sky-200 to-yellow-100',
    Clouds: 'from-gray-300 via-gray-200 to-gray-100',
    Rain: 'from-gray-600 via-gray-500 to-blue-400',
    Drizzle: 'from-gray-500 via-gray-400 to-blue-300',
    Thunderstorm: 'from-indigo-700 via-indigo-600 to-purple-500',
    Snow: 'from-blue-100 via-white to-slate-100',
    Mist: 'from-slate-300 via-slate-200 to-slate-100',
    Fog: 'from-slate-400 via-slate-300 to-slate-200',
    Default: 'from-pink-50 via-purple-50 to-indigo-50'
};
/**
 * Full-screen animated backdrop that responds to real-time weather.
 * Placed as the *first* child inside a page component so all content layers over it.
 */
const DashboardBackdrop = ({ className = '' }) => {
    // const { data: weather } = useWeather();
    const weather = null; // Stub for now
    const gradientClass = useMemo(() => {
        if (!weather)
            return WEATHER_GRADIENTS.Default;
        const key = weather.weather[0].main;
        return WEATHER_GRADIENTS[key] || WEATHER_GRADIENTS.Default;
    }, [weather]);
    return (<motion.div 
    // Tailwind gradient plus subtle opacity animation so transitions feel alive
    className={`fixed inset-0 -z-10 bg-gradient-to-br ${gradientClass} ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING_CONFIG}/>);
};
export default DashboardBackdrop;
//# sourceMappingURL=DashboardBackdrop.jsx.map
//# sourceMappingURL=DashboardBackdrop.jsx.map