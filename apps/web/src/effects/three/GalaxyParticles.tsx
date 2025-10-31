/**
 * 🎯 THREE.JS EFFECT: GALAXY PARTICLES
 * 
 * Adaptive particle system with quality tiers and reduced motion support
 * 
 * Requires: @react-three/fiber (install with: pnpm add @react-three/fiber)
 */

'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useVsyncRate } from '@/foundation/useVsyncRate';
import { useReducedMotion } from '@/foundation/reduceMotion';
import { useQualityTier } from '@/foundation/quality/useQualityTier';

interface GalaxyParticlesProps {
  count?: number;
  enabled?: boolean;
}

export function GalaxyParticles({ count = 50000, enabled = true }: GalaxyParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const vsyncRate = useVsyncRate();
  const reduced = useReducedMotion();
  const quality = useQualityTier();

  const particleCount = useMemo(() => {
    if (!enabled) return 0;

    const vsyncCap = vsyncRate >= 110 ? 80000 : vsyncRate >= 85 ? 60000 : 38000;
    const base = Math.min(count, vsyncCap);
    const reducedCap = reduced ? 0.6 : 1.0;
    return Math.floor(base * quality.particleMultiplier * reducedCap);
  }, [count, vsyncRate, enabled, reduced, quality]);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const c1 = new THREE.Color(0xec4899);
    const c2 = new THREE.Color(0x8b5cf6);
    const c3 = new THREE.Color(0x3b82f6);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.cbrt(Math.random()) * 20;
      const spin = radius * 5.0;
      const branches = 6;
      const branchAngle = (i % branches) * (Math.PI * 2 / branches);
      const rx = (Math.random() - 0.5) * 0.22;
      const ry = (Math.random() - 0.5) * 0.12;
      const rz = (Math.random() - 0.5) * 0.22;

      positions[i3 + 0] = Math.cos(spin + branchAngle) * radius + rx;
      positions[i3 + 1] = ry * 2;
      positions[i3 + 2] = Math.sin(spin + branchAngle) * radius + rz;

      const mixR = radius / 20;
      const branchMix = (i % branches) / branches;
      let col = c1;
      if (branchMix < 0.33) col = c1.clone().lerp(c2, mixR);
      else if (branchMix < 0.66) col = c2.clone().lerp(c3, mixR);
      else col = c3.clone().lerp(c1, mixR);

      colors[i3 + 0] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
      sizes[i] = Math.random() * 0.8 + 0.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.StaticDrawUsage));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.StaticDrawUsage));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1).setUsage(THREE.StaticDrawUsage));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
        uSize: { value: 40 },
        uTwinkle: { value: reduced ? 0.05 : 0.25 },
      },
      vertexShader: /* glsl */ `
        uniform float uPixelRatio;
        uniform float uSize;
        uniform float uTime;
        uniform float uTwinkle;
        attribute float size;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          // Gentle sparkle (zero-ish when reduced motion)
          float sparkle = 1.0 + uTwinkle * sin(dot(position.xyz, vec3(0.7,1.1,1.3)) + uTime*2.0);
          float pSize = size * uSize * sparkle * uPixelRatio / max(-mv.z, 1.0);
          pSize = clamp(pSize, 1.0, 64.0);
          gl_PointSize = pSize;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;

        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.35, 0.5, d);
          float glow = pow(1.0 - d * 2.0, 2.0) * 0.3;
          gl_FragColor = vec4(vColor + glow, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [particleCount, reduced]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    (material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
    const rot = reduced ? 0.02 : 0.05;
    pointsRef.current.rotation.y = state.clock.elapsedTime * rot;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (!enabled || particleCount === 0) return null;

  return (
    <points 
      ref={pointsRef} 
      geometry={geometry} 
      material={material} 
      frustumCulled={false} 
    />
  );
}

