/**
 * 🎯 DIAGNOSTICS: PRELAUNCH SAFE SCENE
 * 
 * Minimal, low-GPU visual to keep bots happy and avoid false crash/ANR flags.
 */

'use client';

import React from 'react';
import * as THREE from 'three';

/**
 * Minimal scene component that can be rendered without react-three/fiber
 * For use in Play Pre-launch testing or review scenarios
 */
export default function PrelaunchSafeScene() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Minimal Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    containerRef.current.appendChild(renderer.domElement);

    // Single, static mesh
    const geometry = new THREE.IcosahedronGeometry(1.2, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, 
      metalness: 0.2, 
      roughness: 0.8 
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 3;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100vh', 
        backgroundColor: '#0f0f15',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }} 
    />
  );
}

