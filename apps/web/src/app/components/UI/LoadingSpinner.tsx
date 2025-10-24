import React from 'react';
import { motion } from 'framer-motion';
export default function LoadingSpinner({ size = 'medium', color = '#3B82F6', className }) {
    const sizeMap = {
        small: 24,
        medium: 40,
        large: 60
    };
    const pawSize = sizeMap[size];
    const mainPawScale = 1;
    const sidePawScale = 0.7;
    // Paw print SVG component
    const PawPrint = ({ scale = 1, delay = 0 }) => (<motion.div animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, scale, scale, 0.5],
        }} transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }} style={{
            width: pawSize * scale,
            height: pawSize * scale,
        }} suppressHydrationWarning>
      <svg viewBox="0 0 24 24" fill={color} style={{ width: '100%', height: '100%' }}>
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