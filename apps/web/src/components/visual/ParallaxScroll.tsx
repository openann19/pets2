/**
 * 🎨 Parallax Scroll Component (Web)
 * Consumes visualEnhancements2025 config for parallax effects
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useVisualEnhancements } from '@/hooks/useVisualEnhancements';

interface ParallaxScrollProps {
  children: React.ReactNode;
  layers?: number;
  intensity?: number;
  className?: string;
}

export function ParallaxScroll({
  children,
  layers: customLayers,
  intensity: customIntensity,
  className = '',
}: ParallaxScrollProps) {
  const { canUseParallax, scrollConfig } = useVisualEnhancements();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  const layers = customLayers ?? scrollConfig?.parallax?.layers ?? 3;
  const intensity = customIntensity ?? scrollConfig?.parallax?.intensity ?? 1;

  useEffect(() => {
    if (!canUseParallax) return;

    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollPosition = window.scrollY - rect.top;
        setScrollY(scrollPosition);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [canUseParallax]);

  if (!canUseParallax) {
    return <div className={className}>{children}</div>;
  }

  // Calculate parallax offsets for each layer
  const getLayerOffset = (layerIndex: number) => {
    const layerSpeed = (layerIndex + 1) * intensity * 0.1;
    return scrollY * layerSpeed;
  };

  return (
    <div ref={containerRef} className={className}>
      {Array.from({ length: layers }).map((_, index) => (
        <div
          key={index}
          style={{
            transform: `translateY(${getLayerOffset(index)}px)`,
            transition: 'transform 0.1s ease-out',
          }}
          className="absolute inset-0"
        >
          {index === 0 && children}
        </div>
      ))}
      <div style={{ position: 'relative', zIndex: layers + 1 }}>
        {children}
      </div>
    </div>
  );
}

