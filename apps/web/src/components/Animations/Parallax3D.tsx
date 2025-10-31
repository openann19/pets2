'use client'

/**
 * 🔥 PHASE 5: ULTRA-PREMIUM 3D EFFECTS & PARALLAX
 * Advanced 3D transformations with gyroscope support, depth mapping,
 * perspective layering, and advanced parallax effects
 * 
 * Features:
 * - True 3D perspective transforms
 * - Gyroscope/device orientation support
 * - Depth-based z-index layering
 * - Scroll-driven parallax
 * - Mouse/touch interaction
 * - Performance optimized
 * - Reduced motion compliant
 */

import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useReducedMotion,
  useAnimation,
  type MotionValue,
} from 'framer-motion';
import { useThrottle } from '@/utils/performance-optimizations';

// ------------------------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------------------------

export interface Parallax3DLayer {
  children: ReactNode;
  /** Scroll range in pixels */
  scrollRange: [number, number];
  /** Transform ranges */
  yRange?: [number, number];
  xRange?: [number, number];
  zRange?: [number, number];
  scaleRange?: [number, number];
  rotateXRange?: [number, number];
  rotateYRange?: [number, number];
  rotateZRange?: [number, number];
  opacityRange?: [number, number];
  /** 3D depth in pixels */
  depth?: number;
  /** Z-index for stacking */
  zIndex?: number;
  /** Spring physics config */
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  } | false;
  /** Enable gyroscope tracking */
  gyroscope?: boolean;
  /** CSS class name */
  className?: string;
}

