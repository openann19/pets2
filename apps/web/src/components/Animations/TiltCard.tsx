/**
 * 🎬 ULTRA PREMIUM 3D TILT CARDS
 * Professional-grade 3D perspective with depth shadows
 * Performance optimized with GPU transforms and gesture handling
 */

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface TiltCardProps {
  children: React.ReactNode;
  /** Maximum rotation angle in degrees */
  maxTilt?: number;
  /** Spring configuration */
  springConfig?: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  /** Shadow configuration */
  shadowConfig?: {
    intensity: number;
    blur: number;
    color: string;
  };
  /** Additional CSS classes */
  className?: string;
  /** Disable tilt effect */
  disabled?: boolean;
  /** Scale on hover */
  hoverScale?: number;
  /** Callback when tilt starts */
  onTiltStart?: () => void;
  /** Callback when tilt ends */
  onTiltEnd?: () => void;
}

const DEFAULT_SPRING_CONFIG = {
  stiffness: 300,
  damping: 20,
  mass: 0.8,
};

const DEFAULT_SHADOW_CONFIG = {
  intensity: 0.15,
  blur: 50,
  color: "rgba(0, 0, 0, 0.15)",
};

/**
 * Ultra Premium 3D Tilt Card Component
 * Creates stunning 3D perspective effects with realistic shadows
 */
export function TiltCard({
  children,
  maxTilt = 10,
  springConfig = DEFAULT_SPRING_CONFIG,
  shadowConfig = DEFAULT_SHADOW_CONFIG,
  className = "",
  disabled = false,
  hoverScale = 1.02,
  onTiltStart,
  onTiltEnd,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth rotation
  const rotateX = useSpring(
    useTransform(mouseY, [-40, 40], [maxTilt, -maxTilt]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-40, 40], [-maxTilt, maxTilt]),
    springConfig
  );

  // Dynamic shadow based on tilt
  const shadowX = useTransform(mouseX, [-40, 40], [-20, 20]);
  const shadowY = useTransform(mouseY, [-40, 40], [-20, 20]);
  const shadowBlur = useTransform(
    mouseX,
    [-40, 40],
    [shadowConfig.blur * 0.8, shadowConfig.blur * 1.2]
  );

  // Mouse event handlers
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseX.set(event.clientX - centerX);
      mouseY.set(event.clientY - centerY);
      
      onTiltStart?.();
    },
    [disabled, mouseX, mouseY, onTiltStart]
  );

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    
    mouseX.set(0);
    mouseY.set(0);
    onTiltEnd?.();
  }, [disabled, mouseX, mouseY, onTiltEnd]);

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      whileHover={disabled ? {} : { scale: hoverScale }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX,
          rotateY,
          boxShadow: `
            ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowConfig.color},
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          willChange: disabled ? "auto" : "transform",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Tilt Card with Glassmorphism Effect
 */
export function GlassTiltCard({
  children,
  className = "",
  ...props
}: TiltCardProps) {
  return (
    <TiltCard
      {...props}
      className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl ${className}`}
      shadowConfig={{
        intensity: 0.2,
        blur: 60,
        color: "rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </TiltCard>
  );
}

/**
 * Tilt Card with Gradient Background
 */
export function GradientTiltCard({
  children,
  gradient = "from-purple-500 to-cyan-500",
  className = "",
  ...props
}: TiltCardProps & { gradient?: string }) {
  return (
    <TiltCard
      {...props}
      className={`bg-gradient-to-br ${gradient} rounded-2xl ${className}`}
      shadowConfig={{
        intensity: 0.25,
        blur: 40,
        color: "rgba(0, 0, 0, 0.2)",
      }}
    >
      {children}
    </TiltCard>
  );
}

/**
 * Tilt Card with Image Background
 */
export function ImageTiltCard({
  children,
  imageSrc,
  imageAlt = "",
  className = "",
  ...props
}: TiltCardProps & { 
  imageSrc: string; 
  imageAlt?: string; 
}) {
  return (
    <TiltCard
      {...props}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      shadowConfig={{
        intensity: 0.3,
        blur: 50,
        color: "rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="absolute inset-0">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </TiltCard>
  );
}

/**
 * Hook for custom tilt effects
 */
export function useTiltEffect(
  maxTilt: number = 10,
  springConfig = DEFAULT_SPRING_CONFIG
) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(
    useTransform(mouseY, [-40, 40], [maxTilt, -maxTilt]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-40, 40], [-maxTilt, maxTilt]),
    springConfig
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseX.set(event.clientX - centerX);
      mouseY.set(event.clientY - centerY);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return {
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseLeave,
  };
}

/**
 * Tilt Card Presets
 */
export const TILT_PRESETS = {
  subtle: {
    maxTilt: 5,
    springConfig: { stiffness: 200, damping: 25, mass: 1 },
    hoverScale: 1.01,
  },
  medium: {
    maxTilt: 10,
    springConfig: { stiffness: 300, damping: 20, mass: 0.8 },
    hoverScale: 1.02,
  },
  dramatic: {
    maxTilt: 15,
    springConfig: { stiffness: 400, damping: 15, mass: 0.6 },
    hoverScale: 1.03,
  },
  bouncy: {
    maxTilt: 12,
    springConfig: { stiffness: 500, damping: 10, mass: 0.5 },
    hoverScale: 1.05,
  },
};
