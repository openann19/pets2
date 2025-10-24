/**
 * 🎬 ULTRA PREMIUM LIQUID BACKDROP SYSTEM
 * Professional-grade SVG morphing with organic motion
 * Performance optimized with GPU transforms and reduced motion support
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

export interface LiquidBlobProps {
  /** SVG path data for morphing */
  paths: string[];
  /** Animation duration in seconds */
  duration?: number;
  /** Animation easing */
  ease?: string;
  /** Gradient colors */
  gradient?: {
    from: string;
    to: string;
    direction?: "horizontal" | "vertical" | "diagonal";
  };
  /** Blob opacity */
  opacity?: number;
  /** Additional CSS classes */
  className?: string;
  /** ViewBox dimensions */
  viewBox?: string;
  /** Disable animation */
  disabled?: boolean;
  /** Animation delay */
  delay?: number;
}

const DEFAULT_GRADIENT = {
  from: "#7c3aed",
  to: "#06b6d4",
  direction: "diagonal" as const,
};

/**
 * Ultra Premium Liquid Blob Component
 * Creates stunning organic morphing animations
 */
export function LiquidBlob({
  paths,
  duration = 8,
  ease = "easeInOut",
  gradient = DEFAULT_GRADIENT,
  opacity = 0.5,
  className = "",
  viewBox = "-90 -90 180 180",
  disabled = false,
  delay = 0,
}: LiquidBlobProps) {
  // Memoize gradient definition for performance
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  
  const gradientDirection = useMemo(() => {
    switch (gradient.direction) {
      case "horizontal":
        return { x1: "0%", y1: "0%", x2: "100%", y2: "0%" };
      case "vertical":
        return { x1: "0%", y1: "0%", x2: "0%", y2: "100%" };
      case "diagonal":
      default:
        return { x1: "0%", y1: "0%", x2: "100%", y2: "100%" };
    }
  }, [gradient.direction]);

  if (disabled || paths.length < 2) {
    return (
      <svg viewBox={viewBox} className={`absolute inset-0 h-full w-full ${className}`}>
        <path
          d={paths[0]}
          fill={`url(#${gradientId})`}
          opacity={opacity}
        />
        <defs>
          <linearGradient id={gradientId} {...gradientDirection}>
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg viewBox={viewBox} className={`absolute inset-0 h-full w-full ${className}`}>
      <motion.path
        d={paths[0]}
        animate={{ d: paths }}
        transition={{
          duration,
          ease,
          repeat: Infinity,
          repeatType: "mirror",
          delay,
        }}
        fill={`url(#${gradientId})`}
        opacity={opacity}
      />
      <defs>
        <linearGradient id={gradientId} {...gradientDirection}>
          <stop offset="0%" stopColor={gradient.from} />
          <stop offset="100%" stopColor={gradient.to} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Predefined blob shapes for common use cases
 */
export const BLOB_SHAPES = {
  organic: [
    "M44.5,-58.8C57.1,-51.1,66.7,-38.3,71,-24.1C75.3,-10,74.2,5.6,68.2,18.3C62.2,31,51.2,40.8,39.2,49.3C27.2,57.8,13.6,65.1,-1.2,66.8C-16,68.5,-32.1,64.6,-44.1,55.2C-56.1,45.7,-64.1,30.7,-67.3,14.7C-70.5,-1.2,-68.9,-18.2,-61.3,-31C-53.7,-43.8,-40.2,-52.4,-26.2,-59.5C-12.3,-66.5,1.9,-72,16.6,-71.4C31.3,-70.9,46.5,-64.3,44.5,-58.8Z",
    "M39.1,-53.5C51.9,-44.9,64.1,-35.6,68.3,-23.5C72.5,-11.4,68.7,3.5,62.8,17.9C56.8,32.2,48.7,45.9,36.9,55.4C25,65,9.5,70.4,-5.1,74.6C-19.7,78.8,-39.5,81.7,-53.4,74.2C-67.2,66.8,-75.1,48.9,-76.1,32C-77.2,15.2,-71.5,-0.6,-64.2,-12.5C-56.8,-24.4,-47.9,-32.3,-37.9,-42.4C-27.9,-52.5,-16.8,-64.8,-3.6,-63.1C9.6,-61.5,19.2,-45.2,39.1,-53.5Z",
    "M52.3,-67.8C68.1,-58.2,81.2,-45.1,85.8,-29.8C90.4,-14.5,86.5,2.9,78.2,18.1C69.9,33.3,57.2,46.3,42.8,56.1C28.4,65.9,12.3,72.5,-4.1,75.8C-20.5,79.1,-41.1,79.1,-57.5,69.3C-73.9,59.5,-86.1,39.9,-89.1,18.9C-92.1,-2.1,-85.9,-24.5,-73.5,-42.3C-61.1,-60.1,-42.5,-73.3,-22.1,-82.9C-1.7,-92.5,20.5,-98.5,52.3,-67.8Z",
  ],
  
  wave: [
    "M0,50 Q25,0 50,50 T100,50 L100,100 L0,100 Z",
    "M0,50 Q25,100 50,50 T100,50 L100,100 L0,100 Z",
    "M0,50 Q25,25 50,50 T100,50 L100,100 L0,100 Z",
  ],
  
  bubble: [
    "M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z",
    "M50,15 C65,15 80,30 80,50 C80,70 65,85 50,85 C35,85 20,70 20,50 C20,30 35,15 50,15 Z",
    "M50,20 C60,20 70,30 70,50 C70,70 60,80 50,80 C40,80 30,70 30,50 C30,30 40,20 50,20 Z",
  ],
  
  cloud: [
    "M20,50 C20,30 35,15 55,15 C60,10 70,10 75,15 C85,15 95,25 95,35 C95,45 85,55 75,55 L25,55 C15,55 5,45 5,35 C5,25 15,15 25,15 C30,10 40,10 45,15 C50,10 60,10 65,15 C75,15 85,25 85,35 C85,45 75,55 65,55 L20,55 C10,55 0,45 0,35 C0,25 10,15 20,15 Z",
    "M25,50 C25,30 40,15 60,15 C65,10 75,10 80,15 C90,15 100,25 100,35 C100,45 90,55 80,55 L30,55 C20,55 10,45 10,35 C10,25 20,15 30,15 C35,10 45,10 50,15 C55,10 65,10 70,15 C80,15 90,25 90,35 C90,45 80,55 70,55 L25,55 C15,55 5,45 5,35 C5,25 15,15 25,15 Z",
  ],
};

/**
 * Gradient presets for common themes
 */
export const GRADIENT_PRESETS = {
  sunset: {
    from: "#ff6b6b",
    to: "#feca57",
    direction: "diagonal" as const,
  },
  ocean: {
    from: "#667eea",
    to: "#764ba2",
    direction: "vertical" as const,
  },
  forest: {
    from: "#56ab2f",
    to: "#a8e6cf",
    direction: "horizontal" as const,
  },
  cosmic: {
    from: "#8360c3",
    to: "#2ebf91",
    direction: "diagonal" as const,
  },
  fire: {
    from: "#ff9a9e",
    to: "#fecfef",
    direction: "vertical" as const,
  },
  ice: {
    from: "#74b9ff",
    to: "#0984e3",
    direction: "horizontal" as const,
  },
};

/**
 * Liquid Backdrop Container
 */
export function LiquidBackdrop({
  children,
  className = "",
  gradient = GRADIENT_PRESETS.cosmic,
  opacity = 0.3,
  ...props
}: LiquidBlobProps & { children?: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LiquidBlob
        {...props}
        paths={BLOB_SHAPES.organic}
        gradient={gradient}
        opacity={opacity}
      />
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Multiple Liquid Blobs for complex backgrounds
 */
export function MultiBlobBackdrop({
  blobs,
  className = "",
  children,
}: {
  blobs: Array<{
    paths: string[];
    gradient?: LiquidBlobProps["gradient"];
    opacity?: number;
    duration?: number;
    delay?: number;
    size?: "small" | "medium" | "large";
  }>;
  className?: string;
  children?: React.ReactNode;
}) {
  const sizeClasses = {
    small: "w-32 h-32",
    medium: "w-64 h-64",
    large: "w-96 h-96",
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {blobs.map((blob, index) => (
        <div
          key={index}
          className={`absolute ${sizeClasses[blob.size || "medium"]}`}
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          <LiquidBlob
            paths={blob.paths}
            gradient={blob.gradient}
            opacity={blob.opacity || 0.2}
            duration={blob.duration || 8}
            delay={blob.delay || index * 2}
          />
        </div>
      ))}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for generating random blob shapes
 */
export function useRandomBlob(
  complexity: "simple" | "medium" | "complex" = "medium"
) {
  return useMemo(() => {
    const points = complexity === "simple" ? 8 : complexity === "medium" ? 12 : 16;
    const shapes = [];
    
    for (let i = 0; i < 3; i++) {
      let path = "M";
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = 40 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (j === 0) {
          path += `${x},${y}`;
        } else {
          path += ` Q${x * 0.5},${y * 0.5} ${x},${y}`;
        }
      }
      path += " Z";
      shapes.push(path);
    }
    
    return shapes;
  }, [complexity]);
}
