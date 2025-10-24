'use client';
import { useEffect, useRef, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
export default function FluidGradient() {
    const containerRef = useRef(null);
    const animationIdRef = useRef(null);
    // Advanced touch state management
    const touchStateRef = useRef({
        isTouching: false,
        touchStartTime: 0,
        lastTouchX: 0,
        lastTouchY: 0,
        touchVelocity: { x: 0, y: 0 },
        touchPressure: 0,
        gestureType: 'none',
        touchHistory: [],
        smoothTarget: { x: 0, y: 0 },
        smoothCurrent: { x: 0, y: 0 }
    });
    useEffect(() => {
        if (!containerRef.current || typeof window === 'undefined')
            return;
        // Dynamically import Three.js only on client-side
        import('three').then((THREE) => {
            if (!containerRef.current)
                return;
            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: "high-performance"
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            containerRef.current.appendChild(renderer.domElement);
            // Shader geometry
            const geometry = new THREE.PlaneGeometry(2, 2);
            // Ultra-smooth fluid gradient shader
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                    mouse: { value: new THREE.Vector2(0, 0) },
                    pulse: { value: 0 },
                    pulseCenter: { value: new THREE.Vector2(0.5, 0.5) },
                    fluidVelocity: { value: new THREE.Vector2(0, 0) },
                    fluidDensity: { value: 0 },
                    surfaceTension: { value: 0.1 },
                    viscosity: { value: 0.05 },
                    gravity: { value: 0.2 },
                    touchInfluence: { value: 0 },
                    touchPressure: { value: 0 },
                    touchVelocity: { value: new THREE.Vector2(0, 0) },
                    gestureIntensity: { value: 0 },
                    smoothTouch: { value: new THREE.Vector2(0, 0) }
                },
                vertexShader: `
          uniform float time;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vPosition = position;
            
            // Create gentle wave-like motion (like your example)
            vec3 pos = position;
            pos.z += sin(pos.x * 3.0 + time * 0.5) * 0.02;
            pos.z += cos(pos.y * 3.0 + time * 0.7) * 0.02;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
                fragmentShader: `
          uniform float time;
          uniform vec2 resolution;
          uniform vec2 mouse;
          uniform float pulse;
          uniform vec2 pulseCenter;
          uniform vec2 fluidVelocity;
          uniform float fluidDensity;
          uniform float surfaceTension;
          uniform float viscosity;
          uniform float gravity;
          uniform float touchInfluence;
          uniform float touchPressure;
          uniform vec2 touchVelocity;
          uniform float gestureIntensity;
          uniform vec2 smoothTouch;
          varying vec2 vUv;
          
          // Ultra-smooth Simplex noise (like your example)
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          
          float snoise(vec3 v) { 
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            
            i = mod289(i); 
            vec4 p = permute(permute(permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            
            vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            
            vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
          }
          
          void main() {
            vec2 uv = vUv;
            float t = time * 0.3; // Slower, more serene movement
            
            // Create ultra-smooth flowing gradients using simplex noise
            float noise1 = snoise(vec3(uv * 2.0, t * 0.5));
            float noise2 = snoise(vec3(uv * 3.0 + 2.0, t * 0.3));
            float noise3 = snoise(vec3(uv * 4.0 + 4.0, t * 0.7));
            float noise4 = snoise(vec3(uv * 1.5 + 1.0, t * 0.2));
            
            // Combine noises for ultra-smooth, complex patterns
            float combinedNoise = (noise1 + 0.5 * noise2 + 0.25 * noise3 + 0.75 * noise4) / 2.5;
            
            // Serene fluid color palette (inspired by your example)
            vec3 colorA = vec3(0.8, 0.6, 1.0);  // Soft lavender
            vec3 colorB = vec3(0.4, 0.8, 1.0);  // Sky blue
            vec3 colorC = vec3(0.2, 0.4, 0.8);  // Deep blue
            vec3 colorD = vec3(0.6, 0.9, 0.8);  // Mint green
            
            // Create smooth gradient with noise
            vec3 gradient = mix(colorA, colorB, uv.x + combinedNoise * 0.3);
            gradient = mix(gradient, colorC, uv.y + combinedNoise * 0.2);
            gradient = mix(gradient, colorD, (uv.x + uv.y) * 0.5 + combinedNoise * 0.15);
            
            // Advanced touch and mouse interaction
            vec2 mouseInfluence = (mouse - 0.5) * 0.1;
            vec2 touchInfluence = (smoothTouch - 0.5) * touchInfluence * 0.3;
            
            // Combine mouse and touch influences
            vec2 combinedInfluence = mouseInfluence + touchInfluence;
            float interactionNoise = snoise(vec3(uv + combinedInfluence, t * 0.4));
            gradient = mix(gradient, colorA, interactionNoise * 0.1);
            
            // Touch pressure effects
            if (touchPressure > 0.0) {
              float pressureNoise = snoise(vec3(uv * 3.0 + touchVelocity * 2.0, t * 0.8));
              vec3 pressureColor = mix(colorB, colorC, pressureNoise);
              gradient = mix(gradient, pressureColor, touchPressure * 0.15);
            }
            
            // Gesture intensity effects
            if (gestureIntensity > 0.0) {
              float gestureNoise = snoise(vec3(uv * 4.0 + touchVelocity * 3.0, t * 1.2));
              vec3 gestureColor = mix(colorD, colorA, gestureNoise);
              gradient = mix(gradient, gestureColor, gestureIntensity * 0.1);
            }
            
            // Add pulse interaction (gentle)
            if (pulse > 0.0) {
              float dist = distance(uv, pulseCenter);
              float pulseEffect = exp(-dist * 3.0) * pulse * 0.2;
              gradient = mix(gradient, colorB, pulseEffect);
            }
            
            // Add subtle highlights and depth
            gradient += vec3(0.1) * noise1;
            gradient += vec3(0.05) * noise2;
            
            // Soften and blend colors for serenity
            gradient = mix(gradient, vec3(1.0), 0.1);
            
            // Add gentle vignette
            float vignette = 1.0 - length(uv - 0.5) * 0.2;
            gradient *= vignette;
            
            // Add breathing effect
            float breathing = sin(t * 0.1) * 0.05 + 0.95;
            gradient *= breathing;
            
            gl_FragColor = vec4(gradient, 1.0);
          }
        `
            });
            const plane = new THREE.Mesh(geometry, material);
            scene.add(plane);
            // Advanced interaction logic
            const targetMouse = new THREE.Vector2(0, 0);
            let isPulsing = false;
            // Smooth interpolation function
            const smoothInterpolate = (current, target, factor) => {
                return current + (target - current) * factor;
            };
            // Calculate touch velocity from history
            const calculateTouchVelocity = (touchState) => {
                const history = touchState.touchHistory;
                if (history.length < 2)
                    return { x: 0, y: 0 };
                const recent = history.slice(-3); // Last 3 points
                let totalVelocity = { x: 0, y: 0 };
                let totalTime = 0;
                for (let i = 1; i < recent.length; i++) {
                    const current = recent[i];
                    const previous = recent[i - 1];
                    if (!current || !previous)
                        continue;
                    const deltaTime = current.time - previous.time;
                    if (deltaTime > 0) {
                        const deltaX = current.x - previous.x;
                        const deltaY = current.y - previous.y;
                        totalVelocity.x += deltaX / deltaTime;
                        totalVelocity.y += deltaY / deltaTime;
                        totalTime += deltaTime;
                    }
                }
                return totalTime > 0 ? {
                    x: totalVelocity.x / (recent.length - 1),
                    y: totalVelocity.y / (recent.length - 1)
                } : { x: 0, y: 0 };
            };
            // Detect gesture type
            const detectGesture = (touchState) => {
                const duration = Date.now() - touchState.touchStartTime;
                const velocity = Math.sqrt(touchState.touchVelocity.x ** 2 + touchState.touchVelocity.y ** 2);
                if (duration < 200 && velocity < 0.1)
                    return 'tap';
                if (velocity > 0.3)
                    return 'swipe';
                if (duration > 100 && velocity > 0.05)
                    return 'drag';
                return 'none';
            };
            const handleMouseMove = (event) => {
                targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            };
            // Advanced touch start handler
            const handleTouchStart = (event) => {
                event.preventDefault();
                const touch = event.touches[0];
                if (!touch)
                    return;
                const touchState = touchStateRef.current;
                touchState.isTouching = true;
                touchState.touchStartTime = Date.now();
                touchState.lastTouchX = touch.clientX;
                touchState.lastTouchY = touch.clientY;
                touchState.touchHistory = [{
                        x: touch.clientX / window.innerWidth,
                        y: touch.clientY / window.innerHeight,
                        time: Date.now()
                    }];
                touchState.smoothTarget.x = touch.clientX / window.innerWidth;
                touchState.smoothTarget.y = touch.clientY / window.innerHeight;
                touchState.touchPressure = 0.1; // Initial pressure
                // Update shader uniforms
                const touchInfluence = material.uniforms['touchInfluence'];
                const touchPressure = material.uniforms['touchPressure'];
                if (touchInfluence?.value !== undefined)
                    touchInfluence.value = 1.0;
                if (touchPressure?.value !== undefined)
                    touchPressure.value = 0.1;
            };
            // Advanced touch move handler
            const handleTouchMove = (event) => {
                event.preventDefault();
                const touch = event.touches[0];
                if (!touch || !touchStateRef.current.isTouching)
                    return;
                const touchState = touchStateRef.current;
                const currentTime = Date.now();
                const currentX = touch.clientX / window.innerWidth;
                const currentY = touch.clientY / window.innerHeight;
                // Update touch history
                touchState.touchHistory.push({
                    x: currentX,
                    y: currentY,
                    time: currentTime
                });
                // Keep only recent history (last 10 points)
                if (touchState.touchHistory.length > 10) {
                    touchState.touchHistory.shift();
                }
                // Calculate velocity
                touchState.touchVelocity = calculateTouchVelocity(touchState);
                // Detect gesture
                touchState.gestureType = detectGesture(touchState);
                // Update smooth target
                touchState.smoothTarget.x = currentX;
                touchState.smoothTarget.y = currentY;
                // Calculate pressure based on velocity and gesture
                const velocity = Math.sqrt(touchState.touchVelocity.x ** 2 + touchState.touchVelocity.y ** 2);
                touchState.touchPressure = Math.min(0.8, 0.1 + velocity * 2);
                // Update gesture intensity
                let gestureIntensity = 0;
                switch (touchState.gestureType) {
                    case 'swipe':
                        gestureIntensity = Math.min(1.0, velocity * 1.5);
                        break;
                    case 'drag':
                        gestureIntensity = Math.min(0.6, velocity * 0.8);
                        break;
                    case 'tap':
                        gestureIntensity = 0.3;
                        break;
                }
                // Update shader uniforms
                const touchVelocity = material.uniforms['touchVelocity'];
                const gestureIntensityUniform = material.uniforms['gestureIntensity'];
                const touchPressureUniform = material.uniforms['touchPressure'];
                if (touchVelocity?.value) {
                    touchVelocity.value.x = touchState.touchVelocity.x;
                    touchVelocity.value.y = touchState.touchVelocity.y;
                }
                if (gestureIntensityUniform?.value !== undefined) {
                    gestureIntensityUniform.value = gestureIntensity;
                }
                if (touchPressureUniform?.value !== undefined) {
                    touchPressureUniform.value = touchState.touchPressure;
                }
                touchState.lastTouchX = touch.clientX;
                touchState.lastTouchY = touch.clientY;
            };
            // Advanced touch end handler
            const handleTouchEnd = (event) => {
                event.preventDefault();
                const touchState = touchStateRef.current;
                if (!touchState.isTouching)
                    return;
                touchState.isTouching = false;
                const duration = Date.now() - touchState.touchStartTime;
                // Create pulse effect based on gesture
                const pulseCenter = material.uniforms['pulseCenter'];
                if (pulseCenter?.value) {
                    pulseCenter.value.x = touchState.smoothTarget.x;
                    pulseCenter.value.y = touchState.smoothTarget.y;
                }
                // Start pulse effect with intensity based on gesture
                const pulse = material.uniforms['pulse'];
                if (pulse?.value !== undefined) {
                    switch (touchState.gestureType) {
                        case 'swipe':
                            pulse.value = 0.5;
                            break;
                        case 'drag':
                            pulse.value = 0.3;
                            break;
                        case 'tap':
                            pulse.value = 0.1;
                            break;
                        default:
                            pulse.value = 0.05;
                    }
                }
                isPulsing = true;
                // Gradually fade out touch effects
                const fadeOut = () => {
                    const touchInfluence = material.uniforms['touchInfluence'];
                    const touchPressure = material.uniforms['touchPressure'];
                    const gestureIntensity = material.uniforms['gestureIntensity'];
                    if (touchInfluence?.value !== undefined && touchInfluence.value > 0) {
                        touchInfluence.value *= 0.95;
                        if (touchInfluence.value < 0.01)
                            touchInfluence.value = 0;
                    }
                    if (touchPressure?.value !== undefined && touchPressure.value > 0) {
                        touchPressure.value *= 0.9;
                        if (touchPressure.value < 0.01)
                            touchPressure.value = 0;
                    }
                    if (gestureIntensity?.value !== undefined && gestureIntensity.value > 0) {
                        gestureIntensity.value *= 0.9;
                        if (gestureIntensity.value < 0.01)
                            gestureIntensity.value = 0;
                    }
                    if (touchInfluence?.value > 0 || touchPressure?.value > 0 || gestureIntensity?.value > 0) {
                        requestAnimationFrame(fadeOut);
                    }
                };
                setTimeout(fadeOut, 100);
            };
            // Mouse interaction handler (for desktop)
            const handleMouseInteraction = (event) => {
                // Only respond if clicking on empty areas (not on interactive elements)
                const target = event.target;
                // Check if the target is an interactive element or inside one
                const isInteractiveElement = Boolean(target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'BUTTON' ||
                    target.tagName === 'A' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable ||
                    target.closest('button') ||
                    target.closest('a') ||
                    target.closest('input') ||
                    target.closest('textarea') ||
                    target.closest('select') ||
                    target.closest('[role="button"]') ||
                    target.closest('[role="link"]') ||
                    target.closest('[contenteditable]') ||
                    target.closest('form'));
                // Don't create ripple effect if clicking on interactive elements
                if (isInteractiveElement) {
                    return;
                }
                const pulseCenter = material.uniforms['pulseCenter'];
                if (pulseCenter?.value) {
                    pulseCenter.value.x = event.clientX / window.innerWidth;
                    pulseCenter.value.y = 1.0 - (event.clientY / window.innerHeight);
                }
                // Start pulse effect
                const pulse = material.uniforms['pulse'];
                if (pulse?.value !== undefined) {
                    pulse.value = 0.01;
                }
                isPulsing = true;
                // Update mouse target
                targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            };
            // Add event listeners with proper touch handling
            window.addEventListener('mousemove', handleMouseMove, { passive: true });
            window.addEventListener('mousedown', handleMouseInteraction, { passive: true });
            // Advanced touch event listeners
            window.addEventListener('touchstart', handleTouchStart, { passive: false });
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd, { passive: false });
            window.addEventListener('touchcancel', handleTouchEnd, { passive: false });
            // Serene animation loop (like your example)
            let time = 0;
            const speed = 0.3; // Serene, slow speed
            const animate = () => {
                animationIdRef.current = requestAnimationFrame(animate);
                time += 0.01 * speed;
                // Ultra-smooth mouse interpolation
                const mouse = material.uniforms['mouse'];
                if (mouse?.value) {
                    mouse.value.x += (targetMouse.x - mouse.value.x) * 0.01;
                    mouse.value.y += (targetMouse.y - mouse.value.y) * 0.01;
                }
                // Ultra-smooth touch interpolation
                const touchState = touchStateRef.current;
                const smoothTouch = material.uniforms['smoothTouch'];
                if (smoothTouch?.value) {
                    // Use different interpolation factors based on touch state
                    const interpolationFactor = touchState.isTouching ? 0.15 : 0.05;
                    smoothTouch.value.x = smoothInterpolate(smoothTouch.value.x, touchState.smoothTarget.x, interpolationFactor);
                    smoothTouch.value.y = smoothInterpolate(smoothTouch.value.y, touchState.smoothTarget.y, interpolationFactor);
                }
                // Update pulse with gentle behavior
                if (isPulsing) {
                    const pulse = material.uniforms['pulse'];
                    if (pulse?.value !== undefined) {
                        pulse.value += 0.02;
                        if (pulse.value >= 2.0) {
                            pulse.value = 0;
                            isPulsing = false;
                        }
                    }
                }
                // Update shader uniforms
                const timeUniform = material.uniforms['time'];
                if (timeUniform?.value !== undefined) {
                    timeUniform.value = time;
                }
                renderer.render(scene, camera);
            };
            // Window resize
            const onWindowResize = () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                const resolution = material.uniforms['resolution'];
                if (resolution?.value) {
                    resolution.value.set(window.innerWidth, window.innerHeight);
                }
            };
            window.addEventListener('resize', onWindowResize);
            // Start animation
            animate();
            // Cleanup
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mousedown', handleMouseInteraction);
                window.removeEventListener('touchstart', handleTouchStart);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
                window.removeEventListener('touchcancel', handleTouchEnd);
                window.removeEventListener('resize', onWindowResize);
                if (animationIdRef.current !== null) {
                    cancelAnimationFrame(animationIdRef.current);
                }
                if (containerRef.current && renderer.domElement) {
                    containerRef.current.removeChild(renderer.domElement);
                }
                geometry.dispose();
                material.dispose();
                renderer.dispose();
            };
        }).catch(error => {
            logger.error('Failed to load Three.js:', { error });
        });
    }, []);
    return (<div ref={containerRef} className="fixed inset-0 pointer-events-auto touch-none" style={{
            backgroundColor: 'transparent',
            zIndex: -10,
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
        }}/>);
}
//# sourceMappingURL=FluidGradient.jsx.map