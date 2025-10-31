/**
 * 🎯 THREE.JS EFFECT: VOLUMETRIC PORTAL
 * 
 * Cleaned + deterministic with proper resource management
 * 
 * Requires: @react-three/fiber (install with: pnpm add @react-three/fiber)
 */

'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useReducedMotion } from '@/foundation/reduceMotion';

interface VolumetricPortalProps {
  intensity?: number;
  active?: boolean;
  color1?: string;
  color2?: string;
}

export function VolumetricPortal({
  intensity = 1,
  active = true,
  color1 = '#f0abfc',
  color2 = '#c084fc',
}: VolumetricPortalProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const reduced = useReducedMotion();

  const torusGeometry = useMemo(() => new THREE.TorusGeometry(1.5, 0.4, 16, 100), []);
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1.2, 32, 32), []);

  // Deterministic noise texture (seeded)
  const noiseTex = useMemo(() => {
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    let seed = 1337;

    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < size * size; i++) {
      const stride = i * 4;
      const v = Math.floor(rnd() * 255);
      data[stride + 0] = v;
      data[stride + 1] = v;
      data[stride + 2] = v;
      data[stride + 3] = 255;
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  const portalMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uNoiseTexture: { value: noiseTex },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          float pulse = sin(uTime * 2.0) * 0.1;
          vec3 pos = position * (1.0 + pulse);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform sampler2D uNoiseTexture;
        varying vec2 vUv;

        void main() {
          vec2 muv = vUv * 2.0 + uTime * 0.5;
          float n = texture2D(uNoiseTexture, muv).r;
          float d = length(vUv - 0.5);
          float grad = 1.0 - smoothstep(0.0, 0.8, d);
          vec3 color = mix(uColor1, uColor2, n);
          float alpha = grad * n * uIntensity;
          float core = 1.0 - smoothstep(0.0, 0.3, d);
          color += core * 2.0;
          alpha += core * 0.5;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [intensity, color1, color2, noiseTex]);

  const volumeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLightPos: { value: new THREE.Vector3() },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vWorldPos;

        void main() {
          vec3 pos = position;
          pos.y += sin(uTime + position.x) * 0.08;
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uLightPos;
        varying vec3 vWorldPos;

        void main() {
          float dist = distance(vWorldPos, uLightPos);
          float inten = 1.0 / (dist * 0.6 + 1.0);
          vec3 color = vec3(0.4, 0.6, 1.0);
          float alpha = inten * 0.28;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !lightRef.current || !active) return;

    const t = state.clock.elapsedTime;
    portalMaterial.uniforms.uTime.value = t;
    volumeMaterial.uniforms.uTime.value = t;
    volumeMaterial.uniforms.uLightPos.value.copy(lightRef.current.position);

    const rot = reduced ? 0.15 : 0.3;
    groupRef.current.rotation.y = t * rot;
    const l = (Math.sin(t * 2) * 0.5 + 0.5) * 3 + 2;
    lightRef.current.intensity = active ? l * (reduced ? 0.6 : 1.0) : 0;
  });

  useEffect(() => {
    return () => {
      torusGeometry.dispose();
      sphereGeometry.dispose();
      portalMaterial.dispose();
      volumeMaterial.dispose();
      noiseTex.dispose();
    };
  }, [torusGeometry, sphereGeometry, portalMaterial, volumeMaterial, noiseTex]);

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <mesh geometry={torusGeometry} material={portalMaterial} rotation-x={Math.PI / 2} />
      <mesh geometry={sphereGeometry} material={portalMaterial} />
      <mesh position={[0, 2, 0]} material={volumeMaterial}>
        <sphereGeometry args={[3, 16, 16]} />
      </mesh>
      <pointLight ref={lightRef} color="#a5b4fc" intensity={3} distance={10} decay={2} />
    </group>
  );
}

