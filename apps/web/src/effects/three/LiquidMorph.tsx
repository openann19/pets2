/**
 * 🎯 THREE.JS EFFECT: LIQUID MORPH
 * 
 * Fixed + hardened with procedural 3D noise (no external textures)
 * 
 * Requires: @react-three/fiber (install with: pnpm add @react-three/fiber)
 */

'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from '@/foundation/reduceMotion';

interface LiquidMorphProps {
  intensity?: number;
  speed?: number;
  color1?: string;
  color2?: string;
}

export function LiquidMorph({
  intensity = 1,
  speed = 1.5,
  color1 = '#ec4899',
  color2 = '#8b5cf6',
}: LiquidMorphProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const reduced = useReducedMotion();
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.8, 64);
    return geo;
  }, []);

  // Procedural FBM — no external textures
  const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform float uNoiseScale;
    uniform vec2 uViewport;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;

    // Hash/Noise helpers (GPU-friendly)
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.1,0.2,0.3));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      // Quintic interpolation for smoothness
      f = f*f*f*(f*(f*6.0-15.0)+10.0);
      float n000 = hash(i + vec3(0.0,0.0,0.0));
      float n100 = hash(i + vec3(1.0,0.0,0.0));
      float n010 = hash(i + vec3(0.0,1.0,0.0));
      float n110 = hash(i + vec3(1.0,1.0,0.0));
      float n001 = hash(i + vec3(0.0,0.0,1.0));
      float n101 = hash(i + vec3(1.0,0.0,1.0));
      float n011 = hash(i + vec3(0.0,1.0,1.0));
      float n111 = hash(i + vec3(1.0,1.0,1.0));
      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n111, f.x);
      float nxy0 = mix(nx00, nx10, f.y);
      float nxy1 = mix(nx01, nx11, f.y);
      return mix(nxy0, nxy1, f.z);
    }

    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      float f = 1.0;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p * f);
        f *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      float t = uTime * uSpeed;
      vec3 pos = position;
      float d1 = fbm(pos * uNoiseScale + vec3(t, 0.0, 0.0));
      float d2 = fbm(pos * (uNoiseScale * 1.7) - vec3(0.0, t * 0.8, 0.0));
      float displacement = (d1 * 0.7 + d2 * 0.3) * uIntensity;
      pos += normal * displacement * 0.18;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uFresnelPower;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;

    float fresnel(vec3 eye, vec3 n) {
      return pow(1.0 - clamp(dot(eye, n), 0.0, 1.0), uFresnelPower);
    }

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(-vWorldPos);
      float f = fresnel(V, N);
      // Animated gradient
      float g = smoothstep(0.0, 1.0, vUv.x * 0.6 + vUv.y * 0.4 + sin(uTime * 0.5) * 0.1);
      vec3 base = mix(uColor1, uColor2, g);
      vec3 color = mix(base, vec3(1.0), f * 0.7);
      float spec = pow(f, 3.0) * 0.35;
      color += vec3(spec);
      float alpha = 0.9 - f * 0.3;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: reduced ? 0.2 : intensity },
        uSpeed: { value: reduced ? 0.3 : speed },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uFresnelPower: { value: 2.0 },
        uNoiseScale: { value: 1.6 },
        uViewport: { value: new THREE.Vector2() },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    return mat;
  }, [intensity, speed, color1, color2, reduced]);

  useFrame((state) => {
    if (!meshRef.current) return;

    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
      state.clock.elapsedTime;

    // Subtle auto-rotation (reduced motion safe)
    const t = state.clock.elapsedTime;
    const rotScale = reduced ? 0.05 : 0.1;
    meshRef.current.rotation.y = t * rotScale;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * (reduced ? 0.05 : 0.1);
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Aspect-aware uniform scale
  const s = Math.min(viewport.width, viewport.height) * 0.22;

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={material} 
      scale={[s, s, s]} 
    />
  );
}