export interface Parallax3DProps {
  layers: Parallax3DLayer[];
  /** Container height */
  height?: number | string;
  /** Perspective depth in pixels */
  perspective?: number;
  /** Enable sticky pinning */
  pin?: boolean;
  /** Scroll container ref */
  containerRef?: React.RefObject<HTMLElement>;
  /** Enable gyroscope support */
  gyroscope?: boolean;
  /** Mouse interaction sensitivity */
  mouseSensitivity?: number;
  /** Performance optimization mode */
  optimize?: 'auto' | 'quality' | 'maxfps';
  /** Respect reduced motion */
  respectReducedMotion?: boolean;
  /** Debug overlay */
  debug?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface Transform3DProps {
  children: ReactNode;
  /** Rotation angles in degrees */
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  /** Translation in pixels */
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  /** Scale factor */
  scale?: number;
  /** Perspective in pixels */
  perspective?: number;
  /** Origin point */
  origin?: { x: number; y: number; z: number };
  /** Enable gyroscope */
  gyroscope?: boolean;
  /** Mouse interaction */
  mouseInteractive?: boolean;
  /** CSS class name */
  className?: string;
}

// ------------------------------------------------------------------------------------
// Core 3D Parallax Component
// ------------------------------------------------------------------------------------

export function Parallax3D({
  layers,
  height = '120vh',
  perspective = 1200,
  pin = false,
  containerRef,
  gyroscope = false,
  mouseSensitivity = 1,
  optimize = 'auto',
  respectReducedMotion = true,
  debug = false,
  className = '',
}: Parallax3DProps) {
  const reduceMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<{
    beta: number;
    gamma: number;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollY } = useScroll(containerRef ? { container: containerRef } : {});

  // Device orientation tracking
  useEffect(() => {
    if (!gyroscope || typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setDeviceOrientation({
          beta: e.beta,
          gamma: e.gamma,
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [gyroscope]);

  // Mouse position tracking
  useEffect(() => {
    if (!mouseSensitivity || !hostRef.current) return;

    const handleMouseMove = useThrottle((e: MouseEvent) => {
      if (!hostRef.current) return;

      const rect = hostRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      setMousePosition({ x, y });
    }, 16);

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseSensitivity]);

  const computedLayers = useMemo(() => {
    return layers
      .map((layer, index) => ({
        ...layer,
        key: index,
        zIndex: layer.zIndex ?? index,
        depth: layer.depth ?? 0,
        spring:
          layer.spring === false
            ? false
            : {
                stiffness: 160,
                damping: 26,
                mass: 0.9,
                ...layer.spring,
              },
      }))
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  }, [layers]);

  const willChange = useMemo(() => {
    switch (optimize) {
      case 'maxfps':
        return 'transform, opacity';
      case 'quality':
        return 'auto';
      default:
        return 'transform';
    }
  }, [optimize]);

  return (
    <div
      ref={hostRef}
      className={`relative overflow-hidden ${pin ? 'sticky top-0' : ''} ${className}`}
      style={{
        height,
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        contain: 'content',
      }}
      aria-label="3D parallax section"
      role="img"
    >
      {computedLayers.map((layer) => {
        if (respectReducedMotion && reduceMotion) {
          return (
            <motion.div
              key={layer.key}
              className={`absolute inset-0 ${layer.className || ''}`}
              style={{ zIndex: layer.zIndex, willChange: 'opacity' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 0.68, 0, 1] }}
            >
              {layer.children}
            </motion.div>
          );
        }

        // Scroll-based transforms
        const yMv = layer.yRange
          ? useTransform(scrollY, layer.scrollRange, layer.yRange)
          : undefined;
        const xMv = layer.xRange
          ? useTransform(scrollY, layer.scrollRange, layer.xRange)
          : undefined;
        const zMv = layer.zRange
          ? useTransform(scrollY, layer.scrollRange, layer.zRange)
          : undefined;
        const scaleMv = layer.scaleRange
          ? useTransform(scrollY, layer.scrollRange, layer.scaleRange)
          : undefined;
        const rotateXMv = layer.rotateXRange
          ? useTransform(scrollY, layer.scrollRange, layer.rotateXRange)
          : undefined;
        const rotateYMv = layer.rotateYRange
          ? useTransform(scrollY, layer.scrollRange, layer.rotateYRange)
          : undefined;
        const rotateZMv = layer.rotateZRange
          ? useTransform(scrollY, layer.scrollRange, layer.rotateZRange)
          : undefined;
        const opacityMv = layer.opacityRange
          ? useTransform(scrollY, layer.scrollRange, layer.opacityRange)
          : undefined;

        // Apply spring smoothing
        const springY = yMv && layer.spring ? useSpring(yMv, layer.spring) : yMv;
        const springX = xMv && layer.spring ? useSpring(xMv, layer.spring) : xMv;
        const springZ = zMv && layer.spring ? useSpring(zMv, layer.spring) : zMv;
        const springScale =
          scaleMv && layer.spring ? useSpring(scaleMv, layer.spring) : scaleMv;
        const springRotateX =
          rotateXMv && layer.spring ? useSpring(rotateXMv, layer.spring) : rotateXMv;
        const springRotateY =
          rotateYMv && layer.spring ? useSpring(rotateYMv, layer.spring) : rotateYMv;
        const springRotateZ =
          rotateZMv && layer.spring ? useSpring(rotateZMv, layer.spring) : rotateZMv;
        const springOpacity =
          opacityMv && layer.spring ? useSpring(opacityMv, layer.spring) : opacityMv;

        // Gyroscope adjustments
        const gyroX = layer.gyroscope && deviceOrientation
          ? deviceOrientation.gamma * 0.1
          : 0;
        const gyroY = layer.gyroscope && deviceOrientation
          ? deviceOrientation.beta * 0.1
          : 0;

        // Mouse interaction adjustments
        const mouseX = mouseSensitivity ? mousePosition.x * mouseSensitivity * 10 : 0;
        const mouseY = mouseSensitivity ? mousePosition.y * mouseSensitivity * 10 : 0;

        const styleProps: Record<string, unknown> = {
          zIndex: layer.zIndex,
          willChange,
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        };

        if (springY) styleProps['y'] = springY;
        if (springX) styleProps['x'] = springX;
        if (springScale) styleProps['scale'] = springScale;
        if (springOpacity) styleProps['opacity'] = springOpacity;

        return (
          <motion.div
            key={layer.key}
            className={`absolute inset-0 ${layer.className || ''}`}
            style={styleProps}
            transformTemplate={(t) => {
              let transforms = `translateZ(${layer.depth ?? 0}px) ${t}`;

              if (springZ) {
                const z = springZ.get();
                transforms += ` translateZ(${z}px)`;
              }

              if (springRotateX) {
                const rx = springRotateX.get();
                transforms += ` rotateX(${rx + gyroX}deg)`;
              } else if (gyroX) {
                transforms += ` rotateX(${gyroX}deg)`;
              }

              if (springRotateY) {
                const ry = springRotateY.get();
                transforms += ` rotateY(${ry + gyroY + mouseX}deg)`;
              } else if (gyroY || mouseX) {
                transforms += ` rotateY(${gyroY + mouseX}deg)`;
              }

              if (springRotateZ) {
                const rz = springRotateZ.get();
                transforms += ` rotateZ(${rz}deg)`;
              }

              if (mouseY && !springRotateX) {
                transforms += ` rotateX(${mouseY}deg)`;
              }

              return transforms;
            }}
          >
            {debug && (
              <div className="absolute top-2 right-2 z-[9999] text-[10px] select-none px-1.5 py-0.5 rounded bg-black/50 text-white font-mono">
                z:{layer.depth ?? 0} idx:{layer.zIndex}
              </div>
            )}
            {layer.children}
          </motion.div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------------------------
// Transform 3D Component
// ------------------------------------------------------------------------------------

export function Transform3D({
  children,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  scale = 1,
  perspective = 1000,
  origin = { x: 50, y: 50, z: 0 },
  gyroscope = false,
  mouseInteractive = false,
  className = '',
}: Transform3DProps) {
  const [deviceOrientation, setDeviceOrientation] = useState<{
    beta: number;
    gamma: number;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const rotateXVal = useMotionValue(rotateX);
  const rotateYVal = useMotionValue(rotateY);
  const rotateZVal = useMotionValue(rotateZ);
  const translateXVal = useMotionValue(translateX);
  const translateYVal = useMotionValue(translateY);
  const translateZVal = useMotionValue(translateZ);
  const scaleVal = useMotionValue(scale);

  // Device orientation tracking
  useEffect(() => {
    if (!gyroscope || typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setDeviceOrientation({
          beta: e.beta,
          gamma: e.gamma,
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [gyroscope]);

  // Mouse position tracking
  useEffect(() => {
    if (!mouseInteractive) return;

    const handleMouseMove = useThrottle((e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    }, 16);

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseInteractive]);

  // Apply gyroscope adjustments
  useEffect(() => {
    if (deviceOrientation) {
      rotateXVal.set(rotateX + deviceOrientation.beta * 0.1);
      rotateYVal.set(rotateY + deviceOrientation.gamma * 0.1);
    }
  }, [deviceOrientation, rotateX, rotateY, rotateXVal, rotateYVal]);

  // Apply mouse adjustments
  useEffect(() => {
    if (mouseInteractive) {
      rotateXVal.set(rotateX + mousePosition.y * 15);
      rotateYVal.set(rotateY + mousePosition.x * 15);
    }
  }, [mousePosition, mouseInteractive, rotateX, rotateY, rotateXVal, rotateYVal]);

  return (
    <motion.div
      className={className}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        transformOrigin: `${origin.x}% ${origin.y}% ${origin.z}px`,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      animate={{
        rotateX: rotateXVal,
        rotateY: rotateYVal,
        rotateZ: rotateZVal,
        x: translateXVal,
        y: translateYVal,
        z: translateZVal,
        scale: scaleVal,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------------------------------
// Preset Configurations
// ------------------------------------------------------------------------------------

export const PARALLAX_3D_PRESETS = {
  hero: [
    {
      children: (
        <div className="bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#06B6D4]" />
      ),
      scrollRange: [0, 800] as [number, number],
      yRange: [0, -140] as [number, number],
      depth: -200,
      zIndex: 1,
    },
    {
      children: <div className="bg-white/10 backdrop-blur-md" />,
      scrollRange: [0, 800] as [number, number],
      yRange: [0, -70] as [number, number],
      xRange: [0, 40] as [number, number],
      depth: -80,
      zIndex: 2,
    },
    {
      children: (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-white drop-shadow-2xl text-5xl md:text-7xl font-extrabold tracking-tight">
            3D Parallax
          </h1>
        </div>
      ),
      scrollRange: [0, 500] as [number, number],
      yRange: [0, -30] as [number, number],
      scaleRange: [0.9, 1] as [number, number],
      opacityRange: [0, 1] as [number, number],
      depth: 0,
      zIndex: 10,
      spring: { stiffness: 180, damping: 24, mass: 0.8 },
    },
  ] satisfies Parallax3DLayer[],
};

