import React from 'react';
import { motion } from 'framer-motion';
import { BOUNCY_CONFIG } from '../../constants/animations';
export default function LoadingSpinner({ size = 'md', variant = 'default', color = '#ec4899', className }) {
    const sizeMap = {
        xs: 20,
        sm: 28,
        md: 40,
        lg: 56,
        xl: 72
    };
    // Variant colors
    const variantColors = {
        default: color,
        gradient: 'url(#gradient)',
        neon: '#ec4899',
        holographic: 'url(#holographic)',
    };
    const pawSize = sizeMap[size];
    const mainPawScale = 1;
    const sidePawScale = 0.7;
    // Paw print SVG component
    const PawPrint = ({ scale = 1, delay = 0 }) => (<motion.div animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, scale, scale, 0.5],
            y: [0, -5, 0],
        }} transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: delay,
            ...BOUNCY_CONFIG,
        }} style={{
            width: pawSize * scale,
            height: pawSize * scale,
        }} suppressHydrationWarning>
      <svg viewBox="0 0 24 24" fill={variantColors[variant]} style={{ width: '100%', height: '100%' }} className={variant === 'neon' ? 'drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : ''}>
        <defs>
          {/* Gradient definition */}
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899"/>
            <stop offset="50%" stopColor="#a855f7"/>
            <stop offset="100%" stopColor="#6366f1"/>
          </linearGradient>
          {/* Holographic gradient */}
          <linearGradient id="holographic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b">
              <animate attributeName="stop-color" values="#ff6b6b;#4ecdc4;#45b7b8;#96ceb4;#ff6b6b" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#4ecdc4">
              <animate attributeName="stop-color" values="#4ecdc4;#45b7b8;#96ceb4;#ff6b6b;#4ecdc4" dur="3s" repeatCount="indefinite"/>
            </stop>
          </linearGradient>
        </defs>
        {/* Main pad */}
        <ellipse cx="12" cy="16" rx="5" ry="6"/>
        {/* Toe pads */}
        <ellipse cx="8" cy="9" rx="2" ry="3"/>
        <ellipse cx="12" cy="8" rx="2" ry="3"/>
        <ellipse cx="16" cy="9" rx="2" ry="3"/>
        <ellipse cx="6" cy="13" rx="1.5" ry="2.5"/>
      </svg>
    </motion.div>);
    return (<div className={className ? `flex items-center justify-center ${className}` : 'flex items-center justify-center'} data-testid="loading-spinner" role="img" aria-label="Loading">
      <div className="relative" style={{ width: pawSize * 2.5, height: pawSize * 2 }}>
        {/* Center paw */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <PawPrint scale={mainPawScale} delay={0}/>
        </div>
        
        {/* Left paw */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
          <PawPrint scale={sidePawScale} delay={0.3}/>
        </div>
        
        {/* Right paw */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
          <PawPrint scale={sidePawScale} delay={0.6}/>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=LoadingSpinner.jsx.map
//# sourceMappingURL=LoadingSpinner.jsx.map